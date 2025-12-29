import { Redirect } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '@/components/OnboardingScreen';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
      setShowOnboarding(onboardingComplete !== 'true');
    } catch (error) {
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#FFF8F0' }}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen 
        onComplete={() => setShowOnboarding(false)} 
      />
    );
  }

  return <Redirect href="/(tabs)" />;
}
