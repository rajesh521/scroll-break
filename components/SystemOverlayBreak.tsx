import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, StatusBar, BackHandler } from 'react-native';
import { Brush, Palette, Shapes, X, Lock } from 'lucide-react-native';
import { useAppContext } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import DrawingCanvas from './DrawingCanvas';
import ColoringPages from './ColoringPages';
import GeometricPatterns from './GeometricPatterns';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Floating emoji background component
function FloatingEmoji({ emoji, delay, startX, startY }: { emoji: string; delay: number; startX: number; startY: number }) {
  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.8, { duration: 500 }));
    scale.value = withDelay(delay, withSpring(1));
    
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startY - 30, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(startY + 30, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    
    rotate.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 1500 }),
        withTiming(15, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value }
    ],
    opacity: opacity.value,
    position: 'absolute' as const,
  }));

  return (
    <Animated.Text style={[animatedStyle, { fontSize: 40 }]}>
      {emoji}
    </Animated.Text>
  );
}

// Fun character illustration
function BreakCharacter() {
  const bounce = useSharedValue(0);
  const wave = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    wave.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 300 }),
        withTiming(20, { duration: 600 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      true
    );
  }, []);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <Animated.View style={bounceStyle}>
      <Svg width={180} height={180} viewBox="0 0 180 180">
        {/* Body */}
        <Circle cx="90" cy="120" r="55" fill="#FFD93D" />
        
        {/* Head */}
        <Circle cx="90" cy="60" r="50" fill="#FFECD2" />
        
        {/* Happy eyes - closed happy */}
        <Path d="M65 50 Q75 40 85 50" stroke="#5B4B8A" strokeWidth="5" fill="none" strokeLinecap="round" />
        <Path d="M95 50 Q105 40 115 50" stroke="#5B4B8A" strokeWidth="5" fill="none" strokeLinecap="round" />
        
        {/* Big smile */}
        <Path d="M55 70 Q90 110 125 70" stroke="#FF6B6B" strokeWidth="5" fill="none" strokeLinecap="round" />
        
        {/* Rosy cheeks */}
        <Circle cx="50" cy="65" r="12" fill="#FF8DC7" opacity="0.5" />
        <Circle cx="130" cy="65" r="12" fill="#FF8DC7" opacity="0.5" />
        
        {/* Arms */}
        <Path d="M35 120 Q20 100 30 80" stroke="#FFECD2" strokeWidth="15" fill="none" strokeLinecap="round" />
        <Path d="M145 120 Q160 100 150 80" stroke="#FFECD2" strokeWidth="15" fill="none" strokeLinecap="round" />
        
        {/* Paintbrush in hand */}
        <G transform="translate(148, 75) rotate(30)">
          <Rect x="-3" y="0" width="6" height="25" rx="2" fill="#8B4513" />
          <Circle cx="0" cy="-5" r="8" fill="#FF6B6B" />
        </G>
        
        {/* Hair/hat */}
        <Path d="M50 30 Q90 -10 130 30" stroke="#5B4B8A" strokeWidth="8" fill="none" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

interface SystemOverlayBreakProps {
  visible: boolean;
  onComplete: () => void;
  breakDuration: number; // in minutes
}

export default function SystemOverlayBreak({ visible, onComplete, breakDuration }: SystemOverlayBreakProps) {
  const [timeRemaining, setTimeRemaining] = useState(breakDuration * 60);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [canClose, setCanClose] = useState(false);
  
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const contentScale = useSharedValue(0);

  const floatingEmojis = [
    { emoji: '🎨', delay: 0, x: 30, y: 100 },
    { emoji: '✨', delay: 200, x: width - 80, y: 150 },
    { emoji: '🌈', delay: 400, x: 50, y: height - 300 },
    { emoji: '⭐', delay: 600, x: width - 100, y: height - 350 },
    { emoji: '🎭', delay: 800, x: width / 2 - 20, y: 80 },
    { emoji: '🖌️', delay: 1000, x: 80, y: height / 2 },
    { emoji: '💫', delay: 1200, x: width - 120, y: height / 2 + 50 },
    { emoji: '🌸', delay: 1400, x: 100, y: height - 400 },
  ];

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });
      contentScale.value = withDelay(200, withSpring(1, { damping: 12 }));
      
      setTimeRemaining(breakDuration * 60);
      setCanClose(false);
      
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanClose(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [visible, breakDuration]);

  // Prevent back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible && !canClose) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return true; // Prevent back
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, canClose]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
  }));

  const handleActivitySelect = (activity: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedActivity(activity);
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = 1 - (timeRemaining / (breakDuration * 60));

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
    <Modal
      visible={visible}
      transparent={false}
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        if (canClose) handleComplete();
      }}
    >
      <StatusBar backgroundColor="#5B4B8A" barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: '#5B4B8A' }}>
        {/* Floating Emojis Background */}
        {floatingEmojis.map((item, index) => (
          <FloatingEmoji 
            key={index} 
            emoji={item.emoji} 
            delay={item.delay} 
            startX={item.x}
            startY={item.y}
          />
        ))}
        
        <Animated.View 
          style={[containerStyle, { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }]}
        >
          <Animated.View
            style={[
              contentStyle,
              {
                width: '100%',
                backgroundColor: '#FFFFFF',
                borderRadius: 40,
                padding: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.3,
                shadowRadius: 40,
                elevation: 20,
                maxHeight: height - 100,
              },
            ]}
          >
            {/* Lock indicator when timer running */}
            {!canClose && (
              <View 
                className="absolute -top-4 left-1/2 -ml-6 w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: '#FF6B6B' }}
              >
                <Lock size={20} color="#FFFFFF" />
              </View>
            )}

            {/* Character */}
            <View className="items-center mb-4">
              <BreakCharacter />
            </View>

            {/* Title */}
            <Text className="text-2xl font-black text-center mb-1" style={{ color: '#5B4B8A' }}>
              {canClose ? '🎉 Great Job!' : '⏰ Creative Break Time!'}
            </Text>
            <Text className="text-base text-center mb-4" style={{ color: '#8B7BA8' }}>
              {canClose 
                ? "You're amazing! Ready to continue?" 
                : "Let's take a break and do something fun! 🎨"
              }
            </Text>

            {/* Timer */}
            <View className="items-center mb-4">
              <View 
                className="w-28 h-28 rounded-full items-center justify-center"
                style={{ 
                  backgroundColor: '#F0E6FF',
                  borderWidth: 6,
                  borderColor: canClose ? '#7FE5A8' : '#A78BFA',
                }}
              >
                <Text className="text-3xl font-black" style={{ color: '#5B4B8A' }}>
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </Text>
              </View>
              
              {/* Progress dots */}
              <View className="flex-row mt-3">
                {[...Array(5)].map((_, i) => (
                  <View 
                    key={i}
                    className="w-2.5 h-2.5 rounded-full mx-1"
                    style={{ 
                      backgroundColor: i / 5 < progress ? '#7FE5A8' : '#E8E0F0'
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Activity Cards */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-center mb-2" style={{ color: '#8B7BA8' }}>
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
            {canClose ? (
              <TouchableOpacity
                onPress={handleComplete}
                className="rounded-2xl py-4"
                style={{
                  backgroundColor: '#7FE5A8',
                  shadowColor: '#7FE5A8',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Text className="text-center text-lg font-bold text-white">
                  Continue 🚀
                </Text>
              </TouchableOpacity>
            ) : (
              <View 
                className="rounded-2xl py-4 flex-row items-center justify-center"
                style={{ backgroundColor: '#F0E6FF' }}
              >
                <Lock size={18} color="#8B7BA8" />
                <Text className="text-center font-bold ml-2" style={{ color: '#8B7BA8' }}>
                  Complete the timer to continue
                </Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>
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
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(
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
      { rotate: `${rotate.value}deg` }
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
        className="rounded-2xl p-3 items-center"
        style={{
          backgroundColor: color + '20',
          width: (width - 100) / 3,
          shadowColor: color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mb-1"
          style={{ backgroundColor: color + '30' }}
        >
          <Text className="text-2xl">{emoji}</Text>
        </View>
        <Text className="font-bold text-xs" style={{ color }}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
