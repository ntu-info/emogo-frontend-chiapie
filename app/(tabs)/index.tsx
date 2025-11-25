import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllSurveys, getAllVlogs, initDatabase } from '../../utils/database';

export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    todaysSurveys: 0,
    todaysVlogs: 0,
    totalSurveys: 0,
    totalVlogs: 0,
  });

  useEffect(() => {
    // Initialize database on app start
    initDatabase().catch(console.error);

    // Load stats
    loadStats();

    // Refresh stats when screen comes into focus
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const surveys = await getAllSurveys();
      const vlogs = await getAllVlogs();

      const today = new Date().toISOString().split('T')[0];

      const todaysSurveys = surveys.filter((s: any) =>
        s.timestamp.startsWith(today)
      ).length;

      const todaysVlogs = vlogs.filter((v: any) =>
        v.timestamp.startsWith(today)
      ).length;

      setStats({
        todaysSurveys,
        todaysVlogs,
        totalSurveys: surveys.length,
        totalVlogs: vlogs.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to EmoGo</Text>
        <Text style={styles.subtitle}>Track your emotions, one moment at a time</Text>

        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Today's Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={32} color="#007AFF" />
              <Text style={styles.statNumber}>{stats.todaysSurveys}</Text>
              <Text style={styles.statLabel}>Surveys</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="videocam" size={32} color="#34C759" />
              <Text style={styles.statNumber}>{stats.todaysVlogs}</Text>
              <Text style={styles.statLabel}>Vlogs</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>All Time</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalSurveys}</Text>
              <Text style={styles.statLabel}>Total Surveys</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalVlogs}</Text>
              <Text style={styles.statLabel}>Total Vlogs</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/survey')}
          >
            <Ionicons name="heart" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Record Your Mood</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => router.push('/(tabs)/vlog')}
          >
            <Ionicons name="videocam" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Record 1-Second Vlog</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonTertiary]}
            onPress={() => router.push('/(tabs)/export')}
          >
            <Ionicons name="download" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Export Your Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About EmoGo</Text>
          <Text style={styles.infoText}>
            EmoGo helps you track your emotional well-being through quick daily check-ins.
            Record your mood, capture 1-second video vlogs, and see patterns in your emotional journey.
          </Text>
          <Text style={styles.infoText}>
            You'll receive 3 daily reminders to check in with yourself. All your data is stored
            locally on your device and can be exported at any time.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDEDED',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FDEDED',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#F875AA',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F875AA',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FDEDED',
  },
  actionButton: {
    backgroundColor: '#F875AA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonSecondary: {
    backgroundColor: '#F875AA',
  },
  actionButtonTertiary: {
    backgroundColor: '#F875AA',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FDEDED',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#F875AA',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
});
