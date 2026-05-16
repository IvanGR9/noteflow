import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useNotesStore } from '../store/notesStore';
import { Colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hasHydrated = useNotesStore((state) => state._hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [hasHydrated]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.dark.background },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="nueva-nota"
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Nueva nota',
          headerStyle: { backgroundColor: Colors.dark.surface },
          headerTintColor: Colors.dark.text,
          headerShadowVisible: false,
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
