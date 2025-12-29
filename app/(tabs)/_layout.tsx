import { Tabs } from 'expo-router';
import { Home, Palette, TrendingUp, Sparkles } from 'lucide-react-native';
import { View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { useEffect } from 'react';

function AnimatedIcon({ focused, children, color }: { focused: boolean; children: React.ReactNode; color: string }) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
      rotate.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }
  }, [focused]);

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
          backgroundColor: focused ? color + '25' : 'transparent',
          padding: 10,
          borderRadius: 18,
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#B8A8D4',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#5B4B8A',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          height: 85,
          paddingTop: 10,
          paddingBottom: 20,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon focused={focused} color="#FF6B6B">
              <Home size={22} color={focused ? '#FF6B6B' : color} strokeWidth={focused ? 2.5 : 2} />
            </AnimatedIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="creative"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon focused={focused} color="#A78BFA">
              <Palette size={22} color={focused ? '#A78BFA' : color} strokeWidth={focused ? 2.5 : 2} />
            </AnimatedIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon focused={focused} color="#7FE5A8">
              <TrendingUp size={22} color={focused ? '#7FE5A8' : color} strokeWidth={focused ? 2.5 : 2} />
            </AnimatedIcon>
          ),
        }}
      />
    </Tabs>
  );
}
