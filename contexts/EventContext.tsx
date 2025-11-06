import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { VenueEvent, EventType, WeddingCategory, EventTimeline, EventFinancials, MeetingDetails } from '@/types/venue';
import { trpc } from '@/lib/trpc';

export const [EventProvider, useEvents] = createContextHook(() => {
  const [events, setEvents] = useState<Record<string, VenueEvent>>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const eventsQuery = trpc.calendar.getEvents.useQuery(undefined, {
    refetchInterval: 30000,
  });
  
  const addEventMutation = trpc.calendar.addEvent.useMutation();
  const updateEventMutation = trpc.calendar.updateEvent.useMutation();
  const deleteEventMutation = trpc.calendar.deleteEvent.useMutation();

  useEffect(() => {
    if (eventsQuery.data) {
      setEvents(eventsQuery.data.events);
      setIsLoaded(true);
    }
  }, [eventsQuery.data]);

  const clearAllEvents = useCallback(async () => {
    const eventIds = Object.keys(events);
    for (const id of eventIds) {
      await deleteEventMutation.mutateAsync({ id });
    }
    eventsQuery.refetch();
  }, [events, deleteEventMutation, eventsQuery]);

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

    addEventMutation.mutate(newEvent, {
      onSuccess: () => {
        eventsQuery.refetch();
      },
    });

    return id;
  }, [addEventMutation, eventsQuery]);

  const updateEvent = useCallback((
    id: string,
    updates: Partial<Omit<VenueEvent, 'id' | 'createdAt'>>
  ) => {
    updateEventMutation.mutate({ id, updates }, {
      onSuccess: () => {
        eventsQuery.refetch();
      },
    });
  }, [updateEventMutation, eventsQuery]);

  const deleteEvent = useCallback((id: string) => {
    deleteEventMutation.mutate({ id }, {
      onSuccess: () => {
        eventsQuery.refetch();
      },
    });
  }, [deleteEventMutation, eventsQuery]);

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
