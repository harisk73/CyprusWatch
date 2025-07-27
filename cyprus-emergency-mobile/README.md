# Cyprus Emergency Alert System - Mobile App

## Overview

This is the React Native mobile application for the Cyprus Emergency Alert System. It provides emergency reporting, real-time alerts, and emergency services access for mobile users.

## Features

- **User Authentication**: Login with email and village association
- **Emergency Dashboard**: Quick access to emergency services and reporting
- **Emergency Reporting**: Location-based emergency reporting with type selection
- **User Profile**: Manage personal information and emergency settings
- **Simplified Navigation**: Custom navigation system for optimal performance

## Current Status

✅ **Working Features:**
- All TypeScript compilation errors resolved
- Custom navigation system implemented
- User authentication flow
- Emergency reporting with mock location data
- Profile management
- Responsive mobile interface
- **Interactive HTML Demo Available** - See `demo.html` for a working preview

## Demo

### HTML Demo
Open `demo.html` in your browser to see an interactive demo of the mobile app with all screens and functionality working.

### Features Demonstrated:
- Login screen with email authentication
- Emergency dashboard with quick actions
- Emergency reporting with location and type selection
- User profile management
- Full navigation between screens

## Development Setup

### Prerequisites
- Node.js 18+ 
- Expo CLI
- React Native development environment

### Installation
```bash
cd cyprus-emergency-mobile
npm install
```

### Required Dependencies for Full Functionality
To enable all features, install these additional dependencies:
```bash
npx expo install expo-location expo-constants react-native-web @expo/metro-runtime
```

### Running the App

For iOS Simulator:
```bash
npm run ios
```

For Android:
```bash
npm run android
```

For Web (requires additional dependencies):
```bash
npm run web
```

## Architecture

### Navigation
- Custom lightweight navigation system
- No external navigation dependencies required
- Simple screen switching with state management

### Screens
- **LoginScreen**: User authentication with email
- **HomeScreen**: Emergency dashboard with quick actions
- **EmergencyReportScreen**: Location-based emergency reporting
- **ProfileScreen**: User profile and settings management

### API Integration
- Configured to work with Cyprus Emergency System backend
- Development/production environment detection
- RESTful API communication

## Emergency Types Supported
- 🔥 Fire
- 🚑 Medical Emergency
- 🚗 Accident
- 🌊 Flood
- 🚨 Security Issue
- ⚠️ Other Emergency

## Mock Location Data
Currently uses Limassol, Cyprus coordinates (34.6857, 33.0299) for demonstration purposes.

## Future Enhancements
- Real location services integration
- Push notifications
- Offline emergency reporting
- Multi-language support
- Real-time emergency updates