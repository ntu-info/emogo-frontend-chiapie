import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { insertVlogEntry } from '../../utils/database';
import { getCurrentLocation } from '../../utils/location';

export default function VlogScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
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

      // Copy video to app directory
      const filename = `vlog_${Date.now()}.mp4`;
      const destUri = (FileSystem as any).documentDirectory + filename;

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

      Alert.alert('Success', 'Vlog saved!');
    } catch (error) {
      console.error('Error saving vlog:', error);
      Alert.alert('Error', 'Failed to save vlog. Please try again.');
    }
  };

  const recordVlog = async () => {
    if (!cameraRef.current || isRecording) return;

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
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        mode="video"
      >
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
            disabled={isRecording}
          >
            <Text style={styles.buttonText}>Flip</Text>
          </TouchableOpacity>

          <View style={styles.centerControls}>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording...</Text>
              </View>
            )}

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
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
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
  camera: {
    flex: 1,
  },
  controlsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  flipButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#F875AA',
    padding: 15,
    borderRadius: 16,
    shadowColor: '#F875AA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  centerControls: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F875AA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#F875AA',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  recordingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(248, 117, 170, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#F875AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  recordButtonActive: {
    backgroundColor: 'rgba(248, 117, 170, 0.7)',
  },
  recordButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F875AA',
  },
  instructionText: {
    color: '#F875AA',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
});
