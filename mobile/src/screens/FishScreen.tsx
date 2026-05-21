import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FishResult {
  fish_name: string;
  scientific_name: string;
  habits: string;
  protection_level: string;
  is_protected: boolean;
  confidence: number;
  warning: string | null;
}

export default function FishScreen() {
  const [result, setResult] = useState<FishResult | null>(null);
  const [loading, setLoading] = useState(false);

  const recognize = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post('http://localhost:3000/api/v1/fish/recognize', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
    } catch (e) {
      alert('识别失败，请登录后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🐟 AI识鱼</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.uploadArea}>
          <Text style={{ fontSize: 60 }}>📷</Text>
          <Text style={styles.uploadText}>拍照或上传图片识别鱼种</Text>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity style={styles.button} onPress={recognize} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>开始识别</Text>}
            </TouchableOpacity>
            <View style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#F59E0B', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ color: '#78350F', fontSize: 10, fontWeight: 'bold' }}>演示</Text>
            </View>
          </View>
          <Text style={{ fontSize: 11, color: '#999', marginTop: 8 }}>* 当前为演示模式，返回模拟结果</Text>
        </View>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>识别结果</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>鱼名</Text>
              <Text style={styles.resultValue}>{result.fish_name}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>学名</Text>
              <Text style={styles.resultValue}>{result.scientific_name}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>习性</Text>
              <Text style={styles.resultValue}>{result.habits}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>保护级别</Text>
              <Text style={[styles.resultValue, result.is_protected && styles.protected]}>
                {result.protection_level}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>置信度</Text>
              <Text style={styles.resultValue}>{(result.confidence * 100).toFixed(1)}%</Text>
            </View>
            {result.warning && (
              <View style={styles.warning}>
                <Text style={styles.warningText}>{result.warning}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#2E7D32', padding: 16, paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { padding: 16 },
  uploadArea: { backgroundColor: '#fff', borderRadius: 16, padding: 30, alignItems: 'center', marginBottom: 16 },
  uploadText: { fontSize: 14, color: '#666', marginVertical: 12 },
  button: { backgroundColor: '#2E7D32', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  resultLabel: { fontSize: 14, color: '#666' },
  resultValue: { fontSize: 14, fontWeight: '600' },
  protected: { color: '#D32F2F' },
  warning: { backgroundColor: '#FFEBEE', borderRadius: 8, padding: 12, marginTop: 12 },
  warningText: { color: '#D32F2F', fontWeight: 'bold', textAlign: 'center' },
});
