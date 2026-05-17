import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../constants/theme';

export default function AjustesScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Ajustes',
          headerStyle: { backgroundColor: Colors.dark.surface },
          headerTintColor: Colors.dark.text,
          headerShadowVisible: false,
        }}
      />
      <View style={styles.container}>
        <Ionicons name="settings-outline" size={64} color={Colors.dark.textMuted} />
        <Text style={styles.label}>Próximamente más opciones</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[4],
    padding: Spacing[6],
  },
  label: {
    fontSize: Typography.size.base,
    color: Colors.dark.textSecondary,
  },
});
