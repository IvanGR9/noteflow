import { View, Text, StyleSheet, Alert } from 'react-native';
import { useState, useMemo } from 'react';
import { Stack, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotesStore } from '../store/notesStore';
import { NoteCard } from '../components/items/NoteCard';
import { ChecklistCard } from '../components/items/ChecklistCard';
import { IdeaCard } from '../components/items/IdeaCard';
import { ContextMenu } from '../components/ContextMenu';
import { Colors, Typography, Spacing } from '../constants/theme';
import type { Note, ChecklistNote, IdeaNote } from '../types';

type ArchivedItem =
  | (Note & { type: 'note' })
  | (ChecklistNote & { type: 'checklist' })
  | (IdeaNote & { type: 'idea' });

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Ionicons name="archive-outline" size={52} color={Colors.dark.textMuted} />
      <Text style={styles.emptyTitle}>No tienes elementos archivados</Text>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

export default function ArchivadosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const notes = useNotesStore((s) => s.notes);
  const checklists = useNotesStore((s) => s.checklists);
  const ideas = useNotesStore((s) => s.ideas);
  const unarchiveNote = useNotesStore((s) => s.unarchiveNote);
  const unarchiveChecklist = useNotesStore((s) => s.unarchiveChecklist);
  const unarchiveIdea = useNotesStore((s) => s.unarchiveIdea);
  const deleteNote = useNotesStore((s) => s.deleteNote);

  const [menuTarget, setMenuTarget] = useState<ArchivedItem | null>(null);

  const archived = useMemo<ArchivedItem[]>(() => {
    const archivedNotes = notes.filter((n) => n.archived) as (Note & { type: 'note' })[];
    const archivedChecklists = checklists.filter((n) => n.archived) as (ChecklistNote & { type: 'checklist' })[];
    const archivedIdeas = ideas.filter((n) => n.archived) as (IdeaNote & { type: 'idea' })[];

    return [...archivedNotes, ...archivedChecklists, ...archivedIdeas].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [notes, checklists, ideas]);

  const handleLongPress = (item: ArchivedItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuTarget(item);
  };

  const menuOptions = menuTarget
    ? [
        {
          label: 'Desarchivar',
          icon: 'arrow-undo-outline' as const,
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (menuTarget.type === 'note') unarchiveNote(menuTarget.id);
            else if (menuTarget.type === 'checklist') unarchiveChecklist(menuTarget.id);
            else unarchiveIdea(menuTarget.id);
          },
        },
        {
          label: 'Eliminar definitivamente',
          icon: 'trash-outline' as const,
          destructive: true,
          onPress: () =>
            Alert.alert('¿Eliminar definitivamente?', 'Esta acción no se puede deshacer.', [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  deleteNote(menuTarget.id, menuTarget.type);
                },
              },
            ]),
        },
      ]
    : [];

  const renderItem = ({ item }: { item: ArchivedItem }) => {
    const onPress = () => router.push({ pathname: '/nueva-nota', params: { type: item.type, id: item.id } });
    const onLongPress = () => handleLongPress(item);

    let card;
    if (item.type === 'note') {
      card = <NoteCard note={item} onPress={onPress} onLongPress={onLongPress} />;
    } else if (item.type === 'checklist') {
      card = <ChecklistCard note={item} onPress={onPress} onLongPress={onLongPress} />;
    } else {
      card = <IdeaCard note={item} onPress={onPress} onLongPress={onLongPress} />;
    }

    return <View style={{ flex: 1, marginHorizontal: Spacing[1] }}>{card}</View>;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: Colors.dark.background },
          headerTintColor: Colors.dark.text,
          headerShadowVisible: false,
        }}
      />
      <View style={[styles.container, { paddingTop: insets.top + Spacing[4] }]}>
        <Text style={styles.heading}>Archivados</Text>
        <FlashList
          data={archived}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          numColumns={2}
          estimatedItemSize={180}
          renderItem={renderItem}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.list}
        />
        <ContextMenu
          visible={menuTarget !== null}
          onClose={() => setMenuTarget(null)}
          options={menuOptions}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  heading: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.dark.text,
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[3],
  },
  list: {
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[8],
  },
  separator: {
    height: Spacing[3],
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
    paddingTop: 120,
  },
  emptyTitle: {
    fontSize: Typography.size.base,
    color: Colors.dark.textSecondary,
  },
});
