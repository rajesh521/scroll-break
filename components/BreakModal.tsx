import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Brush, Palette, Shapes, Sparkles, Star } from 'lucide-react-native';
import { useAppContext } from '@/contexts/AppContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  withDelay,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import DrawingCanvas from './DrawingCanvas';
import ColoringPages from './ColoringPages';
import GeometricPatterns from './GeometricPatterns';

const { width, height } = Dimensions.get('window');

// Floating emoji component
function FloatingEmoji({ emoji, delay, x }: { emoji: string; delay: number; x: number }) {
  const translateY = useSharedValue(height);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-100, { duration: 4000, easing: Easing.linear }),
        -1,
        false
      )
    );
    rotate.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 1500 }),
        withTiming(20, { duration: 1500 })
      ),
      -1,
      true
    );
    opacity.value = withDelay(delay, withTiming(0.7, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` }
    ],
    opacity: opacity.value,
    position: 'absolute',
    left: x,
  }));

  return (
    <Animated.Text style={[animatedStyle, { fontSize: 32 }]}>
      {emoji}
    </Animated.Text>
  );
}

export default function BreakModal() {
  const { completeBreak, timerSettings } = useAppContext();
  const [timeRemaining, setTimeRemaining] = useState(timerSettings.breakDuration * 60);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const titleScale = useSharedValue(0);
  const bounceY = useSharedValue(0);

  const floatingEmojis = ['🎨', '✨', '🌈', '⭐', '🎭', '🖌️', '💫', '🌸'];

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 400 });
    titleScale.value = withDelay(200, withSpring(1, { damping: 10 }));
    
    bounceY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: titleScale.value },
      { translateY: bounceY.value }
    ],
  }));

  const handleActivitySelect = (activity: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedActivity(activity);
  };

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeBreak();
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = 1 - (timeRemaining / (timerSettings.breakDuration * 60));

  if (selectedActivity === 'drawing') {
    return <DrawingCanvas onClose={() => setSelectedActivity(null)} />;
  }

  if (selectedActivity === 'coloring') {
    return <ColoringPages onClose={() => setSelectedActivity(null)} />;
  }

  if (selectedActivity === 'patterns') {
    return <GeometricPatterns onClose={() => setSelectedActivity(null)} />;
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: '#5B4B8A' }}>
        {/* Floating Emojis Background */}
        {floatingEmojis.map((emoji, index) => (
          <FloatingEmoji 
            key={index} 
            emoji={emoji} 
            delay={index * 500} 
            x={Math.random() * (width - 50)}
          />
        ))}
        
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            style={[
              containerStyle,
              {
                width: '100%',
                backgroundColor: '#FFFFFF',
                borderRadius: 40,
                padding: 28,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.3,
                shadowRadius: 40,
                elevation: 20,
              },
            ]}
          >
            {/* Fun Header */}
            <Animated.View style={[titleStyle, { alignItems: 'center', marginBottom: 24 }]}>
              <View 
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: '#FFD93D' }}
              >
                <Text className="text-4xl">🎨</Text>
              </View>
              <Text className="text-3xl font-black text-center" style={{ color: '#5B4B8A' }}>
                Creative Break Time!
              </Text>
              <Text className="text-base mt-2 text-center" style={{ color: '#8B7BA8' }}>
                Let's do something fun together! ✨
              </Text>
            </Animated.View>

            {/* Circular Timer */}
            <View className="items-center mb-6">
              <View 
                className="w-32 h-32 rounded-full items-center justify-center"
                style={{ 
                  backgroundColor: '#F0E6FF',
                  borderWidth: 8,
                  borderColor: timeRemaining === 0 ? '#7FE5A8' : '#A78BFA',
                }}
              >
                <Text className="text-4xl font-black" style={{ color: '#5B4B8A' }}>
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </Text>
              </View>
              
              {/* Progress indicator */}
              <View className="flex-row mt-4">
                {[...Array(5)].map((_, i) => (
                  <View 
                    key={i}
                    className="w-3 h-3 rounded-full mx-1"
                    style={{ 
                      backgroundColor: i / 5 < progress ? '#7FE5A8' : '#E8E0F0'
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Activity Cards */}
            <View className="mb-6">
              <Text className="text-sm font-bold mb-3 text-center" style={{ color: '#8B7BA8' }}>
                PICK AN ACTIVITY
              </Text>
              <View className="flex-row justify-between">
                <ActivityCard
                  emoji="🖌️"
                  title="Draw"
                  color="#FF6B6B"
                  onPress={() => handleActivitySelect('drawing')}
                />
                <ActivityCard
                  emoji="🎨"
                  title="Color"
                  color="#6BCFFF"
                  onPress={() => handleActivitySelect('coloring')}
                />
                <ActivityCard
                  emoji="🔷"
                  title="Patterns"
                  color="#7FE5A8"
                  onPress={() => handleActivitySelect('patterns')}
                />
              </View>
            </View>

            {/* Continue Button */}
            {timeRemaining === 0 && (
              <Animated.View
                style={{
                  transform: [{ scale: withRepeat(withSequence(withTiming(1.05, { duration: 500 }), withTiming(1, { duration: 500 })), -1, true) }]
                }}
              >
                <TouchableOpacity
                  onPress={handleContinue}
                  className="rounded-2xl py-5"
                  style={{
                    backgroundColor: '#7FE5A8',
                    shadowColor: '#7FE5A8',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 8,
                  }}
                >
                  <Text className="text-center text-xl font-bold" style={{ color: '#FFFFFF' }}>
                    Great Job! Continue 🎉
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

interface ActivityCardProps {
  emoji: string;
  title: string;
  color: string;
  onPress: () => void;
}

function ActivityCard({ emoji, title, color, onPress }: ActivityCardProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2000 }),
        withTiming(5, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        className="rounded-3xl p-4 items-center"
        style={{
          backgroundColor: color + '20',
          width: 100,
          shadowColor: color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
          style={{ backgroundColor: color + '30' }}
        >
          <Text className="text-3xl">{emoji}</Text>
        </View>
        <Text className="font-bold" style={{ color }}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
