import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Artwork {
  id: string;
  type: 'drawing' | 'coloring' | 'pattern';
  imageData: string;
  timestamp: number;
}

interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlockedAt: number;
}

interface DailyStats {
  date: string;
  scrollTime: number;
  breaksTaken: number;
}

interface TimerSettings {
  warningMinutes: number;
  breakMinutes: number;
  breakDuration: number;
}

interface AppContextType {
  scrollTime: number;
  isBreakActive: boolean;
  showWarning: boolean;
  artworks: Artwork[];
  achievements: Achievement[];
  weeklyStats: DailyStats[];
  todayStats: DailyStats;
  timerSettings: TimerSettings;
  isTimerRunning: boolean;
  startScrollTracking: () => void;
  stopScrollTracking: () => void;
  triggerBreak: () => void;
  completeBreak: () => void;
  saveArtwork: (artwork: Omit<Artwork, 'id' | 'timestamp'>) => void;
  deleteArtwork: (id: string) => void;
  resetScrollTimer: () => void;
  updateTimerSettings: (settings: Partial<TimerSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  warningMinutes: 12,
  breakMinutes: 15,
  breakDuration: 5,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [scrollTime, setScrollTime] = useState(0);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(DEFAULT_TIMER_SETTINGS);
  const [todayStats, setTodayStats] = useState<DailyStats>({
    date: new Date().toISOString().split('T')[0],
    scrollTime: 0,
    breaksTaken: 0,
  });

  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breakStartTimeRef = useRef<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const warningTimeSeconds = timerSettings.warningMinutes * 60;
    const breakTimeSeconds = timerSettings.breakMinutes * 60;
    
    if (scrollTime >= warningTimeSeconds && !showWarning && !isBreakActive) {
      setShowWarning(true);
    }
    if (scrollTime >= breakTimeSeconds && !isBreakActive) {
      triggerBreak();
    }
  }, [scrollTime, timerSettings]);

  const loadData = async () => {
    try {
      const [artworksData, achievementsData, statsData, settingsData] = await Promise.all([
        AsyncStorage.getItem('artworks'),
        AsyncStorage.getItem('achievements'),
        AsyncStorage.getItem('weeklyStats'),
        AsyncStorage.getItem('timerSettings'),
      ]);

      if (artworksData) setArtworks(JSON.parse(artworksData));
      if (achievementsData) setAchievements(JSON.parse(achievementsData));
      if (settingsData) setTimerSettings(JSON.parse(settingsData));
      if (statsData) {
        const stats = JSON.parse(statsData);
        setWeeklyStats(stats);
        const today = new Date().toISOString().split('T')[0];
        const todayStat = stats.find((s: DailyStats) => s.date === today);
        if (todayStat) setTodayStats(todayStat);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const startScrollTracking = () => {
    if (scrollIntervalRef.current) return;
    setIsTimerRunning(true);
    scrollIntervalRef.current = setInterval(() => {
      setScrollTime((prev) => prev + 1);
    }, 1000);
  };

  const stopScrollTracking = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    setIsTimerRunning(false);
  };

  const triggerBreak = () => {
    setIsBreakActive(true);
    setShowWarning(false);
    stopScrollTracking();
    breakStartTimeRef.current = Date.now();
    
    const updatedStats = { ...todayStats, scrollTime: scrollTime, breaksTaken: todayStats.breaksTaken + 1 };
    setTodayStats(updatedStats);
    updateWeeklyStats(updatedStats);
  };

  const completeBreak = () => {
    setIsBreakActive(false);
    resetScrollTimer();
    checkAchievements();
  };

  const resetScrollTimer = () => {
    setScrollTime(0);
    setShowWarning(false);
  };

  const updateTimerSettings = async (settings: Partial<TimerSettings>) => {
    const newSettings = { ...timerSettings, ...settings };
    setTimerSettings(newSettings);
    await AsyncStorage.setItem('timerSettings', JSON.stringify(newSettings));
  };

  const saveArtwork = async (artwork: Omit<Artwork, 'id' | 'timestamp'>) => {
    const newArtwork: Artwork = {
      ...artwork,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    const updatedArtworks = [newArtwork, ...artworks];
    setArtworks(updatedArtworks);
    await AsyncStorage.setItem('artworks', JSON.stringify(updatedArtworks));
  };

  const deleteArtwork = async (id: string) => {
    const updatedArtworks = artworks.filter((a) => a.id !== id);
    setArtworks(updatedArtworks);
    await AsyncStorage.setItem('artworks', JSON.stringify(updatedArtworks));
  };

  const updateWeeklyStats = async (stats: DailyStats) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = weeklyStats.filter((s) => s.date !== today);
    updated.push(stats);
    
    const sorted = updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);
    setWeeklyStats(sorted);
    await AsyncStorage.setItem('weeklyStats', JSON.stringify(sorted));
  };

  const checkAchievements = async () => {
    const newAchievements: Achievement[] = [];
    
    if (todayStats.breaksTaken === 1 && !achievements.find(a => a.id === 'first_break')) {
      newAchievements.push({
        id: 'first_break',
        title: 'First Break! 🎉',
        icon: '🎉',
        unlockedAt: Date.now(),
      });
    }
    
    if (todayStats.breaksTaken >= 5 && !achievements.find(a => a.id === 'five_breaks')) {
      newAchievements.push({
        id: 'five_breaks',
        title: '5 Breaks! 🌟',
        icon: '🌟',
        unlockedAt: Date.now(),
      });
    }
    
    if (artworks.length >= 10 && !achievements.find(a => a.id === 'creative_master')) {
      newAchievements.push({
        id: 'creative_master',
        title: 'Creative Master 🎨',
        icon: '🎨',
        unlockedAt: Date.now(),
      });
    }

    if (newAchievements.length > 0) {
      const updated = [...achievements, ...newAchievements];
      setAchievements(updated);
      await AsyncStorage.setItem('achievements', JSON.stringify(updated));
    }
  };

  return (
    <AppContext.Provider
      value={{
        scrollTime,
        isBreakActive,
        showWarning,
        artworks,
        achievements,
        weeklyStats,
        todayStats,
        timerSettings,
        isTimerRunning,
        startScrollTracking,
        stopScrollTracking,
        triggerBreak,
        completeBreak,
        saveArtwork,
        deleteArtwork,
        resetScrollTimer,
        updateTimerSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
