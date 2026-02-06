import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>profile.</Text>
      <Text style={styles.subtitle}>coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: '#000',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  subtitle: {
    color: '#444',
    fontSize: 16,
  },
});

