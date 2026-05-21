import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎣 野钓App</Text>
        <Text style={styles.subtitle}>发现身边的野钓好去处</Text>
      </View>

      <View style={styles.features}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('钓点')}>
          <Text style={styles.cardIcon}>🗺️</Text>
          <Text style={styles.cardTitle}>探索钓点</Text>
          <Text style={styles.cardDesc}>发现附近的野钓好去处</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('识鱼')}>
          <Text style={styles.cardIcon}>🐟</Text>
          <Text style={styles.cardTitle}>AI识鱼</Text>
          <Text style={styles.cardDesc}>拍照识别鱼种</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('社区')}>
          <Text style={styles.cardIcon}>👥</Text>
          <Text style={styles.cardTitle}>钓友社区</Text>
          <Text style={styles.cardDesc}>分享钓鱼故事</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#2E7D32', padding: 30, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#fff', marginTop: 8 },
  features: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardIcon: { fontSize: 40, marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#666' },
});
