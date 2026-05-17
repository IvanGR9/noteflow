import { Animated, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { IdeaNote } from '../../types';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface Props {
  note: IdeaNote;
  onPress: () => void;
  onLongPress?: () => void;
}

type StatusConfig = {
  label: string;
  color: string;
};

const STATUS_CONFIG: Record<IdeaNote['status'], StatusConfig> = {
  raw: { label: 'En bruto', color: '#6366f1' },
  developing: { label: 'Desarrollando', color: Colors.dark.accent },
  ready: { label: 'Lista', color: Colors.dark.success },
  discarded: { label: 'Descartada', color: Colors.dark.textMuted },
};

const TAG_LIMIT = 4;

export function IdeaCard({ note, onPress, onLongPress }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const status = STATUS_CONFIG[note.status];
  const visibleTags = note.tags.slice(0, TAG_LIMIT);
  const overflowTags = note.tags.length - TAG_LIMIT;

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      style={[styles.card, { backgroundColor: `${status.color}26` }]}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
        {note.pinned && (
          <Ionicons name="pin" size={14} color={Colors.dark.accent} style={styles.pin} />
        )}
      </View>

      <View style={[styles.badge, { backgroundColor: `${status.color}33` }]}>
        <View style={[styles.badgeDot, { backgroundColor: status.color }]} />
        <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
      </View>

      {note.content.length > 0 && (
        <Text style={styles.content} numberOfLines={2}>
          {note.content}
        </Text>
      )}

      {visibleTags.length > 0 && (
        <View style={styles.tags}>
          {visibleTags.map((tag) => (
            <View key={tag} style={styles.chip}>
              <Text style={styles.chipText}>#{tag}</Text>
            </View>
          ))}
          {overflowTags > 0 && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>+{overflowTags}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    padding: Spacing[3],
    minHeight: 160,
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
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
  content: {
    fontSize: Typography.size.sm,
    color: Colors.dark.textSecondary,
    lineHeight: Typography.size.sm * Typography.lineHeight.normal,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1],
  },
  chip: {
    backgroundColor: Colors.dark.surfaceElevated,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  chipText: {
    fontSize: Typography.size.xs,
    color: Colors.dark.textSecondary,
    fontWeight: Typography.weight.medium,
  },
});
