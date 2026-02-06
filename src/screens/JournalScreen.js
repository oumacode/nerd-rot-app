import React, { useState, useMemo } from 'react';
import { 
  SectionList, 
  FlatList,
  Text, 
  StyleSheet, 
  View, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import JournalCard from '../components/JournalCard';

function formatDateHeader(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (entryDate.getTime() === today.getTime()) {
    return 'today';
  } else if (entryDate.getTime() === yesterday.getTime()) {
    return 'yesterday';
  } else {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date).toLowerCase();
  }
}

function TopicCard({ topic, count, onPress }) {
  return (
    <TouchableOpacity
      style={styles.topicCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.topicName}>{topic.toLowerCase()}</Text>
      <Text style={styles.topicCount}>{count} {count === 1 ? 'entry' : 'entries'}</Text>
    </TouchableOpacity>
  );
}

export default function JournalScreen({ journal, onDelete }) {
  const [filterMode, setFilterMode] = useState('date'); // 'date' | 'topic'
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Get unique topics with counts
  const topicGroups = useMemo(() => {
    const grouped = {};
    journal.forEach(entry => {
      const topic = entry.topic || 'Misc';
      if (!grouped[topic]) {
        grouped[topic] = [];
      }
      grouped[topic].push(entry);
    });

    return Object.keys(grouped)
      .map(topic => ({
        topic,
        entries: grouped[topic].sort((a, b) => b.timestamp - a.timestamp),
        count: grouped[topic].length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [journal]);

  // Get filtered entries for selected topic
  const filteredEntries = useMemo(() => {
    if (!selectedTopic) return [];
    const group = topicGroups.find(g => g.topic === selectedTopic);
    return group ? group.entries : [];
  }, [selectedTopic, topicGroups]);

  // Group entries by date for "Latest" view
  const dateSections = useMemo(() => {
    const grouped = {};
    journal.forEach(entry => {
      const header = formatDateHeader(entry.timestamp);
      if (!grouped[header]) {
        grouped[header] = [];
      }
      grouped[header].push(entry);
    });

    return Object.keys(grouped)
      .sort((a, b) => {
        // Sort dates: today > yesterday > month names (chronological)
        if (a === 'today') return -1;
        if (b === 'today') return 1;
        if (a === 'yesterday') return -1;
        if (b === 'yesterday') return 1;
        return b.localeCompare(a);
      })
      .map(header => ({
        title: header,
        data: grouped[header].sort((a, b) => b.timestamp - a.timestamp),
      }));
  }, [journal]);

  // If viewing a specific topic, show the filtered list
  if (selectedTopic) {
    const selectedGroup = topicGroups.find(g => g.topic === selectedTopic);
    const entryCount = selectedGroup ? selectedGroup.count : 0;

    return (
      <View style={styles.container}>
        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterButton, filterMode === 'date' && styles.filterButtonActive]}
              onPress={() => {
                setFilterMode('date');
                setSelectedTopic(null);
              }}
            >
              <Text style={[styles.filterButtonText, filterMode === 'date' && styles.filterButtonTextActive]}>
                latest
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, filterMode === 'topic' && styles.filterButtonActive]}
              onPress={() => {
                setFilterMode('topic');
                setSelectedTopic(null);
              }}
            >
              <Text style={[styles.filterButtonText, filterMode === 'topic' && styles.filterButtonTextActive]}>
                topics
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Back Button Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedTopic(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#CCFF00" />
            <Text style={styles.backText}>back</Text>
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{selectedTopic.toLowerCase()}</Text>
            <Text style={styles.headerSubtitle}>/ {entryCount} {entryCount === 1 ? 'entry' : 'entries'}</Text>
          </View>
        </View>

        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => String(item.timestamp)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>no entries in this topic.</Text>
          }
          renderItem={({ item }) => (
            <JournalCard entry={item} onDelete={onDelete} />
          )}
        />
      </View>
    );
  }

  // Main view - show topic cards or date sections
  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, filterMode === 'date' && styles.filterButtonActive]}
            onPress={() => {
              setFilterMode('date');
              setSelectedTopic(null);
            }}
          >
            <Text style={[styles.filterButtonText, filterMode === 'date' && styles.filterButtonTextActive]}>
              latest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filterMode === 'topic' && styles.filterButtonActive]}
            onPress={() => {
              setFilterMode('topic');
              setSelectedTopic(null);
            }}
          >
            <Text style={[styles.filterButtonText, filterMode === 'topic' && styles.filterButtonTextActive]}>
              topics
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {filterMode === 'topic' ? (
        // Topic Cards Grid
        <FlatList
          data={topicGroups}
          keyExtractor={(item) => item.topic}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
          ListEmptyComponent={
            <Text style={styles.empty}>no entries yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <TopicCard
                topic={item.topic}
                count={item.count}
                onPress={() => setSelectedTopic(item.topic)}
              />
            </View>
          )}
        />
      ) : (
        // Date Sections List
        <SectionList
          sections={dateSections}
          keyExtractor={(item) => String(item.timestamp)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>no entries yet.</Text>
          }
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLine} />
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <JournalCard entry={item} onDelete={onDelete} />
          )}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  filterBar: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#111',
    borderColor: '#CCFF00',
  },
  filterButtonText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
  filterButtonTextActive: {
    color: '#CCFF00',
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    flex: 1,
    maxWidth: '48%',
    marginHorizontal: 8,
  },
  topicCard: {
    aspectRatio: 1,
    backgroundColor: '#000',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#151515',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 140,
  },
  topicName: {
    color: '#CCFF00',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  topicCount: {
    color: '#777',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backText: {
    color: '#CCFF00',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'lowercase',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'lowercase',
  },
  headerSubtitle: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  empty: {
    color: '#444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionHeaderLine: {
    width: 20,
    height: 1,
    backgroundColor: '#CCFF00',
    marginRight: 8,
  },
  sectionHeaderText: {
    color: '#555',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'lowercase',
    letterSpacing: 0.5,
  },
});
