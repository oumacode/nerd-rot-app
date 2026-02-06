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
  ScrollView 
} from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY; 

export default function App() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setResponse('');
    Keyboard.dismiss();

    try {
      // Initialize the AI
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      
      const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        systemInstruction: "You are a precise fact-checker. Provide ONLY the direct answer to the question. No sentences, no explanations, no punctuation if possible.",
        generationConfig: {
          temperature: 0.0, // This makes the AI very literal and consistent
        }
      });

      // Call the API
      const result = await model.generateContent(question.trim());
      
      // Wait for the response text correctly
      const text = result.response.text();
      
      setResponse(text);
    } catch (e) {
      // This will log the EXACT error to your terminal (VS Code / Metro)
      console.error("Gemini API Error Detail:", e);
      
      // Show a more helpful message to the user
      setResponse(`Error: ${e.message || 'Check your internet or API key.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.cardText}>Consulting the stars...</Text>
              </View>
            ) : response ? (
              <Text style={styles.cardText}>{response}</Text>
            ) : (
              <View style={styles.centerContainer}>
                <Text style={styles.cardText}>
                  Your curious journey begins here.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Quick Question"
            placeholderTextColor="#8E8E93"
            selectionColor="#fff"
            returnKeyType="send"
            value={question}
            onChangeText={setQuestion}
            onSubmitEditing={handleAsk}
            editable={!loading}
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              { opacity: question.trim() && !loading ? 1 : 0.5 },
            ]}
            onPress={handleAsk}
            disabled={!question.trim() || loading}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 16,
    paddingLeft: 24,
    paddingBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#111111',
    borderColor: '#242426',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerContainer: {
    alignItems: 'center',
  },
  cardText: {
    color: '#ddd',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  inputContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    color: '#fff',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 22,
    fontSize: 17,
  },
  submitButton: {
    marginLeft: 10,
    backgroundColor: '#222327',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});