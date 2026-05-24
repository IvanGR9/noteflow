import { Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const colors = Colors.dark;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
          height: 70,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarButton: ({ children, onPress, onLongPress, style, accessibilityState }) => {
          const selected = accessibilityState?.selected;
          return (
            <Pressable
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                style,
                selected && {
                  backgroundColor: `${colors.accent}26`,
                  borderRadius: 16,
                },
              ]}
            >
              {children}
            </Pressable>
          );
        },
      }}
    >
      <Tabs.Screen
        name="notas"
        options={{
          title: 'Notas',
          tabBarIcon: ({ color }) => (
            <Ionicons name={'document-text' as IoniconName} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="checklists"
        options={{
          title: 'Tareas',
          tabBarIcon: ({ color }) => (
            <Ionicons name={'checkbox' as IoniconName} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ideas"
        options={{
          title: 'Ideas',
          tabBarIcon: ({ color }) => (
            <Ionicons name={'bulb' as IoniconName} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="notas/[id]" options={{ href: null }} />
      <Tabs.Screen name="checklists/[id]" options={{ href: null }} />
      <Tabs.Screen name="ideas/[id]" options={{ href: null }} />
    </Tabs>
  );
}
