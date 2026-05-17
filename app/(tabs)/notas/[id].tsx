import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const note = useNotesStore((state) => state.notes.find((n) => n.id === id));

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
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing[4] }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/notas')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/nueva-nota', params: { type: 'note', id: note.id } })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="create-outline" size={24} color={Colors.dark.accent} />
          </TouchableOpacity>
        </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    alignSelf: 'flex-start',
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
