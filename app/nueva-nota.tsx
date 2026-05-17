import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  Platform, KeyboardAvoidingView, ScrollView, Text, TextInput,
  TouchableOpacity, View, StyleSheet,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { useNotesStore } from '../store/notesStore';
import type { NoteType, Note, ChecklistNote, IdeaNote, ChecklistItem } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TITLES: Record<NoteType, string> = {
  note: 'Nueva nota',
  checklist: 'Nueva tarea',
  idea: 'Nueva idea',
};

const EDIT_TITLES: Record<NoteType, string> = {
  note: 'Editar nota',
  checklist: 'Editar tarea',
  idea: 'Editar idea',
};

function resolveType(raw: string | string[] | undefined): NoteType {
  if (raw === 'checklist') return 'checklist';
  if (raw === 'idea') return 'idea';
  return 'note';
}

const timestamp = () => new Date().toISOString();
const newId = () => Date.now().toString();

// ─── Schemas Zod ─────────────────────────────────────────────────────────────

const noteSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  content: z.string().min(1, 'El contenido no puede estar vacío'),
});

const checklistSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  items: z
    .array(z.object({ id: z.string(), text: z.string() }))
    .min(1, 'Añade al menos un item')
    .refine(
      (arr) => arr.every((item) => item.text.trim().length > 0),
      'Todos los items deben tener texto'
    ),
});

const ideaSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
});

// ─── NoteForm ─────────────────────────────────────────────────────────────────

type NoteFormErrors = { title?: string; content?: string };
type NoteFormHandle = { getData: () => { title: string; content: string } };

const NoteForm = forwardRef<NoteFormHandle, { errors: NoteFormErrors; initialData?: Note }>(({ errors, initialData }, ref) => {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');

  useImperativeHandle(ref, () => ({ getData: () => ({ title, content }) }));

  return (
    <View style={formStyles.wrapper}>
      <View style={formStyles.fieldGroup}>
        <TextInput
          style={[formStyles.titleInput, !!errors.title && formStyles.inputError]}
          value={title}
          onChangeText={setTitle}
          placeholder="Título de la nota"
          placeholderTextColor={Colors.dark.textMuted}
          maxLength={120}
          returnKeyType="next"
        />
        {errors.title ? <Text style={formStyles.errorText}>{errors.title}</Text> : null}
      </View>
      <View style={formStyles.fieldGroup}>
        <TextInput
          style={[formStyles.contentInput, !!errors.content && formStyles.inputError]}
          value={content}
          onChangeText={setContent}
          placeholder="Escribe aquí..."
          placeholderTextColor={Colors.dark.textMuted}
          multiline
          textAlignVertical="top"
        />
        {errors.content ? <Text style={formStyles.errorText}>{errors.content}</Text> : null}
      </View>
    </View>
  );
});
NoteForm.displayName = 'NoteForm';

// ─── ChecklistForm ────────────────────────────────────────────────────────────

type ChecklistDraftItem = { id: string; text: string };
type ChecklistFormErrors = { title?: string; items?: string };
type ChecklistFormHandle = { getData: () => { title: string; items: ChecklistDraftItem[] } };

const ChecklistForm = forwardRef<ChecklistFormHandle, { errors: ChecklistFormErrors; initialData?: ChecklistNote }>(({ errors, initialData }, ref) => {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [items, setItems] = useState<ChecklistDraftItem[]>(
    initialData ? initialData.items.map((i) => ({ id: i.id, text: i.text })) : [{ id: newId(), text: '' }]
  );

  useImperativeHandle(ref, () => ({ getData: () => ({ title, items }) }));

  const addItem = () => setItems((prev) => [...prev, { id: newId(), text: '' }]);

  const updateItem = (id: string, text: string) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const canDelete = items.length > 1;

  return (
    <View style={formStyles.wrapper}>
      <View style={formStyles.fieldGroup}>
        <TextInput
          style={[formStyles.titleInput, !!errors.title && formStyles.inputError]}
          value={title}
          onChangeText={setTitle}
          placeholder="Título de la tarea"
          placeholderTextColor={Colors.dark.textMuted}
          maxLength={120}
          returnKeyType="next"
        />
        {errors.title ? <Text style={formStyles.errorText}>{errors.title}</Text> : null}
      </View>
      {items.map((item) => (
        <View key={item.id} style={formStyles.itemRow}>
          <TextInput
            style={formStyles.itemInput}
            value={item.text}
            onChangeText={(t) => updateItem(item.id, t)}
            placeholder="Nuevo item..."
            placeholderTextColor={Colors.dark.textMuted}
            returnKeyType="next"
          />
          <TouchableOpacity
            onPress={() => removeItem(item.id)}
            disabled={!canDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={canDelete ? Colors.dark.textMuted : Colors.dark.border}
            />
          </TouchableOpacity>
        </View>
      ))}
      {errors.items ? <Text style={formStyles.errorText}>{errors.items}</Text> : null}
      <TouchableOpacity style={formStyles.addItemBtn} onPress={addItem}>
        <Text style={formStyles.addItemText}>＋ Añadir item</Text>
      </TouchableOpacity>
    </View>
  );
});
ChecklistForm.displayName = 'ChecklistForm';

// ─── IdeaForm ─────────────────────────────────────────────────────────────────

type IdeaStatus = 'raw' | 'developing' | 'ready';

const IDEA_COLORS = ['#6366f1', '#f97316', '#22c55e', '#ec4899', '#14b8a6', '#f59e0b'] as const;

const STATUS_PILLS: Array<{ value: IdeaStatus; label: string }> = [
  { value: 'raw', label: 'En bruto' },
  { value: 'developing', label: 'Desarrollando' },
  { value: 'ready', label: 'Lista' },
];

type IdeaFormData = { title: string; status: IdeaStatus; selectedColor: string; tags: string[] };
type IdeaFormErrors = { title?: string };
type IdeaFormHandle = { getData: () => IdeaFormData };

const IdeaForm = forwardRef<IdeaFormHandle, { errors: IdeaFormErrors; initialData?: IdeaNote }>(({ errors, initialData }, ref) => {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [status, setStatus] = useState<IdeaStatus>(
    (initialData?.status === 'discarded' ? 'raw' : initialData?.status) ?? 'raw'
  );
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState('');

  useImperativeHandle(ref, () => ({ getData: () => ({ title, status, selectedColor, tags }) }));

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  return (
    <View style={formStyles.wrapper}>
      <View style={formStyles.fieldGroup}>
        <TextInput
          style={[formStyles.titleInput, !!errors.title && formStyles.inputError]}
          value={title}
          onChangeText={setTitle}
          placeholder="Título de la idea"
          placeholderTextColor={Colors.dark.textMuted}
          maxLength={120}
          returnKeyType="next"
        />
        {errors.title ? <Text style={formStyles.errorText}>{errors.title}</Text> : null}
      </View>

      <View style={formStyles.pillsRow}>
        {STATUS_PILLS.map(({ value, label }) => {
          const active = status === value;
          return (
            <TouchableOpacity
              key={value}
              style={[formStyles.pill, active && formStyles.pillActive]}
              onPress={() => setStatus(value)}
              activeOpacity={0.7}
            >
              <Text style={[formStyles.pillText, active && formStyles.pillTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={formStyles.colorsRow}>
        {IDEA_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              formStyles.colorCircle,
              { backgroundColor: color },
              selectedColor === color && formStyles.colorCircleSelected,
            ]}
            onPress={() => setSelectedColor(color)}
            activeOpacity={0.8}
          />
        ))}
      </View>

      <View style={formStyles.tagInputRow}>
        <TextInput
          style={formStyles.tagInputField}
          value={tagInput}
          onChangeText={setTagInput}
          placeholder="Nueva etiqueta..."
          placeholderTextColor={Colors.dark.textMuted}
          returnKeyType="done"
          onSubmitEditing={addTag}
          autoCapitalize="none"
        />
        <TouchableOpacity style={formStyles.addTagBtn} onPress={addTag} activeOpacity={0.7}>
          <Text style={formStyles.addTagText}>Añadir</Text>
        </TouchableOpacity>
      </View>

      {tags.length > 0 && (
        <View style={formStyles.tagsRow}>
          {tags.map((tag) => (
            <View key={tag} style={formStyles.tag}>
              <Text style={formStyles.tagText}>#{tag}</Text>
              <TouchableOpacity
                onPress={() => removeTag(tag)}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Ionicons name="close" size={12} color={Colors.dark.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});
IdeaForm.displayName = 'IdeaForm';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NuevaNotaScreen() {
  const router = useRouter();
  const { type, id } = useLocalSearchParams<{ type?: string; id?: string }>();
  const noteType = resolveType(type);
  const isEditing = !!id;
  const screenTitle = isEditing ? EDIT_TITLES[noteType] : TITLES[noteType];

  const addNote = useNotesStore((state) => state.addNote);
  const updateNote = useNotesStore((state) => state.updateNote);
  const updateChecklist = useNotesStore((state) => state.updateChecklist);
  const updateIdea = useNotesStore((state) => state.updateIdea);
  const notes = useNotesStore((state) => state.notes);
  const checklists = useNotesStore((state) => state.checklists);
  const ideas = useNotesStore((state) => state.ideas);

  const initialNote = id && noteType === 'note' ? notes.find((n) => n.id === id) : undefined;
  const initialChecklist = id && noteType === 'checklist' ? checklists.find((n) => n.id === id) : undefined;
  const initialIdea = id && noteType === 'idea' ? ideas.find((n) => n.id === id) : undefined;

  const noteRef = useRef<NoteFormHandle>(null);
  const checklistRef = useRef<ChecklistFormHandle>(null);
  const ideaRef = useRef<IdeaFormHandle>(null);

  const [noteErrors, setNoteErrors] = useState<NoteFormErrors>({});
  const [checklistErrors, setChecklistErrors] = useState<ChecklistFormErrors>({});
  const [ideaErrors, setIdeaErrors] = useState<IdeaFormErrors>({});

  const handleSave = () => {
    if (noteType === 'note') {
      const result = noteSchema.safeParse(noteRef.current?.getData());
      if (!result.success) {
        const fe = result.error.flatten().fieldErrors;
        setNoteErrors({ title: fe.title?.[0], content: fe.content?.[0] });
        return;
      }
      setNoteErrors({});
      if (isEditing && id) {
        updateNote(id, { title: result.data.title, content: result.data.content });
      } else {
        const ts = timestamp();
        const note: Note = {
          id: newId(), type: 'note',
          title: result.data.title,
          content: result.data.content,
          createdAt: ts, updatedAt: ts,
          pinned: false, tags: [],
        };
        addNote(note);
      }
      router.back();
      return;
    }

    if (noteType === 'checklist') {
      const result = checklistSchema.safeParse(checklistRef.current?.getData());
      if (!result.success) {
        const fe = result.error.flatten().fieldErrors;
        setChecklistErrors({ title: fe.title?.[0], items: fe.items?.[0] });
        return;
      }
      setChecklistErrors({});
      if (isEditing && id && initialChecklist) {
        const originalItems = initialChecklist.items;
        const updatedItems: ChecklistItem[] = result.data.items.map((draftItem) => {
          const original = originalItems.find((o) => o.id === draftItem.id);
          return { id: draftItem.id, text: draftItem.text, checked: original?.checked ?? false };
        });
        updateChecklist(id, { title: result.data.title, items: updatedItems });
      } else {
        const ts = timestamp();
        const checklistItems: ChecklistItem[] = result.data.items.map((item) => ({
          id: item.id, text: item.text, checked: false,
        }));
        const checklist: ChecklistNote = {
          id: newId(), type: 'checklist',
          title: result.data.title,
          items: checklistItems,
          createdAt: ts, updatedAt: ts,
          pinned: false, tags: [],
        };
        addNote(checklist);
      }
      router.back();
      return;
    }

    if (noteType === 'idea') {
      const raw = ideaRef.current?.getData();
      const result = ideaSchema.safeParse(raw);
      if (!result.success) {
        const fe = result.error.flatten().fieldErrors;
        setIdeaErrors({ title: fe.title?.[0] });
        return;
      }
      setIdeaErrors({});
      if (isEditing && id) {
        updateIdea(id, { title: result.data.title, status: raw!.status, tags: raw!.tags });
      } else {
        const ts = timestamp();
        const idea: IdeaNote = {
          id: newId(), type: 'idea',
          title: result.data.title,
          content: '',
          status: raw!.status,
          createdAt: ts, updatedAt: ts,
          pinned: false, tags: raw!.tags,
        };
        addNote(idea);
      }
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: screenTitle,
          headerStyle: { backgroundColor: Colors.dark.surface },
          headerTitleStyle: {
            fontSize: Typography.size.md,
            fontWeight: Typography.weight.semibold,
            color: Colors.dark.text,
          },
          headerTintColor: Colors.dark.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.cancelBtn}>Cancelar</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.saveBtn}>Guardar</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {noteType === 'note' && <NoteForm ref={noteRef} errors={noteErrors} initialData={initialNote} />}
          {noteType === 'checklist' && <ChecklistForm ref={checklistRef} errors={checklistErrors} initialData={initialChecklist} />}
          {noteType === 'idea' && <IdeaForm ref={ideaRef} errors={ideaErrors} initialData={initialIdea} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scroll: {
    flexGrow: 1,
    padding: Spacing[4],
  },
  cancelBtn: {
    fontSize: Typography.size.base,
    color: Colors.dark.textSecondary,
    fontWeight: Typography.weight.regular,
  },
  saveBtn: {
    fontSize: Typography.size.base,
    color: Colors.dark.accent,
    fontWeight: Typography.weight.semibold,
  },
});

const formStyles = StyleSheet.create({
  wrapper: {
    gap: Spacing[3],
  },
  fieldGroup: {
    gap: Spacing[1],
  },
  titleInput: {
    backgroundColor: Colors.dark.surface,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: Radius.md,
    padding: Spacing[3],
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.medium,
  },
  contentInput: {
    backgroundColor: Colors.dark.surface,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: Radius.md,
    padding: Spacing[3],
    fontSize: Typography.size.base,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.dark.destructive,
  },
  errorText: {
    fontSize: Typography.size.xs,
    color: Colors.dark.destructive,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  itemInput: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: Radius.md,
    padding: Spacing[3],
    fontSize: Typography.size.base,
  },
  addItemBtn: {
    paddingVertical: Spacing[2],
    alignSelf: 'flex-start',
  },
  addItemText: {
    fontSize: Typography.size.sm,
    color: Colors.dark.accent,
    fontWeight: Typography.weight.medium,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  pill: {
    flex: 1,
    paddingVertical: Spacing[2],
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  pillText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
    color: Colors.dark.textSecondary,
  },
  pillTextActive: {
    color: '#fff',
  },
  colorsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: '#fff',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  tagInputField: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: Radius.md,
    padding: Spacing[3],
    fontSize: Typography.size.base,
  },
  addTagBtn: {
    backgroundColor: Colors.dark.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[3],
    justifyContent: 'center',
  },
  addTagText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.dark.text,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    backgroundColor: Colors.dark.surfaceElevated,
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: Typography.size.xs,
    color: Colors.dark.textSecondary,
    fontWeight: Typography.weight.medium,
  },
});
