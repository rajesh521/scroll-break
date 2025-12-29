import React, { useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { Trophy, Clock, Zap, Image as ImageIcon, Star, Target } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  withRepeat,
  Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { todayStats, weeklyStats, achievements, artworks, scrollTime, timerSettings } = useAppContext();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Header Background */}
      <View 
        className="absolute top-0 left-0 right-0 h-72"
        style={{ 
          backgroundColor: '#D4F5E9',
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
          <View className="flex-row items-center mb-6">
            <View 
              className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
              style={{ backgroundColor: '#7FE5A830' }}
            >
              <Trophy size={24} color="#7FE5A8" />
            </View>
            <View>
              <Text className="text-3xl font-black" style={{ color: '#5B4B8A' }}>
                Your Progress
              </Text>
              <Text className="text-base" style={{ color: '#8B7BA8' }}>
                You're doing amazing! 🌟
              </Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View className="flex-row justify-between mb-6">
            <StatCard 
              icon={<Clock size={22} color="#FF6B6B" />}
              value={formatTime(todayStats.scrollTime)}
              label="Screen Time"
              color="#FF6B6B"
              index={0}
            />
            <StatCard 
              icon={<Zap size={22} color="#A78BFA" />}
              value={todayStats.breaksTaken.toString()}
              label="Breaks"
              color="#A78BFA"
              index={1}
            />
            <StatCard 
              icon={<ImageIcon size={22} color="#7FE5A8" />}
              value={artworks.length.toString()}
              label="Artworks"
              color="#7FE5A8"
              index={2}
            />
          </View>

          {/* Current Session */}
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
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold" style={{ color: '#5B4B8A' }}>
                Current Session 🎯
              </Text>
              <View 
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: '#F0E6FF' }}
              >
                <Text className="text-sm font-bold" style={{ color: '#A78BFA' }}>
                  {formatTime(scrollTime)}
                </Text>
              </View>
            </View>
            
            {/* Progress bar */}
            <View className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#F0E6FF' }}>
              <View 
                className="h-full rounded-full"
                style={{ 
                  width: `${Math.min((scrollTime / (timerSettings.breakMinutes * 60)) * 100, 100)}%`,
                  backgroundColor: '#A78BFA',
                }}
              />
            </View>
            <Text className="text-xs mt-2 text-center" style={{ color: '#8B7BA8' }}>
              {Math.max(0, timerSettings.breakMinutes - Math.floor(scrollTime / 60))} minutes until next creative break
            </Text>
          </View>

          {/* Achievements */}
          <View className="mb-6">
            <Text className="text-xl font-bold mb-4" style={{ color: '#5B4B8A' }}>
              Achievements 🏆
            </Text>
            
            {achievements.length === 0 ? (
              <View
                className="rounded-3xl p-6 items-center"
                style={{
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#5B4B8A',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                  elevation: 6,
                }}
              >
                <View 
                  className="w-16 h-16 rounded-full items-center justify-center mb-3"
                  style={{ backgroundColor: '#FFD93D30' }}
                >
                  <Star size={32} color="#FFD93D" />
                </View>
                <Text className="text-base font-bold text-center" style={{ color: '#5B4B8A' }}>
                  Keep going!
                </Text>
                <Text className="text-sm text-center mt-1" style={{ color: '#8B7BA8' }}>
                  Complete breaks to earn achievements 🌟
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {achievements.map((achievement, index) => (
                  <AchievementCard key={achievement.id} achievement={achievement} index={index} />
                ))}
              </ScrollView>
            )}
          </View>

          {/* Weekly Summary */}
          <View className="mb-6">
            <Text className="text-xl font-bold mb-4" style={{ color: '#5B4B8A' }}>
              This Week 📊
            </Text>
            
            <View
              className="rounded-3xl p-5"
              style={{
                backgroundColor: '#FFFFFF',
                shadowColor: '#5B4B8A',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              <View className="flex-row justify-between">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const dayData = weeklyStats.find(s => {
                    const d = new Date(s.date);
                    return d.getDay() === (index + 1) % 7;
                  });
                  const hasData = dayData && dayData.breaksTaken > 0;
                  
                  return (
                    <View key={day} className="items-center">
                      <View 
                        className="w-8 h-24 rounded-full mb-2 justify-end overflow-hidden"
                        style={{ backgroundColor: '#F0E6FF' }}
                      >
                        <View 
                          className="w-full rounded-full"
                          style={{ 
                            height: `${Math.min((dayData?.breaksTaken || 0) * 20, 100)}%`,
                            backgroundColor: hasData ? '#A78BFA' : 'transparent',
                          }}
                        />
                      </View>
                      <Text className="text-xs font-medium" style={{ color: '#8B7BA8' }}>
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Recent Artwork */}
          {artworks.length > 0 && (
            <View>
              <Text className="text-xl font-bold mb-4" style={{ color: '#5B4B8A' }}>
                Recent Artwork 🎨
              </Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {artworks.slice(0, 5).map((artwork, index) => (
                  <View
                    key={artwork.id}
                    className="mr-4 rounded-3xl overflow-hidden"
                    style={{
                      width: 140,
                      backgroundColor: '#FFFFFF',
                      shadowColor: '#5B4B8A',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 12,
                      elevation: 4,
                    }}
                  >
                    <View 
                      className="h-32 items-center justify-center"
                      style={{ 
                        backgroundColor: 
                          artwork.type === 'drawing' ? '#FF6B6B20' :
                          artwork.type === 'coloring' ? '#6BCFFF20' : '#7FE5A820'
                      }}
                    >
                      <Text className="text-5xl">
                        {artwork.type === 'drawing' ? '🖌️' :
                         artwork.type === 'coloring' ? '🎨' : '🔷'}
                      </Text>
                    </View>
                    <View className="p-3">
                      <Text className="font-bold capitalize" style={{ color: '#5B4B8A' }}>
                        {artwork.type}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  index: number;
}

function StatCard({ icon, value, label, color, index }: StatCardProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(index * 100, withSpring(1, { damping: 12 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View 
      style={[
        animatedStyle,
        {
          width: (width - 56) / 3,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 16,
          alignItems: 'center',
          shadowColor: color,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 4,
        }
      ]}
    >
      <View 
        className="w-10 h-10 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: color + '20' }}
      >
        {icon}
      </View>
      <Text className="text-2xl font-black" style={{ color }}>
        {value}
      </Text>
      <Text className="text-xs mt-1" style={{ color: '#8B7BA8' }}>
        {label}
      </Text>
    </Animated.View>
  );
}

interface AchievementCardProps {
  achievement: any;
  index: number;
}

function AchievementCard({ achievement, index }: AchievementCardProps) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(index * 100, withSpring(1, { damping: 12 }));
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

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          marginRight: 16,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 20,
          alignItems: 'center',
          width: 140,
          shadowColor: '#FFD93D',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 4,
        }
      ]}
    >
      <Text className="text-4xl mb-2">{achievement.icon}</Text>
      <Text className="text-sm font-bold text-center" style={{ color: '#5B4B8A' }}>
        {achievement.title}
      </Text>
    </Animated.View>
  );
}
