import { Redirect } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '@/components/OnboardingScreen';
import PermissionsScreen from '@/components/PermissionsScreen';

type AppScreen = 'loading' | 'onboarding' | 'permissions' | 'main';

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('loading');

  useEffect(() => {
    checkInitialScreen();
  }, []);

  const checkInitialScreen = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
      const permissionsComplete = await AsyncStorage.getItem('permissions_complete');
      
      if (onboardingComplete !== 'true') {
        setCurrentScreen('onboarding');
      } else if (permissionsComplete !== 'true' && Platform.OS === 'android') {
        setCurrentScreen('permissions');
      } else {
        setCurrentScreen('main');
      }
    } catch (error) {
      setCurrentScreen('onboarding');
    }
  };

  if (currentScreen === 'loading') {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#FFF8F0' }}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  if (currentScreen === 'onboarding') {
    return (
      <OnboardingScreen 
        onComplete={() => {
          if (Platform.OS === 'android') {
            setCurrentScreen('permissions');
          } else {
            setCurrentScreen('main');
          }
        }} 
      />
    );
  }

  if (currentScreen === 'permissions') {
    return (
      <PermissionsScreen 
        onComplete={() => setCurrentScreen('main')} 
      />
    );
  }

  return <Redirect href="/(tabs)" />;
}
