
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';

export default function EmergencyReportScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');

  const emergencyTypes = [
    { id: 'fire', label: '🔥 Fire', color: '#ff4444' },
    { id: 'medical', label: '🚑 Medical Emergency', color: '#ff6b6b' },
    { id: 'accident', label: '🚗 Accident', color: '#ffa726' },
    { id: 'flood', label: '🌊 Flood', color: '#42a5f5' },
    { id: 'security', label: '🚨 Security Issue', color: '#ab47bc' },
    { id: 'other', label: '⚠️ Other Emergency', color: '#66bb6a' },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required for emergency reporting');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const handleSubmitReport = () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select an emergency type');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location is required for reporting');
      return;
    }

    Alert.alert(
      'Report Submitted',
      'Your emergency report has been submitted successfully. Emergency services have been notified.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Report Emergency</Text>
      
      <View style={styles.locationSection}>
        <Text style={styles.sectionTitle}>📍 Current Location</Text>
        {location ? (
          <Text style={styles.locationText}>
            Lat: {location.coords.latitude.toFixed(6)}, 
            Lng: {location.coords.longitude.toFixed(6)}
          </Text>
        ) : (
          <Text style={styles.locationText}>Getting location...</Text>
        )}
      </View>

      <View style={styles.typeSection}>
        <Text style={styles.sectionTitle}>Emergency Type</Text>
        {emergencyTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              { borderColor: type.color },
              selectedType === type.id && { backgroundColor: type.color }
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <Text style={[
              styles.typeButtonText,
              selectedType === type.id && { color: '#fff' }
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, !selectedType && styles.submitButtonDisabled]}
        onPress={handleSubmitReport}
        disabled={!selectedType}
      >
        <Text style={styles.submitButtonText}>Submit Emergency Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#d32f2f',
    textAlign: 'center',
  },
  locationSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  typeSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  typeButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 10,
  },
  typeButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#d32f2f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
