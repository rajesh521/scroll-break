import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, PanResponder, Dimensions } from 'react-native';
import { Canvas, Path, Skia, SkPath } from '@shopify/react-native-skia';
import { X, Undo, Save, Trash2, Minus, Plus } from 'lucide-react-native';
import { useAppContext } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface DrawingCanvasProps {
  onClose: () => void;
}

interface PathData {
  path: SkPath;
  color: string;
  strokeWidth: number;
}

export default function DrawingCanvas({ onClose }: DrawingCanvasProps) {
  const { saveArtwork } = useAppContext();
  const [paths, setPaths] = useState<PathData[]>([]);
  const [currentColor, setCurrentColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(8);
  const [currentPath, setCurrentPath] = useState<PathData | null>(null);
  const pathRef = useRef<PathData | null>(null);

  const colors = ['#FF6B6B', '#FFD93D', '#6BCFFF', '#7FE5A8', '#A78BFA', '#FF8DC7', '#FFA94D', '#5B4B8A', '#FFFFFF', '#3A3A3A'];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const path = Skia.Path.Make();
        path.moveTo(locationX, locationY);
        pathRef.current = { path, color: currentColor, strokeWidth: brushSize };
        setCurrentPath(pathRef.current);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        if (pathRef.current) {
          pathRef.current.path.lineTo(locationX, locationY);
          setCurrentPath({ ...pathRef.current });
        }
      },
      onPanResponderRelease: () => {
        if (pathRef.current) {
          setPaths(prev => [...prev, pathRef.current!]);
          pathRef.current = null;
          setCurrentPath(null);
        }
      },
    })
  ).current;

  const handleUndo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPaths(paths.slice(0, -1));
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPaths([]);
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    saveArtwork({ type: 'drawing', imageData: 'drawing-data' });
    onClose();
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
            <Text className="text-4xl mr-2">🖌️</Text>
            <Text className="text-xl font-bold" style={{ color: '#5B4B8A' }}>
              Free Drawing
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
        <View 
          className="flex-1 mx-4 mt-4 rounded-3xl overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            shadowColor: '#5B4B8A',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          }}
          {...panResponder.panHandlers}
        >
          <Canvas style={{ flex: 1 }}>
            {paths.map((p, index) => (
              <Path
                key={`path-${index}`}
                path={p.path}
                color={p.color}
                style="stroke"
                strokeWidth={p.strokeWidth}
                strokeCap="round"
                strokeJoin="round"
              />
            ))}
            {currentPath && (
              <Path
                path={currentPath.path}
                color={currentPath.color}
                style="stroke"
                strokeWidth={currentPath.strokeWidth}
                strokeCap="round"
                strokeJoin="round"
              />
            )}
          </Canvas>
        </View>

        {/* Tools */}
        <View className="px-4 py-4">
          {/* Brush Size */}
          <View 
            className="rounded-2xl p-4 mb-4 flex-row items-center justify-between"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <Text className="font-bold" style={{ color: '#5B4B8A' }}>Brush Size</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setBrushSize(Math.max(2, brushSize - 2));
                }}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: '#F0E6FF' }}
              >
                <Minus size={18} color="#5B4B8A" />
              </TouchableOpacity>
              <View 
                className="mx-4 items-center justify-center"
                style={{ width: 40 }}
              >
                <View 
                  className="rounded-full"
                  style={{ 
                    width: brushSize * 2, 
                    height: brushSize * 2, 
                    backgroundColor: currentColor,
                    maxWidth: 40,
                    maxHeight: 40,
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setBrushSize(Math.min(20, brushSize + 2));
                }}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: '#F0E6FF' }}
              >
                <Plus size={18} color="#5B4B8A" />
              </TouchableOpacity>
            </View>
            <View className="flex-row">
              <TouchableOpacity 
                onPress={handleUndo} 
                className="w-10 h-10 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: '#FFD93D30' }}
              >
                <Undo size={18} color="#FFA94D" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleClear}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: '#FF6B6B30' }}
              >
                <Trash2 size={18} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Color Picker */}
          <View 
            className="rounded-2xl p-4 flex-row flex-wrap justify-center"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCurrentColor(color);
                }}
                className="m-1.5"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
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
          </View>
        </View>
      </View>
    </Modal>
  );
}
