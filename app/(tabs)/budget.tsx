import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useStore, sum, byCat, thisMonth, predict, CATS, C } from '../../lib/store';
import { BudgetCard, Button, Header, Input } from '../../components';
import { DonutChart } from '../../components/Charts';
export default function Budget() {
  const { txs, budget, setBudget, catBudgets, setCatBudget } = useStore();
  const [v, setV] = useState(''), [cv, setCv] = useState<Record<string, string>>({});
  const month = thisMonth(txs), spent = sum(month, 'expense'), cats = byCat(month);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <BudgetCard label="Monthly budget" spent={spent} limit={budget} />
      <Text style={{ color: C.mute }}>🔮 {predict(txs, budget)}</Text>
      <DonutChart data={Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }))} />
      <Input placeholder="New monthly budget" keyboardType="decimal-pad" value={v} onChangeText={setV} />
      <Button label="Save budget" onPress={() => { const n = parseFloat(v); if (n > 0) { setBudget(n); setV(''); } }} />
      <Header title="Category limits" sub="Type a limit and tap Set" />
      {CATS.filter(c => c !== 'Salary').map(c => (
        <View key={c} style={{ gap: 6 }}>
          {catBudgets[c] ? <BudgetCard label={c} spent={cats[c] || 0} limit={catBudgets[c]} /> : null}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Input style={{ flex: 1 }} placeholder={`${c} limit`} keyboardType="decimal-pad" value={cv[c] || ''} onChangeText={t => setCv({ ...cv, [c]: t })} />
            <View style={{ width: 80 }}><Button label="Set" color={C.green} onPress={() => { const n = parseFloat(cv[c]); if (n > 0) { setCatBudget(c, n); setCv({ ...cv, [c]: '' }); } }} /></View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
