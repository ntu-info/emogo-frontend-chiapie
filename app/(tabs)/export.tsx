import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllSurveys, getAllVlogs, exportAllData } from '../../utils/database';
import type { SurveyResponse, VlogEntry } from '../../utils/database';

export default function ExportScreen() {
  const [surveys, setSurveys] = useState<SurveyResponse[]>([]);
  const [vlogs, setVlogs] = useState<VlogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (Platform.OS === 'web') {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const surveysData = await getAllSurveys();
      const vlogsData = await getAllVlogs();
      setSurveys(surveysData);
      setVlogs(vlogsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setExporting(true);

      // Get all data
      const exportData = await exportAllData();

      // Create JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const fileUri = `${FileSystem.documentDirectory}emogo_export.json`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export EmoGo Data',
        });
      } else {
        Alert.alert('Success', `Data exported to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error exporting JSON:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleExportAll = async () => {
    try {
      setExporting(true);

      // Create export directory
      const exportDir = `${FileSystem.cacheDirectory}emogo_export/`;

      // Remove old export if exists
      const dirInfo = await FileSystem.getInfoAsync(exportDir);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(exportDir, { idempotent: true });
      }

      await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

      // Export JSON data
      const exportData = await exportAllData();
      const jsonString = JSON.stringify(exportData, null, 2);
      await FileSystem.writeAsStringAsync(`${exportDir}data.json`, jsonString);

      // Copy all video files
      for (const vlog of vlogs) {
        const filename = vlog.video_uri.split('/').pop() || `vlog_${vlog.id}.mp4`;
        const destUri = `${exportDir}${filename}`;

        try {
          await FileSystem.copyAsync({
            from: vlog.video_uri,
            to: destUri,
          });
        } catch (error) {
          console.error(`Error copying vlog ${filename}:`, error);
        }
      }

      // Share directory
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(exportDir, {
          dialogTitle: 'Export All EmoGo Data',
        });
      } else {
        Alert.alert('Success', `Data exported to: ${exportDir}`);
      }
    } catch (error) {
      console.error('Error exporting all data:', error);
      Alert.alert('Error', 'Failed to export all data');
    } finally {
      setExporting(false);
    }
  };

  const getDateRange = () => {
    if (surveys.length === 0) return 'No data yet';

    const dates = surveys.map(s => new Date(s.timestamp).getTime());
    const earliest = new Date(Math.min(...dates));
    const latest = new Date(Math.max(...dates));

    const diffHours = (latest.getTime() - earliest.getTime()) / (1000 * 60 * 60);

    return `${diffHours.toFixed(1)} hours (${earliest.toLocaleDateString()} - ${latest.toLocaleDateString()})`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Export Data</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{surveys.length}</Text>
            <Text style={styles.statLabel}>Survey Responses</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{vlogs.length}</Text>
            <Text style={styles.statLabel}>Video Vlogs</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Date Range:</Text>
          <Text style={styles.infoValue}>{getDateRange()}</Text>
        </View>

        <TouchableOpacity
          style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
          onPress={handleExportJSON}
          disabled={exporting || surveys.length === 0}
        >
          {exporting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.exportButtonText}>Export JSON Data</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, styles.exportButtonSecondary, exporting && styles.exportButtonDisabled]}
          onPress={handleExportAll}
          disabled={exporting || (surveys.length === 0 && vlogs.length === 0)}
        >
          {exporting ? (
            <ActivityIndicator color="#FF6B6B" />
          ) : (
            <Text style={[styles.exportButtonText, styles.exportButtonTextSecondary]}>
              Export All Data + Videos
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadData}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh Data</Text>
        </TouchableOpacity>

        {surveys.length > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Recent Surveys</Text>
            {surveys.slice(0, 3).map((survey) => (
              <View key={survey.id} style={styles.previewItem}>
                <Text style={styles.previewText}>
                  Score: {survey.sentiment_score} • {new Date(survey.timestamp).toLocaleString()}
                </Text>
                {survey.latitude && survey.longitude && (
                  <Text style={styles.previewLocation}>
                    📍 {survey.latitude.toFixed(4)}, {survey.longitude.toFixed(4)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDEDED',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDEDED',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  exportButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  exportButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  exportButtonDisabled: {
    opacity: 0.5,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exportButtonTextSecondary: {
    color: '#FF6B6B',
  },
  refreshButton: {
    padding: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#666',
    fontSize: 16,
  },
  previewContainer: {
    marginTop: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  previewItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  previewLocation: {
    fontSize: 12,
    color: '#666',
  },
});
