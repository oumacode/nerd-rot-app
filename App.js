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
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import NerdRotScreen from './src/screens/NerdRotScreen';
import JournalScreen from './src/screens/JournalScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { askNerdRot, categorizeEntry } from './src/api/gemini';
import { useJournal } from './src/hooks/useJournal';

export default function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [rabbitHoles, setRabbitHoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [view, setView] = useState('main'); // 'main' | 'journal' | 'profile'
  const [saved, setSaved] = useState(false);
  const { journal, addEntry, deleteEntry } = useJournal();

  const handleTabPress = async (nextView) => {
    if (view === nextView) return;
    setView(nextView);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // haptics are best-effort only
    }
  };

  const askWithQuestion = async (q) => {
    const trimmed = (q || '').trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setErrorMsg('');
    setAnswer('');
    setRabbitHoles([]);
    setQuestion(trimmed);
    setSaved(false);

    try {
      const parsed = await askNerdRot(trimmed);
      setAnswer(parsed.answer);
      setRabbitHoles(parsed.rabbit_holes);
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

  const handleSave = async () => {
    if (!question || !answer || saved) return;
    
    try {
      const topic = await categorizeEntry(question, answer);
      addEntry(question, answer, topic);
      setSaved(true);
      
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // haptics are best-effort only
      }
    } catch (e) {
      console.error('Failed to categorize entry:', e);
      addEntry(question, answer, 'Misc');
      setSaved(true);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        {view === 'main' && (
          <View style={styles.minimalHeader}>
            <Text style={styles.title}>nerdrot</Text>
          </View>
        )}

        {view === 'journal' ? (
          <JournalScreen journal={journal} onDelete={deleteEntry} />
        ) : view === 'profile' ? (
          <ProfileScreen />
        ) : (
          <NerdRotScreen
            question={question}
            onChangeQuestion={setQuestion}
            answer={answer}
            rabbitHoles={rabbitHoles}
            loading={loading}
            errorMsg={errorMsg}
            onAsk={askWithQuestion}
            saved={saved}
            onSave={handleSave}
          />
        )}

        <View style={styles.dockWrapper} pointerEvents="box-none">
          <BlurView intensity={60} tint="dark" style={styles.dock}>
            <TouchableOpacity
              style={[
                styles.dockIconButton,
                view === 'main' && styles.dockIconButtonActive,
              ]}
              onPress={() => handleTabPress('main')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={view === 'main' ? 'sparkles' : 'sparkles-outline'}
                size={22}
                color={view === 'main' ? '#CCFF00' : '#666'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dockIconButton,
                view === 'journal' && styles.dockIconButtonActive,
              ]}
              onPress={() => handleTabPress('journal')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={view === 'journal' ? 'library' : 'library-outline'}
                size={22}
                color={view === 'journal' ? '#CCFF00' : '#666'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dockIconButton,
                view === 'profile' && styles.dockIconButtonActive,
              ]}
              onPress={() => handleTabPress('profile')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={view === 'profile' ? 'person-circle' : 'person-circle-outline'}
                size={24}
                color={view === 'profile' ? '#CCFF00' : '#666'}
              />
            </TouchableOpacity>
          </BlurView>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  minimalHeader: {
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 24,
    alignItems: 'flex-start',
  },
  title: {
    color: '#CCFF00',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dockWrapper: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  dock: {
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.2)',
    overflow: 'hidden',
    shadowColor: '#CCFF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  dockIconButton: {
    padding: 12,
    borderRadius: 20,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockIconButtonActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
  },
});