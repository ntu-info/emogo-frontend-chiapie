import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { insertVlogEntry } from '../../utils/database';
import { getCurrentLocation } from '../../utils/location';

export default function VlogScreen() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
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

  const recordVlog = async () => {
    if (!cameraRef.current || isRecording) return;

    try {
      setIsRecording(true);

      // Start recording
      const video = await cameraRef.current.recordAsync({
        maxDuration: 1,
      });

      // Save video
      await saveVlog(video.uri);
    } catch (error) {
      console.error('Error recording vlog:', error);
      Alert.alert('Error', 'Failed to record vlog. Please try again.');
    } finally {
      setIsRecording(false);
    }
  };

  const saveVlog = async (videoUri: string) => {
    try {
      // Get location
      const location = await getCurrentLocation();

      // Create filename
      const filename = `vlog_${Date.now()}.mp4`;
      const destUri = `${FileSystem.documentDirectory}${filename}`;

      // Copy video to app directory
      await FileSystem.copyAsync({
        from: videoUri,
        to: destUri,
      });

      // Save metadata to database
      await insertVlogEntry({
        timestamp: new Date().toISOString(),
        video_uri: destUri,
        latitude: location?.coords.latitude || null,
        longitude: location?.coords.longitude || null,
      });

      Alert.alert('Success!', 'Vlog recorded and saved successfully!');
    } catch (error) {
      console.error('Error saving vlog:', error);
      Alert.alert('Error', 'Failed to save vlog. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        mode="video"
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>Record 1-Second Vlog</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
              disabled={isRecording}
            >
              <Text style={styles.flipButtonText}>🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={recordVlog}
              disabled={isRecording}
            >
              {isRecording ? (
                <View style={styles.recordingIndicator}>
                  <Text style={styles.recordingText}>●</Text>
                </View>
              ) : (
                <Text style={styles.recordButtonText}>Record</Text>
              )}
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>

          {countdown !== null && (
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  controls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: 30,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  recordButtonActive: {
    backgroundColor: '#FF0000',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordingIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingText: {
    color: '#fff',
    fontSize: 40,
  },
  placeholder: {
    width: 60,
  },
  countdownContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#fff',
  },
});
