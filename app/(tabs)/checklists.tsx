import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState, useMemo } from 'react';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotesStore } from '../../store/notesStore';
import { ChecklistCard } from '../../components/items/ChecklistCard';
import { ContextMenu } from '../../components/ContextMenu';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import type { ChecklistNote } from '../../types';

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Ionicons name="checkbox-outline" size={52} color={Colors.dark.textMuted} />
      <Text style={styles.emptyTitle}>No tienes checklists aún.</Text>
      <Text style={styles.emptySubtitle}>Pulsa + para crear una.</Text>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

export default function ChecklistsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const allChecklists = useNotesStore((s) => s.checklists);
  const archiveChecklist = useNotesStore((s) => s.archiveChecklist);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'alpha'>('date-desc');
  const [menuTarget, setMenuTarget] = useState<ChecklistNote | null>(null);

  const filtered = useMemo(() => {
    const list = allChecklists
      .filter((n) => !n.archived)
      .filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (sortBy === 'date-desc') {
      return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    if (sortBy === 'date-asc') {
      return [...list].sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    }
    return [...list].sort((a, b) => a.title.localeCompare(b.title));
  }, [allChecklists, searchQuery, sortBy]);

  const handleLongPress = (item: ChecklistNote) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuTarget(item);
  };

  const menuOptions = menuTarget
    ? [
        {
          label: 'Archivar',
          icon: 'archive-outline' as const,
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            archiveChecklist(menuTarget.id);
          },
        },
        {
          label: 'Eliminar',
          icon: 'trash-outline' as const,
          destructive: true,
          onPress: () =>
            Alert.alert('¿Eliminar checklist?', 'Esta acción no se puede deshacer.', [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  deleteNote(menuTarget.id, 'checklist');
                },
              },
            ]),
        },
      ]
    : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing[4] }]}>
      <Text style={styles.heading}>Checklists</Text>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.dark.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          placeholderTextColor={Colors.dark.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>
      <FlashList
        data={filtered}
        keyExtractor={(item: ChecklistNote) => item.id}
        estimatedItemSize={120}
        numColumns={2}
        renderItem={({ item }: { item: ChecklistNote }) => (
          <View style={styles.itemWrapper}>
            <ChecklistCard
              note={item}
              onPress={() => router.push({ pathname: '/(tabs)/checklists/[id]', params: { id: item.id } })}
              onLongPress={() => handleLongPress(item)}
            />
          </View>
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={EmptyState}
        estimatedItemSize={180}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: '/nueva-nota', params: { type: 'checklist' } })}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
      <ContextMenu
        visible={menuTarget !== null}
        onClose={() => setMenuTarget(null)}
        options={menuOptions}
      />
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[3],
  },
  searchIcon: {
    marginRight: Spacing[2],
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: Typography.size.sm,
    color: Colors.dark.text,
  },
  list: {
    paddingHorizontal: Spacing[4],
    paddingBottom: 100,
  },
  itemWrapper: {
    flex: 1,
    marginHorizontal: Spacing[1],
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
