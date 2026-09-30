import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { C, card, money } from '../lib/store';

type Item = { label: string; value: number };
const PALETTE = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#8B5CF6', '#84CC16', '#94A3B8'];

export function BarChart({ data, title, height = 80 }: { data: Item[]; title?: string; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const empty = data.every(d => !d.value);
  return (
    <View style={card}>
      {title ? <Text style={{ color: C.mute }}>{title}</Text> : null}
      {empty ? <Text style={{ color: C.mute, textAlign: 'center', marginVertical: height / 2 }}>No spending yet</Text> : (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: height + 30, gap: 6, marginTop: 8 }}>
          {data.map(d => (
            <View key={d.label} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <Text style={{ color: C.mute, fontSize: 9 }}>{d.value ? Math.round(d.value) : ''}</Text>
              <View style={{ width: '100%', height: Math.max((d.value / max) * height, 2), backgroundColor: C.accent, borderRadius: 4 }} />
              <Text style={{ color: C.mute, fontSize: 10 }}>{d.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function DonutChart({ data, size = 150 }: { data: Item[]; size?: number }) {
  if (!data.length || !data.some(d => d.value > 0)) {
    return (
      <View style={[card, { alignItems: 'center', paddingVertical: 22 }]}>
        <Text style={{ color: C.mute }}>No spending to chart yet.</Text>
        <Text style={{ color: C.mute, fontSize: 11, marginTop: 2 }}>Add an expense and it will show up here.</Text>
      </View>
    );
  }
  const total = data.reduce((a, d) => a + d.value, 0) || 1, r = size / 2 - 14, circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <View style={[card, { flexDirection: 'row', alignItems: 'center', gap: 16 }]}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
            {data.map((d, i) => {
              const len = (d.value / total) * circ;
              const el = <Circle key={d.label} cx={size / 2} cy={size / 2} r={r} stroke={PALETTE[i % PALETTE.length]} strokeWidth={22} fill="none" strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset} />;
              offset += len;
              return el;
            })}
          </G>
        </Svg>
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ color: C.mute, fontSize: 11 }}>Total</Text>
          <Text style={{ color: C.text, fontWeight: '800' }}>{money(total)}</Text>
        </View>
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        {data.slice(0, 6).map((d, i) => (
          <View key={d.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: PALETTE[i % PALETTE.length] }} />
            <Text style={{ color: C.text, flex: 1 }}>{d.label}</Text>
            <Text style={{ color: C.mute }}>{Math.round((d.value / total) * 100)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
