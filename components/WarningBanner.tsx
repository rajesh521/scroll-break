import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function WarningBanner() {
  const { scrollTime, timerSettings } = useAppContext();
  const translateY = useSharedValue(-120);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const remainingTime = Math.max(0, timerSettings.breakMinutes * 60 - scrollTime);
  const remainingMinutes = Math.floor(remainingTime / 60);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    translateY.value = withSpring(0, { damping: 12, stiffness: 100 });
    
    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    rotate.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 300 }),
        withTiming(2, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      3,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` }
    ],
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          top: 200,
          left: 20,
          right: 20,
          zIndex: 50,
          borderRadius: 24,
          overflow: 'hidden',
          shadowColor: '#FFA94D',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 10,
        },
      ]}
    >
      {/* Gradient-like background with layers */}
      <View style={{ backgroundColor: '#FFE4B8' }}>
        <View 
          className="absolute top-0 right-0 w-32 h-32 rounded-full"
          style={{ backgroundColor: '#FFD93D40', transform: [{ translateX: 20 }, { translateY: -20 }] }}
        />
        <View 
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full"
          style={{ backgroundColor: '#FFA94D30', transform: [{ translateX: -10 }, { translateY: 10 }] }}
        />
        
        <View className="p-5 flex-row items-center">
          <View 
            className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
            style={{ backgroundColor: '#FFD93D' }}
          >
            <Text className="text-2xl">⏰</Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-lg font-black" style={{ color: '#5B4B8A' }}>
              Break coming soon! 🎨
            </Text>
            <Text className="text-sm mt-0.5" style={{ color: '#8B7BA8' }}>
              {remainingMinutes > 0 
                ? `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} until creative time!`
                : 'Get ready for some fun!'}
            </Text>
          </View>
          
          <View 
            className="px-3 py-2 rounded-xl"
            style={{ backgroundColor: '#FFA94D' }}
          >
            <Text className="font-bold text-white text-sm">{remainingMinutes}m</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
