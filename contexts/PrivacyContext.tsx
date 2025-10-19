import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIVACY_STORAGE_KEY = '@venue_privacy_blur';

export const [PrivacyProvider, usePrivacy] = createContextHook(() => {
  const [isMoneyBlurred, setIsMoneyBlurred] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadPrivacySetting();
  }, []);

  const loadPrivacySetting = async () => {
    try {
      const stored = await AsyncStorage.getItem(PRIVACY_STORAGE_KEY);
      if (stored !== null) {
        setIsMoneyBlurred(JSON.parse(stored) as boolean);
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMoneyBlur = useCallback(async () => {
    const newValue = !isMoneyBlurred;
    setIsMoneyBlurred(newValue);
    try {
      await AsyncStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(newValue));
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    }
  }, [isMoneyBlurred]);

  return useMemo(() => ({
    isMoneyBlurred,
    isLoading,
    toggleMoneyBlur,
  }), [isMoneyBlurred, isLoading, toggleMoneyBlur]);
});
