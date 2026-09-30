import { alertNow } from './notify';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Animated, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Tx = { id: string; title: string; amount: number; type: 'income' | 'expense'; category: string; date: string; note?: string; repeat?: boolean };
export type Goal = { id: string; name: string; target: number; saved: number };
export const CATS = ['Food', 'Transport', 'Shopping', 'Rent', 'Entertainment', 'Education', 'Bills', 'Salary', 'Other'];
export const DARK = { bg: '#0F172A', card: '#1E293B', text: '#F1F5F9', mute: '#94A3B8', green: '#22C55E', red: '#EF4444', accent: '#6366F1', amber: '#F59E0B' };
export const LIGHT = { bg: '#F1F5F9', card: '#FFFFFF', text: '#0F172A', mute: '#64748B', green: '#16A34A', red: '#DC2626', accent: '#6366F1', amber: '#D97706' };
export const C = { ...DARK }; // mutated when the theme changes
export const btn = (bg: string) => ({ backgroundColor: bg, padding: 14, borderRadius: 14, alignItems: 'center' as const });
export const card = { get backgroundColor() { return C.card; }, borderRadius: 12, padding: 12 };
export let sym = '$';
export type Theme = 'system' | 'light' | 'dark';

type Store = { txs: Tx[]; budget: number; goals: Goal[]; currency: string; name: string; ready: boolean; dark: boolean; theme: Theme; catBudgets: Record<string, number>; setDark: (d: boolean) => void; setTheme: (t: Theme) => void; setCatBudget: (c: string, n: number) => void;
  add: (t: Omit<Tx, 'id'>) => void; update: (t: Tx) => void; remove: (id: string) => void; setBudget: (n: number) => void;
  setGoals: (g: Goal[]) => void; setCurrency: (c: string) => void; setName: (n: string) => void };
const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);
const put = (k: string, v: unknown) => AsyncStorage.setItem(k, JSON.stringify(v));

// Budget alerts fire once per threshold per month, not on every add
const monthKey = () => new Date().toISOString().slice(0, 7);
const warn = (t: Tx[], b: number, fired: Record<string, boolean>) => {
  if (!b) return;
  const spent = sum(thisMonth(t), 'expense'), p = spent / b;
  const k = monthKey();
  if (p >= 1 && !fired[k + '100']) { fired[k + '100'] = true; alertNow('Over budget', `You have spent ${sym}${spent.toFixed(2)} of ${sym}${b}.`); }
  else if (p >= 0.8 && !fired[k + '80']) { fired[k + '80'] = true; alertNow('Close to your budget', `${Math.round(p * 100)}% of your monthly budget is used.`); }
};

// Recurring: copy each repeating transaction into the current month if it is missing
const roll = (t: Tx[]) => {
  const now = new Date().toISOString().slice(0, 7), out = [...t];
  t.filter(x => x.repeat && x.date.slice(0, 7) < now).forEach(x => {
    if (!out.some(y => y.repeat && y.title === x.title && y.date.slice(0, 7) === now)) out.unshift({ ...x, id: Date.now() + x.title, date: now + '-01' });
  });
  return out;
};

export function Provider({ children }: { children: React.ReactNode }) {
  const [txs, setTxs] = useState<Tx[]>([]), [budget, setB] = useState(0), [goals, setG] = useState<Goal[]>([]);
  const [currency, setCur] = useState('$'), [name, setN] = useState(''), [ready, setReady] = useState(false), [cb, setCB] = useState<Record<string, number>>({});
  const [theme, setThemeState] = useState<Theme>('dark');
  const systemDark = useColorScheme() !== 'light';
  const wantDark = theme === 'system' ? systemDark : theme === 'dark';
  // Palette swaps at the midpoint of the fade, so the change reads as a cross-fade rather than a hard cut
  const [applied, setApplied] = useState(wantDark), fade = useRef(new Animated.Value(1)).current;
  const fired = useRef<Record<string, boolean>>({}).current;
  sym = currency;
  Object.assign(C, applied ? DARK : LIGHT);
  useEffect(() => {
    if (applied === wantDark) return;
    Animated.timing(fade, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      setApplied(wantDark);
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  }, [wantDark, applied]);
  useEffect(() => {
    (async () => {
      try {
        const g = async (k: string) => JSON.parse((await AsyncStorage.getItem(k)) || 'null');
        const t = await g('txs'), r = roll(Array.isArray(t) ? t : []);
        setTxs(r); put('txs', r);
        setB(Number(await g('budget')) || 0);
        const gl = await g('goals'); setG(Array.isArray(gl) ? gl : []);
        setCur((await g('currency')) || '$'); setN((await g('name')) || ''); setCB((await g('catBudgets')) || {});
        const th = await g('theme');
        if (th === 'light' || th === 'dark' || th === 'system') setThemeState(th);
        else { const d = await g('dark'); if (d !== null) setThemeState(d !== false ? 'dark' : 'light'); } // migrate the old boolean
      } catch { /* corrupt data: start fresh */ }
      setReady(true);
    })();
  }, []);
  const save = (t: Tx[]) => { setTxs(t); put('txs', t); };
  const value: Store = {
    txs, budget, goals, currency, name, ready, dark: applied, theme, catBudgets: cb,
    add: t => { const next = [{ ...t, id: Date.now().toString() }, ...txs]; save(next); if (t.type === 'expense') warn(next, budget, fired); },
    update: t => save(txs.map(x => (x.id === t.id ? t : x))),
    remove: id => save(txs.filter(x => x.id !== id)),
    setBudget: n => { setB(n); put('budget', n); },
    setGoals: g => { setG(g); put('goals', g); },
    setCurrency: c => { setCur(c); put('currency', c); },
    setName: n => { setN(n); put('name', n); },
    setDark: d => { setThemeState(d ? 'dark' : 'light'); put('theme', d ? 'dark' : 'light'); },
    setTheme: t => { setThemeState(t); put('theme', t); },
    setCatBudget: (c, n) => { const m = { ...cb, [c]: n }; setCB(m); put('catBudgets', m); },
  };
  return <Ctx.Provider value={value}><Animated.View style={{ flex: 1, opacity: fade }}>{children}</Animated.View></Ctx.Provider>;
}

export const sum = (t: Tx[], type: Tx['type']) => t.filter(x => x.type === type).reduce((a, x) => a + x.amount, 0);
export const byCat = (t: Tx[]) => {
  const m: Record<string, number> = {};
  t.filter(x => x.type === 'expense').forEach(x => (m[x.category] = (m[x.category] || 0) + x.amount));
  return m;
};
export const thisMonth = (t: Tx[]) => t.filter(x => x.date.slice(0, 7) === new Date().toISOString().slice(0, 7));
export const money = (n: number) => sym + n.toFixed(2);

export function answer(q: string, t: Tx[], budget: number): string {
  const s = q.toLowerCase(), inc = sum(t, 'income'), exp = sum(t, 'expense'), cats = byCat(t);
  const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  const cat = CATS.find(c => s.includes(c.toLowerCase()));
  const spent = sum(thisMonth(t), 'expense');
  if (cat && /spen|spent/.test(s)) return `You spent ${money(cats[cat] || 0)} on ${cat}.`;
  if (/predict|forecast|will i|pace/.test(s)) return predict(t, budget);
  if (/balance/.test(s)) return `Your balance is ${money(inc - exp)}.`;
  if (/most|highest|top/.test(s)) return top ? `${top[0]} is your biggest category at ${money(top[1])}.` : 'No expenses yet.';
  if (/income|earn|receiv/.test(s)) return `Total income: ${money(inc)}.`;
  if (/month/.test(s)) return `This month you spent ${money(spent)}.` + (budget ? ` Budget left: ${money(budget - spent)}.` : '');
  if (/budget/.test(s)) return budget ? `Budget ${money(budget)}, spent ${money(spent)}, ${money(budget - spent)} left.` : 'No budget set yet.';
  if (/summary|overview/.test(s)) return `Income ${money(inc)}, expenses ${money(exp)}, balance ${money(inc - exp)}, ${t.length} transactions.` + (top ? ` Top category: ${top[0]}.` : '');
  if (/save|tip|advice/.test(s)) return exp > inc ? 'You are spending more than you earn. Trim your top category first.' : `You keep ${inc ? Math.round(((inc - exp) / inc) * 100) : 0}% of your income. Nice.`;
  return 'Try: "What is my balance?", "How much did I spend on food?", "Give me a summary", or "Any tips?"';
}

export function predict(t: Tx[], budget: number): string {
  const now = new Date(), day = now.getDate(), dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const spent = sum(thisMonth(t), 'expense');
  if (!spent) return 'Add some expenses to get a forecast.';
  const rate = spent / day, end = rate * dim;
  let out = `At this pace you will spend ${money(end)} by month end.`;
  if (budget) out += spent >= budget ? ' You are already over budget.' : end > budget ? ` You will hit your budget around day ${Math.ceil(budget / rate)}.` : ' You are on track to stay within budget.';
  return out;
}
