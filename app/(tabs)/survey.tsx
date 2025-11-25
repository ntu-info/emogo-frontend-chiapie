import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { insertSurveyResponse } from '../../utils/database';
import { getCurrentLocation } from '../../utils/location';

const sentimentEmojis = ['😢', '😕', '😐', '🙂', '😄'];
const sentimentLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

export default function SurveyScreen() {
  const [selectedSentiment, setSelectedSentiment] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitSurvey = async () => {
    if (selectedSentiment === null) {
      Alert.alert('Please select a sentiment', 'Choose how you\'re feeling right now.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current location
      const location = await getCurrentLocation();

      // Get current timestamp
      const timestamp = new Date().toISOString();

      // Save to database
      await insertSurveyResponse({
        timestamp,
        sentiment_score: selectedSentiment + 1, // 1-5 scale
        latitude: location?.coords.latitude || null,
        longitude: location?.coords.longitude || null,
      });

      // Show success message
      Alert.alert('Success', 'Response saved!', [
        { text: 'OK', onPress: () => setSelectedSentiment(null) }
      ]);
    } catch (error) {
      console.error('Error submitting survey:', error);
      Alert.alert('Error', 'Failed to save response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>
      <Text style={styles.subtitle}>Select your current mood</Text>

      <View style={styles.sentimentContainer}>
        {sentimentEmojis.map((emoji, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sentimentButton,
              selectedSentiment === index && styles.sentimentButtonSelected,
            ]}
            onPress={() => setSelectedSentiment(index)}
            disabled={isSubmitting}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.label}>{sentimentLabels[index]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmitSurvey}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Saving...' : 'Submit Response'}
        </Text>
      </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  sentimentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
    flexWrap: 'wrap',
  },
  sentimentButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#fff',
    width: '18%',
    minWidth: 60,
    marginBottom: 10,
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
    backgroundColor: '#FDEDED',
  },
  emoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    color: '#F875AA',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#F875AA',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#F875AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#F875AA',
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});
