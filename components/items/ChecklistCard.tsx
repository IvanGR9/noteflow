import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ChecklistNote } from '../../types';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface Props {
  note: ChecklistNote;
  onPress: () => void;
}

const PREVIEW_LIMIT = 3;

export function ChecklistCard({ note, onPress }: Props) {
  const total = note.items.length;
  const completed = note.items.filter((i) => i.checked).length;
  const progress = total > 0 ? completed / total : 0;
  const previewItems = note.items.slice(0, PREVIEW_LIMIT);
  const overflow = total - PREVIEW_LIMIT;

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

      {total > 0 && (
        <View style={styles.items}>
          {previewItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Ionicons
                name={item.checked ? 'checkbox' : 'square-outline'}
                size={16}
                color={item.checked ? Colors.dark.accent : Colors.dark.textMuted}
              />
              <Text
                style={[styles.itemText, item.checked && styles.itemChecked]}
                numberOfLines={1}
              >
                {item.text}
              </Text>
            </View>
          ))}
          {overflow > 0 && (
            <Text style={styles.overflow}>+{overflow} más</Text>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {completed}/{total} completadas
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.md,
    padding: Spacing[4],
    gap: Spacing[3],
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
  items: {
    gap: Spacing[2],
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  itemText: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.dark.text,
  },
  itemChecked: {
    color: Colors.dark.textMuted,
    textDecorationLine: 'line-through',
  },
  overflow: {
    fontSize: Typography.size.xs,
    color: Colors.dark.textMuted,
    marginLeft: Spacing[1] + 16 + Spacing[2], // alinea con el texto de los items
  },
  footer: {
    gap: Spacing[1],
  },
  progressTrack: {
    height: 3,
    backgroundColor: Colors.dark.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.accent,
    borderRadius: Radius.full,
  },
  progressLabel: {
    fontSize: Typography.size.xs,
    color: Colors.dark.textMuted,
  },
});
