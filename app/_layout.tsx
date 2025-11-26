import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  setupNotifications,
  scheduleDailyPrompts,
  addNotificationResponseListener,
} from '../utils/notifications';
import { initDatabase } from '../utils/database';

export default function RootLayout() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Initialize database (skip on web - SQLite doesn't work on web)
        if (Platform.OS !== 'web') {
          try {
            await initDatabase();
            console.log('Database initialized');
          } catch (dbError) {
            console.log('Database initialization failed:', dbError);
          }
        } else {
          console.log('Database skipped on web platform');
        }

        // Setup notifications (skip in Expo Go for SDK 53+ and on web)
        if (Platform.OS !== 'web') {
          try {
            const notificationsEnabled = await setupNotifications();

            if (notificationsEnabled) {
              // Schedule daily prompts
              await scheduleDailyPrompts();
              console.log('Daily prompts scheduled');
            }
          } catch (notifError) {
            console.log('Notifications not available (normal in Expo Go)');
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();

    // Handle notification taps (skip in Expo Go)
    try {
      responseListener.current = addNotificationResponseListener((response) => {
        const data = response.notification.request.content.data;

        // Navigate to the appropriate screen
        if (data.screen === 'survey') {
          router.push('/(tabs)/survey');
        }
      });
    } catch (error) {
      console.log('Notification listeners not available (normal in Expo Go)');
    }

    // Cleanup
    return () => {
      try {
        if (notificationListener.current && notificationListener.current.remove) {
          notificationListener.current.remove();
        }
        if (responseListener.current && responseListener.current.remove) {
          responseListener.current.remove();
        }
      } catch (error) {
        // Ignore cleanup errors in Expo Go
      }
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
