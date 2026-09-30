import { useState } from 'react';
import { Text, TextInput, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useStore, C, btn } from '../lib/store';
export default function Welcome() {
  const { setName } = useStore();
  const [n, setN] = useState('');
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 14, backgroundColor: C.bg }}>
      <Text style={{ fontSize: 40 }}>💸</Text>
      <Text style={{ color: C.text, fontSize: 28, fontWeight: '800' }}>Smart Expense Tracker</Text>
      <Text style={{ color: C.mute }}>Track income, budgets and goals, and ask your assistant anything.</Text>
      <TextInput placeholder="Your name" placeholderTextColor={C.mute} value={n} onChangeText={setN} style={{ backgroundColor: C.card, color: C.text, borderRadius: 12, padding: 12 }} />
      <Pressable onPress={() => { if (n.trim()) { setName(n.trim()); router.replace('/'); } }} style={btn(C.accent)}><Text style={{ color: '#fff', fontWeight: '800' }}>Get started</Text></Pressable>
    </View>
  );
}
