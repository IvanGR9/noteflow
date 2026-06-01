import { Animated, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { ChecklistNote } from '../../types';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  note: ChecklistNote;
  onPress: () => void;
  onLongPress?: () => void;
}

const PREVIEW_LIMIT = 3;

export function ChecklistCard({ note, onPress, onLongPress }: Props) {
  const colors = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const items = note.items ?? [];
  const total = items.length;
  const completed = items.filter((i) => i.checked).length;
  const progress = total > 0 ? completed / total : 0;
  const previewItems = items.slice(0, PREVIEW_LIMIT);
  const overflow = total - PREVIEW_LIMIT;

  return (
    <Animated.View style={[{ flex: 1 }, { transform: [{ scale: scaleAnim }] }]}>
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} onLongPress={onLongPress} delayLongPress={300} onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start()} onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start()} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.iconBadge}>
        <Ionicons name="checkbox" size={28} color={colors.success} style={{ opacity: 0.25 }} />
      </View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {note.title}
        </Text>
        {note.pinned && (
          <Ionicons name="pin" size={14} color={colors.accent} style={styles.pin} />
        )}
      </View>

      {total > 0 && (
        <View style={styles.items}>
          {previewItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Ionicons
                name={item.checked ? 'checkbox' : 'square-outline'}
                size={16}
                color={item.checked ? colors.accent : colors.textMuted}
              />
              <Text
                style={[styles.itemText, { color: colors.text }, item.checked && { color: colors.textMuted, textDecorationLine: 'line-through' }]}
                numberOfLines={1}
              >
                {item.text}
              </Text>
            </View>
          ))}
          {overflow > 0 && (
            <Text style={[styles.overflow, { color: colors.textMuted }]}>+{overflow} más</Text>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: colors.accent }]} />
        </View>
        <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
          {completed}/{total} completadas
        </Text>
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 24,
    padding: Spacing[3],
    height: '100%',
    gap: Spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    paddingRight: Spacing[8],
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
  iconBadge: {
    position: 'absolute',
    top: Spacing[3],
    right: Spacing[3],
    zIndex: 1,
  },
});
