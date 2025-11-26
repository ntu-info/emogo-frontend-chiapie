# EmoGo: Experience-Sampling App 📱

## App URI (Android APK)
🔗: https://expo.dev/accounts/janet_c/projects/emogo-app/builds/bae8ddad-8a7c-4be6-8bf8-b5cf6672152d

**Installation:** Click the link above → Click [Install] button → Download and install APK on Android device

---

## Overview
EmoGo is a mobile experience-sampling application that combines video recording with mood tracking. Users capture their emotional state through 1-second video vlogs paired with 5-point Likert scale mood ratings. The app automatically records GPS coordinates and timestamps for each entry, enabling comprehensive emotional well-being analysis over time.

## Key Features

### 🎥 Combined Video + Mood Interface
- **Unified recording screen** with camera view and mood selector
- Record 1-second video vlogs with simultaneous mood rating
- Must select mood before recording (validation included)
- Camera positioned center-screen with mood scale directly below

### 😊 5-Point Likert Mood Scale
- Visual emoji-based rating: 😢 😕 😐 🙂 😄
- Labels: Very Sad → Sad → Neutral → Happy → Very Happy
- Mapped to numeric scores (1-5) for data analysis

### 📍 Automatic GPS Tracking
- Location captured with every video and mood entry
- Same timestamp and GPS coordinates link video to mood data
- Optional: app functions without location permission

### 🔔 Smart Notifications
- 3 daily reminders: 9 AM, 2 PM, 8 PM
- Automatically scheduled on app launch
- Tapping notification navigates to survey screen

### 💾 Local SQLite Storage
- All data stored locally on device
- Two database tables: surveys (mood) and vlogs (videos)
- Persistent storage between app sessions

### 📊 Multiple Export Formats

#### CSV Export (Recommended for Analysis)
```csv
Type,Timestamp,Date,Time,Sentiment_Score,Sentiment_Label,Video_URI,Latitude,Longitude,Has_Location
Survey,2025-11-26T14:30:00.000Z,2025-11-26,14:30:00,5,Very Happy,,37.7749,-122.4194,Yes
Vlog,2025-11-26T14:30:00.000Z,2025-11-26,14:30:00,,,vlog_1732604400000.mp4,37.7749,-122.4194,Yes
```

#### JSON Export
Complete metadata export with all survey and vlog entries

#### Full Export (JSON + Videos)
Includes all video files plus metadata for complete backup

---

## Tech Stack
- **Framework**: React Native with Expo (SDK 54)
- **Routing**: expo-router (file-based routing)
- **Language**: TypeScript
- **Database**: expo-sqlite (local SQLite database)
- **Key Packages**:
  - `expo-notifications` - Scheduled reminders
  - `expo-camera` - Video recording
  - `expo-location` - GPS tracking
  - `expo-file-system` - File management
  - `expo-sharing` - Data export

---

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Expo Go app (for iOS testing) OR EAS Build (for production)

### Quick Start
```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Start with tunnel (for remote testing)
npx expo start --tunnel

# Clear cache if needed
npx expo start --clear
```

### Running on Device

#### Option 1: Expo Go (Development)
1. Install Expo Go from App Store (iOS) or Google Play (Android)
2. Run `npx expo start --tunnel`
3. Scan QR code with your device
4. App opens in Expo Go

**Note:** Some native features have limitations in Expo Go. For full functionality, use a development build.

#### Option 2: Development Build (Recommended)
```bash
# iOS
eas build --platform ios --profile preview

# Android
eas build --platform android --profile preview
```

---

## Project Structure
```
emogo-app/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with notification setup
│   └── (tabs)/             # Tab navigation
│       ├── _layout.tsx     # Tab bar configuration
│       ├── index.tsx       # Home/Dashboard
│       ├── vlog.tsx        # Combined video + mood interface ⭐
│       ├── survey.tsx      # Mood-only (no video)
│       └── export.tsx      # Data export (CSV, JSON, Videos)
├── utils/                  # Utility functions
│   ├── database.ts         # SQLite operations & schema
│   ├── location.ts         # GPS location services
│   └── notifications.ts    # Notification scheduling
├── data/                   # Exported data storage
├── app.json                # Expo configuration
├── eas.json                # EAS Build configuration
└── package.json            # Dependencies
```

---

## Database Schema

### Surveys Table
```sql
CREATE TABLE surveys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  sentiment_score INTEGER NOT NULL,  -- 1-5 scale
  latitude REAL,
  longitude REAL
);
```

### Vlogs Table
```sql
CREATE TABLE vlogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  video_uri TEXT NOT NULL,           -- Local file path
  latitude REAL,
  longitude REAL
);
```

**Data Linking:** Entries with identical timestamps represent a combined video+mood recording from the main interface.

---

## App Navigation

### 🏠 Home Tab
- Today's progress (surveys and vlogs count)
- All-time statistics
- Quick action buttons

### 🎬 Record Tab (Main Feature)
- Camera view (3:4 aspect ratio, centered)
- 5-point mood scale below camera
- "Flip" button to switch camera
- Record button captures 1-second video
- Saves video + mood + GPS + timestamp

### ❤️ Mood Only Tab
- Alternative quick mood check-in
- No video recording
- Useful for rapid data collection

### 📤 Export Tab
- Summary statistics
- CSV export (recommended)
- JSON export
- Full export (JSON + all video files)

---

## Data Collection Workflow

### Combined Video + Mood Entry
1. User opens "Record" tab
2. Selects mood from 5 emoji options
3. Taps record button
4. Camera records exactly 1 second
5. App saves:
   - Video file to local storage
   - Video metadata to `vlogs` table
   - Mood data to `surveys` table
   - GPS coordinates (if permitted)
   - ISO timestamp (identical for linked entries)

### Mood-Only Entry
1. User opens "Mood Only" tab
2. Selects mood
3. Taps submit
4. App saves to `surveys` table only

---

## Permissions

### iOS
- **Camera**: Record video vlogs
- **Microphone**: Capture audio with video
- **Location When In Use**: Track entry locations
- **Notifications**: Daily reminders

### Android
- Same as iOS, plus:
- **Storage**: Save videos and export data

All permissions requested on first use. App functions with reduced features if permissions denied (except camera, which is required for video recording).

---

## Building for Production

### Android APK (Preview Build)
```bash
# Build APK
eas build --platform android --profile preview

# Build process takes ~15 minutes
# Check build status: https://expo.dev/accounts/[username]/projects/emogo-app
```

### iOS (Requires Apple Developer Account)
```bash
# Build for device
eas build --platform ios --profile preview

# Requires interactive Apple account login
# Follow prompts for code signing
```

---

## Data Export Guide

### CSV Export
**Best for:** Data analysis in Excel, Python, R, or statistical software

**Includes:**
- Entry type (Survey or Vlog)
- Full ISO timestamp
- Separated date and time
- Sentiment score (1-5) and label
- Video filename (for vlogs)
- GPS coordinates
- Location availability flag

### JSON Export
**Best for:** Programmatic data processing

**Includes:**
- Export metadata (date, counts)
- Complete survey array
- Complete vlog array with file paths

### Full Export
**Best for:** Complete backup

**Includes:**
- JSON metadata file
- All video files (.mp4)
- Packaged in exportable directory

---

## Troubleshooting

### "Type Error: expected boolean, but had type string"
**Solution:**
- Force close Expo Go completely
- Clear app cache: Swipe left on project → Delete
- Re-scan QR code fresh

### Notifications Not Working
- Check notification permissions in device settings
- Verify notifications scheduled: Check console logs
- iOS requires physical device (not simulator)

### Camera Not Working
- Camera permissions must be granted
- Only works on physical devices
- Expo Go has camera limitations (use dev build)

### Location Not Available
- Enable Location Services in device settings
- Grant "While Using App" permission
- App functions without location (coordinates saved as null)

### Database Issues
- Database auto-initializes on first launch
- Check console for error logs
- Data persists between app restarts
- To reset: Clear app data or reinstall

### Metro Bundler Issues
```bash
# Clear all caches
watchman watch-del-all
rm -rf .expo node_modules/.cache
npx expo start --clear
```

---

## Development Notes

### Testing Workflow
1. Make code changes
2. Save files (Metro auto-reloads)
3. Or reload manually: Shake device → Reload

### Recommended Testing
- Test on physical device (camera, GPS, notifications)
- Test with/without permissions granted
- Test data persistence across app restarts
- Test export with actual data (3+ entries)
- Verify CSV opens correctly in Excel/Google Sheets

### Common Development Commands
```bash
# Start with clean cache
npx expo start --clear

# View logs
npx expo start (logs appear in terminal)

# Build development version
eas build --platform [ios|android] --profile development

# Build production version
eas build --platform [ios|android] --profile production
```

---

## Known Limitations

### Expo Go Limitations
- Notifications: Limited functionality in Expo Go (SDK 53+)
- Custom native code: Requires development build
- Background location: Not fully supported

**Solution:** Use `eas build --profile preview` for full functionality

### Video Recording
- Fixed 1-second duration (by design)
- Requires camera permission (mandatory)
- Files saved to app's document directory

### GPS Tracking
- Requires location permission (optional)
- "While Using App" permission sufficient
- Background tracking not implemented

---

## Future Enhancements (Not Implemented)

- Cloud sync/backup
- Data visualization dashboard
- Customizable notification times
- Video playback within app
- Multi-user support
- Export to cloud storage (Google Drive, Dropbox)

---

## Credits

Built with:
- React Native
- Expo SDK 54
- TypeScript
- SQLite

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review Expo documentation: https://docs.expo.dev
- File issue on GitHub repository

---

**Last Updated:** November 26, 2025
**Version:** 1.0.0
**Expo SDK:** 54
