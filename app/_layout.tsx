import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { useNotesStore } from '../store/notesStore';
import { Colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const isDarkMode = useNotesStore((state) => state.isDarkMode);

  const paperTheme = isDarkMode
    ? { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, primary: '#f97316', background: '#0f0f0f', surface: '#1a1a1a' } }
    : { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: '#f97316', background: '#fafafa', surface: '#ffffff' } };

  useEffect(() => {
    fetchNotes().finally(() => SplashScreen.hideAsync());
  }, []);

  const bg = isDarkMode ? Colors.dark.background : Colors.light.background;
  const surface = isDarkMode ? Colors.dark.surface : Colors.light.surface;
  const text = isDarkMode ? Colors.dark.text : Colors.light.text;

  return (
    <PaperProvider theme={paperTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: bg },
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
            headerStyle: { backgroundColor: surface },
            headerTintColor: text,
            headerShadowVisible: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
