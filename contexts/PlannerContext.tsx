import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import type { Planner } from '@/types/venue';

const STORAGE_KEY = '@venue_planners';

export const [PlannerProvider, usePlanners] = createContextHook(() => {
  const [planners, setPlanners] = useState<Record<string, Planner>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadPlanners();
  }, []);

  const loadPlanners = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPlanners(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading planners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlanners = async (newPlanners: Record<string, Planner>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPlanners));
      setPlanners(newPlanners);
    } catch (error) {
      console.error('Error saving planners:', error);
    }
  };

  const addPlanner = useCallback(async (
    name: string,
    companyName: string,
    email: string,
    telephone: string,
    website?: string
  ) => {
    const id = Date.now().toString();
    const newPlanner: Planner = {
      id,
      name,
      companyName,
      email,
      telephone,
      website,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = { ...planners, [id]: newPlanner };
    await savePlanners(updated);
  }, [planners]);

  const updatePlanner = useCallback(async (id: string, updates: Partial<Omit<Planner, 'id' | 'createdAt'>>) => {
    const planner = planners[id];
    if (!planner) return;

    const updated = {
      ...planners,
      [id]: {
        ...planner,
        ...updates,
        updatedAt: Date.now(),
      },
    };
    await savePlanners(updated);
  }, [planners]);

  const deletePlanner = useCallback(async (id: string) => {
    const updated = { ...planners };
    delete updated[id];
    await savePlanners(updated);
  }, [planners]);

  const getPlannerById = useCallback((id: string): Planner | undefined => {
    return planners[id];
  }, [planners]);

  const getAllPlanners = useMemo(() => {
    return Object.values(planners).sort((a, b) => b.createdAt - a.createdAt);
  }, [planners]);

  return useMemo(() => ({
    planners,
    getAllPlanners,
    getPlannerById,
    addPlanner,
    updatePlanner,
    deletePlanner,
    isLoading,
  }), [planners, getAllPlanners, getPlannerById, addPlanner, updatePlanner, deletePlanner, isLoading]);
});
