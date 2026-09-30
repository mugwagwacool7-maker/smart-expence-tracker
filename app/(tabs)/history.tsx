import { useState } from 'react';
import { FlatList, ScrollView, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { useStore, Tx, CATS, C } from '../../lib/store';
import { SearchBar, TransactionCard, EmptyState } from '../../components';
export default function History() {
  const { txs, remove, add } = useStore();
  const [q, setQ] = useState(''), [type, setType] = useState('all'), [cat, setCat] = useState('All'), [undo, setUndo] = useState<Tx | null>(null);
  const list = txs.filter(t => (type === 'all' || t.type === type) && (cat === 'All' || t.category === cat) && (t.title + t.category).toLowerCase().includes(q.toLowerCase()));
  const del = (t: Tx) => { remove(t.id); setUndo(t); setTimeout(() => setUndo(null), 5000); };
  const chips = (opts: string[], val: string, set: (s: string) => void) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginVertical: 6 }} contentContainerStyle={{ gap: 8 }}>
      {opts.map(o => <Pressable key={o} onPress={() => set(o)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: val === o ? C.accent : C.card }}><Text style={{ color: val === o ? '#fff' : C.text }}>{o}</Text></Pressable>)}
    </ScrollView>
  );
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <SearchBar value={q} onChangeText={setQ} />
      {chips(['all', 'income', 'expense'], type, setType)}
      {chips(['All', ...CATS], cat, setCat)}
      <FlatList data={list} keyExtractor={t => t.id} ListEmptyComponent={<EmptyState text="No transactions found." />}
        renderItem={({ item: t }) => (
          <Swipeable renderRightActions={() => (<Pressable onPress={() => del(t)} style={{ backgroundColor: C.red, justifyContent: 'center', paddingHorizontal: 22, borderRadius: 12, marginBottom: 8, marginLeft: 8 }}><Text style={{ color: '#fff', fontWeight: '800' }}>Delete</Text></Pressable>)}>
            <View style={{ marginBottom: 8 }}><TransactionCard t={t} onPress={() => router.push({ pathname: '/details', params: { id: t.id } })} /></View>
          </Swipeable>
        )} />
      {undo && <Pressable onPress={() => { add(undo); setUndo(null); }} style={{ backgroundColor: C.accent, padding: 12, borderRadius: 12 }}><Text style={{ color: '#fff' }}>Deleted “{undo.title}”. Tap to undo.</Text></Pressable>}
    </View>
  );
}
