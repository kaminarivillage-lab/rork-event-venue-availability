import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VenueEvent, EventType, WeddingCategory, EventTimeline, EventFinancials, MeetingDetails } from '@/types/venue';

const EVENTS_STORAGE_KEY = '@venue_events';

export const [EventProvider, useEvents] = createContextHook(() => {
  const [events, setEvents] = useState<Record<string, VenueEvent>>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, isLoaded]);

  const loadEvents = async () => {
    try {
      const stored = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Loaded events from storage:', Object.keys(parsed).length);
        setEvents(parsed);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveEvents = async () => {
    try {
      await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      console.log('Saved events to storage:', Object.keys(events).length);
    } catch (error) {
      console.error('Failed to save events:', error);
    }
  };

  const clearAllEvents = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(EVENTS_STORAGE_KEY);
      setEvents({});
      console.log('All events cleared from storage');
    } catch (error) {
      console.error('Failed to clear events:', error);
    }
  }, []);

  const addEvent = useCallback((
    name: string,
    date: string,
    eventType: EventType,
    timeline: EventTimeline | undefined,
    financials: EventFinancials,
    weddingCategory?: WeddingCategory,
    notes?: string,
    vendorIds?: string[],
    meetingDetails?: MeetingDetails
  ) => {
    const id = `${date}-${Date.now()}`;
    const newEvent: VenueEvent = {
      id,
      name,
      date,
      eventType,
      weddingCategory,
      timeline,
      meetingDetails,
      financials,
      notes,
      vendorIds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setEvents(prev => {
      const updated = {
        ...prev,
        [id]: newEvent,
      };
      console.log('Event added:', newEvent);
      console.log('Total events after add:', Object.keys(updated).length);
      return updated;
    });

    return id;
  }, []);

  const updateEvent = useCallback((
    id: string,
    updates: Partial<Omit<VenueEvent, 'id' | 'createdAt'>>
  ) => {
    setEvents(prev => {
      const existing = prev[id];
      if (!existing) {
        console.error('Event not found:', id);
        return prev;
      }

      return {
        ...prev,
        [id]: {
          ...existing,
          ...updates,
          updatedAt: Date.now(),
        },
      };
    });

    console.log('Event updated:', id);
  }, []);

  const deleteEvent = useCallback((id: string) => {
    console.log('Deleting event:', id);
    setEvents(prev => {
      const { [id]: removed, ...rest } = prev;
      console.log('Event deleted:', id, 'Remaining events:', Object.keys(rest).length);
      return rest;
    });
  }, []);

  const getEventByDate = useCallback((date: string): VenueEvent | undefined => {
    return Object.values(events).find(event => event.date === date);
  }, [events]);

  const getEventById = useCallback((id: string): VenueEvent | undefined => {
    return events[id];
  }, [events]);

  const getAllEvents = useMemo(() => {
    const allEvents = Object.values(events).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    console.log('getAllEvents computed, count:', allEvents.length);
    return allEvents;
  }, [events]);

  const getEventFinancialsSummary = useMemo(() => {
    let totalRental = 0;
    let totalExtras = 0;
    let totalCosts = 0;
    let totalCommissions = 0;

    Object.values(events).forEach(event => {
      totalRental += event.financials.venueRentalFee;
      totalExtras += event.financials.incomeFromExtras;
      totalCosts += event.financials.costs;
      totalCommissions += event.financials.plannerCommission || 0;
    });

    const totalIncome = totalRental + totalExtras;
    const totalAllCosts = totalCosts + totalCommissions;
    const netProfit = totalIncome - totalAllCosts;

    return {
      totalRental,
      totalExtras,
      totalIncome,
      totalCosts,
      totalCommissions,
      totalAllCosts,
      netProfit,
    };
  }, [events]);

  const getEventsByType = useCallback((eventType: EventType) => {
    return Object.values(events).filter(event => event.eventType === eventType);
  }, [events]);

  const getPendingPayments = useMemo(() => {
    return Object.values(events)
      .filter(event => event.financials.payment.status === 'pending')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  return useMemo(() => ({
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventByDate,
    getEventById,
    getAllEvents,
    getEventFinancialsSummary,
    getEventsByType,
    getPendingPayments,
    clearAllEvents,
    isLoaded,
  }), [
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventByDate,
    getEventById,
    getAllEvents,
    getEventFinancialsSummary,
    getEventsByType,
    getPendingPayments,
    clearAllEvents,
    isLoaded,
  ]);
});
