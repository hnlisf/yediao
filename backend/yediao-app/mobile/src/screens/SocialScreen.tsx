import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';

interface Post {
  id: number;
  user: { nickname: string };
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export default function SocialScreen() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/social/posts').then((res) => {
      setPosts(res.data.items || []);
    });
  }, []);

  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.user?.nickname?.[0] || '?'}</Text>
        </View>
        <View>
          <Text style={styles.nickname}>{item.user?.nickname || '匿名'}</Text>
          <Text style={styles.time}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
      <Text style={styles.content}>{item.content}</Text>
      <View style={styles.actions}>
        <TouchableOpacity>
          <Text>❤️ {item.likes_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text>💬 {item.comments_count}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 社区动态</Text>
      </View>
      <FlatList
        data={posts}
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
  postCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  nickname: { fontSize: 15, fontWeight: '600', marginLeft: 12 },
  time: { fontSize: 12, color: '#999', marginLeft: 12 },
  content: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 20 },
});
