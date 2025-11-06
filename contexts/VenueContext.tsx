import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { DateStatus } from '@/constants/colors';
import { DateBooking } from '@/types/venue';
import { trpc } from '@/lib/trpc';

const DEFAULT_HOLD_DURATION = 7 * 24 * 60 * 60 * 1000;

export const [VenueProvider, useVenue] = createContextHook(() => {
  const [bookings, setBookings] = useState<Record<string, DateBooking>>({});
  const [holdDuration, setHoldDuration] = useState<number>(DEFAULT_HOLD_DURATION);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const bookingsQuery = trpc.calendar.getBookings.useQuery(undefined, {
    refetchInterval: 30000,
  });
  
  const setBookingMutation = trpc.calendar.setBooking.useMutation();
  const updateHoldDurationMutation = trpc.calendar.updateHoldDuration.useMutation();

  useEffect(() => {
    if (bookingsQuery.data) {
      setBookings(bookingsQuery.data.bookings);
      setHoldDuration(bookingsQuery.data.holdDuration);
      setIsLoaded(true);
    }
  }, [bookingsQuery.data]);



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
    const interval = setInterval(() => {
      checkExpiredHolds();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkExpiredHolds]);

  const setDateStatus = useCallback((dateStr: string, status: DateStatus, note?: string, plannerId?: string, customHoldDays?: number) => {
    const booking: DateBooking = {
      date: dateStr,
      status,
      setAt: Date.now(),
      note,
      plannerId,
      customHoldDays: status === 'on-hold' ? customHoldDays : undefined,
    };

    setBookingMutation.mutate(booking, {
      onSuccess: () => {
        bookingsQuery.refetch();
      },
    });
  }, [setBookingMutation, bookingsQuery]);

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
    updateHoldDurationMutation.mutate({ days }, {
      onSuccess: () => {
        bookingsQuery.refetch();
      },
    });
  }, [updateHoldDurationMutation, bookingsQuery]);

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
