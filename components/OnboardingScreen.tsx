import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { ArrowRight, Check } from 'lucide-react-native';
import Svg, { Circle, Path, G, Rect, Ellipse, Line, Text as SvgText } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  backgroundColor: string;
  accentColor: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Doomscrolling Hurts',
    subtitle: '😔 The Problem',
    description: 'Too much screen time can make kids feel sad, tired, and lose focus. It steals time from play, creativity, and real friendships.',
    backgroundColor: '#FFE4E1',
    accentColor: '#FF6B6B',
  },
  {
    id: '2',
    title: 'Take Creative Breaks',
    subtitle: '🎨 The Solution',
    description: 'Our app gently reminds kids to stop scrolling and do something creative! Drawing, coloring, and patterns keep minds happy.',
    backgroundColor: '#E8F5E9',
    accentColor: '#7FE5A8',
  },
  {
    id: '3',
    title: 'Build Healthy Habits',
    subtitle: '⭐ The Reward',
    description: 'Earn achievements, save artwork, and track progress. Screen time becomes balanced and fun with creative breaks!',
    backgroundColor: '#F3E5F5',
    accentColor: '#A78BFA',
  },
];

// Onboarding Image 1: Sad kid with phone showing negative effects
function OnboardingImage1() {
  const bounce = useSharedValue(0);
  const sadFace = useSharedValue(0);

  React.useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1000 }),
        withTiming(5, { duration: 1000 })
      ),
      -1,
      true
    );
    sadFace.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <View className="items-center justify-center" style={{ width: width - 80, height: 280 }}>
      <Animated.View style={floatStyle}>
        <Svg width={280} height={280} viewBox="0 0 280 280">
          {/* Background circles */}
          <Circle cx="140" cy="140" r="130" fill="#FF6B6B20" />
          <Circle cx="140" cy="140" r="100" fill="#FF6B6B15" />
          
          {/* Kid's body */}
          <Ellipse cx="140" cy="200" rx="50" ry="60" fill="#FFD93D" />
          
          {/* Kid's head */}
          <Circle cx="140" cy="110" r="50" fill="#FFECD2" />
          
          {/* Sad eyes */}
          <Ellipse cx="125" cy="100" rx="8" ry="10" fill="#5B4B8A" />
          <Ellipse cx="155" cy="100" rx="8" ry="10" fill="#5B4B8A" />
          
          {/* Sad eyebrows */}
          <Path d="M115 88 Q125 83 135 88" stroke="#5B4B8A" strokeWidth="3" fill="none" />
          <Path d="M145 88 Q155 83 165 88" stroke="#5B4B8A" strokeWidth="3" fill="none" />
          
          {/* Sad mouth */}
          <Path d="M120 130 Q140 115 160 130" stroke="#FF6B6B" strokeWidth="4" fill="none" strokeLinecap="round" />
          
          {/* Tears */}
          <Ellipse cx="118" cy="115" rx="4" ry="6" fill="#6BCFFF" opacity="0.8" />
          <Ellipse cx="162" cy="115" rx="4" ry="6" fill="#6BCFFF" opacity="0.8" />
          
          {/* Phone */}
          <Rect x="110" y="155" width="60" height="90" rx="8" fill="#3A3A3A" />
          <Rect x="115" y="160" width="50" height="75" rx="4" fill="#6BCFFF" />
          
          {/* Negative symbols around */}
          <G transform="translate(50, 60)">
            <Circle cx="0" cy="0" r="15" fill="#FF6B6B30" />
            <Path d="M-6 0 L6 0" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
          </G>
          
          <G transform="translate(230, 70)">
            <Circle cx="0" cy="0" r="15" fill="#FF6B6B30" />
            <Path d="M-6 0 L6 0" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
          </G>
          
          <G transform="translate(60, 180)">
            <Circle cx="0" cy="0" r="12" fill="#FF6B6B30" />
            <SvgText x="-4" y="5" fill="#FF6B6B" fontSize="14" fontWeight="bold">Z</SvgText>
          </G>
          
          <G transform="translate(220, 200)">
            <Circle cx="0" cy="0" r="12" fill="#FF6B6B30" />
            <SvgText x="-4" y="5" fill="#FF6B6B" fontSize="14" fontWeight="bold">Z</SvgText>
          </G>
          
          {/* "NO FOCUS" indicator */}
          <G transform="translate(40, 240)">
            <Rect x="-5" y="-12" width="60" height="24" rx="12" fill="#FF6B6B" />
            <SvgText x="25" y="5" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">NO FOCUS</SvgText>
          </G>
          
          {/* "TIRED" indicator */}
          <G transform="translate(185, 240)">
            <Rect x="-5" y="-12" width="50" height="24" rx="12" fill="#FF6B6B" />
            <SvgText x="20" y="5" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">TIRED</SvgText>
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

// Onboarding Image 2: Happy kid taking creative break
function OnboardingImage2() {
  const bounce = useSharedValue(0);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1200 }),
        withTiming(8, { duration: 1200 })
      ),
      -1,
      true
    );
    rotate.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000 }),
        withTiming(10, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <View className="items-center justify-center" style={{ width: width - 80, height: 280 }}>
      <Animated.View style={floatStyle}>
        <Svg width={280} height={280} viewBox="0 0 280 280">
          {/* Background */}
          <Circle cx="140" cy="140" r="130" fill="#7FE5A820" />
          <Circle cx="140" cy="140" r="100" fill="#7FE5A815" />
          
          {/* Easel/Canvas */}
          <G transform="translate(160, 80)">
            <Rect x="0" y="0" width="80" height="100" rx="4" fill="#FFECD2" stroke="#5B4B8A" strokeWidth="3" />
            {/* Art on canvas */}
            <Circle cx="25" cy="35" r="15" fill="#FF6B6B" />
            <Circle cx="55" cy="45" r="12" fill="#FFD93D" />
            <Circle cx="40" cy="70" r="10" fill="#6BCFFF" />
            <Path d="M20 85 Q40 75 60 85" stroke="#7FE5A8" strokeWidth="3" fill="none" />
          </G>
          
          {/* Happy Kid */}
          <G transform="translate(40, 100)">
            {/* Body */}
            <Ellipse cx="60" cy="110" rx="45" ry="55" fill="#7FE5A8" />
            
            {/* Head */}
            <Circle cx="60" cy="45" r="45" fill="#FFECD2" />
            
            {/* Happy eyes */}
            <Path d="M40 35 Q50 25 60 35" stroke="#5B4B8A" strokeWidth="4" fill="none" strokeLinecap="round" />
            <Path d="M60 35 Q70 25 80 35" stroke="#5B4B8A" strokeWidth="4" fill="none" strokeLinecap="round" />
            
            {/* Big smile */}
            <Path d="M35 55 Q60 80 85 55" stroke="#FF6B6B" strokeWidth="4" fill="none" strokeLinecap="round" />
            
            {/* Rosy cheeks */}
            <Circle cx="30" cy="50" r="8" fill="#FF8DC7" opacity="0.5" />
            <Circle cx="90" cy="50" r="8" fill="#FF8DC7" opacity="0.5" />
            
            {/* Arm holding brush */}
            <Path d="M100 100 L130 70" stroke="#FFECD2" strokeWidth="12" strokeLinecap="round" />
            
            {/* Paintbrush */}
            <Rect x="125" y="50" width="6" height="40" rx="2" fill="#8B4513" />
            <Ellipse cx="128" cy="48" rx="8" ry="6" fill="#FF6B6B" />
          </G>
          
          {/* Sparkles */}
          <G transform="translate(250, 50)">
            <Path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#FFD93D" />
          </G>
          <G transform="translate(30, 70)">
            <Path d="M0 -8 L1.5 -1.5 L8 0 L1.5 1.5 L0 8 L-1.5 1.5 L-8 0 L-1.5 -1.5 Z" fill="#A78BFA" />
          </G>
          <G transform="translate(200, 220)">
            <Path d="M0 -8 L1.5 -1.5 L8 0 L1.5 1.5 L0 8 L-1.5 1.5 L-8 0 L-1.5 -1.5 Z" fill="#FF6B6B" />
          </G>
          <G transform="translate(50, 240)">
            <Path d="M0 -6 L1 -1 L6 0 L1 1 L0 6 L-1 1 L-6 0 L-1 -1 Z" fill="#7FE5A8" />
          </G>
          
          {/* Timer icon */}
          <G transform="translate(240, 140)">
            <Circle cx="0" cy="0" r="25" fill="#FFFFFF" stroke="#5B4B8A" strokeWidth="3" />
            <Path d="M0 -15 L0 0 L10 10" stroke="#5B4B8A" strokeWidth="3" fill="none" strokeLinecap="round" />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

// Onboarding Image 3: Achievements and progress
function OnboardingImage3() {
  const bounce = useSharedValue(0);
  const starRotate = useSharedValue(0);

  React.useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1000 }),
        withTiming(6, { duration: 1000 })
      ),
      -1,
      true
    );
    starRotate.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <View className="items-center justify-center" style={{ width: width - 80, height: 280 }}>
      <Animated.View style={floatStyle}>
        <Svg width={280} height={280} viewBox="0 0 280 280">
          {/* Background */}
          <Circle cx="140" cy="140" r="130" fill="#A78BFA20" />
          <Circle cx="140" cy="140" r="100" fill="#A78BFA15" />
          
          {/* Trophy */}
          <G transform="translate(100, 60)">
            {/* Cup */}
            <Path d="M20 0 L60 0 L55 60 L25 60 Z" fill="#FFD93D" />
            {/* Handles */}
            <Path d="M20 10 Q0 20 10 40 Q15 45 20 40" stroke="#FFD93D" strokeWidth="8" fill="none" />
            <Path d="M60 10 Q80 20 70 40 Q65 45 60 40" stroke="#FFD93D" strokeWidth="8" fill="none" />
            {/* Base */}
            <Rect x="25" y="60" width="30" height="10" fill="#FFA94D" />
            <Rect x="15" y="70" width="50" height="8" rx="2" fill="#FFA94D" />
            {/* Star on trophy */}
            <Path d="M40 25 L43 35 L53 35 L45 42 L48 52 L40 46 L32 52 L35 42 L27 35 L37 35 Z" fill="#FFFFFF" />
          </G>
          
          {/* Achievement badges */}
          <G transform="translate(30, 150)">
            <Circle cx="25" cy="25" r="25" fill="#FF6B6B" />
            <SvgText x="25" y="32" fill="#FFFFFF" fontSize="24" textAnchor="middle">🎨</SvgText>
          </G>
          
          <G transform="translate(200, 150)">
            <Circle cx="25" cy="25" r="25" fill="#7FE5A8" />
            <SvgText x="25" y="32" fill="#FFFFFF" fontSize="24" textAnchor="middle">⭐</SvgText>
          </G>
          
          <G transform="translate(115, 180)">
            <Circle cx="25" cy="25" r="30" fill="#6BCFFF" />
            <SvgText x="25" y="35" fill="#FFFFFF" fontSize="28" textAnchor="middle">🏆</SvgText>
          </G>
          
          {/* Progress bar */}
          <G transform="translate(40, 245)">
            <Rect x="0" y="0" width="200" height="20" rx="10" fill="#E8E0F0" />
            <Rect x="0" y="0" width="150" height="20" rx="10" fill="#A78BFA" />
            <SvgText x="100" y="14" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">75% PROGRESS</SvgText>
          </G>
          
          {/* Floating stars */}
          <G transform="translate(60, 50)">
            <Path d="M0 -12 L2.5 -2.5 L12 0 L2.5 2.5 L0 12 L-2.5 2.5 L-12 0 L-2.5 -2.5 Z" fill="#FFD93D" />
          </G>
          <G transform="translate(220, 80)">
            <Path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#FF8DC7" />
          </G>
          <G transform="translate(250, 200)">
            <Path d="M0 -8 L1.5 -1.5 L8 0 L1.5 1.5 L0 8 L-1.5 1.5 L-8 0 L-1.5 -1.5 Z" fill="#7FE5A8" />
          </G>
          <G transform="translate(20, 220)">
            <Path d="M0 -8 L1.5 -1.5 L8 0 L1.5 1.5 L0 8 L-1.5 1.5 L-8 0 L-1.5 -1.5 Z" fill="#6BCFFF" />
          </G>
          
          {/* Happy kid peeking */}
          <G transform="translate(180, 100)">
            <Circle cx="30" cy="30" r="30" fill="#FFECD2" />
            <Path d="M18 22 Q25 17 32 22" stroke="#5B4B8A" strokeWidth="3" fill="none" />
            <Path d="M28 22 Q35 17 42 22" stroke="#5B4B8A" strokeWidth="3" fill="none" />
            <Path d="M18 38 Q30 50 42 38" stroke="#FF6B6B" strokeWidth="3" fill="none" strokeLinecap="round" />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem('onboardingComplete', 'true');
    onComplete();
  };

  const renderImage = (index: number) => {
    switch (index) {
      case 0:
        return <OnboardingImage1 />;
      case 1:
        return <OnboardingImage2 />;
      case 2:
        return <OnboardingImage3 />;
      default:
        return null;
    }
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => (
    <View 
      style={{ width, flex: 1, backgroundColor: item.backgroundColor }}
      className="items-center justify-center px-8"
    >
      {/* Image */}
      <View className="mb-8">
        {renderImage(index)}
      </View>
      
      {/* Content */}
      <View className="items-center">
        <View 
          className="px-4 py-2 rounded-full mb-4"
          style={{ backgroundColor: item.accentColor + '30' }}
        >
          <Text 
            className="text-base font-bold"
            style={{ color: item.accentColor }}
          >
            {item.subtitle}
          </Text>
        </View>
        
        <Text 
          className="text-3xl font-black text-center mb-4"
          style={{ color: '#5B4B8A' }}
        >
          {item.title}
        </Text>
        
        <Text 
          className="text-base text-center leading-6"
          style={{ color: '#5B4B8A', opacity: 0.8 }}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        keyExtractor={(item) => item.id}
      />
      
      {/* Bottom Controls */}
      <View 
        className="absolute bottom-0 left-0 right-0 px-8 pb-12 pt-6"
        style={{ backgroundColor: slides[currentIndex].backgroundColor }}
      >
        {/* Dots */}
        <View className="flex-row justify-center mb-8">
          {slides.map((_, index) => (
            <View
              key={index}
              className="mx-1.5 rounded-full"
              style={{
                width: index === currentIndex ? 32 : 10,
                height: 10,
                backgroundColor: index === currentIndex 
                  ? slides[currentIndex].accentColor 
                  : slides[currentIndex].accentColor + '40',
              }}
            />
          ))}
        </View>
        
        {/* Button */}
        <TouchableOpacity
          onPress={handleNext}
          className="rounded-2xl py-5 flex-row items-center justify-center"
          style={{
            backgroundColor: slides[currentIndex].accentColor,
            shadowColor: slides[currentIndex].accentColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text className="text-lg font-bold text-white mr-2">
            {currentIndex === slides.length - 1 ? "Let's Start!" : 'Next'}
          </Text>
          {currentIndex === slides.length - 1 ? (
            <Check size={22} color="#FFFFFF" />
          ) : (
            <ArrowRight size={22} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        
        {/* Skip */}
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity
            onPress={handleComplete}
            className="mt-4 py-2"
          >
            <Text 
              className="text-center text-base"
              style={{ color: slides[currentIndex].accentColor }}
            >
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
