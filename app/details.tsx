import { Alert, Text, View, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useStore, money, C, btn, card } from '../lib/store';
export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { txs, remove } = useStore();
  const t = txs.find(x => x.id === id);
  if (!t) return <Text style={{ color: C.mute, padding: 16 }}>Transaction not found.</Text>;
  const rows: [string, string][] = [['Title', t.title], ['Amount', money(t.amount)], ['Type', t.type], ['Category', t.category], ['Date', t.date], ['Repeats monthly', t.repeat ? 'Yes' : 'No'], ['Note', t.note || '—']];
  return (
    <View style={{ padding: 16, gap: 8 }}>
      {rows.map(([k, v]) => (<View key={k} style={[card, { flexDirection: 'row', justifyContent: 'space-between' }]}><Text style={{ color: C.mute }}>{k}</Text><Text style={{ color: C.text }}>{v}</Text></View>))}
      <Pressable onPress={() => router.push({ pathname: '/add', params: { id: t.id } })} style={btn(C.accent)}><Text style={{ color: '#fff', fontWeight: '800' }}>Edit</Text></Pressable>
      <Pressable onPress={() => Alert.alert('Delete this transaction?', t.title, [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { remove(t.id); router.back(); } }])} style={btn(C.red)}><Text style={{ fontWeight: '800' }}>Delete</Text></Pressable>
    </View>
  );
}
