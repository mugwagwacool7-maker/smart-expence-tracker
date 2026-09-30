import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, Pressable, View } from 'react-native';
import { useAuth } from '../lib/auth';
import { C, btn, card } from '../lib/store';
import { Logo } from '../components/Logo';

export default function SignIn() {
  const { configured, signIn, signUp, resend } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState('');

  const sendAgain = async () => {
    setNote('');
    if (!email.trim()) return setNote('Enter the email you signed up with first.');
    setBusy(true);
    const r = await resend(email);
    setBusy(false);
    // The built-in SMTP is rate limited, so say so rather than implying success
    setNote(r.ok ? 'Sent. Check your inbox and spam folder.' : r.error);
  };

  const submit = async () => {
    setErr('');
    if (!email.trim() || !pass) return setErr('Enter your email and password.');
    setBusy(true);
    const r = mode === 'in' ? await signIn(email, pass) : await signUp(email, pass);
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    // No session means the project requires email confirmation, so route them to the inbox
    if (mode === 'up' && (r as { needsConfirmation?: boolean }).needsConfirmation) setSent(true);
  };

  // Offer resend whenever confirmation is the blocker, not just right after sign-up
  const stuckConfirming = /not confirmed/i.test(err);

  const input = { backgroundColor: C.card, color: C.text, borderRadius: 12, padding: 12, fontSize: 16 };
  const chip = (on: boolean) => ({ flex: 1, padding: 10, borderRadius: 20, alignItems: 'center' as const, backgroundColor: on ? C.accent : C.card });
  const chipText = (on: boolean) => ({ color: on ? '#fff' : C.text, fontWeight: on ? '700' as const : '400' as const });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 14, backgroundColor: C.bg }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Logo size={72} />
          <Text style={{ color: C.text, fontSize: 24, fontWeight: '800' }}>Smart Expense</Text>
          <Text style={{ color: C.mute, fontSize: 14, textAlign: 'center' }}>Sign in to track your money</Text>
        </View>

        {!configured ? (
          <View style={[card, { gap: 8, borderWidth: 1, borderColor: C.amber }]}>
            <Text style={{ color: C.amber, fontWeight: '800' }}>Supabase not configured</Text>
            <Text style={{ color: C.text, lineHeight: 20 }}>
              Sign-in needs these two values in a .env file at the project root, then restart the dev server:
            </Text>
            <Text style={{ color: C.mute, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 }}>
              {'EXPO_PUBLIC_SUPABASE_URL=\nEXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY='}
            </Text>
            <Text style={{ color: C.mute, fontSize: 12 }}>See .env.example for details.</Text>
          </View>
        ) : sent ? (
          <View style={[card, { gap: 8, borderWidth: 1, borderColor: C.accent }]}>
            <Text style={{ color: C.text, fontWeight: '800' }}>Confirm your email</Text>
            <Text style={{ color: C.mute, lineHeight: 20 }}>
              We sent a confirmation link to {email.trim()}. Open it to activate your account, then come back and sign in.
            </Text>
            <Text style={{ color: C.mute, fontSize: 12, lineHeight: 18 }}>
              No email? The default Supabase mailer only sends a few per hour, so it can be delayed or filtered.
            </Text>
            {!!note && <Text style={{ color: note.startsWith('Sent') ? C.green : C.amber, fontSize: 12 }}>{note}</Text>}
            <Pressable onPress={sendAgain} disabled={busy} style={[btn(C.card), busy && { opacity: 0.6 }]}>
              <Text style={{ color: C.text, fontWeight: '700' }}>Resend confirmation email</Text>
            </Pressable>
            <Pressable onPress={() => { setSent(false); setMode('in'); setErr(''); setNote(''); }} style={btn(C.accent)}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>Back to sign in</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable onPress={() => { setMode('in'); setErr(''); }} style={chip(mode === 'in')}><Text style={chipText(mode === 'in')}>Sign in</Text></Pressable>
              <Pressable onPress={() => { setMode('up'); setErr(''); }} style={chip(mode === 'up')}><Text style={chipText(mode === 'up')}>Create account</Text></Pressable>
            </View>
            <TextInput
              placeholder="Email" placeholderTextColor={C.mute}
              value={email} onChangeText={setEmail}
              autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
              autoComplete="email" style={input}
            />
            <TextInput
              placeholder="Password" placeholderTextColor={C.mute}
              value={pass} onChangeText={setPass}
              secureTextEntry autoCapitalize="none" autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              onSubmitEditing={submit} returnKeyType="go" style={input}
            />
            {mode === 'up' && <Text style={{ color: C.mute, fontSize: 12, lineHeight: 18 }}>At least 6 characters. You will get a confirmation email before you can sign in.</Text>}
            {!!err && <Text style={{ color: C.red, fontSize: 13 }}>{err}</Text>}
            {stuckConfirming && (
              <View style={{ gap: 8 }}>
                {!!note && <Text style={{ color: note.startsWith('Sent') ? C.green : C.amber, fontSize: 12 }}>{note}</Text>}
                <Pressable onPress={sendAgain} disabled={busy} style={[btn(C.card), busy && { opacity: 0.6 }]}>
                  <Text style={{ color: C.text, fontWeight: '700' }}>Resend confirmation email</Text>
                </Pressable>
              </View>
            )}
            <Pressable onPress={submit} disabled={busy} style={[btn(C.accent), busy && { opacity: 0.6 }]}>
              {busy
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: '#fff', fontWeight: '800' }}>{mode === 'in' ? 'Sign in' : 'Create account'}</Text>}
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
