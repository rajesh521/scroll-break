import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import FeedCard from '@/components/FeedCard';
import WarningBanner from '@/components/WarningBanner';
import BreakModal from '@/components/BreakModal';
import TimerSettingsModal from '@/components/TimerSettingsModal';
import { Settings, Play, Pause } from 'lucide-react-native';
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

const { width } = Dimensions.get('window');

const feedContent = [
  {
    id: '1',
    type: 'fact',
    title: 'Did You Know? 🌈',
    content: 'Butterflies taste with their feet! They land on flowers to find out if they are good to eat.',
    color: '#FFD93D',
    emoji: '🦋',
  },
  {
    id: '2',
    type: 'joke',
    title: 'Joke Time! 😄',
    content: 'Why did the math book look sad? Because it had too many problems!',
    color: '#6BCFFF',
    emoji: '📚',
  },
  {
    id: '3',
    type: 'fact',
    title: 'Amazing Fact! 🌟',
    content: 'Honey never spoils! Archaeologists have found 3000-year-old honey in Egyptian tombs that\'s still perfectly good to eat.',
    color: '#7FE5A8',
    emoji: '🍯',
  },
  {
    id: '4',
    type: 'fact',
    title: 'Cool Science! 🔬',
    content: 'Your heart beats about 100,000 times a day! That\'s like a tiny drum keeping you alive.',
    color: '#FF8DC7',
    emoji: '❤️',
  },
  {
    id: '5',
    type: 'joke',
    title: 'Silly Joke! 🤪',
    content: 'What do you call a bear with no teeth? A gummy bear!',
    color: '#FFA94D',
    emoji: '🐻',
  },
  {
    id: '6',
    type: 'fact',
    title: 'Space Facts! 🚀',
    content: 'One day on Venus is longer than one year on Venus! It takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.',
    color: '#A78BFA',
    emoji: '🪐',
  },
  {
    id: '7',
    type: 'joke',
    title: 'Knock Knock! 🚪',
    content: 'Knock knock! Who\'s there? Lettuce. Lettuce who? Lettuce in, it\'s cold out here!',
    color: '#FF6B6B',
    emoji: '🥬',
  },
  {
    id: '8',
    type: 'fact',
    title: 'Ocean Wonders! 🌊',
    content: 'Octopuses have three hearts and blue blood! Two hearts pump blood to the gills, and one pumps it to the rest of the body.',
    color: '#6BCFFF',
    emoji: '🐙',
  },
];

export default function HomeScreen() {
  const { startScrollTracking, stopScrollTracking, showWarning, isBreakActive, isTimerRunning, scrollTime, timerSettings } = useAppContext();
  const [showSettings, setShowSettings] = useState(false);
  
  const floatAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isTimerRunning) {
      stopScrollTracking();
    } else {
      startScrollTracking();
    }
  };

  const progress = scrollTime / (timerSettings.breakMinutes * 60);
  const progressPercent = Math.min(progress * 100, 100);

  return (
    <View className="flex-1" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Gradient Background */}
      <View 
        className="absolute top-0 left-0 right-0 h-80"
        style={{ 
          backgroundColor: '#FFE4D6',
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      />
      
      {/* Header */}
      <View className="px-6 pt-14 pb-4 flex-row items-center justify-between z-10">
        <View>
          <Text className="text-3xl font-black" style={{ color: '#5B4B8A' }}>
            Hey there! 👋
          </Text>
          <Text className="text-base mt-1" style={{ color: '#8B7BA8' }}>
            Let's have some fun today
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowSettings(true);
          }}
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ 
            backgroundColor: '#FFFFFF',
            shadowColor: '#5B4B8A',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <Settings size={22} color="#5B4B8A" />
        </TouchableOpacity>
      </View>

      {/* Timer Card */}
      <Animated.View 
        style={[
          floatStyle,
          {
            marginHorizontal: 24,
            marginTop: 8,
            backgroundColor: '#FFFFFF',
            borderRadius: 28,
            padding: 20,
            shadowColor: '#5B4B8A',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 8,
          }
        ]}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-semibold mb-1" style={{ color: '#8B7BA8' }}>
              Screen Time Timer
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-4xl font-black" style={{ color: '#5B4B8A' }}>
                {Math.floor(scrollTime / 60)}
              </Text>
              <Text className="text-lg font-medium ml-1" style={{ color: '#A78BFA' }}>
                :{(scrollTime % 60).toString().padStart(2, '0')} min
              </Text>
            </View>
            <Text className="text-xs mt-1" style={{ color: '#B8A8D4' }}>
              Break in {timerSettings.breakMinutes - Math.floor(scrollTime / 60)} minutes
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={toggleTimer}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: isTimerRunning ? '#FF6B6B' : '#7FE5A8',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: isTimerRunning ? '#FF6B6B' : '#7FE5A8',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            {isTimerRunning ? (
              <Pause size={28} color="#FFFFFF" />
            ) : (
              <Play size={28} color="#FFFFFF" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Progress Bar */}
        <View 
          className="mt-4 h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: '#F0E6FF' }}
        >
          <Animated.View 
            style={[
              pulseStyle,
              {
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: progressPercent > 80 ? '#FF6B6B' : progressPercent > 60 ? '#FFD93D' : '#7FE5A8',
                borderRadius: 999,
              }
            ]}
          />
        </View>
      </Animated.View>

      {showWarning && <WarningBanner />}
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          <Text className="text-xl font-bold mb-4" style={{ color: '#5B4B8A' }}>
            Discover Something Fun! ✨
          </Text>

          {feedContent.map((item, index) => (
            <FeedCard key={item.id} {...item} index={index} />
          ))}
        </View>
      </ScrollView>

      {isBreakActive && <BreakModal />}
      
      <TimerSettingsModal 
        visible={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </View>
  );
}
