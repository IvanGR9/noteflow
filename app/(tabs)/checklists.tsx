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
import { useTheme } from '../../hooks/useTheme';
import type { ChecklistNote } from '../../types';

function EmptyState() {
  const colors = useTheme();
  return (
    <View style={styles.empty}>
      <Ionicons name="checkbox-outline" size={52} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No tienes tareas aún.</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Pulsa + para crear una.</Text>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

export default function ChecklistsScreen() {
  const colors = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const allChecklists = useNotesStore((s) => s.checklists);
  const archiveChecklist = useNotesStore((s) => s.archiveChecklist);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const clearAllChecklists = useNotesStore((s) => s.clearAllChecklists);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'alpha'>('date-desc');
  const [menuTarget, setMenuTarget] = useState<ChecklistNote | null>(null);
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);

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
            Alert.alert('¿Eliminar tarea?', 'Esta acción no se puede deshacer.', [
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

  const headerMenuOptions = [
    {
      label: 'Ordenar: reciente primero',
      icon: 'time-outline' as const,
      onPress: () => setSortBy('date-desc'),
    },
    {
      label: 'Ordenar: antiguo primero',
      icon: 'time-outline' as const,
      onPress: () => setSortBy('date-asc'),
    },
    {
      label: 'Ordenar alfabéticamente',
      icon: 'text-outline' as const,
      onPress: () => setSortBy('alpha'),
    },
    {
      label: 'Ver archivados',
      icon: 'archive-outline' as const,
      onPress: () => router.push('/archivados'),
    },
    {
      label: 'Borrar todas las tareas',
      icon: 'trash-outline' as const,
      destructive: true,
      onPress: () =>
        Alert.alert('¿Borrar todas las tareas?', 'Esta acción no se puede deshacer.', [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Borrar todo',
            style: 'destructive',
            onPress: () => clearAllChecklists(),
          },
        ]),
    },
    {
      label: 'Ajustes',
      icon: 'settings-outline' as const,
      onPress: () => router.push('/ajustes'),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing[4], backgroundColor: colors.background }]}>
      <View style={styles.headingRow}>
        <Text style={[styles.heading, { color: colors.text }]}>Tareas</Text>
        <TouchableOpacity
          onPress={() => setHeaderMenuVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="ellipsis-vertical" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={[styles.searchRow, { backgroundColor: colors.surfaceElevated }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>
      <FlashList
        data={filtered}
        keyExtractor={(item: ChecklistNote) => item.id}
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
        ListEmptyComponent={EmptyState}
        estimatedItemSize={200}
        overrideItemLayout={(layout) => { layout.size = 200; }}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent, shadowColor: colors.accent }]}
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
      <ContextMenu
        visible={headerMenuVisible}
        onClose={() => setHeaderMenuVisible(false)}
        options={headerMenuOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[3],
  },
  heading: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.dark.text,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 50,
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[3],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
  },
  searchIcon: {
    marginRight: Spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.dark.text,
  },
  list: {
    paddingHorizontal: Spacing[4],
    paddingBottom: 100,
  },
  itemWrapper: {
    flex: 1,
    height: 200,
    marginHorizontal: Spacing[1],
    marginBottom: Spacing[2],
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
