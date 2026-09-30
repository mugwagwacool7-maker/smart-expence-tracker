import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { C, Tx, card, money } from '../lib/store';

// Dates are handled as local YYYY-MM-DD strings throughout, matching Tx.date
export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const monthOf = (k: string) => { const [y, m] = k.split('-').map(Number); return new Date(y, m - 1, 1); };
export const shiftMonth = (k: string, n: number) => { const d = monthOf(k); d.setMonth(d.getMonth() + n); return ymd(d).slice(0, 7); };
export const label = (k: string) => monthOf(k).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Month grid with a spending heat tint per day, plus per-day totals for the footer
export function MonthGrid({ txs, month, selected, onSelect }: {
  txs: Tx[]; month: string; selected: string; onSelect: (d: string) => void;
}) {
  const { cells, byDay, peak } = useMemo(() => {
    const first = monthOf(month), y = first.getFullYear(), m = first.getMonth();
    const start = new Date(y, m, 1).getDay(), len = new Date(y, m + 1, 0).getDate();
    const out: (string | null)[] = Array(start).fill(null);
    for (let d = 1; d <= len; d++) out.push(ymd(new Date(y, m, d)));
    const map: Record<string, number> = {};
    txs.filter(t => t.type === 'expense').forEach(t => { const k = t.date.slice(0, 10); map[k] = (map[k] || 0) + t.amount; });
    return { cells: out, byDay: map, peak: Math.max(...Object.values(map), 0) };
  }, [txs, month]);

  const today = ymd(new Date());
  return (
    <View style={card}>
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {DOW.map((d, i) => <Text key={i} style={{ flex: 1, textAlign: 'center', color: C.mute, fontSize: 11, fontWeight: '700' }}>{d}</Text>)}
      </View>
      {Array.from({ length: Math.ceil(cells.length / 7) }).map((_, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {cells.slice(r * 7, r * 7 + 7).map((d, i) => {
            if (!d) return <View key={i} style={{ flex: 1, aspectRatio: 1 }} />;
            const v = byDay[d] || 0, heat = peak ? v / peak : 0;
            const on = d === selected;
            return (
              <Pressable key={i} onPress={() => onSelect(d)} style={{ flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 }}>
                <View style={{
                  width: '100%', height: '100%', borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: on ? C.accent : v ? `rgba(99,102,241,${0.12 + heat * 0.45})` : 'transparent',
                  borderWidth: d === today && !on ? 1 : 0, borderColor: C.accent,
                }}>
                  <Text style={{ color: on ? '#fff' : C.text, fontSize: 13, fontWeight: d === today || on ? '800' : '500' }}>{Number(d.slice(8))}</Text>
                  {!!v && <Text style={{ color: on ? '#fff' : C.mute, fontSize: 8 }}>{Math.round(v)}</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// Month totals strip: income vs expenses vs net for the visible month
export function MonthTotals({ txs, month }: { txs: Tx[]; month: string }) {
  const m = txs.filter(t => t.date.slice(0, 7) === month);
  const inc = m.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const exp = m.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const cell = (l: string, v: string, c: string) => (
    <View style={[card, { flex: 1, alignItems: 'center' }]}>
      <Text style={{ color: C.mute, fontSize: 11 }}>{l}</Text>
      <Text style={{ color: c, fontWeight: '800', fontSize: 15 }}>{v}</Text>
    </View>
  );
  return <View style={{ flexDirection: 'row', gap: 8 }}>{cell('In', money(inc), C.green)}{cell('Out', money(exp), C.red)}{cell('Net', money(inc - exp), inc - exp >= 0 ? C.green : C.red)}</View>;
}
