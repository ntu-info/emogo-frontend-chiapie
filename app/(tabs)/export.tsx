import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllSurveys, getAllVlogs } from '../../utils/database';

export default function ExportScreen() {
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalVlogs: 0,
    dateRange: { earliest: '', latest: '' },
  });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const surveys = await getAllSurveys();
      const vlogs = await getAllVlogs();

      const allTimestamps = [
        ...surveys.map((s: any) => s.timestamp),
        ...vlogs.map((v: any) => v.timestamp),
      ].sort();

      setStats({
        totalSurveys: surveys.length,
        totalVlogs: vlogs.length,
        dateRange: {
          earliest: allTimestamps[0] || 'N/A',
          latest: allTimestamps[allTimestamps.length - 1] || 'N/A',
        },
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const exportData = async () => {
    setIsExporting(true);

    try {
      // Get all survey responses
      const surveys = await getAllSurveys();

      // Get all vlog entries
      const vlogs = await getAllVlogs();

      // Create JSON file
      const exportDataObj = {
        export_date: new Date().toISOString(),
        total_surveys: surveys.length,
        total_vlogs: vlogs.length,
        surveys,
        vlogs,
      };

      const jsonString = JSON.stringify(exportDataObj, null, 2);
      const fileUri = (FileSystem as any).documentDirectory + 'emogo_export.json';

      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export EmoGo Data',
        });
      } else {
        Alert.alert('Export Complete', `Data saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportCSV = async () => {
    setIsExporting(true);

    try {
      // Get all data
      const surveys = await getAllSurveys();
      const vlogs = await getAllVlogs();

      // Create CSV header
      const csvHeader = 'Type,Timestamp,Date,Time,Sentiment_Score,Sentiment_Label,Video_URI,Latitude,Longitude,Has_Location\n';

      // Map sentiment scores to labels
      const sentimentLabels = ['', 'Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

      // Convert surveys to CSV rows
      const surveyRows = surveys.map((survey: any) => {
        const date = new Date(survey.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().split(' ')[0];
        const hasLocation = survey.latitude && survey.longitude ? 'Yes' : 'No';
        const sentimentLabel = sentimentLabels[survey.sentiment_score] || 'Unknown';

        return `Survey,${survey.timestamp},${dateStr},${timeStr},${survey.sentiment_score},${sentimentLabel},,${survey.latitude || ''},${survey.longitude || ''},${hasLocation}`;
      }).join('\n');

      // Convert vlogs to CSV rows
      const vlogRows = vlogs.map((vlog: any) => {
        const date = new Date(vlog.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().split(' ')[0];
        const hasLocation = vlog.latitude && vlog.longitude ? 'Yes' : 'No';
        const videoFilename = vlog.video_uri.split('/').pop();

        return `Vlog,${vlog.timestamp},${dateStr},${timeStr},,,${videoFilename},${vlog.latitude || ''},${vlog.longitude || ''},${hasLocation}`;
      }).join('\n');

      // Combine all rows
      const csvContent = csvHeader + surveyRows + (vlogRows ? '\n' + vlogRows : '');

      // Write CSV file
      const fileUri = (FileSystem as any).documentDirectory + 'emogo_export.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      // Share file
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export EmoGo Data as CSV',
        });
      } else {
        Alert.alert('Export Complete', `CSV saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllFiles = async () => {
    setIsExporting(true);

    try {
      // Create a temporary directory
      const exportDir = ((FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory) + 'emogo_export/';

      // Remove old export directory if it exists
      const dirInfo = await FileSystem.getInfoAsync(exportDir);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(exportDir);
      }

      await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

      // Get all data
      const surveys = await getAllSurveys();
      const vlogs = await getAllVlogs();

      // Create JSON file
      const exportDataObj = {
        export_date: new Date().toISOString(),
        total_surveys: surveys.length,
        total_vlogs: vlogs.length,
        surveys,
        vlogs,
      };

      const jsonString = JSON.stringify(exportDataObj, null, 2);
      await FileSystem.writeAsStringAsync(`${exportDir}data.json`, jsonString);

      // Copy all video files
      for (const vlog of vlogs) {
        const filename = vlog.video_uri.split('/').pop();
        const fileInfo = await FileSystem.getInfoAsync(vlog.video_uri);

        if (fileInfo.exists) {
          await FileSystem.copyAsync({
            from: vlog.video_uri,
            to: `${exportDir}${filename}`,
          });
        }
      }

      // Share directory
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(exportDir, {
          dialogTitle: 'Export EmoGo Data',
        });
      } else {
        Alert.alert('Export Complete', `Data saved to: ${exportDir}`);
      }
    } catch (error) {
      console.error('Error exporting all files:', error);
      Alert.alert('Error', 'Failed to export all files. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Data Export</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Collection Summary</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Surveys:</Text>
            <Text style={styles.statValue}>{stats.totalSurveys}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Vlogs:</Text>
            <Text style={styles.statValue}>{stats.totalVlogs}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>First Entry:</Text>
            <Text style={styles.statValue}>{formatDate(stats.dateRange.earliest)}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Latest Entry:</Text>
            <Text style={styles.statValue}>{formatDate(stats.dateRange.latest)}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
            onPress={exportCSV}
            disabled={isExporting}
          >
            <Text style={styles.exportButtonText}>
              {isExporting ? 'Exporting...' : 'Export CSV (Recommended)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, styles.exportAllButton, isExporting && styles.exportButtonDisabled]}
            onPress={exportData}
            disabled={isExporting}
          >
            <Text style={styles.exportButtonText}>
              {isExporting ? 'Exporting...' : 'Export JSON Data'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, styles.exportAllButton, isExporting && styles.exportButtonDisabled]}
            onPress={exportAllFiles}
            disabled={isExporting}
          >
            <Text style={styles.exportButtonText}>
              {isExporting ? 'Exporting...' : 'Export All Files (JSON + Videos)'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>
          Export your data to share or backup. CSV format is recommended for data analysis and includes recording time, GPS location, sentiment scores, and labels. JSON and video exports are also available.
        </Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#F875AA',
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
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
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FDEDED',
  },
  statLabel: {
    fontSize: 16,
    color: '#F875AA',
    opacity: 0.8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F875AA',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  exportButton: {
    backgroundColor: '#F875AA',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#F875AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  exportAllButton: {
    backgroundColor: '#F875AA',
    opacity: 0.9,
  },
  exportButtonDisabled: {
    backgroundColor: '#F875AA',
    opacity: 0.5,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 14,
    color: '#F875AA',
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.8,
  },
});
