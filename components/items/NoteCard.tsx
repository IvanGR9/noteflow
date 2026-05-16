import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Note } from '../../types';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface Props {
  note: Note;
  onPress: () => void;
}

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'ahora mismo';
  if (diffMin < 60) return `hace ${diffMin} min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;

  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function NoteCard({ note, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
        {note.pinned && (
          <Ionicons name="pin" size={14} color={Colors.dark.accent} style={styles.pin} />
        )}
      </View>

      {note.content.length > 0 && (
        <Text style={styles.content} numberOfLines={2}>
          {note.content}
        </Text>
      )}

      <Text style={styles.date}>{formatRelativeTime(note.updatedAt)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.accent,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  title: {
    flex: 1,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.dark.text,
  },
  pin: {
    marginTop: 2,
  },
  content: {
    fontSize: Typography.size.sm,
    color: Colors.dark.textSecondary,
    lineHeight: Typography.size.sm * Typography.lineHeight.normal,
  },
  date: {
    fontSize: Typography.size.xs,
    color: Colors.dark.textMuted,
  },
});
