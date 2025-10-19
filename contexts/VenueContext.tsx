import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { DateStatus } from '@/constants/colors';
import { DateBooking } from '@/types/venue';

const STORAGE_KEY = 'venue_bookings';
const DEFAULT_HOLD_DURATION = 7 * 24 * 60 * 60 * 1000;

export const [VenueProvider, useVenue] = createContextHook(() => {
  const [bookings, setBookings] = useState<Record<string, DateBooking>>({});
  const [holdDuration, setHoldDuration] = useState<number>(DEFAULT_HOLD_DURATION);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as { bookings?: Record<string, DateBooking>; holdDuration?: number };
          setBookings(data.bookings || {});
          setHoldDuration(data.holdDuration || DEFAULT_HOLD_DURATION);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load bookings:', error);
        setIsLoaded(true);
      }
    };
    loadBookings();
  }, []);

  const saveBookings = useCallback(async () => {
    try {
      const data = {
        bookings,
        holdDuration,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save bookings:', error);
    }
  }, [bookings, holdDuration]);

  const checkExpiredHolds = useCallback(() => {
    const now = Date.now();
    const updated = { ...bookings };
    let hasChanges = false;

    Object.keys(updated).forEach((dateStr) => {
      const booking = updated[dateStr];
      if (booking && booking.status === 'on-hold') {
        const duration = booking.customHoldDays 
          ? booking.customHoldDays * 24 * 60 * 60 * 1000 
          : holdDuration;
        const expiresAt = booking.setAt + duration;
        if (now > expiresAt) {
          delete updated[dateStr];
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setBookings(updated);
    }
  }, [bookings, holdDuration]);



  useEffect(() => {
    if (isLoaded) {
      saveBookings();
    }
  }, [bookings, isLoaded, saveBookings]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkExpiredHolds();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkExpiredHolds]);

  const setDateStatus = useCallback((dateStr: string, status: DateStatus, note?: string, plannerId?: string, customHoldDays?: number) => {
    const updated = { ...bookings };

    if (status === 'available') {
      delete updated[dateStr];
    } else {
      updated[dateStr] = {
        date: dateStr,
        status,
        setAt: Date.now(),
        note,
        plannerId,
        customHoldDays: status === 'on-hold' ? customHoldDays : undefined,
      };
    }

    setBookings(updated);
  }, [bookings]);

  const getDateStatus = useCallback((dateStr: string): DateStatus => {
    const booking = bookings[dateStr];
    if (!booking) return 'available';

    if (booking.status === 'on-hold') {
      const now = Date.now();
      const duration = booking.customHoldDays 
        ? booking.customHoldDays * 24 * 60 * 60 * 1000 
        : holdDuration;
      const expiresAt = booking.setAt + duration;
      if (now > expiresAt) {
        return 'available';
      }
    }

    return booking.status;
  }, [bookings, holdDuration]);

  const stats = useMemo(() => {
    let bookedCount = 0;
    let onHoldCount = 0;
    const now = Date.now();

    Object.values(bookings).forEach((booking) => {
      if (booking.status === 'booked') {
        bookedCount++;
      } else if (booking.status === 'on-hold') {
        const duration = booking.customHoldDays 
          ? booking.customHoldDays * 24 * 60 * 60 * 1000 
          : holdDuration;
        const expiresAt = booking.setAt + duration;
        if (now <= expiresAt) {
          onHoldCount++;
        }
      }
    });

    return { bookedCount, onHoldCount, total: bookedCount + onHoldCount };
  }, [bookings, holdDuration]);

  const getAllBookings = useMemo(() => {
    const now = Date.now();
    return Object.values(bookings)
      .filter((booking) => {
        if (booking.status === 'on-hold') {
          const duration = booking.customHoldDays 
            ? booking.customHoldDays * 24 * 60 * 60 * 1000 
            : holdDuration;
          const expiresAt = booking.setAt + duration;
          return now <= expiresAt;
        }
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bookings, holdDuration]);

  const updateHoldDuration = useCallback((days: number) => {
    const milliseconds = days * 24 * 60 * 60 * 1000;
    setHoldDuration(milliseconds);
  }, []);

  const getHoldDurationDays = useCallback(() => {
    return Math.round(holdDuration / (24 * 60 * 60 * 1000));
  }, [holdDuration]);

  const getBookingByDate = useCallback((dateStr: string): DateBooking | undefined => {
    return bookings[dateStr];
  }, [bookings]);

  const getRemainingDays = useCallback((dateStr: string): number | null => {
    const booking = bookings[dateStr];
    if (!booking || booking.status !== 'on-hold') return null;

    const now = Date.now();
    const duration = booking.customHoldDays 
      ? booking.customHoldDays * 24 * 60 * 60 * 1000 
      : holdDuration;
    const expiresAt = booking.setAt + duration;
    const remainingMs = expiresAt - now;
    
    if (remainingMs <= 0) return 0;
    return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  }, [bookings, holdDuration]);

  return useMemo(() => ({
    bookings,
    setDateStatus,
    getDateStatus,
    getBookingByDate,
    getRemainingDays,
    stats,
    getAllBookings,
    isLoaded,
    holdDuration,
    updateHoldDuration,
    getHoldDurationDays,
  }), [bookings, setDateStatus, getDateStatus, getBookingByDate, getRemainingDays, stats, getAllBookings, isLoaded, holdDuration, updateHoldDuration, getHoldDurationDays]);
});
