import React from 'react';
import { FlatList, Text, StyleSheet } from 'react-native';
import JournalCard from '../components/JournalCard';

export default function JournalScreen({ journal, onDelete }) {
  return (
    <FlatList
      data={journal}
      keyExtractor={(item) => String(item.timestamp)}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={styles.empty}>no entries yet.</Text>
      }
      renderItem={({ item }) => (
        <JournalCard entry={item} onDelete={onDelete} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  empty: { color: '#444', fontSize: 16, textAlign: 'center', marginTop: 40 },
});

