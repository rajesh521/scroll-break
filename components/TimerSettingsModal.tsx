import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, Clock, Palette, Timer, Minus, Plus } from 'lucide-react-native';
import { useAppContext } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  Easing
} from 'react-native-reanimated';

interface TimerSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TimerSettingsModal({ visible, onClose }: TimerSettingsModalProps) {
  const { timerSettings, updateTimerSettings } = useAppContext();
  const [localSettings, setLocalSettings] = useState(timerSettings);
  
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 200 });
      setLocalSettings(timerSettings);
    } else {
      scale.value = withTiming(0.9);
      opacity.value = withTiming(0);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateTimerSettings(localSettings);
    onClose();
  };

  const adjustValue = (key: keyof typeof localSettings, increment: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = Math.max(1, Math.min(60, localSettings[key] + increment));
    setLocalSettings({ ...localSettings, [key]: newValue });
  };

  const presets = [
    { label: '5 min', warning: 4, break: 5 },
    { label: '10 min', warning: 8, break: 10 },
    { label: '15 min', warning: 12, break: 15 },
    { label: '20 min', warning: 17, break: 20 },
    { label: '30 min', warning: 25, break: 30 },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(91, 75, 138, 0.4)' }}>
        <Animated.View
          style={[
            animatedStyle,
            {
              width: '90%',
              maxHeight: '80%',
              backgroundColor: '#FFFFFF',
              borderRadius: 32,
              overflow: 'hidden',
              shadowColor: '#5B4B8A',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.25,
              shadowRadius: 32,
              elevation: 20,
            },
          ]}
        >
          {/* Header */}
          <View 
            className="px-6 py-5 flex-row items-center justify-between"
            style={{ backgroundColor: '#FFF8F0' }}
          >
            <View className="flex-row items-center">
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                style={{ backgroundColor: '#A78BFA20' }}
              >
                <Clock size={24} color="#A78BFA" />
              </View>
              <View>
                <Text className="text-xl font-bold" style={{ color: '#5B4B8A' }}>
                  Timer Settings
                </Text>
                <Text className="text-sm" style={{ color: '#8B7BA8' }}>
                  Customize your break schedule
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: '#F0E6FF' }}
            >
              <X size={20} color="#5B4B8A" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
            {/* Quick Presets */}
            <Text className="text-sm font-semibold mb-3" style={{ color: '#8B7BA8' }}>
              QUICK PRESETS
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              {presets.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setLocalSettings({
                      ...localSettings,
                      warningMinutes: preset.warning,
                      breakMinutes: preset.break,
                    });
                  }}
                  className="mr-3 px-5 py-3 rounded-2xl"
                  style={{
                    backgroundColor: localSettings.breakMinutes === preset.break ? '#A78BFA' : '#F0E6FF',
                  }}
                >
                  <Text 
                    className="font-bold"
                    style={{ 
                      color: localSettings.breakMinutes === preset.break ? '#FFFFFF' : '#5B4B8A' 
                    }}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Custom Settings */}
            <Text className="text-sm font-semibold mb-3" style={{ color: '#8B7BA8' }}>
              CUSTOM SETTINGS
            </Text>

            {/* Warning Time */}
            <View 
              className="rounded-3xl p-5 mb-4"
              style={{ backgroundColor: '#FFD93D15' }}
            >
              <View className="flex-row items-center mb-4">
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: '#FFD93D30' }}
                >
                  <Timer size={20} color="#FFA94D" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold" style={{ color: '#5B4B8A' }}>
                    Warning Time
                  </Text>
                  <Text className="text-xs" style={{ color: '#8B7BA8' }}>
                    When to show the warning banner
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center justify-center">
                <TouchableOpacity
                  onPress={() => adjustValue('warningMinutes', -1)}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <Minus size={20} color="#5B4B8A" />
                </TouchableOpacity>
                <View className="mx-6 items-center">
                  <Text className="text-4xl font-black" style={{ color: '#FFA94D' }}>
                    {localSettings.warningMinutes}
                  </Text>
                  <Text className="text-sm" style={{ color: '#8B7BA8' }}>minutes</Text>
                </View>
                <TouchableOpacity
                  onPress={() => adjustValue('warningMinutes', 1)}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <Plus size={20} color="#5B4B8A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Break Time */}
            <View 
              className="rounded-3xl p-5 mb-4"
              style={{ backgroundColor: '#FF6B6B15' }}
            >
              <View className="flex-row items-center mb-4">
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: '#FF6B6B30' }}
                >
                  <Clock size={20} color="#FF6B6B" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold" style={{ color: '#5B4B8A' }}>
                    Break Time
                  </Text>
                  <Text className="text-xs" style={{ color: '#8B7BA8' }}>
                    When to trigger creative break
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center justify-center">
                <TouchableOpacity
                  onPress={() => adjustValue('breakMinutes', -1)}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <Minus size={20} color="#5B4B8A" />
                </TouchableOpacity>
                <View className="mx-6 items-center">
                  <Text className="text-4xl font-black" style={{ color: '#FF6B6B' }}>
                    {localSettings.breakMinutes}
                  </Text>
                  <Text className="text-sm" style={{ color: '#8B7BA8' }}>minutes</Text>
                </View>
                <TouchableOpacity
                  onPress={() => adjustValue('breakMinutes', 1)}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <Plus size={20} color="#5B4B8A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Break Duration */}
            <View 
              className="rounded-3xl p-5 mb-6"
              style={{ backgroundColor: '#7FE5A815' }}
            >
              <View className="flex-row items-center mb-4">
                <View 
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: '#7FE5A830' }}
                >
                  <Palette size={20} color="#7FE5A8" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold" style={{ color: '#5B4B8A' }}>
                    Break Duration
                  </Text>
                  <Text className="text-xs" style={{ color: '#8B7BA8' }}>
                    How long the creative break lasts
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center justify-center">
                <TouchableOpacity
                  onPress={() => adjustValue('breakDuration', -1)}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <Minus size={20} color="#5B4B8A" />
                </TouchableOpacity>
                <View className="mx-6 items-center">
                  <Text className="text-4xl font-black" style={{ color: '#7FE5A8' }}>
                    {localSettings.breakDuration}
                  </Text>
                  <Text className="text-sm" style={{ color: '#8B7BA8' }}>minutes</Text>
                </View>
                <TouchableOpacity
                  onPress={() => adjustValue('breakDuration', 1)}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <Plus size={20} color="#5B4B8A" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View className="px-6 pb-6">
            <TouchableOpacity
              onPress={handleSave}
              className="rounded-2xl py-5"
              style={{
                backgroundColor: '#A78BFA',
                shadowColor: '#A78BFA',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Text className="text-center text-lg font-bold text-white">
                Save Settings ✨
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
