
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

interface EmergencyReportScreenProps {
  navigation: any;
}

export default function EmergencyReportScreen({ navigation }: EmergencyReportScreenProps) {
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

    // Submit the emergency report
    Alert.alert(
      'Emergency Reported',
      `Emergency type: ${selectedType}\nLocation: ${location.coords.latitude}, ${location.coords.longitude}`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  };

  const handleBack = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Report Emergency</Text>
      </View>
      
      <ScrollView style={styles.content}>
      
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
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
