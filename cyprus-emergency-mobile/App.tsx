
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import EmergencyReportScreen from './src/screens/EmergencyReportScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [user, setUser] = useState(null);

  const navigation = {
    navigate: (screenName: string) => setCurrentScreen(screenName),
    replace: (screenName: string) => setCurrentScreen(screenName),
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Login':
        return <LoginScreen navigation={navigation} onLogin={setUser} />;
      case 'Home':
        return <HomeScreen navigation={navigation} user={user} />;
      case 'EmergencyReport':
        return <EmergencyReportScreen navigation={navigation} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} user={user} />;
      default:
        return <LoginScreen navigation={navigation} onLogin={setUser} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
