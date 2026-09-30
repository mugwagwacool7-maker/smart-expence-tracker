import { AssistantMessage } from '../../components';
import { useState } from 'react';
import { FlatList, ScrollView, Text, TextInput, View, Pressable } from 'react-native';
import { useStore, answer, byCat, C } from '../../lib/store';
type Msg = { id: string; from: 'me' | 'ai'; text: string };
export default function Assistant() {
  const { txs, budget } = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([{ id: '0', from: 'ai', text: 'Hi! Ask me about your balance, spending, budget, or tips.' }]);
  const [q, setQ] = useState('');
  const send = async (text: string) => {
    if (!text.trim()) return;
    setQ('');
    let reply = answer(text, txs, budget);
    const url = process.env.EXPO_PUBLIC_AI_URL; // optional: your backend that calls the Claude API
    if (url) {
      try {
        const r = await fetch(url + '/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: text, transactions: txs, budget }) });
        const j = await r.json(); if (j.reply) reply = j.reply;
      } catch { /* fall back to the built-in answers */ }
    }
    setMsgs(m => [...m, { id: Date.now() + 'a', from: 'me', text }, { id: Date.now() + 'b', from: 'ai', text: reply }]);
  };
  // Each one resolves against the rule-based answers, so they work with or without the AI server
  const top = Object.entries(byCat(txs)).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Food';
  const suggestions = [
    'What is my balance?',
    'Give me a summary',
    'How much did I spend on ' + top + '?',
    'What is my top category?',
    'How much have I spent this month?',
    'What is my total income?',
    'How is my budget looking?',
    'What will I spend by month end?',
    'How much can I save?',
    'Any tips?',
  ];
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList data={msgs} keyExtractor={m => m.id} renderItem={({ item: m }) => <AssistantMessage from={m.from} text={m.text} />} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
        {suggestions.map(s => (
          <Pressable key={s} onPress={() => send(s)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.accent }}>
            <Text style={{ color: C.text, fontSize: 13 }}>{s}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <TextInput value={q} onChangeText={setQ} onSubmitEditing={() => send(q)} returnKeyType="send" placeholder="Ask about your money…" placeholderTextColor={C.mute} style={{ backgroundColor: C.card, color: C.text, borderRadius: 12, padding: 12 }} />
    </View>
  );
}
