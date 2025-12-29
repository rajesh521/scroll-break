import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { X, Save, Trash2, FlipHorizontal, Grid3X3 } from 'lucide-react-native';
import { useAppContext } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface GeometricPatternsProps {
  onClose: () => void;
}

export default function GeometricPatterns({ onClose }: GeometricPatternsProps) {
  const { saveArtwork } = useAppContext();
  const [currentColor, setCurrentColor] = useState('#FF6B6B');
  const [filledTiles, setFilledTiles] = useState<{ [key: number]: string }>({});
  const [symmetryMode, setSymmetryMode] = useState(true);
  const [gridSize, setGridSize] = useState(6);

  const colors = ['#FF6B6B', '#FFD93D', '#6BCFFF', '#7FE5A8', '#A78BFA', '#FF8DC7', '#FFA94D', '#5B4B8A', '#FFFFFF'];
  const tiles = Array.from({ length: gridSize * gridSize }, (_, i) => i);

  const handleTileFill = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newFilled = { ...filledTiles };
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    newFilled[index] = currentColor;
    
    if (symmetryMode) {
      // Horizontal symmetry
      const mirrorCol = gridSize - 1 - col;
      const mirrorIndex = row * gridSize + mirrorCol;
      newFilled[mirrorIndex] = currentColor;
      
      // Vertical symmetry
      const mirrorRow = gridSize - 1 - row;
      const verticalMirrorIndex = mirrorRow * gridSize + col;
      newFilled[verticalMirrorIndex] = currentColor;
      
      // Diagonal symmetry
      const diagMirrorIndex = mirrorRow * gridSize + mirrorCol;
      newFilled[diagMirrorIndex] = currentColor;
    }
    
    setFilledTiles(newFilled);
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFilledTiles({});
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    saveArtwork({ type: 'pattern', imageData: 'pattern-data' });
    onClose();
  };

  const filledCount = Object.keys(filledTiles).length;
  const totalTiles = gridSize * gridSize;
  const progress = filledCount / totalTiles;
  const isComplete = filledCount === totalTiles;

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
            <Text className="text-3xl mr-2">🔷</Text>
            <Text className="text-xl font-bold" style={{ color: '#5B4B8A' }}>
              Patterns
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

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          {/* Progress */}
          <View className="px-6 pt-4">
            <View 
              className="rounded-2xl p-4"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-bold" style={{ color: '#5B4B8A' }}>
                  {isComplete ? '🎉 Complete!' : 'Keep going!'}
                </Text>
                <Text className="text-sm" style={{ color: '#8B7BA8' }}>
                  {filledCount}/{totalTiles} tiles
                </Text>
              </View>
              <View 
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: '#F0E6FF' }}
              >
                <View 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${progress * 100}%`,
                    backgroundColor: isComplete ? '#7FE5A8' : '#A78BFA',
                  }}
                />
              </View>
            </View>
          </View>

          {/* Controls */}
          <View className="px-6 pt-4 flex-row justify-between">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSymmetryMode(!symmetryMode);
              }}
              className="flex-1 mr-2 rounded-2xl p-4 flex-row items-center justify-center"
              style={{
                backgroundColor: symmetryMode ? '#A78BFA' : '#FFFFFF',
              }}
            >
              <FlipHorizontal size={20} color={symmetryMode ? '#FFFFFF' : '#5B4B8A'} />
              <Text 
                className="font-bold ml-2"
                style={{ color: symmetryMode ? '#FFFFFF' : '#5B4B8A' }}
              >
                Symmetry
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setGridSize(gridSize === 6 ? 8 : gridSize === 8 ? 4 : 6);
                setFilledTiles({});
              }}
              className="flex-1 mx-2 rounded-2xl p-4 flex-row items-center justify-center"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <Grid3X3 size={20} color="#5B4B8A" />
              <Text className="font-bold ml-2" style={{ color: '#5B4B8A' }}>
                {gridSize}x{gridSize}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleClear}
              className="rounded-2xl p-4 items-center justify-center"
              style={{ backgroundColor: '#FF6B6B20' }}
            >
              <Trash2 size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>

          {/* Grid */}
          <View className="px-6 pt-4">
            <View
              className="rounded-3xl p-3"
              style={{
                backgroundColor: '#FFFFFF',
                shadowColor: '#5B4B8A',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {tiles.map((index) => {
                  const tileSize = (width - 64) / gridSize;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleTileFill(index)}
                      style={{
                        width: tileSize,
                        height: tileSize,
                        padding: 2,
                      }}
                    >
                      <Animated.View
                        className="flex-1 rounded-xl"
                        style={{
                          backgroundColor: filledTiles[index] || '#F0E6FF',
                          shadowColor: filledTiles[index] || '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: filledTiles[index] ? 0.3 : 0,
                          shadowRadius: 4,
                          elevation: filledTiles[index] ? 3 : 0,
                        }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {isComplete && (
            <View className="px-6 pt-4">
              <Animated.View 
                className="rounded-2xl p-5"
                style={{ 
                  backgroundColor: '#7FE5A8',
                  shadowColor: '#7FE5A8',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Text className="text-center text-xl font-bold text-white">
                  🎉 Amazing Pattern! 🎉
                </Text>
                <Text className="text-center text-base text-white mt-1 opacity-90">
                  You're a pattern master! ✨
                </Text>
              </Animated.View>
            </View>
          )}
        </ScrollView>

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
