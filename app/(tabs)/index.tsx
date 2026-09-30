import { ScrollView, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useStore, sum, byCat, thisMonth, predict, C, card } from '../../lib/store';
import { SummaryCard, CategoryCard, BudgetCard, TransactionCard, Button, EmptyState } from '../../components';
import { BarChart, DonutChart } from '../../components/Charts';
export default function Home() {
  const { txs, budget, name } = useStore();
  const inc = sum(txs, 'income'), exp = sum(txs, 'expense');
  const cats = Object.entries(byCat(txs)).sort((a, b) => b[1] - a[1]);
  const months = [...Array(6)].map((_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + i); const k = d.toISOString().slice(0, 7); return { k: k.slice(5), v: sum(txs.filter(t => t.date.slice(0, 7) === k), 'expense') }; });
  const cur = months[5].v, prev = months[4].v;
  const diff = prev ? `Spending is ${cur <= prev ? 'down' : 'up'} ${Math.abs(Math.round(((cur - prev) / prev) * 100))}% vs last month` : 'Spending, last 6 months';
  const stat = (label: string, value: string) => (<View style={[card, { flex: 1 }]}><Text style={{ color: C.mute }}>{label}</Text><Text style={{ color: C.text, fontSize: 20, fontWeight: '800' }}>{value}</Text></View>);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ color: C.mute }}>Hello, {name} 👋</Text>
      <SummaryCard balance={inc - exp} income={inc} expense={exp} />
      <BudgetCard label="Monthly budget" spent={sum(thisMonth(txs), 'expense')} limit={budget} />
      <Text style={{ color: C.mute }}>🔮 {predict(txs, budget)}</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>{stat('Transactions', String(txs.length))}{stat('Top category', cats[0] ? cats[0][0] : '—')}</View>
      <BarChart title={diff} data={months.map(m => ({ label: m.k, value: m.v }))} />
      <Text style={{ color: C.text, fontSize: 18, fontWeight: '700' }}>Spending by category</Text>
      {cats.length === 0 && <EmptyState text="No expenses yet. Tap + to add one." />}
      <DonutChart data={cats.map(([label, value]) => ({ label, value }))} />
      {cats.map(([c, v]) => <CategoryCard key={c} name={c} value={v} pct={v / exp} />)}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: '700' }}>Recent transactions</Text>
        <Pressable onPress={() => router.push('/history')}><Text style={{ color: C.accent }}>See all</Text></Pressable>
      </View>
      {txs.length === 0 && <EmptyState text="Nothing here yet." />}
      {txs.slice(0, 5).map(t => <TransactionCard key={t.id} t={t} onPress={() => router.push({ pathname: '/details', params: { id: t.id } })} />)}
      <Button label="+ Add Transaction" color={C.green} onPress={() => router.push('/add')} />
    </ScrollView>
  );
}
