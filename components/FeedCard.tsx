import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface FeedCardProps {
  title: string;
  content: string;
  color: string;
  emoji?: string;
  index?: number;
}

export default function FeedCard({ title, content, color, emoji, index = 0 }: FeedCardProps) {
  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      index * 100,
      withSpring(0, { damping: 15, stiffness: 100 })
    );
    opacity.value = withDelay(
      index * 100,
      withTiming(1, { duration: 400 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="mb-4 rounded-3xl p-5"
        style={{
          backgroundColor: '#FFFFFF',
          shadowColor: color,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 6,
          borderWidth: 2,
          borderColor: color + '20',
        }}
      >
        <View className="flex-row items-start">
          {/* Emoji Container */}
          {emoji && (
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
              style={{ backgroundColor: color + '20' }}
            >
              <Text className="text-2xl">{emoji}</Text>
            </View>
          )}
          
          <View className="flex-1">
            {/* Title Badge */}
            <View
              className="rounded-xl px-3 py-1.5 mb-2 self-start"
              style={{ backgroundColor: color + '25' }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: color }}
              >
                {title}
              </Text>
            </View>
            
            {/* Content */}
            <Text
              className="text-base leading-6"
              style={{ color: '#3A3A3A' }}
            >
              {content}
            </Text>
          </View>
        </View>
        
        {/* Decorative Corner */}
        <View 
          className="absolute -bottom-1 -right-1 w-16 h-16 rounded-tl-3xl"
          style={{ 
            backgroundColor: color + '08',
            borderTopLeftRadius: 40,
          }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}
