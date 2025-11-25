# Experience-Sampling App Sprint Plan

## Project Overview
Build a mobile app that collects experience-sampling data 3x daily, including:
- Sentiment questionnaire (structured data)
- 1-second video vlogs (unstructured data)  
- GPS coordinates (passive background data)
- Local storage with export functionality

## Technical Stack
- **Framework**: React Native with Expo
- **Routing**: expo-router (file-based routing)
- **Language**: TypeScript (.tsx files)
- **Key Packages**:
  - expo-notifications (scheduled prompts)
  - expo-sqlite (structured data storage)
  - expo-camera (video recording)
  - expo-file-system (file management)
  - expo-sharing (data export)
  - expo-location (GPS tracking)

---

## Sprint Tasks Breakdown

### Phase 1: Project Setup & Configuration
**Time Estimate: 2-3 hours**

#### Task 1.1: Initialize Expo Project
```bash
npx create-expo-app@latest emogo-app --template tabs
cd emogo-app
```

#### Task 1.2: Install Dependencies
```bash
npx expo install expo-router expo-notifications expo-sqlite expo-camera expo-file-system expo-sharing expo-location
```

#### Task 1.3: Configure EAS Build
```bash
eas build:configure
```
- Set up eas.json for preview builds
- Configure app permissions in app.json:
  ```json
  {
    "expo": {
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "NOTIFICATIONS"
      ]
    }
  }
  ```

#### Task 1.4: Set Up File Structure
```
app/
  ├── _layout.tsx          # Root stack layout
  ├── (tabs)/
  │   ├── _layout.tsx      # Tab navigation
  │   ├── index.tsx        # Home/Dashboard
  │   ├── survey.tsx       # Sentiment survey screen
  │   ├── vlog.tsx         # Video recording screen
  │   └── export.tsx       # Data export screen
  └── details.tsx          # Optional detail view
```

---

### Phase 2: Database Setup
**Time Estimate: 2 hours**

#### Task 2.1: Create Database Schema
Create `utils/database.ts`:
```typescript
import * as SQLite from 'expo-sqlite';

export interface SurveyResponse {
  id: number;
  timestamp: string;
  sentiment_score: number;
  latitude: number;
  longitude: number;
}

export interface VlogEntry {
  id: number;
  timestamp: string;
  video_uri: string;
  latitude: number;
  longitude: number;
}

// Database initialization
export const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('emogo.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      sentiment_score INTEGER NOT NULL,
      latitude REAL,
      longitude REAL
    );
    
    CREATE TABLE IF NOT EXISTS vlogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      video_uri TEXT NOT NULL,
      latitude REAL,
      longitude REAL
    );
  `);
  
  return db;
};
```

#### Task 2.2: Create CRUD Operations
Add functions for:
- `insertSurveyResponse()`
- `insertVlogEntry()`
- `getAllSurveys()`
- `getAllVlogs()`
- `exportAllData()` (returns JSON)

---

### Phase 3: Notification System
**Time Estimate: 3 hours**

#### Task 3.1: Request Permissions
Create `utils/notifications.ts`:
```typescript
import * as Notifications from 'expo-notifications';

export const setupNotifications = async () => {
  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status !== 'granted') {
    alert('Notification permissions required!');
    return false;
  }
  
  // Configure notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  
  return true;
};
```

#### Task 3.2: Schedule Daily Notifications
```typescript
export const scheduleDailyPrompts = async () => {
  // Cancel existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  // Schedule 3 daily notifications (9 AM, 2 PM, 8 PM)
  const times = [
    { hour: 9, minute: 0 },
    { hour: 14, minute: 0 },
    { hour: 20, minute: 0 }
  ];
  
  for (const time of times) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to check in!",
        body: "How are you feeling right now?",
      },
      trigger: {
        hour: time.hour,
        minute: time.minute,
        repeats: true,
      },
    });
  }
};
```

#### Task 3.3: Handle Notification Taps
Add listener to navigate to survey screen when notification is tapped.

---

### Phase 4: Sentiment Survey Screen
**Time Estimate: 3 hours**

#### Task 4.1: Design Survey UI
Create `app/(tabs)/survey.tsx`:
- Display sentiment scale (1-5 with emoji faces)
- Show current timestamp
- Display current location (if available)

#### Task 4.2: Implement Survey Logic
```typescript
const handleSubmitSurvey = async (sentimentScore: number) => {
  // Get current location
  const location = await getCurrentLocation();
  
  // Get current timestamp
  const timestamp = new Date().toISOString();
  
  // Save to database
  await insertSurveyResponse({
    timestamp,
    sentiment_score: sentimentScore,
    latitude: location?.coords.latitude,
    longitude: location?.coords.longitude,
  });
  
  // Show success message
  Alert.alert('Success', 'Response saved!');
};
```

#### Task 4.3: Add Visual Feedback
- Highlight selected sentiment
- Show loading state while saving
- Navigate back after submission

---

### Phase 5: Video Vlog Recorder
**Time Estimate: 4 hours**

#### Task 5.1: Set Up Camera View
Create `app/(tabs)/vlog.tsx`:
```typescript
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function VlogScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  
  // Camera setup and recording logic
}
```

#### Task 5.2: Implement 1-Second Recording
```typescript
const recordVlog = async () => {
  if (!cameraRef.current) return;
  
  setIsRecording(true);
  
  const video = await cameraRef.current.recordAsync({
    maxDuration: 1, // 1 second
  });
  
  setIsRecording(false);
  
  // Save video
  await saveVlog(video.uri);
};
```

#### Task 5.3: Save Video with Metadata
```typescript
const saveVlog = async (videoUri: string) => {
  // Get location
  const location = await getCurrentLocation();
  
  // Copy video to app directory
  const filename = `vlog_${Date.now()}.mp4`;
  const destUri = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.copyAsync({
    from: videoUri,
    to: destUri,
  });
  
  // Save metadata to database
  await insertVlogEntry({
    timestamp: new Date().toISOString(),
    video_uri: destUri,
    latitude: location?.coords.latitude,
    longitude: location?.coords.longitude,
  });
};
```

#### Task 5.4: Add Camera Controls
- Flip camera (front/back)
- Recording indicator
- Countdown timer
- Preview last recorded vlog

---

### Phase 6: Location Services
**Time Estimate: 2 hours**

#### Task 6.1: Set Up Location Utils
Create `utils/location.ts`:
```typescript
import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

export const getCurrentLocation = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;
    
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch (error) {
    console.error('Location error:', error);
    return null;
  }
};
```

#### Task 6.2: Integrate Location into Data Collection
- Call `getCurrentLocation()` before each survey submission
- Call `getCurrentLocation()` before each vlog recording
- Handle permission denials gracefully

---

### Phase 7: Data Export Functionality
**Time Estimate: 3 hours**

#### Task 7.1: Create Export Screen
Create `app/(tabs)/export.tsx`:
- Display summary statistics (total surveys, total vlogs)
- Show date range of collected data
- Export button

#### Task 7.2: Implement Export Logic
```typescript
const exportData = async () => {
  const db = await initDatabase();
  
  // Get all survey responses
  const surveys = await db.getAllAsync('SELECT * FROM surveys');
  
  // Get all vlog entries
  const vlogs = await db.getAllAsync('SELECT * FROM vlogs');
  
  // Create JSON file
  const exportData = {
    export_date: new Date().toISOString(),
    surveys,
    vlogs,
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const fileUri = `${FileSystem.documentDirectory}emogo_export.json`;
  
  await FileSystem.writeAsStringAsync(fileUri, jsonString);
  
  // Share file
  await Sharing.shareAsync(fileUri);
};
```

#### Task 7.3: Export Video Files
```typescript
const exportAllFiles = async () => {
  // Create a temporary directory
  const exportDir = `${FileSystem.cacheDirectory}emogo_export/`;
  await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });
  
  // Copy JSON file
  await FileSystem.copyAsync({
    from: `${FileSystem.documentDirectory}emogo_export.json`,
    to: `${exportDir}data.json`,
  });
  
  // Copy all video files
  const vlogs = await getAllVlogs();
  for (const vlog of vlogs) {
    const filename = vlog.video_uri.split('/').pop();
    await FileSystem.copyAsync({
      from: vlog.video_uri,
      to: `${exportDir}${filename}`,
    });
  }
  
  // Share directory (on Android, may need to zip first)
  await Sharing.shareAsync(exportDir);
};
```

---

### Phase 8: Testing & Data Collection
**Time Estimate: 2-3 hours**

#### Task 8.1: Test on Device
```bash
npx expo start --tunnel
```
- Test notification system
- Test survey submission
- Test video recording
- Test location tracking
- Test data export

#### Task 8.2: Collect Real Data
- Use app for 12+ hours
- Collect 3+ survey responses
- Record 3+ vlogs
- Ensure GPS coordinates are captured
- Verify timestamps span >12 hours

#### Task 8.3: Verify Export
- Export data
- Check JSON format
- Verify all video files are included
- Confirm GPS coordinates are present

---

### Phase 9: Build & Deployment
**Time Estimate: 1-2 hours**

#### Task 9.1: Build Preview APK
```bash
eas build --platform android --profile preview
```

#### Task 9.2: Test Installation
- Download APK from Expo website
- Install on Android device
- Test all features on installed build

#### Task 9.3: Create Data Folder
```bash
mkdir data
```
- Export data from app
- Save exported JSON to `data/` folder
- Save video files to `data/` folder
- Verify 3+ records for each type
- Verify time span >12 hours

---

### Phase 10: Documentation & Submission
**Time Estimate: 1 hour**

#### Task 10.1: Update README.md
```markdown
# EmoGo Experience-Sampling App

## App URI
https://expo.dev/accounts/[your-account]/projects/emogo-app/builds/[build-id]

## Features
- Scheduled notifications (3x daily)
- Sentiment survey with 5-point scale
- 1-second video vlog recording
- GPS coordinate tracking
- Local SQLite storage
- Data export functionality

## Installation
1. Download APK from the link above
2. Install on Android device
3. Grant camera, location, and notification permissions

## Data Collection
This app collects:
- Survey responses (sentiment score, timestamp, GPS)
- Video vlogs (1-second recordings with metadata)
- Background location data

## Export Format
Data is exported as JSON with accompanying video files.
```

#### Task 10.2: Create H-AI Interaction History
- Document in `AI_INTERACTIONS.md`
- Include all significant prompts used with Claude/ChatGPT
- Include key code snippets generated by AI
- Note any debugging help received

#### Task 10.3: Organize GitHub Repo
```
emogo-app/
├── README.md
├── AI_INTERACTIONS.md
├── app/
├── utils/
├── data/
│   ├── emogo_export.json
│   ├── vlog_1.mp4
│   ├── vlog_2.mp4
│   └── vlog_3.mp4
├── package.json
└── eas.json
```

#### Task 10.4: Final Checklist
- [ ] App URI in README.md
- [ ] Source code pushed to GitHub
- [ ] AI interaction history documented
- [ ] Data folder with 3+ entries per type
- [ ] Time span >12 hours verified
- [ ] Preview APK successfully built
- [ ] All features tested on device

---

## Troubleshooting Tips

### Notifications Not Working
- Check permissions in device settings
- Verify notification handler is set before scheduling
- Test with immediate trigger first

### Camera Issues
- Request permissions before using camera
- Handle permission denials gracefully
- Test on physical device (not simulator)

### Location Not Updating
- Enable location services in device settings
- Use `Accuracy.Balanced` for better battery life
- Handle null location gracefully

### Database Errors
- Initialize database before first use
- Use `await` for all database operations
- Check table schemas match data types

### Export Failures
- Check file system permissions
- Verify files exist before copying
- Test sharing on physical device

---