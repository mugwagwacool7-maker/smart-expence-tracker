import { Platform } from 'react-native';

// expo-notifications throws during module evaluation in Expo Go on Android
// (SDK 53+ removed push there). Importing it unguarded takes down every route,
// so it is loaded lazily and every call is a no-op when unavailable.
type N = typeof import('expo-notifications');
let mod: N | null = null;
try { mod = require('expo-notifications'); } catch { mod = null; }

const live = () => {
  if (!mod) return null;
  try {
    mod.setNotificationHandler({ handleNotification: async () => ({ shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }) });
    return mod;
  } catch { return null; }
};

const enabled = () => Platform.OS !== 'android' && !!mod;
const allowed = async () => {
  const n = live(); if (!enabled() || !n) return false;
  try { return (await n.requestPermissionsAsync()).granted; } catch { return false; }
};

export async function alertNow(title: string, body: string) {
  const n = live(); if (!enabled() || !n) return;
  try { if (await allowed()) await n.scheduleNotificationAsync({ content: { title, body }, trigger: null }); } catch { /* notifications unavailable */ }
}
export async function dailyReminder(on: boolean) {
  const n = live(); if (!enabled() || !n) return;
  try {
    await n.cancelAllScheduledNotificationsAsync();
    if (on && (await allowed())) await n.scheduleNotificationAsync({ content: { title: 'Log your expenses', body: 'Add today\'s spending to stay on budget.' }, trigger: { type: n.SchedulableTriggerInputTypes.DAILY, hour: 20, minute: 0 } });
  } catch { /* notifications unavailable */ }
}
