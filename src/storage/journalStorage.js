import AsyncStorage from '@react-native-async-storage/async-storage';

export const JOURNAL_KEY = '@nerdrot_journal';

export async function loadJournal() {
  try {
    const raw = await AsyncStorage.getItem(JOURNAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveJournal(entries) {
  try {
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

