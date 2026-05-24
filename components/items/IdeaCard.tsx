import { Animated, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { IdeaNote } from '../../types';
import { Typography, Spacing, Radius } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  note: IdeaNote;
  onPress: () => void;
  onLongPress?: () => void;
}

type StatusConfig = {
  label: string;
  color: string;
};

const TAG_LIMIT = 2;

export function IdeaCard({ note, onPress, onLongPress }: Props) {
  const colors = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const STATUS_CONFIG: Record<IdeaNote['status'], StatusConfig> = {
    raw: { label: 'En bruto', color: '#6366f1' },
    developing: { label: 'Desarrollando', color: colors.accent },
    ready: { label: 'Lista', color: colors.success },
    discarded: { label: 'Descartada', color: colors.textMuted },
  };

  const status = STATUS_CONFIG[note.status];
  const visibleTags = note.tags.slice(0, TAG_LIMIT);
  const overflowTags = note.tags.length - TAG_LIMIT;

  return (
    <Animated.View style={[{ flex: 1 }, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={300}
        onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start()}
        onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start()}
        style={[
          styles.card,
          {
            backgroundColor: `${status.color}40`,
            borderColor: status.color,
          },
        ]}
      >
        <View style={styles.iconBadge}>
          <Ionicons name="bulb" size={28} color="#ffffff" style={{ opacity: 0.25 }} />
        </View>
        <View style={styles.top}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{note.title}</Text>
            {note.pinned && (
              <Ionicons name="pin" size={11} color="rgba(255,255,255,0.5)" style={styles.pin} />
            )}
          </View>
          {note.content.length > 0 && (
            <Text style={[styles.content, { color: colors.textSecondary }]} numberOfLines={2}>{note.content}</Text>
          )}
        </View>

        <View style={styles.bottom}>
          <View style={styles.tagsRow}>
            {visibleTags.map((tag) => (
              <View key={tag} style={styles.chip}>
                <Text style={[styles.chipText, { color: colors.text }]}>#{tag}</Text>
              </View>
            ))}
            {overflowTags > 0 && (
              <View style={styles.chip}>
                <Text style={[styles.chipText, { color: colors.text }]}>+{overflowTags}</Text>
              </View>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: status.color }]}>
            <Text style={styles.badgeText}>{status.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    padding: Spacing[4],
    height: '100%',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  top: {
    gap: Spacing[2],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[1],
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 22,
    paddingRight: Spacing[8],
  },
  pin: {
    marginTop: 3,
  },
  content: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 19,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1],
    flex: 1,
  },
  chip: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  chipText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  iconBadge: {
    position: 'absolute',
    top: Spacing[3],
    right: Spacing[3],
    zIndex: 1,
  },
});
