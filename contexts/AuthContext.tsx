import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/venue';

const AUTH_STORAGE_KEY = '@venue_auth_user';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsedUser = JSON.parse(stored) as User;
        setUser(parsedUser);
        console.log('User loaded:', parsedUser);
      } else {
        const defaultAdmin: User = {
          id: 'admin-1',
          role: 'admin',
        };
        setUser(defaultAdmin);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultAdmin));
        console.log('Default admin user created');
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchToAdmin = useCallback(async () => {
    const adminUser: User = {
      id: 'admin-1',
      role: 'admin',
    };
    setUser(adminUser);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
    console.log('Switched to admin user');
  }, []);

  const switchToPlanner = useCallback(async (plannerId: string) => {
    console.log('switchToPlanner called with plannerId:', plannerId);
    const plannerUser: User = {
      id: `planner-${plannerId}`,
      role: 'planner',
      plannerId,
    };
    console.log('Setting planner user:', plannerUser);
    setUser(plannerUser);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(plannerUser));
    console.log('Switched to planner user - completed');
  }, []);

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);
  const isPlanner = useMemo(() => user?.role === 'planner', [user]);

  return useMemo(() => ({
    user,
    isLoading,
    isAdmin,
    isPlanner,
    switchToAdmin,
    switchToPlanner,
  }), [user, isLoading, isAdmin, isPlanner, switchToAdmin, switchToPlanner]);
});
