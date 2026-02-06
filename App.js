import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NerdRotScreen from './src/screens/NerdRotScreen';
import JournalScreen from './src/screens/JournalScreen';
import { askNerdRot } from './src/api/gemini';
import { useJournal } from './src/hooks/useJournal';

export default function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [rabbitHoles, setRabbitHoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [view, setView] = useState('main'); // 'main' | 'journal'
  const { journal, addEntry, deleteEntry } = useJournal();

  const askWithQuestion = async (q) => {
    const trimmed = (q || '').trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setErrorMsg('');
    setAnswer('');
    setRabbitHoles([]);
    setQuestion(trimmed);

    try {
      const parsed = await askNerdRot(trimmed);
      setAnswer(parsed.answer);
      setRabbitHoles(parsed.rabbit_holes);
      addEntry(trimmed, parsed.answer);
    } catch (e) {
      if (e.message?.includes('429')) {
        setErrorMsg('nerd brain resting. try in 60s.');
      } else {
        setErrorMsg('something went wrong. check key.');
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>nerdrot.</Text>
            <TouchableOpacity
              style={[styles.tab, view === 'main' && styles.tabActive]}
              onPress={() => setView('main')}
            >
              <Text style={[styles.tabText, view === 'main' && styles.tabTextActive]}>Rot</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, view === 'journal' && styles.tabActive]}
              onPress={() => setView('journal')}
            >
              <Text style={[styles.tabText, view === 'journal' && styles.tabTextActive]}>Journal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {view === 'journal' ? (
          <JournalScreen journal={journal} onDelete={deleteEntry} />
        ) : (
          <NerdRotScreen
            question={question}
            onChangeQuestion={setQuestion}
            answer={answer}
            rabbitHoles={rabbitHoles}
            loading={loading}
            errorMsg={errorMsg}
            onAsk={askWithQuestion}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, paddingTop: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' },
  title: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1.5 },
  tab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  tabActive: { backgroundColor: '#1a1a1a' },
  tabText: { color: '#555', fontSize: 14, fontWeight: '700' },
  tabTextActive: { color: '#CCFF00' },
});