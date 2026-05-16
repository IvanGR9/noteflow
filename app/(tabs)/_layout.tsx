import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants/theme';

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
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: Typography.size.xs,
          fontWeight: Typography.weight.medium,
        },
      }}
    >
      <Tabs.Screen
        name="notas"
        options={{
          title: 'Notas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={'document-text' as IoniconName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="checklists"
        options={{
          title: 'Checklists',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={'checkbox' as IoniconName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ideas"
        options={{
          title: 'Ideas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={'bulb' as IoniconName} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
