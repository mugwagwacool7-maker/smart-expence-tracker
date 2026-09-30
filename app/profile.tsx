import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useStore, C, btn, card, money, sum } from '../lib/store';

const initials = (s: string) => {
  const parts = s.trim().split(/[\s@._-]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : s.slice(0, 2)).toUpperCase();
};
const longDate = (iso?: string) => {
  if (!iso) return 'Unknown';
  const d = new Date(iso);
  return isNaN(+d) ? 'Unknown' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function Profile() {
  const { user, signOut } = useAuth();
  const { name, setName, txs, goals, budget, currency, setCurrency } = useStore();
  const router = useRouter();
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  // Prefer the account's full_name, then the locally stored name, then the email
  const accountName = (user?.user_metadata?.full_name as string) || name || '';
  useEffect(() => { setDraft(accountName); }, [accountName]);

  if (!user) return null;
  const email = user.email ?? '';
  const label = accountName || email.split('@')[0] || '?';
  const isIncome = sum(txs, 'income'), isExpense = sum(txs, 'expense');

  const saveName = async () => {
    const clean = draft.trim();
    if (!clean || clean === accountName) return;
    setSaving(true);
    const { error } = await supabase!.auth.updateUser({ data: { full_name: clean } });
    setSaving(false);
    if (error) return Alert.alert('Could not save', error.message);
    setName(clean); // keep the in-app greeting in step with the account
  };

  const confirmSignOut = () =>
    Alert.alert('Sign out', 'Your transactions stay on this device, but you will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);

  const line = (k: string, v: string) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 7 }}>
      <Text style={{ color: C.mute, fontSize: 13 }}>{k}</Text>
      <Text style={{ color: C.text, fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' }} selectable>{v}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
      <View style={{ alignItems: 'center', gap: 10, paddingVertical: 8 }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800' }}>{initials(label)}</Text>
        </View>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '800' }}>{label}</Text>
        <Text style={{ color: C.mute, fontSize: 13 }}>{email}</Text>
      </View>

      <View style={[card, { gap: 8 }]}>
        <Text style={{ color: C.text, fontWeight: '800' }}>Display name</Text>
        <TextInput
          value={draft} onChangeText={setDraft}
          placeholder="Your name" placeholderTextColor={C.mute}
          onSubmitEditing={saveName} returnKeyType="done"
          style={{ backgroundColor: C.bg, color: C.text, borderRadius: 12, padding: 12, fontSize: 16 }}
        />
        <Text style={{ color: C.mute, fontSize: 12 }}>Used for the greeting in the app header.</Text>
        <Pressable onPress={saveName} disabled={saving || !draft.trim() || draft.trim() === accountName} style={[btn(C.accent), (saving || !draft.trim() || draft.trim() === accountName) && { opacity: 0.5 }]}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>{saving ? 'Saving…' : 'Save name'}</Text>
        </Pressable>
      </View>

      <View style={[card, { gap: 2 }]}>
        <Text style={{ color: C.text, fontWeight: '800', marginBottom: 4 }}>Account</Text>
        {line('Email', email)}
        {line('User ID', user.id)}
        {line('Provider', user.app_metadata?.provider ?? 'email')}
        {line('Member since', longDate(user.created_at))}
        {line('Email confirmed', user.email_confirmed_at ? 'Yes' : 'Not yet')}
      </View>

      <View style={[card, { gap: 2 }]}>
        <Text style={{ color: C.text, fontWeight: '800', marginBottom: 4 }}>This device</Text>
        {line('Transactions', String(txs.length))}
        {line('Income', money(isIncome))}
        {line('Expenses', money(isExpense))}
        {line('Balance', money(isIncome - isExpense))}
        {line('Savings goals', String(goals.length))}
        {line('Monthly budget', budget ? money(budget) : 'Not set')}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 7 }}>
          <Text style={{ color: C.mute, fontSize: 13 }}>Currency</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {['$', 'R', '€', '£'].map(c => (
              <Pressable key={c} onPress={() => setCurrency(c)} style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: currency === c ? C.accent : C.bg }}>
                <Text style={{ color: currency === c ? '#fff' : C.text, fontSize: 12, fontWeight: '700' }}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={{ color: C.mute, fontSize: 12, lineHeight: 18, paddingTop: 8 }}>
          Stored locally on this device. Signing in on another device does not copy it over.
        </Text>
      </View>

      <Pressable onPress={() => router.push('/(tabs)/settings')} style={btn(C.card)}>
        <Text style={{ color: C.text, fontWeight: '700' }}>⚙️  App settings</Text>
      </Pressable>
      <Pressable onPress={confirmSignOut} style={btn(C.red)}>
        <Text style={{ color: '#fff', fontWeight: '800' }}>Sign out</Text>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 8 }}>
        <Ionicons name="shield-checkmark-outline" size={14} color={C.mute} />
        <Text style={{ color: C.mute, fontSize: 12 }}>Signed in with Supabase Auth</Text>
      </View>
    </ScrollView>
  );
}
