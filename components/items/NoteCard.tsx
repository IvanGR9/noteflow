import { Animated, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { Note } from '../../types';
import { Colors, Spacing } from '../../constants/theme';

interface Props {
  note: Note;
  onPress: () => void;
  onLongPress?: () => void;
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

export function NoteCard({ note, onPress, onLongPress }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.animated, { opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={300}
        style={styles.card}
      >
        <View style={styles.iconBadge}>
          <Ionicons name="document-text" size={28} color={Colors.dark.accent} style={{ opacity: 0.25 }} />
        </View>
        <View style={styles.top}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{note.title}</Text>
            {note.pinned && (
              <Ionicons name="pin" size={11} color={Colors.dark.textMuted} style={styles.pin} />
            )}
          </View>
          {note.content.length > 0 && (
            <Text style={styles.content} numberOfLines={3}>{note.content}</Text>
          )}
        </View>
        <Text style={styles.date}>{formatRelativeTime(note.updatedAt)}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animated: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 24,
    padding: Spacing[4],
    height: '100%',
    justifyContent: 'space-between',
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
    color: Colors.dark.text,
    lineHeight: 22,
    paddingRight: Spacing[8],
  },
  pin: {
    marginTop: 3,
  },
  content: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 19,
  },
  date: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: Spacing[2],
  },
  iconBadge: {
    position: 'absolute',
    top: Spacing[3],
    right: Spacing[3],
    zIndex: 1,
  },
});
