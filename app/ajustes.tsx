import { View, Text, Switch, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotesStore } from '../store/notesStore';
import { useTheme } from '../hooks/useTheme';
import { Colors, Typography, Spacing } from '../constants/theme';

export default function AjustesScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const isDarkMode = useNotesStore((s) => s.isDarkMode);
  const toggleDarkMode = useNotesStore((s) => s.toggleDarkMode);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Ajustes',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + Spacing[4] }]}>
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>Modo oscuro</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            thumbColor={Colors.dark.accent}
            trackColor={{ false: colors.border, true: `${Colors.dark.accent}66` }}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderRadius: 16,
    borderWidth: 1,
  },
  rowLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
});
