import { Share, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { dailyReminder } from '../../lib/notify';
import { useAuth } from '../../lib/auth';
import { useStore, C, Theme, btn, card } from '../../lib/store';
export default function Settings() {
  const { name, txs, currency, setCurrency, theme, setTheme, setDark } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  const exportCsv = () => {
    const rows = txs.map(t => [t.date, t.title, t.type, t.category, t.amount].join(','));
    Share.share({ message: ['date,title,type,category,amount', ...rows].join('\n') });
  };
  const themes: [Theme, string, string][] = [['system', 'System', 'phone-outline'], ['light', 'Light', 'sunny-outline'], ['dark', 'Dark', 'moon-outline']];
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Pressable onPress={() => router.push('/profile')} style={card}>
        <Text style={{ color: C.mute }}>Signed in as</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: C.text, fontSize: 20, fontWeight: '700', flexShrink: 1 }} numberOfLines={1}>{name || user?.email || 'Not set'}</Text>
          <Text style={{ color: C.accent, fontWeight: '700' }}>View profile ›</Text>
        </View>
      </Pressable>
      <Text style={{ color: C.mute }}>Theme</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {themes.map(([v, label]) => (
          <Pressable key={v} onPress={() => setTheme(v)} style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, backgroundColor: theme === v ? C.accent : C.card, borderWidth: 2, borderColor: theme === v ? C.accent : 'transparent' }}>
            <Text style={{ color: theme === v ? '#fff' : C.text, fontWeight: '700' }}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={{ color: C.mute }}>Currency</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {['$', 'R', '€', '£', 'ZWL '].map(c => <Pressable key={c} onPress={() => setCurrency(c)} style={{ padding: 10, borderRadius: 16, backgroundColor: currency === c ? C.accent : C.card }}><Text style={{ color: C.text }}>{c.trim()}</Text></Pressable>)}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: C.text }}>Quick theme toggle</Text><Pressable onPress={() => setDark(theme !== 'dark')}><Text style={{ color: C.accent }}>Switch</Text></Pressable></View>
      <Pressable onPress={() => dailyReminder(true)} style={btn(C.card)}><Text style={{ color: C.text }}>🔔 Enable daily reminder (8 pm)</Text></Pressable>
      <Pressable onPress={() => dailyReminder(false)} style={btn(C.card)}><Text style={{ color: C.mute }}>Disable reminders</Text></Pressable>
      <Pressable onPress={exportCsv} style={btn(C.accent)}><Text style={{ color: '#fff', fontWeight: '800' }}>Export transactions (CSV)</Text></Pressable>
      <Pressable onPress={() => router.push('/profile')} style={btn(C.card)}><Text style={{ color: C.text, fontWeight: '800' }}>Profile &amp; sign out</Text></Pressable>
    </View>
  );
}
