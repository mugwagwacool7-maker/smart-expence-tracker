import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, Pressable, View, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useStore, CATS, C, btn } from '../lib/store';
import { ymd } from '../components/Calendar';
export default function Add() {
  const { add, update, txs } = useStore();
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const old = txs.find(t => t.id === id);
  const [title, setTitle] = useState(old?.title || ''), [amount, setAmount] = useState(old ? String(old.amount) : ''), [note, setNote] = useState(old?.note || '');
  const [type, setType] = useState<'income' | 'expense'>(old?.type || 'expense'), [category, setCat] = useState(old?.category || 'Food'), [repeat, setRepeat] = useState(!!old?.repeat);
  const submit = () => {
    const n = parseFloat(amount);
    if (!title.trim()) return Alert.alert('Enter a title');
    if (!(n > 0)) return Alert.alert('Amount must be greater than zero');
    const data = { title: title.trim(), amount: n, type, category, note, repeat, date: old?.date || date || ymd(new Date()) };
    if (old) update({ ...data, id: old.id }); else add(data);
    router.back();
  };
  const chip = (on: boolean) => ({ padding: 10, borderRadius: 20, backgroundColor: on ? C.accent : C.card, borderWidth: 2, borderColor: on ? C.accent : 'transparent' });
  const chipText = (on: boolean) => ({ color: on ? '#fff' : C.text, fontWeight: on ? '700' as const : '400' as const });
  const input = { backgroundColor: C.card, color: C.text, borderRadius: 12, padding: 12 };
  const row = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 };
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <TextInput placeholder="Title" placeholderTextColor={C.mute} value={title} onChangeText={setTitle} style={input} />
      <TextInput placeholder="Amount" placeholderTextColor={C.mute} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} style={input} />
      <View style={row}>{(['expense', 'income'] as const).map(t => (<Pressable key={t} onPress={() => setType(t)} style={chip(type === t)}><Text style={chipText(type === t)}>{t === 'expense' ? '💸 Expense' : '💰 Income'}</Text></Pressable>))}</View>
      <View style={row}>{CATS.map(c => <Pressable key={c} onPress={() => setCat(c)} style={chip(category === c)}><Text style={chipText(category === c)}>{c}</Text></Pressable>)}</View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: C.text }}>Repeat every month</Text><Switch value={repeat} onValueChange={setRepeat} /></View>
      <TextInput placeholder="Note (optional)" placeholderTextColor={C.mute} value={note} onChangeText={setNote} style={input} />
      <Pressable onPress={submit} style={btn(C.green)}><Text style={{ fontWeight: '800' }}>{old ? 'Update' : 'Save'}</Text></Pressable>
    </ScrollView>
  );
}
