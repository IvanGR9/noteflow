import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNotesStore } from '../../../store/notesStore';
import { Colors, Typography, Spacing, Radius } from '../../../constants/theme';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function ChecklistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const note = useNotesStore((state) => state.checklists.find((n) => n.id === id));
  const toggleChecklistItem = useNotesStore((state) => state.toggleChecklistItem);

  const allCompleted = !!note && note.items.length > 0 && note.items.every((i) => i.checked);
  const prevAllCompleted = useRef(false);

  useEffect(() => {
    if (allCompleted && !prevAllCompleted.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    prevAllCompleted.current = allCompleted;
  }, [allCompleted]);

  if (!note) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Lista no encontrada</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const completed = note.items.filter((i) => i.checked).length;
  const total = note.items.length;
  const progress = total > 0 ? completed / total : 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: Colors.dark.surface },
          headerTintColor: Colors.dark.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.date}>{formatDate(note.updatedAt)}</Text>

        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{completed}/{total} completadas</Text>
        </View>

        <View style={styles.items}>
          {note.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemRow}
              onPress={() => toggleChecklistItem(note.id, item.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.checked ? 'checkbox' : 'square-outline'}
                size={22}
                color={item.checked ? Colors.dark.accent : Colors.dark.textMuted}
              />
              <Text style={[styles.itemText, item.checked && styles.itemChecked]}>
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    gap: Spacing[4],
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
  progressSection: {
    gap: Spacing[2],
  },
  progressTrack: {
    height: 4,
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
  items: {
    gap: Spacing[1],
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  itemText: {
    flex: 1,
    fontSize: Typography.size.base,
    color: Colors.dark.text,
    lineHeight: Typography.size.base * Typography.lineHeight.normal,
  },
  itemChecked: {
    color: Colors.dark.textMuted,
    textDecorationLine: 'line-through',
  },
});
