import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

export default function JournalCard({ entry, onDelete }) {
  const renderRightActions = () => (
    <TouchableOpacity 
      style={styles.deleteAction} 
      onPress={() => onDelete(entry.timestamp)}
      activeOpacity={0.8}
    >
      <Text style={styles.deleteText}>delete</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.swipeWrapper}>
      <Swipeable
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
      >
        <View style={styles.card}>
          <Text style={styles.answer}>{entry.answer}</Text>
          <Text style={styles.question}>{entry.question}</Text>
        </View>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeWrapper: {
    marginBottom: 16, 
  },
  card: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#050505',
    borderWidth: 3,
    borderColor: '#151515',
  },
  answer: { color: '#CCFF00', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  question: { color: '#777', fontSize: 13 },
  deleteAction: {
    backgroundColor: '#FF4B4B',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 28,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    height: '100%', 
  },
  deleteText: {
    color: '#fff', 
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'lowercase',
  },
});