import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
export const configureNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

// Request notification permissions
export const setupNotifications = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Configure notification handler
    configureNotificationHandler();

    // For iOS, set notification categories if needed
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('survey_reminder', [
        {
          identifier: 'open_survey',
          buttonTitle: 'Take Survey',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);
    }

    console.log('Notifications set up successfully');
    return true;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return false;
  }
};

// Schedule 3 daily notification prompts (9 AM, 2 PM, 8 PM)
export const scheduleDailyPrompts = async (): Promise<void> => {
  try {
    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule 3 daily notifications
    const times = [
      { hour: 9, minute: 0, label: 'morning' },
      { hour: 14, minute: 0, label: 'afternoon' },
      { hour: 20, minute: 0, label: 'evening' },
    ];

    for (const time of times) {
      const content: any = {
        title: "Time to check in! 💙",
        body: "How are you feeling right now?",
        data: { screen: 'survey', time: time.label },
        sound: true,
      };

      if (Platform.OS === 'ios') {
        content.categoryIdentifier = 'survey_reminder';
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: time.hour,
          minute: time.minute,
          repeats: true,
        } as any,
      });

      console.log(`Scheduled ${time.label} notification (${time.hour}:${String(time.minute).padStart(2, '0')}) with ID:`, notificationId);
    }

    console.log('All daily prompts scheduled successfully');
  } catch (error) {
    console.error('Error scheduling daily prompts:', error);
    throw error;
  }
};

// Get all scheduled notifications
export const getScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', notifications);
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// Cancel all notifications
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
    throw error;
  }
};

// Send immediate test notification
export const sendTestNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification from EmoGo!",
        data: { screen: 'survey' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      } as any,
    });
    console.log('Test notification scheduled');
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
};

// Add notification received listener
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(callback);
};

// Add notification response listener (when user taps notification)
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};
