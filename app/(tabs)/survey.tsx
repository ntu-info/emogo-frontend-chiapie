import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { insertSurveyResponse } from '../../utils/database';
import { getCurrentLocation } from '../../utils/location';

const SENTIMENTS = [
  { score: 1, emoji: '😢', label: 'Very Sad' },
  { score: 2, emoji: '😟', label: 'Sad' },
  { score: 3, emoji: '😐', label: 'Neutral' },
  { score: 4, emoji: '🙂', label: 'Happy' },
  { score: 5, emoji: '😄', label: 'Very Happy' },
];

export default function SurveyScreen() {
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (selectedScore === null) {
      Alert.alert('Please select a sentiment', 'Choose how you\'re feeling right now');
      return;
    }

    setLoading(true);

    try {
      if (Platform.OS === 'web') {
        Alert.alert('Web Demo', 'Survey submission works on mobile only. Data not saved on web.');
        setSelectedScore(null);
        setLoading(false);
        return;
      }

      // Get current location
      const location = await getCurrentLocation();

      // Get current timestamp
      const timestamp = new Date().toISOString();

      // Save to database
      await insertSurveyResponse({
        timestamp,
        sentiment_score: selectedScore,
        latitude: location?.coords.latitude || null,
        longitude: location?.coords.longitude || null,
      });

      Alert.alert('Success!', 'Your response has been saved', [
        {
          text: 'OK',
          onPress: () => setSelectedScore(null),
        },
      ]);
    } catch (error) {
      console.error('Error submitting survey:', error);
      Alert.alert('Error', 'Failed to save response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>
      <Text style={styles.subtitle}>Select your current mood</Text>

      <View style={styles.sentimentContainer}>
        {SENTIMENTS.map((sentiment) => (
          <TouchableOpacity
            key={sentiment.score}
            style={[
              styles.sentimentButton,
              selectedScore === sentiment.score && styles.sentimentButtonSelected,
            ]}
            onPress={() => setSelectedScore(sentiment.score)}
            disabled={loading}
          >
            <Text style={styles.emoji}>{sentiment.emoji}</Text>
            <Text style={styles.label}>{sentiment.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading || selectedScore === null}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Response</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.timestamp}>
        {new Date().toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FDEDED',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  sentimentContainer: {
    marginBottom: 40,
  },
  sentimentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  sentimentButtonSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFE8E8',
  },
  emoji: {
    fontSize: 32,
    marginRight: 16,
  },
  label: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#FFAAAA',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timestamp: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
});
