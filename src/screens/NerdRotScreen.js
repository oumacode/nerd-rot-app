import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NerdRotScreen({
  question,
  onChangeQuestion,
  answer,
  rabbitHoles,
  loading,
  errorMsg,
  onAsk,
  saved,
  onSave,
}) {
  return (
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

              <TouchableOpacity
                style={[styles.saveButton, saved && styles.saveButtonSaved]}
                onPress={onSave}
                disabled={saved}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={16}
                  color="#CCFF00"
                  style={{ opacity: saved ? 0.5 : 1 }}
                />
              </TouchableOpacity>

              <View style={styles.divider} />

              <Text style={styles.subLabel}>dig deeper</Text>
              <View style={styles.pillContainer}>
                {rabbitHoles.map((hole, i) => (
                  <View key={i} style={styles.pill}>
                    <Text
                      style={styles.pillText}
                      onPress={() => onAsk(hole)}
                    >
                      {hole}
                    </Text>
                  </View>
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
          placeholder="Ask something obscure..."
          placeholderTextColor="#444"
          value={question}
          onChangeText={onChangeQuestion}
          onSubmitEditing={() => onAsk(question)}
          editable={!loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: '#000',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    minHeight: 300,
    justifyContent: 'center',
  },
  answerText: {
    color: '#fff',
    fontSize: 56,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -2,
    lineHeight: 60,
  },
  welcomeText: { color: '#CCFF00', fontSize: 24, fontWeight: '700' },
  errorText: { color: '#ff4444', fontSize: 16, textAlign: 'center' },
  divider: {
    height: 1,
    backgroundColor: '#111',
    marginVertical: 30,
    width: '100%',
  },
  subLabel: {
    color: '#444',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 15,
    textAlign: 'center',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  pill: {
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#222',
  },
  pillText: { color: '#CCFF00', fontSize: 14, fontWeight: '600' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#CCFF00',
    gap: 6,
  },
  saveButtonSaved: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#CCFF00',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  saveButtonTextSaved: {
    opacity: 0.7,
  },
  inputArea: { padding: 20, marginBottom: 70 },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 24,
    padding: 18,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#222',
  },
});

