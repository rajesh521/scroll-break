import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Linking, Alert, ScrollView } from 'react-native';
import { Shield, Bell, Eye, CheckCircle, XCircle, AlertTriangle, ArrowRight, Settings } from 'lucide-react-native';
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
  Easing
} from 'react-native-reanimated';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';

interface PermissionsScreenProps {
  onComplete: () => void;
}

interface Permission {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  granted: boolean;
  androidOnly?: boolean;
}

export default function PermissionsScreen({ onComplete }: PermissionsScreenProps) {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'overlay',
      title: 'Display Over Other Apps',
      description: 'Required to show creative breaks on top of any app your child is using (YouTube, Instagram, etc.)',
      icon: <Eye size={24} color="#A78BFA" />,
      required: true,
      granted: false,
      androidOnly: true,
    },
    {
      id: 'notification',
      title: 'Notifications',
      description: 'To remind you when screen time limits are reached and show break progress',
      icon: <Bell size={24} color="#FFD93D" />,
      required: true,
      granted: false,
    },
    {
      id: 'background',
      title: 'Background Activity',
      description: 'To keep tracking screen time even when the app is in the background',
      icon: <Shield size={24} color="#7FE5A8" />,
      required: true,
      granted: false,
      androidOnly: true,
    },
  ]);

  const [allGranted, setAllGranted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const scale = useSharedValue(0.9);
  const warningShake = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    checkInitialPermissions();
  }, []);

  const checkInitialPermissions = async () => {
    // Check stored permissions
    const overlayGranted = await AsyncStorage.getItem('overlay_permission_granted');
    const notificationGranted = await AsyncStorage.getItem('notification_permission_granted');
    const backgroundGranted = await AsyncStorage.getItem('background_permission_granted');

    setPermissions(prev => prev.map(p => {
      if (p.id === 'overlay') return { ...p, granted: overlayGranted === 'true' };
      if (p.id === 'notification') return { ...p, granted: notificationGranted === 'true' };
      if (p.id === 'background') return { ...p, granted: backgroundGranted === 'true' };
      return p;
    }));
  };

  useEffect(() => {
    const applicablePermissions = permissions.filter(p => 
      !p.androidOnly || Platform.OS === 'android'
    );
    const allApplicableGranted = applicablePermissions
      .filter(p => p.required)
      .every(p => p.granted);
    setAllGranted(allApplicableGranted);
  }, [permissions]);

  const handlePermissionRequest = async (permissionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (Platform.OS !== 'android' && permissions.find(p => p.id === permissionId)?.androidOnly) {
      // Auto-grant for iOS since these features aren't available
      setPermissions(prev => prev.map(p => 
        p.id === permissionId ? { ...p, granted: true } : p
      ));
      await AsyncStorage.setItem(`${permissionId}_permission_granted`, 'true');
      return;
    }

    switch (permissionId) {
      case 'overlay':
        Alert.alert(
          '🔒 Display Over Other Apps',
          'This permission allows Creative Break to show fun activities on top of other apps.\n\nWithout this, the app cannot interrupt doomscrolling on apps like YouTube or Instagram.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: async () => {
                try {
                  await Linking.openSettings();
                  // Show confirmation dialog
                  setTimeout(() => {
                    Alert.alert(
                      'Did you enable the permission?',
                      'Look for "Display over other apps" or "Draw over other apps" and enable it.',
                      [
                        { text: 'No', style: 'cancel' },
                        {
                          text: 'Yes, I enabled it',
                          onPress: async () => {
                            setPermissions(prev => prev.map(p => 
                              p.id === 'overlay' ? { ...p, granted: true } : p
                            ));
                            await AsyncStorage.setItem('overlay_permission_granted', 'true');
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          },
                        },
                      ]
                    );
                  }, 1000);
                } catch (error) {
                  Alert.alert('Error', 'Could not open settings. Please manually open Settings > Apps > Creative Break > Display over other apps');
                }
              },
            },
          ]
        );
        break;

      case 'notification':
        // For notifications, typically handled by expo-notifications
        setPermissions(prev => prev.map(p => 
          p.id === 'notification' ? { ...p, granted: true } : p
        ));
        await AsyncStorage.setItem('notification_permission_granted', 'true');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case 'background':
        Alert.alert(
          '⚡ Background Activity',
          'This allows the app to track time even when minimized.\n\nOn some devices, you may need to disable battery optimization for this app.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: async () => {
                try {
                  await Linking.openSettings();
                  setTimeout(() => {
                    Alert.alert(
                      'Did you allow background activity?',
                      'Look for "Battery optimization" or "Background restrictions" and allow unrestricted usage.',
                      [
                        { text: 'No', style: 'cancel' },
                        {
                          text: 'Yes, I enabled it',
                          onPress: async () => {
                            setPermissions(prev => prev.map(p => 
                              p.id === 'background' ? { ...p, granted: true } : p
                            ));
                            await AsyncStorage.setItem('background_permission_granted', 'true');
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          },
                        },
                      ]
                    );
                  }, 1000);
                } catch (error) {
                  Alert.alert('Error', 'Could not open settings');
                }
              },
            },
          ]
        );
        break;
    }
  };

  const handleContinue = async () => {
    if (!allGranted) {
      setShowWarning(true);
      warningShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 50 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem('permissions_complete', 'true');
    onComplete();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const warningStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: warningShake.value }],
  }));

  const PermissionIllustration = () => (
    <Svg width={200} height={160} viewBox="0 0 200 160">
      {/* Phone */}
      <Rect x="60" y="20" width="80" height="120" rx="12" fill="#5B4B8A" />
      <Rect x="65" y="30" width="70" height="100" rx="8" fill="#FFFFFF" />
      
      {/* App icons on phone */}
      <Rect x="72" y="40" width="20" height="20" rx="4" fill="#FF6B6B" />
      <Rect x="100" y="40" width="20" height="20" rx="4" fill="#6BCFFF" />
      <Rect x="72" y="68" width="20" height="20" rx="4" fill="#FFD93D" />
      <Rect x="100" y="68" width="20" height="20" rx="4" fill="#7FE5A8" />
      
      {/* Overlay effect */}
      <G opacity="0.9">
        <Rect x="50" y="10" width="100" height="140" rx="16" fill="#A78BFA" opacity="0.3" />
        <Circle cx="100" cy="80" r="30" fill="#A78BFA" />
        <Path d="M100 60 L100 80 L115 90" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />
      </G>
      
      {/* Shield icon */}
      <G transform="translate(150, 20)">
        <Path d="M20 5 L35 10 L35 25 Q35 40 20 50 Q5 40 5 25 L5 10 Z" fill="#7FE5A8" />
        <Path d="M15 25 L20 30 L30 18" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />
      </G>
      
      {/* Bell icon */}
      <G transform="translate(10, 100)">
        <Path d="M20 10 Q20 0 25 0 Q30 0 30 10 L30 25 L35 30 L15 30 L20 25 Z" fill="#FFD93D" />
        <Circle cx="25" cy="35" r="4" fill="#FFD93D" />
      </G>
    </Svg>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: '#FFF8F0' }}>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={containerStyle} className="px-6 pt-14">
          {/* Header */}
          <View className="items-center mb-6">
            <PermissionIllustration />
          </View>

          <Text className="text-3xl font-black text-center mb-2" style={{ color: '#5B4B8A' }}>
            We Need Your Help! 🛡️
          </Text>
          <Text className="text-base text-center mb-8" style={{ color: '#8B7BA8' }}>
            To protect your child from doomscrolling on ANY app, please grant these permissions
          </Text>

          {/* Permissions List */}
          <View className="mb-6">
            {permissions
              .filter(p => !p.androidOnly || Platform.OS === 'android')
              .map((permission, index) => (
              <Animated.View
                key={permission.id}
                style={[
                  {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: '#5B4B8A',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 4,
                    borderWidth: 2,
                    borderColor: permission.granted ? '#7FE5A8' : 'transparent',
                  },
                ]}
              >
                <View className="flex-row items-start">
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: permission.granted ? '#7FE5A820' : '#F0E6FF' }}
                  >
                    {permission.granted ? (
                      <CheckCircle size={24} color="#7FE5A8" />
                    ) : (
                      permission.icon
                    )}
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="font-bold text-base" style={{ color: '#5B4B8A' }}>
                        {permission.title}
                      </Text>
                      {permission.required && (
                        <View 
                          className="ml-2 px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: '#FF6B6B20' }}
                        >
                          <Text className="text-xs font-bold" style={{ color: '#FF6B6B' }}>
                            Required
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm" style={{ color: '#8B7BA8' }}>
                      {permission.description}
                    </Text>
                    
                    {!permission.granted && (
                      <TouchableOpacity
                        onPress={() => handlePermissionRequest(permission.id)}
                        className="mt-3 rounded-xl py-2.5 flex-row items-center justify-center"
                        style={{ backgroundColor: '#A78BFA' }}
                      >
                        <Settings size={16} color="#FFFFFF" />
                        <Text className="text-white font-bold ml-2">
                          Grant Permission
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Warning */}
          {showWarning && (
            <Animated.View 
              style={[
                warningStyle,
                {
                  backgroundColor: '#FF6B6B20',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: '#FF6B6B',
                }
              ]}
            >
              <View className="flex-row items-center">
                <AlertTriangle size={24} color="#FF6B6B" />
                <Text className="flex-1 ml-3 font-bold" style={{ color: '#FF6B6B' }}>
                  ⚠️ All permissions are required for the app to work properly. Without them, the app cannot show creative breaks over other apps.
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Info Box */}
          <View 
            className="rounded-2xl p-4 mb-6"
            style={{ backgroundColor: '#E8F5E920', borderWidth: 1, borderColor: '#7FE5A830' }}
          >
            <Text className="text-sm text-center" style={{ color: '#5B4B8A' }}>
              💡 These permissions are only used to show creative activities when screen time is up. We respect your privacy and don't collect any personal data.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Button */}
      <View 
        className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-4"
        style={{ backgroundColor: '#FFF8F0' }}
      >
        <TouchableOpacity
          onPress={handleContinue}
          className="rounded-2xl py-5 flex-row items-center justify-center"
          style={{
            backgroundColor: allGranted ? '#7FE5A8' : '#E5E7EB',
            shadowColor: allGranted ? '#7FE5A8' : '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: allGranted ? 0.4 : 0.1,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text 
            className="text-lg font-bold mr-2"
            style={{ color: allGranted ? '#FFFFFF' : '#9CA3AF' }}
          >
            {allGranted ? "Let's Go! 🚀" : "Grant All Permissions"}
          </Text>
          {allGranted && <ArrowRight size={22} color="#FFFFFF" />}
        </TouchableOpacity>
        
        {!allGranted && (
          <Text className="text-center text-sm mt-3" style={{ color: '#8B7BA8' }}>
            {permissions.filter(p => (!p.androidOnly || Platform.OS === 'android') && p.required && !p.granted).length} permission(s) remaining
          </Text>
        )}
      </View>
    </View>
  );
}
