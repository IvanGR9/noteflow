import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useNotesStore } from '../store/notesStore';
import { Colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const isDarkMode = useNotesStore((state) => state.isDarkMode);

  const [user, setUser] = useState<FirebaseAuthTypes.User | null | undefined>(undefined);
  const router = useRouter();
  const segments = useSegments();

  const paperTheme = isDarkMode
    ? { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, primary: '#f97316', background: '#0f0f0f', surface: '#1a1a1a' } }
    : { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: '#f97316', background: '#fafafa', surface: '#ffffff' } };

  // Suscripción al estado de auth — undefined = aún no resuelto
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  // Redirige y oculta el splash una vez que auth está resuelto
  useEffect(() => {
    if (user === undefined) return;

    const inAuthGroup = segments[0] === 'login';

    if (!user && !inAuthGroup) {
      router.replace('/login');
      SplashScreen.hideAsync();
    } else if (user && inAuthGroup) {
      fetchNotes().finally(() => {
        router.replace('/(tabs)/notas');
        SplashScreen.hideAsync();
      });
    } else if (user && !inAuthGroup) {
      fetchNotes().finally(() => SplashScreen.hideAsync());
    } else {
      SplashScreen.hideAsync();
    }
  }, [user]);

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
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
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
