import { useState } from 'react';
import { ScrollView, Text, TextInput, View, Pressable } from 'react-native';
import { useStore, money, C, btn, card } from '../../lib/store';
export default function Goals() {
  const { goals, setGoals } = useStore();
  const [n, setN] = useState(''), [t, setT] = useState('');
  const fund = (id: string, v: number) => setGoals(goals.map(g => (g.id === id ? { ...g, saved: g.saved + v } : g)));
  const input = { backgroundColor: C.card, color: C.text, borderRadius: 12, padding: 12 };
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      {goals.length === 0 && <Text style={{ color: C.mute }}>No savings goals yet. Create one below.</Text>}
      {goals.map(g => {
        const p = Math.min(g.saved / g.target, 1);
        return (
          <View key={g.id} style={card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: C.text, fontWeight: '700' }}>{g.name}{p >= 1 ? ' ✅' : ''}</Text><Text style={{ color: C.mute }}>{money(g.saved)} / {money(g.target)}</Text></View>
            <View style={{ height: 8, backgroundColor: C.bg, borderRadius: 4, marginVertical: 8 }}><View style={{ width: `${p * 100}%`, height: 8, backgroundColor: C.green, borderRadius: 4 }} /></View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[10, 50].map(v => <Pressable key={v} onPress={() => fund(g.id, v)}><Text style={{ color: C.accent }}>+{v}</Text></Pressable>)}
              <Pressable onPress={() => setGoals(goals.filter(x => x.id !== g.id))}><Text style={{ color: C.red, marginLeft: 'auto' }}>Remove</Text></Pressable>
            </View>
          </View>
        );
      })}
      <TextInput placeholder="Goal name (e.g. Laptop)" placeholderTextColor={C.mute} value={n} onChangeText={setN} style={input} />
      <TextInput placeholder="Target amount" placeholderTextColor={C.mute} keyboardType="decimal-pad" value={t} onChangeText={setT} style={input} />
      <Pressable onPress={() => { const x = parseFloat(t); if (n.trim() && x > 0) { setGoals([...goals, { id: Date.now().toString(), name: n.trim(), target: x, saved: 0 }]); setN(''); setT(''); } }} style={btn(C.accent)}><Text style={{ color: '#fff', fontWeight: '800' }}>Add goal</Text></Pressable>
    </ScrollView>
  );
}
