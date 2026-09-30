import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { configured, supabase } from './supabase';

export type AuthResult = { ok: true } | { ok: false; error: string };

type Auth = {
  user: User | null;
  session: Session | null;
  /** true until the persisted session has been read back from storage */
  loading: boolean;
  /** false when the Supabase env vars are missing, so the UI can explain why */
  configured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult & { needsConfirmation: boolean }>;
  resend: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  /** "Invalid login credentials" is Supabase's way of saying the pair is wrong */
  friendly: (e: unknown) => string;
};

const Ctx = createContext<Auth>(null as unknown as Auth);
export const useAuth = () => useContext(Ctx);

// Avoid handing out a token refresh error as if it were a sign-in problem
const friendly = (e: unknown) => {
  const raw = e instanceof Error ? e.message : String(e);
  if (/invalid login credentials/i.test(raw)) return 'That email and password do not match an account.';
  // The project has Confirm email on, so sign-up returns no session until the link is clicked
  if (/email not confirmed/i.test(raw)) return 'Your email is not confirmed yet. Open the link we sent you, or tap Resend below.';
  if (/user already registered/i.test(raw)) return 'An account already exists for that email. Try signing in.';
  if (/password should be at least/i.test(raw)) return 'Choose a password of at least 6 characters.';
  if (/unable to validate email|invalid email/i.test(raw)) return 'That does not look like a valid email address.';
  if (/fetch|network|failed to fetch/i.test(raw)) return 'Could not reach the server. Check your connection and try again.';
  // Supabase's built-in SMTP is heavily rate limited, so this is the likeliest cause of a "missing" email
  if (/rate limit|too many requests|security purposes/i.test(raw)) return 'Too many emails requested. Wait a few minutes before resending.';
  if (/over_email_send_rate_limit|email rate/i.test(raw)) return 'The email service is rate limited right now. Wait a few minutes and try again.';
  return raw;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    // getSession reads whatever AsyncStorage persisted on the last visit
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (active) setSession(s ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const guard = useCallback(() => {
    if (!supabase) return { ok: false, error: 'Supabase is not configured. Add the env vars to .env and restart.' } as AuthResult;
    return null;
  }, []);

  const signIn = useCallback<Auth['signIn']>(async (email, password) => {
    const g = guard();
    if (g) return g;
    const { error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { ok: false, error: friendly(error) } : { ok: true };
  }, [guard]);

  const signUp = useCallback<Auth['signUp']>(async (email, password) => {
    const g = guard();
    if (g) return { ...g, needsConfirmation: false };
    const { data, error } = await supabase!.auth.signUp({ email: email.trim(), password });
    if (error) return { ok: false, error: friendly(error), needsConfirmation: false };
    // A session is only returned when the project has email confirmation turned off
    return { ok: true, needsConfirmation: !data.session };
  }, [guard]);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const resend = useCallback<Auth['resend']>(async (email) => {
    const g = guard();
    if (g) return g;
    // Resend the signup confirmation email to the same address
    const { error } = await supabase!.auth.resend({ type: 'signup', email: email.trim() });
    return error ? { ok: false, error: friendly(error) } : { ok: true };
  }, [guard]);

  const value = useMemo(
    () => ({ user: session?.user ?? null, session, loading, configured, signIn, signUp, resend, signOut, friendly }),
    [session, loading, signIn, signUp, resend, signOut]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
