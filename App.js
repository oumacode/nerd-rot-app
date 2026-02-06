import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Platform, 
  SafeAreaView, 
  TouchableOpacity, 
  Keyboard, 
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Ensure your .env has EXPO_PUBLIC_GEMINI_API_KEY
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const SYSTEM_PROMPT = `
### ROLE
You are a precision discovery engine for "nerd.".

### CONSTRAINTS
- **Direct Answer**: Provide ONLY the direct, literal answer to the user's question. 
- **Formatting**: No sentences, no explanations, no filler words, and NO punctuation in the "answer" field. 
- **Rabbit Holes**: Provide 3 unique, obscure, and specific follow-up questions to expand curiosity.
- **Tone**: Clinical, raw, and high-signal.

### OUTPUT SCHEMA (STRICT JSON ONLY)
{
  "answer": "one or two word direct answer with no punctuation",
  "rabbit_holes": ["q1", "q2", "q3"]
}
`;

function parseResponseText(text) {
  let raw = (text || '').trim();
  // Remove markdown code fences if Gemini adds them
  raw = raw.replace(/```json|```/g, "").trim();
  
  try {
    const parsed = JSON.parse(raw);
    return {
      answer: String(parsed.answer || '').toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,""),
      rabbit_holes: Array.isArray(parsed.rabbit_holes) ? parsed.rabbit_holes : [],
    };
  } catch (_) {
    return { answer: text.split('\n')[0], rabbit_holes: [] };
  }
}

export default function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [rabbitHoles, setRabbitHoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const askWithQuestion = async (q) => {
    const trimmed = (q || '').trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setErrorMsg('');
    setAnswer('');
    setRabbitHoles([]);
    setQuestion(trimmed);
    Keyboard.dismiss();

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      // Switch to Flash-Lite for better free tier limits
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite', 
        systemInstruction: SYSTEM_PROMPT,
      });

      const result = await model.generateContent(trimmed);
      const responseText = result.response.text();
      const parsed = parseResponseText(responseText);
      
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>nerdrot.</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            {loading ? (
              <ActivityIndicator size="large" color="#CCFF00" />
            ) : errorMsg ? (
              <Text style={styles.errorText}>{errorMsg}</Text>
            ) : answer ? (
              <View style={{ width: '100%' }}>
                <Text style={styles.answerText}>{answer}</Text>
                
                <View style={styles.divider} />
                
                <Text style={styles.subLabel}>dig deeper</Text>
                <View style={styles.pillContainer}>
                  {rabbitHoles.map((hole, i) => (
                    <TouchableOpacity 
                      key={i} 
                      style={styles.pill} 
                      onPress={() => askWithQuestion(hole)}
                    >
                      <Text style={styles.pillText}>{hole}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.welcomeText}>feed the rot.</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="ask something obscure..."
            placeholderTextColor="#444"
            value={question}
            onChangeText={setQuestion}
            onSubmitEditing={() => askWithQuestion(question)}
            editable={!loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, paddingTop: 40 },
  title: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1.5 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { 
    backgroundColor: '#000', 
    borderRadius: 24, 
    padding: 30, 
    alignItems: 'center',
    minHeight: 300,
    justifyContent: 'center'
  },
  answerText: { 
    color: '#fff', 
    fontSize: 56, 
    fontWeight: '900', 
    textAlign: 'center',
    letterSpacing: -2,
    lineHeight: 60
  },
  welcomeText: { color: '#222', fontSize: 24, fontWeight: '700' },
  errorText: { color: '#ff4444', fontSize: 16, textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#111', marginVertical: 30, width: '100%' },
  subLabel: { color: '#444', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 15, textAlign: 'center' },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  pill: { backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 100, borderWidth: 1, borderColor: '#222' },
  pillText: { color: '#CCFF00', fontSize: 14, fontWeight: '600' },
  inputArea: { padding: 20, paddingBottom: 40 },
  input: { 
    backgroundColor: '#111', 
    color: '#fff', 
    borderRadius: 16, 
    padding: 18, 
    fontSize: 18, 
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#222'
  }
});