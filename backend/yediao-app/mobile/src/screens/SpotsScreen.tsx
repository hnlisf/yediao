import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';

interface Spot {
  id: number;
  name: string;
  description: string;
  fish_species: string[];
  water_depth: string;
  creator: { nickname: string };
}

export default function SpotsScreen() {
  const [spots, setSpots] = useState<Spot[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/spots').then((res) => setSpots(res.data));
  }, []);

  const renderItem = ({ item }: { item: Spot }) => (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Text style={{ fontSize: 40 }}>🎣</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <View style={styles.tags}>
          {item.fish_species?.map((fish) => (
            <View key={fish} style={styles.tag}>
              <Text style={styles.tagText}>{fish}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.meta}>水深: {item.water_depth || '未知'} | by {item.creator?.nickname}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ 附近钓点</Text>
      </View>
      <FlatList
        data={spots}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#2E7D32', padding: 16, paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  list: { padding: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 2 },
  imagePlaceholder: { height: 120, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  cardContent: { padding: 12 },
  name: { fontSize: 16, fontWeight: 'bold' },
  desc: { fontSize: 13, color: '#666', marginTop: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  tag: { backgroundColor: '#E8F5E9', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 12, color: '#2E7D32' },
  meta: { fontSize: 12, color: '#999', marginTop: 8 },
});
