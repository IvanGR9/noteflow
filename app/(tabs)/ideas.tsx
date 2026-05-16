import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotesStore } from '../../store/notesStore';
import { IdeaCard } from '../../components/items/IdeaCard';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import type { IdeaNote } from '../../types';

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Ionicons name="bulb-outline" size={52} color={Colors.dark.textMuted} />
      <Text style={styles.emptyTitle}>No tienes ideas aún.</Text>
      <Text style={styles.emptySubtitle}>Pulsa + para capturar una.</Text>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

export default function IdeasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const ideas = useNotesStore((state) => state.ideas);

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing[4] }]}>
      <Text style={styles.heading}>Ideas</Text>
      <FlashList
        data={ideas}
        keyExtractor={(item: IdeaNote) => item.id}
        estimatedItemSize={110}
        renderItem={({ item }: { item: IdeaNote }) => (
          <IdeaCard
            note={item}
            onPress={() => router.push({ pathname: '/(tabs)/ideas/[id]', params: { id: item.id } })}
          />
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: '/nueva-nota', params: { type: 'idea' } })}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  heading: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.dark.text,
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[3],
  },
  list: {
    paddingHorizontal: Spacing[4],
    paddingBottom: 100,
  },
  separator: {
    height: Spacing[3],
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.medium,
    color: Colors.dark.textSecondary,
    marginTop: Spacing[2],
  },
  emptySubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.dark.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
