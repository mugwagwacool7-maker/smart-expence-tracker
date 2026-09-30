import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore, money, C, btn } from '../../lib/store';
import { MonthGrid, MonthTotals, ymd, shiftMonth, label } from '../../components/Calendar';
import { TransactionCard, EmptyState } from '../../components';
import { BarChart } from '../../components/Charts';

export default function CalendarScreen() {
  const { txs } = useStore();
  const now = new Date();
  const [month, setMonth] = useState(ymd(now).slice(0, 7)), [day, setDay] = useState(ymd(now));
  const onMonth = (m: string) => { setMonth(m); setDay(`${m}-01`); };
  const dayTxs = txs.filter(t => t.date.slice(0, 10) === day).sort((a, b) => b.date.localeCompare(a.date));
  const weeks = [...Array(8)].map((_, w) => {
    const start = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1 + w * 7);
    const k = ymd(start).slice(0, 7);
    return { label: start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }).replace(/^\d+\s/, ''), value: txs.filter(t => t.date.slice(0, 7) === k && t.type === 'expense').reduce((a, t) => a + t.amount, 0) };
  }).filter((_, i) => i < 6);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => onMonth(shiftMonth(month, -1))} hitSlop={12}><Ionicons name="chevron-back" size={26} color={C.text} /></Pressable>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: '800' }}>{label(month)}</Text>
        <Pressable onPress={() => onMonth(shiftMonth(month, 1))} hitSlop={12}><Ionicons name="chevron-forward" size={26} color={C.text} /></Pressable>
      </View>
      <MonthGrid txs={txs} month={month} selected={day} onSelect={setDay} />
      <MonthTotals txs={txs} month={month} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: C.text, fontSize: 17, fontWeight: '700' }}>{new Date(day + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
        <Pressable onPress={() => router.push({ pathname: '/add', params: { date: day } })}><Text style={{ color: C.accent, fontWeight: '700' }}>+ Add</Text></Pressable>
      </View>
      {dayTxs.length === 0 ? <EmptyState text="Nothing on this day." /> : dayTxs.map(t => (
        <TransactionCard key={t.id} t={t} onPress={() => router.push({ pathname: '/details', params: { id: t.id } })} />
      ))}
      <Text style={{ color: C.mute, marginTop: 8 }}>Spending, last 6 months</Text>
      <BarChart data={weeks} height={70} />
    </ScrollView>
  );
}
