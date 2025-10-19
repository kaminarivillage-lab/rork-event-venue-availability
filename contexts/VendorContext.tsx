import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import type { Vendor } from '@/types/vendor';

const STORAGE_KEY = '@venue_vendors';

export const [VendorProvider, useVendors] = createContextHook(() => {
  const [vendors, setVendors] = useState<Record<string, Vendor>>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVendors(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveVendors = async (newVendors: Record<string, Vendor>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newVendors));
      setVendors(newVendors);
    } catch (error) {
      console.error('Error saving vendors:', error);
    }
  };

  const addVendor = useCallback((
    name: string,
    telephone: string,
    email: string,
    website?: string,
    instagram?: string
  ) => {
    const id = Date.now().toString();
    const newVendor: Vendor = {
      id,
      name,
      telephone,
      email,
      website,
      instagram,
      createdAt: Date.now(),
    };
    const updated = { ...vendors, [id]: newVendor };
    saveVendors(updated);
  }, [vendors]);

  const updateVendor = useCallback((id: string, updates: Partial<Omit<Vendor, 'id' | 'createdAt'>>) => {
    const vendor = vendors[id];
    if (!vendor) return;

    const updated = {
      ...vendors,
      [id]: {
        ...vendor,
        ...updates,
      },
    };
    saveVendors(updated);
  }, [vendors]);

  const deleteVendor = useCallback((id: string) => {
    const updated = { ...vendors };
    delete updated[id];
    saveVendors(updated);
  }, [vendors]);

  const getVendorById = useCallback((id: string): Vendor | undefined => {
    return vendors[id];
  }, [vendors]);

  const getAllVendors = useMemo(() => {
    return Object.values(vendors).sort((a, b) => b.createdAt - a.createdAt);
  }, [vendors]);

  return useMemo(() => ({
    vendors,
    getAllVendors,
    getVendorById,
    addVendor,
    updateVendor,
    deleteVendor,
    isLoaded,
  }), [vendors, getAllVendors, getVendorById, addVendor, updateVendor, deleteVendor, isLoaded]);
});
