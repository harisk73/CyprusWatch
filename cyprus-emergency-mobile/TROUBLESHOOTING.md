# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to resolve plugin for module expo-location" Error

**Solution:** This error occurs when expo-location is referenced but not installed.

- ✅ **Already Fixed**: All plugin references have been removed from `app.config.js`
- The app now uses mock location data instead

### 2. "react-native-web is not installed" Error

**Problem:** The dependency is listed in package.json but not actually installed.

**Solutions:**

**Option A - Reinstall Dependencies (Recommended):**
```bash
cd cyprus-emergency-mobile
rm -rf node_modules package-lock.json
npm install
npm install react-native-web @expo/metro-runtime
```

**Option B - Use HTML Demo:**
Open `demo.html` in your browser - it's a fully functional mobile app preview.

**Option C - Remove Web Dependencies:**
If you only need native mobile (iOS/Android), remove web-related dependencies from package.json.

### 3. TypeScript Errors

**Problem:** Cannot find module 'react-native'

**Solution:**
```bash
npm install @types/react-native
```

### 4. Metro Bundler Issues

**Problem:** Metro bundler fails to start

**Solution:**
```bash
npx expo start --clear
```

## Alternative Testing Options

### 1. HTML Demo (No Setup Required)
- Open `demo.html` in any web browser
- Fully interactive mobile app preview
- All screens and functionality working
- No dependencies or installation needed

### 2. Expo Web
- Run `npx expo start --web` after installing react-native-web
- Browser-based testing with React Native components

### 3. Mobile Device Testing
- Use Expo Go app on your phone
- Scan QR code from `npx expo start`
- Test on actual mobile device

## Current Working Features

✅ **HTML Demo**
- Complete mobile app preview
- All screens functional
- Emergency reporting workflow
- User authentication flow
- Profile management

✅ **Native App Structure**
- All TypeScript components created
- Custom navigation system
- Mock location services
- Clean architecture

## Need Help?

1. **For quick testing**: Use `demo.html`
2. **For development**: Follow dependency installation steps
3. **For deployment**: Use Expo build service

The HTML demo provides the fastest way to see the mobile app working without any setup issues.