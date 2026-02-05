import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Platform, SafeAreaView, TouchableOpacity, Keyboard, ActivityIndicator } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'YOUR_API_KEY_HERE'; // <-- Replace with your Gemini API key

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
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(question.trim());
      const text = result?.response?.text?.() || 'No response from Gemini.';
      setResponse(text);
    } catch (e) {
      setResponse('There was an error connecting to Gemini.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
      </View>
      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.cardText}>Loading...</Text>
            </>
          ) : response ? (
            <Text style={styles.cardText}>{response}</Text>
          ) : (
            <Text style={styles.cardText}>
              Your curious journey begins here.
            </Text>
          )}
        </View>
      </View>
      {/* Quick Question Input */}
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
    justifyContent: 'flex-start',
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
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#111111',
    borderColor: '#242426',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'center',
    minHeight: 100,
  },
  cardText: {
    color: '#ddd',
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
    marginTop: 12,
  },
  inputContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: 'transparent',
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
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
    borderWidth: 0,
  },
  submitButton: {
    marginLeft: 10,
    backgroundColor: '#222327',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});
