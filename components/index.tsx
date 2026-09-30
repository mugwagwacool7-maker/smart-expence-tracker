import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';
import { C, Tx, card, money } from '../lib/store';

const row = { flexDirection: 'row' as const, justifyContent: 'space-between' as const };
export const Header = ({ title, sub }: { title: string; sub?: string }) => (
  <View style={{ paddingVertical: 6 }}><Text style={{ color: C.text, fontSize: 20, fontWeight: '800' }}>{title}</Text>{sub ? <Text style={{ color: C.mute }}>{sub}</Text> : null}</View>
);
export const Button = ({ label, onPress, color }: { label: string; onPress: () => void; color?: string }) => (
  <Pressable onPress={onPress} style={{ backgroundColor: color || C.accent, padding: 14, borderRadius: 14, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: '800' }}>{label}</Text></Pressable>
);
export const Input = (p: TextInputProps) => <TextInput placeholderTextColor={C.mute} {...p} style={[{ backgroundColor: C.card, color: C.text, borderRadius: 12, padding: 12 }, p.style]} />;
export const SearchBar = (p: TextInputProps) => <Input placeholder="Search…" {...p} />;
export const EmptyState = ({ text }: { text: string }) => <Text style={{ color: C.mute, textAlign: 'center', marginVertical: 30 }}>{text}</Text>;
export const Bar = ({ pct, color }: { pct: number; color: string }) => (
  <View style={{ height: 8, backgroundColor: C.bg, borderRadius: 4, marginTop: 8 }}><View style={{ width: `${Math.min(pct, 1) * 100}%`, height: 8, backgroundColor: color, borderRadius: 4 }} /></View>
);
export const SummaryCard = ({ balance, income, expense }: { balance: number; income: number; expense: number }) => (
  <View style={{ backgroundColor: C.accent, borderRadius: 20, padding: 20 }}>
    <Text style={{ color: '#E0E7FF' }}>Current balance</Text>
    <Text style={{ color: '#fff', fontSize: 36, fontWeight: '800' }}>{money(balance)}</Text>
    <View style={[row, { marginTop: 12 }]}><Text style={{ color: '#BBF7D0' }}>↑ {money(income)}</Text><Text style={{ color: '#FECACA' }}>↓ {money(expense)}</Text></View>
  </View>
);
export const CategoryCard = ({ name, value, pct }: { name: string; value: number; pct: number }) => (
  <View style={card}><View style={row}><Text style={{ color: C.text }}>{name}</Text><Text style={{ color: C.mute }}>{money(value)}</Text></View><Bar pct={pct} color={C.accent} /></View>
);
export const BudgetCard = ({ label, spent, limit }: { label: string; spent: number; limit: number }) => {
  const p = limit ? spent / limit : 0, col = p >= 1 ? C.red : p >= 0.8 ? C.amber : C.green;
  return (
    <View style={card}>
      <View style={row}><Text style={{ color: C.text, fontWeight: '700' }}>{label}</Text><Text style={{ color: C.mute }}>{money(spent)} / {money(limit)}</Text></View>
      <Bar pct={p} color={col} />
      <Text style={{ color: col, marginTop: 6 }}>{!limit ? 'No limit set' : p >= 1 ? 'Over budget!' : p >= 0.8 ? 'Close to the limit' : `${money(limit - spent)} left`}</Text>
    </View>
  );
};
export const TransactionCard = ({ t, onPress }: { t: Tx; onPress: () => void }) => (
  <Pressable onPress={onPress} style={[card, row]}>
    <View><Text style={{ color: C.text, fontWeight: '600' }}>{t.title}{t.repeat ? ' 🔁' : ''}</Text><Text style={{ color: C.mute }}>{t.category} · {t.date}</Text></View>
    <Text style={{ color: t.type === 'income' ? C.green : C.red, fontWeight: '700' }}>{t.type === 'income' ? '+' : '-'}{money(t.amount)}</Text>
  </Pressable>
);
export const AssistantMessage = ({ from, text }: { from: 'me' | 'ai'; text: string }) => (
  <View style={{ alignSelf: from === 'me' ? 'flex-end' : 'flex-start', backgroundColor: from === 'me' ? C.accent : C.card, padding: 12, borderRadius: 16, marginBottom: 8, maxWidth: '85%' }}>
    <Text style={{ color: from === 'me' ? '#fff' : C.text }}>{text}</Text>
  </View>
);
