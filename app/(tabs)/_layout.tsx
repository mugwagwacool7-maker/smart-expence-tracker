import { View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, useStore } from '../../lib/store';
import { Logo } from '../../components/Logo';
const icon = (n: any) => ({ color, size }: any) => <Ionicons name={n} color={color} size={size} />;
export default function TabsLayout() {
  const { ready, name } = useStore();
  if (ready && !name) return <Redirect href="/welcome" />;
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: C.card }, headerTintColor: C.text, headerTitleStyle: { fontWeight: '700' },
      sceneStyle: { backgroundColor: C.bg },
      tabBarStyle: { backgroundColor: C.card, borderTopWidth: 0, height: 62, paddingTop: 6, paddingBottom: 8 },
      tabBarActiveTintColor: C.accent, tabBarInactiveTintColor: C.mute,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      tabBarItemStyle: { paddingVertical: 2 },
      headerLeft: () => <View style={{ paddingLeft: 14 }}><Logo size={30} /></View>,
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: icon('list') }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar', tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="budget" options={{ title: 'Budget', tabBarIcon: icon('wallet') }} />
      <Tabs.Screen name="goals" options={{ title: 'Goals', tabBarIcon: icon('trophy') }} />
      <Tabs.Screen name="assistant" options={{ title: 'Assistant', tabBarIcon: icon('sparkles') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('settings') }} />
    </Tabs>
  );
}
