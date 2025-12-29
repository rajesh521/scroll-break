import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Brush, Palette, Shapes, Sparkles, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { useAppContext } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';
import DrawingCanvas from '@/components/DrawingCanvas';
import ColoringPages from '@/components/ColoringPages';
import GeometricPatterns from '@/components/GeometricPatterns';
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

export default function CreativeScreen() {
  const { artworks, deleteArtwork } = useAppContext();
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const handleActivitySelect = (activity: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedActivity(activity);
  };

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
    <View className="flex-1" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Header Background */}
      <View 
        className="absolute top-0 left-0 right-0 h-64"
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
          <View className="flex-row items-center mb-2">
            <View 
              className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
              style={{ backgroundColor: '#A78BFA30' }}
            >
              <Sparkles size={24} color="#A78BFA" />
            </View>
            <View>
              <Text className="text-3xl font-black" style={{ color: '#5B4B8A' }}>
                Creative Hub
              </Text>
              <Text className="text-base" style={{ color: '#8B7BA8' }}>
                Let your imagination run wild! ✨
              </Text>
            </View>
          </View>

          {/* Activity Cards */}
          <View className="mt-6">
            <Text className="text-sm font-bold mb-3" style={{ color: '#8B7BA8' }}>
              PICK AN ACTIVITY
            </Text>
            
            <View className="flex-row justify-between mb-6">
              <ActivityCard
                emoji="🖌️"
                title="Draw"
                color="#FF6B6B"
                index={0}
                onPress={() => handleActivitySelect('drawing')}
              />
              <ActivityCard
                emoji="🎨"
                title="Color"
                color="#6BCFFF"
                index={1}
                onPress={() => handleActivitySelect('coloring')}
              />
              <ActivityCard
                emoji="🔷"
                title="Patterns"
                color="#7FE5A8"
                index={2}
                onPress={() => handleActivitySelect('patterns')}
              />
            </View>
          </View>

          {/* Artwork Gallery */}
          <View className="mt-2">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold" style={{ color: '#5B4B8A' }}>
                Your Artwork 🖼️
              </Text>
              <Text className="text-sm" style={{ color: '#8B7BA8' }}>
                {artworks.length} pieces
              </Text>
            </View>
            
            {artworks.length === 0 ? (
              <View
                className="rounded-3xl p-8 items-center"
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
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: '#F0E6FF' }}
                >
                  <ImageIcon size={36} color="#A78BFA" />
                </View>
                <Text className="text-lg font-bold text-center" style={{ color: '#5B4B8A' }}>
                  No artwork yet!
                </Text>
                <Text className="text-base text-center mt-2" style={{ color: '#8B7BA8' }}>
                  Start creating by choosing an activity above ✨
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {artworks.map((artwork, index) => (
                  <ArtworkCard 
                    key={artwork.id} 
                    artwork={artwork} 
                    index={index}
                    onDelete={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      deleteArtwork(artwork.id);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

interface ActivityCardProps {
  emoji: string;
  title: string;
  color: string;
  index: number;
  onPress: () => void;
}

function ActivityCard({ emoji, title, color, index, onPress }: ActivityCardProps) {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(index * 100, withSpring(1, { damping: 12 }));
    rotation.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 2000 + index * 200 }),
        withTiming(3, { duration: 2000 + index * 200 })
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
    scale.value = withSpring(0.95);
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
        className="rounded-3xl items-center py-5"
        style={{
          backgroundColor: '#FFFFFF',
          width: (width - 64) / 3,
          shadowColor: color,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 6,
          borderWidth: 2,
          borderColor: color + '30',
        }}
      >
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
          style={{ backgroundColor: color + '20' }}
        >
          <Text className="text-3xl">{emoji}</Text>
        </View>
        <Text className="font-bold text-sm" style={{ color }}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface ArtworkCardProps {
  artwork: any;
  index: number;
  onDelete: () => void;
}

function ArtworkCard({ artwork, index, onDelete }: ArtworkCardProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(index * 80, withSpring(1, { damping: 12 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getEmoji = (type: string) => {
    switch (type) {
      case 'drawing': return '🖌️';
      case 'coloring': return '🎨';
      case 'pattern': return '🔷';
      default: return '🎨';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'drawing': return '#FF6B6B';
      case 'coloring': return '#6BCFFF';
      case 'pattern': return '#7FE5A8';
      default: return '#A78BFA';
    }
  };

  return (
    <Animated.View 
      style={[
        animatedStyle,
        {
          width: (width - 56) / 2,
          marginBottom: 16,
        }
      ]}
    >
      <View
        className="rounded-3xl overflow-hidden"
        style={{
          backgroundColor: '#FFFFFF',
          shadowColor: getColor(artwork.type),
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View 
          className="h-32 items-center justify-center"
          style={{ backgroundColor: getColor(artwork.type) + '20' }}
        >
          <Text className="text-5xl">{getEmoji(artwork.type)}</Text>
        </View>
        <View className="p-4 flex-row items-center justify-between">
          <View>
            <Text className="font-bold capitalize" style={{ color: '#5B4B8A' }}>
              {artwork.type}
            </Text>
            <Text className="text-xs" style={{ color: '#8B7BA8' }}>
              {new Date(artwork.timestamp).toLocaleDateString()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onDelete}
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: '#FF6B6B20' }}
          >
            <Trash2 size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
