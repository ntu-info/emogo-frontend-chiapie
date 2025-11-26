# EmoGo: Experience-Sampling App

## App URI
🔗: https://expo.dev/accounts/janet_c/projects/emogo-app/builds/bae8ddad-8a7c-4be6-8bf8-b5cf6672152d

---

## Overview
Mobile experience-sampling app that collects mood data and 1-second video vlogs 3x daily with GPS coordinates.

## Features
- ✅ **Survey Screen**: 5-point sentiment scale (😢 😟 😐 🙂 😄)
- ✅ **Vlog Screen**: 1-second video recording with camera toggle
- ✅ **Export Screen**: Export data to JSON with video files
- ✅ **SQLite Database**: Local storage for surveys and vlogs
- ✅ **GPS Tracking**: Location capture for each entry
- ✅ **Notifications**: 3x daily reminders (9 AM, 2 PM, 8 PM)

## Tech Stack
- React Native with Expo SDK 54
- expo-router for navigation
- TypeScript
- expo-sqlite, expo-camera, expo-location, expo-notifications

## Installation
Visit the build URL above and click "Install" to download the app.

## Database Schema

**surveys table**: id, timestamp, sentiment_score (1-5), latitude, longitude

**vlogs table**: id, timestamp, video_uri, latitude, longitude

## Development

```bash
# Install dependencies
npm install

# Start development server
npx expo start --tunnel
```

## Publishing Updates

```bash
# iOS
CI=1 npx eas update --branch production --message "Update" --platform ios

# Android
CI=1 npx eas update --branch production --message "Update" --platform android
```

---

**Version**: 1.0.0
**Last Updated**: November 27, 2025
