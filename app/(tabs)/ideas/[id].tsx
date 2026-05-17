import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotesStore } from '../../../store/notesStore';
import { Colors, Typography, Spacing, Radius } from '../../../constants/theme';
import type { IdeaNote } from '../../../types';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

type StatusConfig = { label: string; color: string };

const STATUS_CONFIG: Record<IdeaNote['status'], StatusConfig> = {
  raw: { label: 'En bruto', color: '#6366f1' },
  developing: { label: 'Desarrollando', color: Colors.dark.accent },
  ready: { label: 'Lista', color: Colors.dark.success },
  discarded: { label: 'Descartada', color: Colors.dark.textMuted },
};

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const note = useNotesStore((state) => state.ideas.find((n) => n.id === id));

  if (!note) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Idea no encontrada</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = STATUS_CONFIG[note.status];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing[4] }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <View style={[styles.badge, { backgroundColor: `${status.color}33` }]}>
          <View style={[styles.badgeDot, { backgroundColor: status.color }]} />
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>

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

        {note.content.length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.noteContent}>{note.content}</Text>
          </>
        )}
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
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    color: Colors.dark.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: Typography.size.xs,
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
