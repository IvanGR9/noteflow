import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNotesStore } from '../../../store/notesStore';
import { Colors, Typography, Spacing, Radius } from '../../../constants/theme';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const note = useNotesStore((state) => state.notes.find((n) => n.id === id));
  const deleteNote = useNotesStore((state) => state.deleteNote);

  const handleDelete = () => {
    Alert.alert('¿Eliminar?', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          deleteNote(id as string, 'note');
          router.back();
        },
      },
    ]);
  };

  if (!note) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Nota no encontrada</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: Colors.dark.surface },
          headerTintColor: Colors.dark.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.dark.destructive} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        {note.pinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={12} color={Colors.dark.accent} />
            <Text style={styles.pinnedText}>Fijada</Text>
          </View>
        )}
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.date}>{formatDate(note.updatedAt)}</Text>
        {note.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {note.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.divider} />
        <Text style={styles.noteContent}>{note.content}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scroll: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[4],
    backgroundColor: Colors.dark.background,
  },
  notFoundText: {
    fontSize: Typography.size.md,
    color: Colors.dark.textSecondary,
  },
  backBtn: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.md,
  },
  backBtnText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.dark.text,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    alignSelf: 'flex-start',
  },
  pinnedText: {
    fontSize: Typography.size.xs,
    color: Colors.dark.accent,
    fontWeight: Typography.weight.medium,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.dark.text,
    lineHeight: Typography.size['2xl'] * Typography.lineHeight.tight,
  },
  date: {
    fontSize: Typography.size.xs,
    color: Colors.dark.textMuted,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  tag: {
    backgroundColor: Colors.dark.surfaceElevated,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  tagText: {
    fontSize: Typography.size.xs,
    color: Colors.dark.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: Spacing[1],
  },
  noteContent: {
    fontSize: Typography.size.base,
    color: Colors.dark.text,
    lineHeight: Typography.size.base * Typography.lineHeight.relaxed,
  },
});
