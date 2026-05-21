import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  id: number;
  phone: string;
  nickname: string;
  fishing_age: number;
  frequent_spots: string[];
  skilled_fish: string[];
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:3000/api/v1/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).then((res) => setProfile(res.data));
    }
  };

  const login = async () => {
    // MVP简化登录
    try {
      const res = await axios.post('http://localhost:3000/api/v1/auth/login', {
        phone: '13800138001',
        code: '123456'
      });
      await AsyncStorage.setItem('token', res.data.token);
      setProfile(res.data.user);
    } catch (e) {
      alert('登录失败');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setProfile(null);
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👤 我的</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.emptyText}>未登录</Text>
          <TouchableOpacity style={styles.button} onPress={login}>
            <Text style={styles.buttonText}>快速登录 (测试账号)</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 我的</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.nickname?.[0] || profile.phone?.slice(-1)}</Text>
          </View>
          <Text style={styles.name}>{profile.nickname || '未设置昵称'}</Text>
          <Text style={styles.phone}>{profile.phone}</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.fishing_age || 0}</Text>
            <Text style={styles.statLabel}>钓龄(年)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.skilled_fish?.length || 0}</Text>
            <Text style={styles.statLabel}>擅长鱼种</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
          <Text style={[styles.buttonText, styles.logoutText]}>退出登录</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#2E7D32', padding: 16, paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { padding: 16 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#999', marginVertical: 20 },
  profileCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', marginTop: 12 },
  phone: { fontSize: 14, color: '#999', marginTop: 4 },
  stats: { flexDirection: 'row', marginTop: 16, gap: 12 },
  statItem: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  button: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D32F2F' },
  logoutText: { color: '#D32F2F' },
});
