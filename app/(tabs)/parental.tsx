import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions, Platform } from 'react-native';
import { Shield, Clock, Play, Pause, Settings, Lock, Unlock, AlertTriangle, Timer, Zap } from 'lucide-react-native';
import { useAppContext } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Timer presets in minutes
const TIMER_PRESETS = [
  { label: '5 min', value: 5, color: '#7FE5A8' },
  { label: '10 min', value: 10, color: '#6BCFFF' },
  { label: '15 min', value: 15, color: '#A78BFA' },
  { label: '20 min', value: 20, color: '#FFD93D' },
  { label: '30 min', value: 30, color: '#FF8DC7' },
  { label: '45 min', value: 45, color: '#FFA94D' },
  { label: '1 hour', value: 60, color: '#FF6B6B' },
];

function ParentalIllustration() {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
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
      <Svg width={200} height={150} viewBox="0 0 200 150">
        {/* Shield */}
        <Path 
          d="M100 10 L150 30 L150 80 Q150 120 100 140 Q50 120 50 80 L50 30 Z" 
          fill="#A78BFA" 
          opacity="0.9"
        />
        <Path 
          d="M100 25 L135 40 L135 75 Q135 105 100 120 Q65 105 65 75 L65 40 Z" 
          fill="#FFFFFF" 
          opacity="0.3"
        />
        
        {/* Clock icon in shield */}
        <Circle cx="100" cy="70" r="30" fill="#FFFFFF" />
        <Circle cx="100" cy="70" r="25" fill="#F0E6FF" />
        <Path d="M100 50 L100 70 L115 80" stroke="#5B4B8A" strokeWidth="4" fill="none" strokeLinecap="round" />
        
        {/* Sparkles */}
        <G transform="translate(170, 30)">
          <Path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#FFD93D" />
        </G>
        <G transform="translate(25, 50)">
          <Path d="M0 -8 L1.5 -1.5 L8 0 L1.5 1.5 L0 8 L-1.5 1.5 L-8 0 L-1.5 -1.5 Z" fill="#FF6B6B" />
        </G>
        <G transform="translate(175, 100)">
          <Path d="M0 -6 L1 -1 L6 0 L1 1 L0 6 L-1 1 L-6 0 L-1 -1 Z" fill="#7FE5A8" />
        </G>
        
        {/* Lock */}
        <G transform="translate(155, 115)">
          <Rect x="0" y="10" width="25" height="20" rx="3" fill="#5B4B8A" />
          <Path d="M5 10 L5 5 Q5 -5 12.5 -5 Q20 -5 20 5 L20 10" stroke="#5B4B8A" strokeWidth="4" fill="none" />
        </G>
      </Svg>
    </Animated.View>
  );
}

export default function ParentalScreen() {
  const { 
    isGlobalTimerActive, 
    globalTimerEndTime, 
    startGlobalTimer, 
    stopGlobalTimer,
    timerSettings,
    showSystemOverlay,
    setShowSystemOverlay
  } = useAppContext();
  
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState(15);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isGlobalTimerActive && globalTimerEndTime) {
      interval = setInterval(() => {
        const remaining = Math.max(0, globalTimerEndTime - Date.now());
        setRemainingTime(Math.floor(remaining / 1000));
      }, 1000);
    } else {
      setRemainingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGlobalTimerActive, globalTimerEndTime]);

  const handleStartTimer = (minutes: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Alert.alert(
      '🛡️ Start Screen Time Timer',
      `This will start a ${minutes} minute timer. When it ends, a creative break screen will appear to interrupt your child's scrolling on ANY app.\n\nMake sure you've granted the "Display over other apps" permission for this to work.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Timer',
          onPress: () => {
            startGlobalTimer(minutes);
            setSelectedPreset(minutes);
          },
        },
      ]
    );
  };

  const handleStopTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      '⏹️ Stop Timer',
      'Are you sure you want to stop the screen time timer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            stopGlobalTimer();
            setSelectedPreset(null);
          },
        },
      ]
    );
  };

  const handleTestOverlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowSystemOverlay(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isGlobalTimerActive && globalTimerEndTime 
    ? 1 - (remainingTime / ((globalTimerEndTime - Date.now() + remainingTime * 1000) / 1000))
    : 0;

  return (
    <View className="flex-1" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Header Background */}
      <View 
        className="absolute top-0 left-0 right-0 h-72"
        style={{ 
          backgroundColor: '#E8E0FF',
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-14">
          {/* Header */}
          <View className="items-center mb-4">
            <ParentalIllustration />
          </View>

          <Text className="text-3xl font-black text-center mb-1" style={{ color: '#5B4B8A' }}>
            Parental Controls
          </Text>
          <Text className="text-base text-center mb-6" style={{ color: '#8B7BA8' }}>
            Set timers to protect your child from doomscrolling 🛡️
          </Text>

          {/* Active Timer Card */}
          {isGlobalTimerActive && (
            <View
              className="rounded-3xl p-6 mb-6"
              style={{
                backgroundColor: '#FFFFFF',
                shadowColor: '#A78BFA',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
                elevation: 10,
                borderWidth: 3,
                borderColor: '#A78BFA',
              }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: '#A78BFA' }}
                  >
                    <Timer size={24} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text className="font-bold text-lg" style={{ color: '#5B4B8A' }}>
                      Timer Active
                    </Text>
                    <Text className="text-sm" style={{ color: '#8B7BA8' }}>
                      Screen time being tracked
                    </Text>
                  </View>
                </View>
                
                <View 
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#7FE5A820' }}
                >
                  <Text className="font-bold" style={{ color: '#7FE5A8' }}>🟢 Active</Text>
                </View>
              </View>

              {/* Large Timer Display */}
              <View className="items-center mb-4">
                <Text 
                  className="text-6xl font-black"
                  style={{ color: '#5B4B8A', fontVariant: ['tabular-nums'] }}
                >
                  {formatTime(remainingTime)}
                </Text>
                <Text className="text-sm mt-1" style={{ color: '#8B7BA8' }}>
                  until creative break
                </Text>
              </View>

              {/* Progress Bar */}
              <View 
                className="h-4 rounded-full overflow-hidden mb-4"
                style={{ backgroundColor: '#F0E6FF' }}
              >
                <View 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${Math.min(progress * 100, 100)}%`,
                    backgroundColor: '#A78BFA',
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleStopTimer}
                className="rounded-2xl py-4 flex-row items-center justify-center"
                style={{ backgroundColor: '#FF6B6B' }}
              >
                <Pause size={20} color="#FFFFFF" />
                <Text className="text-white font-bold ml-2">Stop Timer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Start Section */}
          {!isGlobalTimerActive && (
            <>
              <Text className="text-sm font-bold mb-3" style={{ color: '#8B7BA8' }}>
                QUICK START TIMER
              </Text>
              
              <View className="flex-row flex-wrap justify-between mb-6">
                {TIMER_PRESETS.map((preset, index) => (
                  <TouchableOpacity
                    key={preset.value}
                    onPress={() => handleStartTimer(preset.value)}
                    className="rounded-2xl p-4 items-center mb-3"
                    style={{
                      width: (width - 64) / 2 - 8,
                      backgroundColor: '#FFFFFF',
                      shadowColor: preset.color,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 12,
                      elevation: 4,
                      borderWidth: 2,
                      borderColor: preset.color + '30',
                    }}
                  >
                    <View 
                      className="w-14 h-14 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: preset.color + '20' }}
                    >
                      <Clock size={28} color={preset.color} />
                    </View>
                    <Text className="font-bold text-lg" style={{ color: '#5B4B8A' }}>
                      {preset.label}
                    </Text>
                    <Text className="text-xs" style={{ color: '#8B7BA8' }}>
                      Tap to start
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* How It Works */}
          <View
            className="rounded-3xl p-5 mb-6"
            style={{
              backgroundColor: '#FFFFFF',
              shadowColor: '#5B4B8A',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Text className="text-lg font-bold mb-4" style={{ color: '#5B4B8A' }}>
              How It Works 🎯
            </Text>
            
            <View className="mb-3">
              <View className="flex-row items-center mb-2">
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#A78BFA20' }}
                >
                  <Text className="font-bold" style={{ color: '#A78BFA' }}>1</Text>
                </View>
                <Text className="flex-1" style={{ color: '#5B4B8A' }}>
                  Set a timer for your child's screen time
                </Text>
              </View>
            </View>
            
            <View className="mb-3">
              <View className="flex-row items-center mb-2">
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#FFD93D20' }}
                >
                  <Text className="font-bold" style={{ color: '#FFA94D' }}>2</Text>
                </View>
                <Text className="flex-1" style={{ color: '#5B4B8A' }}>
                  Your child can use any app (YouTube, Instagram, etc.)
                </Text>
              </View>
            </View>
            
            <View className="mb-3">
              <View className="flex-row items-center mb-2">
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#7FE5A820' }}
                >
                  <Text className="font-bold" style={{ color: '#7FE5A8' }}>3</Text>
                </View>
                <Text className="flex-1" style={{ color: '#5B4B8A' }}>
                  When timer ends, a fun creative break appears over ALL apps
                </Text>
              </View>
            </View>
            
            <View>
              <View className="flex-row items-center">
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#FF6B6B20' }}
                >
                  <Text className="font-bold" style={{ color: '#FF6B6B' }}>4</Text>
                </View>
                <Text className="flex-1" style={{ color: '#5B4B8A' }}>
                  Child must complete the creative activity to continue
                </Text>
              </View>
            </View>
          </View>

          {/* Test Overlay Button */}
          <TouchableOpacity
            onPress={handleTestOverlay}
            className="rounded-2xl py-4 flex-row items-center justify-center mb-4"
            style={{
              backgroundColor: '#5B4B8A',
              shadowColor: '#5B4B8A',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Zap size={20} color="#FFFFFF" />
            <Text className="text-white font-bold ml-2">Test Break Screen</Text>
          </TouchableOpacity>

          {/* Important Notice */}
          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#FFD93D20', borderWidth: 1, borderColor: '#FFD93D50' }}
          >
            <View className="flex-row items-start">
              <AlertTriangle size={20} color="#FFA94D" />
              <View className="ml-3 flex-1">
                <Text className="font-bold mb-1" style={{ color: '#5B4B8A' }}>
                  Important for Android
                </Text>
                <Text className="text-sm" style={{ color: '#8B7BA8' }}>
                  Make sure "Display over other apps" permission is enabled in Settings for the break screen to appear over other apps.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
