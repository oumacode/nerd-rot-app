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
import { askNerdRot } from './src/api/gemini';
import { useJournal } from './src/hooks/useJournal';

export default function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [rabbitHoles, setRabbitHoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [view, setView] = useState('main'); // 'main' | 'journal' | 'profile'
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

    try {
      const parsed = await askNerdRot(trimmed);
      setAnswer(parsed.answer);
      setRabbitHoles(parsed.rabbit_holes);
      addEntry(trimmed, parsed.answer, parsed.topic);
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
          </View>
        </View>

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
          />
        )}

        <View style={styles.dockWrapper} pointerEvents="box-none">
          <BlurView intensity={40} tint="dark" style={styles.dock}>
            <TouchableOpacity
              style={[
                styles.dockIconButton,
                view === 'main' && styles.dockIconButtonActive,
              ]}
              onPress={() => handleTabPress('main')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="sparkles-outline"
                size={24}
                color={view === 'main' ? '#CCFF00' : '#777'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dockIconButton,
                view === 'journal' && styles.dockIconButtonActive,
              ]}
              onPress={() => handleTabPress('journal')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="library-outline"
                size={24}
                color={view === 'journal' ? '#CCFF00' : '#777'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dockIconButton,
                view === 'profile' && styles.dockIconButtonActive,
              ]}
              onPress={() => handleTabPress('profile')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person-circle-outline"
                size={26}
                color={view === 'profile' ? '#CCFF00' : '#777'}
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
  header: { padding: 20, paddingTop: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' },
  title: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1.5 },
  tab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  tabActive: { backgroundColor: '#1a1a1a' },
  tabText: { color: '#555', fontSize: 14, fontWeight: '700' },
  tabTextActive: { color: '#CCFF00' },
    dockWrapper: {
      position: 'absolute', // Ensures it floats OVER the screens
      bottom: 34,           // Offset from the bottom edge (Safe Area consideration)
      left: 0,
      right: 0,
      alignItems: 'center',
      paddingHorizontal: 20,
      zIndex: 1000,         // Ensure it stays on top of all screen content
    },
    dock: {
      width: '100%',
      maxWidth: 380,        // Slightly wider for better reachability
      flexDirection: 'row',
      justifyContent: 'space-around', // Better spacing for three icons
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 10,
      backgroundColor: 'rgba(0,0,0,0.7)', // Semi-transparent for BlurView effect
      borderRadius: 24,     // Perfectly pill-shaped
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)', // Subtle "glass" border
      overflow: 'hidden',  
    },
    dockIconButton: {
      padding: 10,          // Larger touch target
      borderRadius: 25,
    },
    dockIconButtonActive: {
      backgroundColor: 'rgba(204, 255, 0, 0.15)', // Subtle neon glow background
    },
  });