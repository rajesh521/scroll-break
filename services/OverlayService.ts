import { Platform, NativeModules, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OVERLAY_PERMISSION_KEY = 'overlay_permission_granted';
const TIMER_RUNNING_KEY = 'timer_running';
const TIMER_END_TIME_KEY = 'timer_end_time';
const TIMER_DURATION_KEY = 'timer_duration';

export interface OverlayTimerSettings {
  durationMinutes: number;
  warningMinutes: number;
  breakDurationMinutes: number;
}

class OverlayServiceClass {
  private isServiceRunning: boolean = false;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private onTimerUpdate: ((remaining: number) => void) | null = null;
  private onBreakTrigger: (() => void) | null = null;

  // Check if overlay permission is granted (Android only)
  async checkOverlayPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't support this feature
    }

    try {
      // For Expo, we need to use a workaround since direct native access is limited
      // In a production app, you would use a native module
      const stored = await AsyncStorage.getItem(OVERLAY_PERMISSION_KEY);
      return stored === 'true';
    } catch (error) {
      console.error('Error checking overlay permission:', error);
      return false;
    }
  }

  // Request overlay permission
  async requestOverlayPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Not Supported',
        'System overlay is only available on Android devices. On iOS, the app will work within itself only.',
        [{ text: 'OK' }]
      );
      return true;
    }

    return new Promise((resolve) => {
      Alert.alert(
        '🔒 Special Permission Required',
        'To show creative breaks over other apps (like YouTube, Instagram), we need the "Display over other apps" permission.\n\nThis is essential for the app to work properly and protect your child from doomscrolling.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Grant Permission',
            onPress: async () => {
              try {
                // Open Android settings for overlay permission
                await Linking.openSettings();
                
                // Show follow-up alert
                Alert.alert(
                  '📱 Permission Steps',
                  '1. Find "Display over other apps" or "Draw over other apps"\n2. Enable it for Creative Break\n3. Return to the app\n\nThe app will check permission when you return.',
                  [
                    {
                      text: 'I\'ve Enabled It',
                      onPress: async () => {
                        await AsyncStorage.setItem(OVERLAY_PERMISSION_KEY, 'true');
                        resolve(true);
                      },
                    },
                  ]
                );
              } catch (error) {
                console.error('Error opening settings:', error);
                resolve(false);
              }
            },
          },
        ]
      );
    });
  }

  // Check all required permissions
  async checkAllPermissions(): Promise<{
    overlay: boolean;
    notification: boolean;
    allGranted: boolean;
  }> {
    const overlay = await this.checkOverlayPermission();
    
    return {
      overlay,
      notification: true, // Add notification permission check if needed
      allGranted: overlay,
    };
  }

  // Start the background timer service
  async startTimerService(
    settings: OverlayTimerSettings,
    onUpdate: (remaining: number) => void,
    onBreak: () => void
  ): Promise<boolean> {
    if (this.isServiceRunning) {
      console.log('Timer service already running');
      return true;
    }

    this.onTimerUpdate = onUpdate;
    this.onBreakTrigger = onBreak;

    const endTime = Date.now() + settings.durationMinutes * 60 * 1000;
    
    await AsyncStorage.setItem(TIMER_RUNNING_KEY, 'true');
    await AsyncStorage.setItem(TIMER_END_TIME_KEY, endTime.toString());
    await AsyncStorage.setItem(TIMER_DURATION_KEY, settings.durationMinutes.toString());

    this.isServiceRunning = true;

    // Start the timer
    this.timerInterval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const remainingSeconds = Math.floor(remaining / 1000);

      if (this.onTimerUpdate) {
        this.onTimerUpdate(remainingSeconds);
      }

      if (remaining <= 0) {
        this.stopTimerService();
        if (this.onBreakTrigger) {
          this.onBreakTrigger();
        }
      }
    }, 1000);

    return true;
  }

  // Stop the timer service
  async stopTimerService(): Promise<void> {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.isServiceRunning = false;
    await AsyncStorage.setItem(TIMER_RUNNING_KEY, 'false');
    await AsyncStorage.removeItem(TIMER_END_TIME_KEY);
  }

  // Check if timer is running (for app restart scenarios)
  async checkRunningTimer(): Promise<{
    isRunning: boolean;
    remainingSeconds: number;
  }> {
    const running = await AsyncStorage.getItem(TIMER_RUNNING_KEY);
    const endTimeStr = await AsyncStorage.getItem(TIMER_END_TIME_KEY);

    if (running !== 'true' || !endTimeStr) {
      return { isRunning: false, remainingSeconds: 0 };
    }

    const endTime = parseInt(endTimeStr, 10);
    const remaining = Math.max(0, endTime - Date.now());
    const remainingSeconds = Math.floor(remaining / 1000);

    return {
      isRunning: remaining > 0,
      remainingSeconds,
    };
  }

  // Get service status
  isRunning(): boolean {
    return this.isServiceRunning;
  }
}

export const OverlayService = new OverlayServiceClass();
