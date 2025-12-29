import React from 'react';
import { View, Text } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withRepeat,
  withSequence 
} from 'react-native-reanimated';

export default function ScrollTimeIndicator() {
  const { scrollTime } = useAppContext();
  
  const minutes = Math.floor(scrollTime / 60);
  const seconds = scrollTime % 60;
  
  const progress = (scrollTime / (15 * 60)) * 100;
  
  return (
    <View
      className="absolute top-0 left-0 right-0 z-10 bg-offWhite px-6 py-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="text-2xl font-bold text-deepPurple"
          style={{ fontFamily: 'System' }}
        >
          Creative Break 🎨
        </Text>
        
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-lavender items-center justify-center mr-3">
            <View
              className="w-10 h-10 rounded-full bg-offWhite items-center justify-center"
              style={{
                borderWidth: 3,
                borderColor: progress > 80 ? '#FF6B6B' : progress > 60 ? '#FFD93D' : '#7FE5A8',
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{
                  fontFamily: 'SpaceMono',
                  color: progress > 80 ? '#FF6B6B' : progress > 60 ? '#FFD93D' : '#7FE5A8',
                }}
              >
                {minutes}:{seconds.toString().padStart(2, '0')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
