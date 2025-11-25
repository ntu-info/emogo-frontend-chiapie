# EmoGo - Experience-Sampling Mobile App

## App URI
https://expo.dev/accounts/janet_c/projects/emogo-app/builds/c94a6ccc-1aa8-4fd2-83fe-6a3a80efcc18

## Overview
EmoGo is a mobile application designed to collect experience-sampling data through sentiment surveys, 1-second video vlogs, and GPS coordinates. The app sends 3 daily reminders to help users track their emotional well-being throughout the day.

## Features
- **Sentiment Survey**: 5-point scale (😢 to 😄) to track your mood
- **1-Second Video Vlogs**: Quick video recordings to capture moments
- **GPS Tracking**: Automatic location recording with each entry
- **Daily Reminders**: 3 scheduled notifications (9 AM, 2 PM, 8 PM)
- **Local Storage**: All data stored locally using SQLite
- **Data Export**: Export your data as JSON with video files

## Tech Stack
- **Framework**: React Native with Expo (SDK 54)
- **Routing**: expo-router (file-based routing)
- **Language**: TypeScript
- **Database**: expo-sqlite (local SQLite database)
- **Key Packages**:
  - expo-notifications (scheduled reminders)
  - expo-camera (video recording)
  - expo-location (GPS tracking)
  - expo-file-system (file management)
  - expo-sharing (data export)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Expo Go app on your iOS device (for testing)

### Setup
```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on iOS Device
1. Install Expo Go from the App Store on your iPhone
2. Run `npx expo start` in your terminal
3. Scan the QR code with your iPhone camera
4. The app will open in Expo Go

## Project Structure
```
emogo-app/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with notification handlers
│   └── (tabs)/             # Tab navigation
│       ├── _layout.tsx     # Tab bar configuration
│       ├── index.tsx       # Home/Dashboard screen
│       ├── survey.tsx      # Sentiment survey screen
│       ├── vlog.tsx        # Video recording screen
│       └── export.tsx      # Data export screen
├── utils/                  # Utility functions
│   ├── database.ts         # SQLite database operations
│   ├── location.ts         # GPS location services
│   └── notifications.ts    # Notification management
├── data/                   # Exported data storage
├── app.json                # Expo configuration
├── eas.json                # EAS Build configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript configuration
```

## Database Schema

### Surveys Table
```sql
CREATE TABLE surveys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  sentiment_score INTEGER NOT NULL,
  latitude REAL,
  longitude REAL
);
```

### Vlogs Table
```sql
CREATE TABLE vlogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  video_uri TEXT NOT NULL,
  latitude REAL,
  longitude REAL
);
```

## Data Collection

### Survey Responses
- User selects a sentiment rating (1-5)
- Timestamp is automatically recorded
- GPS coordinates are captured if permission is granted
- Data is stored in SQLite database

### Video Vlogs
- User records a 1-second video
- Video is saved to device storage
- Metadata (timestamp, location, file path) stored in database
- Videos are included in exports

## Notifications
The app schedules 3 daily reminders:
- **9:00 AM** - Morning check-in
- **2:00 PM** - Afternoon check-in
- **8:00 PM** - Evening check-in

Notifications will navigate to the survey screen when tapped.

## Data Export

### JSON Export
Exports survey and vlog metadata:
```json
{
  "export_date": "2025-11-26T12:00:00.000Z",
  "total_surveys": 10,
  "total_vlogs": 8,
  "surveys": [...],
  "vlogs": [...]
}
```

### Full Export
Includes JSON data plus all video files for complete backup.

## Permissions Required

### iOS
- Camera (for video recording)
- Microphone (for video audio)
- Location When In Use (for GPS tracking)
- Notifications (for daily reminders)

All permissions are requested when first needed and can be managed in iOS Settings.

## Building for Production

### iOS Build (Preview)
```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login to Expo account
eas login

# Build iOS preview
eas build --platform ios --profile preview
```

The build will be available in your Expo account dashboard. You can install it on your iPhone via TestFlight or direct download.

## Development

### Running Locally
```bash
# Start development server
npx expo start

# Start with tunnel (for remote testing)
npx expo start --tunnel

# Clear cache if needed
npx expo start --clear
```

### Testing Features
1. **Survey**: Navigate to Survey tab and submit responses
2. **Vlog**: Navigate to Vlog tab, grant camera permissions, record 1-second videos
3. **Export**: Navigate to Export tab to download your data
4. **Notifications**: Scheduled automatically on app start (test with immediate notification in code)

## Troubleshooting

### Notifications Not Working
- Check notification permissions in iOS Settings
- Verify notifications are scheduled: Check console logs
- Test with immediate notification first

### Camera Not Working
- Ensure camera permissions are granted
- Camera only works on physical devices (not simulator)
- Check that video recording is supported

### Location Not Available
- Enable Location Services in iOS Settings
- Grant location permission when prompted
- Location is optional and won't block functionality

### Database Issues
- Database is initialized on first app launch
- Check console logs for errors
- Data persists between app restarts

## Contributing
This is an educational project for experience-sampling data collection.

## License
MIT License

## Support
For issues or questions, please check the troubleshooting section or review the code documentation.

---

Built with React Native and Expo
