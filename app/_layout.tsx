import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider, C, useStore } from '../lib/store';
import { Logo, Splash } from '../components/Logo';

// Back arrow + logo, so the logo stays top-left on stack screens too
const brand = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
    <Pressable onPress={() => router.back()} hitSlop={10}><Ionicons name="chevron-back" size={26} color={C.text} /></Pressable>
    <Logo size={28} />
  </View>
);
function Screens() {
  const [splash, setSplash] = useState(true);
  useStore(); // re-render when the theme changes
  return (
    <>
      <Stack screenOptions={{ headerStyle: { backgroundColor: C.card }, headerTintColor: C.text, contentStyle: { backgroundColor: C.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="details" options={{ title: 'Details', headerBackVisible: false, headerLeft: brand }} />
        <Stack.Screen name="add" options={{ title: 'Transaction', presentation: 'modal', headerBackVisible: false, headerLeft: brand }} />
      </Stack>
      {splash && <Splash onDone={() => setSplash(false)} />}
    </>
  );
}
export default function Root() {
  return (<GestureHandlerRootView style={{ flex: 1 }}><Provider><Screens /></Provider></GestureHandlerRootView>);
}
