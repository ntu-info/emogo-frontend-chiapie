import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
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
        // Initialize database
        await initDatabase();
        console.log('Database initialized');

        // Setup notifications
        const notificationsEnabled = await setupNotifications();

        if (notificationsEnabled) {
          // Schedule daily prompts
          await scheduleDailyPrompts();
          console.log('Daily prompts scheduled');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();

    // Handle notification taps
    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;

      // Navigate to the appropriate screen
      if (data.screen === 'survey') {
        router.push('/(tabs)/survey');
      }
    });

    // Cleanup
    return () => {
      if (notificationListener.current && notificationListener.current.remove) {
        notificationListener.current.remove();
      }
      if (responseListener.current && responseListener.current.remove) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
