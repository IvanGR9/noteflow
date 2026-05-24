import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { useNotesStore } from '../store/notesStore';
import { Colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#f97316',
    background: '#0f0f0f',
    surface: '#1a1a1a',
  },
};

export default function RootLayout() {
  const hasHydrated = useNotesStore((state) => state._hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [hasHydrated]);

  return (
    <PaperProvider theme={theme}>
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
    </PaperProvider>
  );
}
