import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { X, ChevronLeft, ChevronRight, Save, RotateCcw } from 'lucide-react-native';
import { useAppContext } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Rect, Ellipse, G } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ColoringPagesProps {
  onClose: () => void;
}

const coloringPages = [
  {
    id: '1',
    name: 'Happy Star ⭐',
    emoji: '⭐',
    paths: [
      { type: 'path', d: 'M150,30 L170,90 L230,90 L180,130 L200,190 L150,150 L100,190 L120,130 L70,90 L130,90 Z' },
      { type: 'circle', cx: 130, cy: 110, r: 8 },
      { type: 'circle', cx: 170, cy: 110, r: 8 },
      { type: 'path', d: 'M130,140 Q150,160 170,140' },
    ],
  },
  {
    id: '2',
    name: 'Cute Heart 💖',
    emoji: '💖',
    paths: [
      { type: 'path', d: 'M150,200 Q50,130 80,70 Q110,30 150,70 Q190,30 220,70 Q250,130 150,200 Z' },
      { type: 'circle', cx: 120, cy: 100, r: 10 },
      { type: 'circle', cx: 180, cy: 100, r: 10 },
    ],
  },
  {
    id: '3',
    name: 'Rainbow 🌈',
    emoji: '🌈',
    paths: [
      { type: 'path', d: 'M40,180 Q40,60 150,60 Q260,60 260,180' },
      { type: 'path', d: 'M60,180 Q60,80 150,80 Q240,80 240,180' },
      { type: 'path', d: 'M80,180 Q80,100 150,100 Q220,100 220,180' },
      { type: 'path', d: 'M100,180 Q100,120 150,120 Q200,120 200,180' },
      { type: 'circle', cx: 60, cy: 200, r: 25 },
      { type: 'circle', cx: 240, cy: 200, r: 25 },
    ],
  },
  {
    id: '4',
    name: 'Smiling Sun ☀️',
    emoji: '☀️',
    paths: [
      { type: 'circle', cx: 150, cy: 150, r: 60 },
      { type: 'path', d: 'M150,70 L150,40' },
      { type: 'path', d: 'M150,260 L150,230' },
      { type: 'path', d: 'M70,150 L40,150' },
      { type: 'path', d: 'M260,150 L230,150' },
      { type: 'path', d: 'M94,94 L72,72' },
      { type: 'path', d: 'M206,206 L228,228' },
      { type: 'path', d: 'M206,94 L228,72' },
      { type: 'path', d: 'M94,206 L72,228' },
      { type: 'circle', cx: 130, cy: 140, r: 8 },
      { type: 'circle', cx: 170, cy: 140, r: 8 },
      { type: 'path', d: 'M120,170 Q150,195 180,170' },
    ],
  },
];

export default function ColoringPages({ onClose }: ColoringPagesProps) {
  const { saveArtwork } = useAppContext();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentColor, setCurrentColor] = useState('#FF6B6B');
  const [filledColors, setFilledColors] = useState<{ [key: string]: string }>({});

  const colors = ['#FF6B6B', '#FFD93D', '#6BCFFF', '#7FE5A8', '#A78BFA', '#FF8DC7', '#FFA94D', '#5B4B8A', '#FFFFFF'];
  const currentPage = coloringPages[currentPageIndex];

  const handleFill = (pathIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilledColors({
      ...filledColors,
      [`${currentPage.id}-${pathIndex}`]: currentColor,
    });
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const resetColors = { ...filledColors };
    currentPage.paths.forEach((_, index) => {
      delete resetColors[`${currentPage.id}-${index}`];
    });
    setFilledColors(resetColors);
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    saveArtwork({ type: 'coloring', imageData: 'coloring-data' });
    onClose();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentPageIndex < coloringPages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePrev = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const renderShape = (shape: any, index: number) => {
    const fill = filledColors[`${currentPage.id}-${index}`] || 'white';
    const commonProps = {
      key: index,
      fill,
      stroke: "#5B4B8A",
      strokeWidth: 4,
      onPress: () => handleFill(index),
    };

    switch (shape.type) {
      case 'circle':
        return <Circle {...commonProps} cx={shape.cx} cy={shape.cy} r={shape.r} />;
      case 'path':
        return <Path {...commonProps} d={shape.d} strokeLinecap="round" strokeLinejoin="round" />;
      default:
        return null;
    }
  };

  return (
    <Modal visible animationType="slide">
      <View className="flex-1" style={{ backgroundColor: '#FFF8F0' }}>
        {/* Header */}
        <View
          className="px-6 pt-14 pb-4 flex-row items-center justify-between"
          style={{
            backgroundColor: '#FFFFFF',
            shadowColor: '#5B4B8A',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <TouchableOpacity 
            onPress={onClose} 
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: '#F0E6FF' }}
          >
            <X size={22} color="#5B4B8A" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Text className="text-3xl mr-2">{currentPage.emoji}</Text>
            <Text className="text-xl font-bold" style={{ color: '#5B4B8A' }}>
              {currentPage.name}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleSave} 
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: '#7FE5A8' }}
          >
            <Save size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Canvas */}
        <View className="flex-1 items-center justify-center px-4">
          <View 
            className="rounded-3xl p-6"
            style={{
              backgroundColor: '#FFFFFF',
              shadowColor: '#5B4B8A',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <Svg width={width - 80} height={width - 80} viewBox="0 0 300 300">
              {currentPage.paths.map((shape, index) => renderShape(shape, index))}
            </Svg>
          </View>

          {/* Navigation */}
          <View className="flex-row items-center justify-center mt-6">
            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentPageIndex === 0}
              className="w-12 h-12 rounded-full items-center justify-center mr-4"
              style={{ 
                backgroundColor: currentPageIndex === 0 ? '#E5E7EB' : '#A78BFA',
                opacity: currentPageIndex === 0 ? 0.5 : 1 
              }}
            >
              <ChevronLeft size={24} color={currentPageIndex === 0 ? '#9CA3AF' : '#FFFFFF'} />
            </TouchableOpacity>
            
            <View className="flex-row items-center">
              {coloringPages.map((_, index) => (
                <View 
                  key={index}
                  className="w-3 h-3 rounded-full mx-1"
                  style={{ 
                    backgroundColor: index === currentPageIndex ? '#A78BFA' : '#E5E7EB' 
                  }}
                />
              ))}
            </View>
            
            <TouchableOpacity
              onPress={handleNext}
              disabled={currentPageIndex === coloringPages.length - 1}
              className="w-12 h-12 rounded-full items-center justify-center ml-4"
              style={{ 
                backgroundColor: currentPageIndex === coloringPages.length - 1 ? '#E5E7EB' : '#A78BFA',
                opacity: currentPageIndex === coloringPages.length - 1 ? 0.5 : 1 
              }}
            >
              <ChevronRight size={24} color={currentPageIndex === coloringPages.length - 1 ? '#9CA3AF' : '#FFFFFF'} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleReset}
              className="w-12 h-12 rounded-full items-center justify-center ml-6"
              style={{ backgroundColor: '#FFD93D30' }}
            >
              <RotateCcw size={20} color="#FFA94D" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Color Picker */}
        <View className="px-4 pb-6">
          <View 
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ justifyContent: 'center', flexGrow: 1 }}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCurrentColor(color);
                  }}
                  className="mx-2"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: color,
                    borderWidth: currentColor === color ? 4 : 2,
                    borderColor: currentColor === color ? '#5B4B8A' : color === '#FFFFFF' ? '#E5E7EB' : 'transparent',
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.4,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
