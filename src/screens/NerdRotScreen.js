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
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#CCFF00" />
              <Text style={styles.loadingText}>thinking...</Text>
            </View>
          ) : errorMsg ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={32} color="#ff4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : answer ? (
            <View style={styles.answerContainer}>
              <Text style={styles.answerText}>{answer}</Text>

              <TouchableOpacity
                style={[styles.saveButton, saved && styles.saveButtonSaved]}
                onPress={onSave}
                disabled={saved}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color="#CCFF00"
                  style={{ opacity: saved ? 0.5 : 1 }}
                />
                <Text style={[styles.saveButtonText, saved && styles.saveButtonTextSaved]}>
                  {saved ? 'saved' : 'save'}
                </Text>
              </TouchableOpacity>

              {rabbitHoles.length > 0 && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.subLabel}>explore</Text>
                  <View style={styles.pillContainer}>
                    {rabbitHoles.map((hole, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.pill}
                        onPress={() => onAsk(hole)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.pillText}>{hole}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </View>
          ) : (
            <Text style={styles.welcomeText}>feed the rot</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.inputArea}>
        <View style={styles.inputWrapper}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="what do you want to know?"
            placeholderTextColor="#444"
            value={question}
            onChangeText={onChangeQuestion}
            onSubmitEditing={() => onAsk(question)}
            editable={!loading}
            returnKeyType="search"
          />
          {question.length > 0 && (
            <TouchableOpacity
              onPress={() => onAsk(question)}
              style={styles.sendButton}
              disabled={loading}
            >
              <Ionicons name="arrow-forward" size={20} color="#CCFF00" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  errorContainer: {
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  answerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  answerText: {
    color: '#fff',
    fontSize: 64,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -3,
    lineHeight: 72,
    marginBottom: 24,
  },

  welcomeText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
  },
  divider: {
    height: 1,
    backgroundColor: '#111',
    marginVertical: 32,
    width: '100%',
  },
  subLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    textAlign: 'center',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  pill: {
    backgroundColor: '#0a0a0a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  pillText: {
    color: '#CCFF00',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#CCFF00',
    backgroundColor: 'rgba(204, 255, 0, 0.05)',
  },
  saveButtonSaved: {
    opacity: 0.4,
    backgroundColor: 'transparent',
  },
  saveButtonText: {
    color: '#CCFF00',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
  saveButtonTextSaved: {
    opacity: 0.7,
  },
  inputArea: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 16,
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
});

