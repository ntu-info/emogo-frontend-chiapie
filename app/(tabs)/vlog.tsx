import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { insertVlogEntry, insertSurveyResponse } from '../../utils/database';
import { getCurrentLocation } from '../../utils/location';

const sentimentEmojis = ['😢', '😕', '😐', '🙂', '😄'];
const sentimentLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

export default function VlogScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [selectedSentiment, setSelectedSentiment] = useState<number | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera permission to record vlogs</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const saveVlog = async (videoUri: string) => {
    try {
      // Get location
      const location = await getCurrentLocation();
      const timestamp = new Date().toISOString();

      // Copy video to app directory
      const filename = `vlog_${Date.now()}.mp4`;
      const destUri = (FileSystem as any).documentDirectory + filename;

      await FileSystem.copyAsync({
        from: videoUri,
        to: destUri,
      });

      // Save video metadata to database
      await insertVlogEntry({
        timestamp,
        video_uri: destUri,
        latitude: location?.coords.latitude || null,
        longitude: location?.coords.longitude || null,
      });

      // Save mood data if selected
      if (selectedSentiment !== null) {
        await insertSurveyResponse({
          timestamp,
          sentiment_score: selectedSentiment + 1, // 1-5 scale
          latitude: location?.coords.latitude || null,
          longitude: location?.coords.longitude || null,
        });
      }

      Alert.alert('Success', 'Vlog and mood saved!', [
        { text: 'OK', onPress: () => setSelectedSentiment(null) }
      ]);
    } catch (error) {
      console.error('Error saving vlog:', error);
      Alert.alert('Error', 'Failed to save vlog. Please try again.');
    }
  };

  const recordVlog = async () => {
    if (!cameraRef.current || isRecording) return;

    // Check if mood is selected
    if (selectedSentiment === null) {
      Alert.alert('Select Your Mood', 'Please select how you\'re feeling before recording.');
      return;
    }

    try {
      setIsRecording(true);

      const video = await cameraRef.current.recordAsync({
        maxDuration: 1, // 1 second
      });

      if (video && video.uri) {
        await saveVlog(video.uri);
      }
    } catch (error) {
      console.error('Error recording vlog:', error);
      Alert.alert('Error', 'Failed to record vlog. Please try again.');
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How are you feeling?</Text>
        <Text style={styles.subtitle}>Select your mood and record a 1-second vlog</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
        >
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
            disabled={isRecording}
          >
            <Text style={styles.buttonText}>Flip</Text>
          </TouchableOpacity>

          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording...</Text>
            </View>
          )}
        </CameraView>
      </View>

      <View style={styles.moodSection}>
        <Text style={styles.moodTitle}>Select Your Mood</Text>
        <View style={styles.sentimentContainer}>
          {sentimentEmojis.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.sentimentButton,
                selectedSentiment === index && styles.sentimentButtonSelected,
              ]}
              onPress={() => setSelectedSentiment(index)}
              disabled={isRecording}
            >
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={styles.label}>{sentimentLabels[index]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.recordSection}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={recordVlog}
          disabled={isRecording}
        >
          <View style={styles.recordButtonInner} />
        </TouchableOpacity>
        <Text style={styles.instructionText}>
          {isRecording ? 'Recording 1 second...' : 'Tap to record 1-second vlog'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDEDED',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 20,
    color: '#F875AA',
    fontSize: 18,
    fontWeight: '600',
  },
  permissionButton: {
    backgroundColor: '#F875AA',
    padding: 18,
    borderRadius: 16,
    marginHorizontal: 40,
    shadowColor: '#F875AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  permissionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#FDEDED',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  cameraContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  camera: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  flipButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#F875AA',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#F875AA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F875AA',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#F875AA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  moodSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: '#FDEDED',
  },
  moodTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    color: '#F875AA',
  },
  sentimentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sentimentButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sentimentButtonSelected: {
    borderColor: '#F875AA',
    backgroundColor: '#FFF0F7',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    textAlign: 'center',
    color: '#F875AA',
    fontWeight: '600',
  },
  recordSection: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#FDEDED',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(248, 117, 170, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#F875AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  recordButtonActive: {
    backgroundColor: 'rgba(248, 117, 170, 0.7)',
  },
  recordButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F875AA',
  },
  instructionText: {
    color: '#F875AA',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
});
