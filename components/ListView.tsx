import React, { useState, Dispatch, SetStateAction } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, Clock, DollarSign, Calendar as CalendarIcon, List, User } from 'lucide-react-native';
import { AutumnColors, StatusColors } from '@/constants/colors';
import { useVenue } from '@/contexts/VenueContext';
import { useEvents } from '@/contexts/EventContext';
import { usePlanners } from '@/contexts/PlannerContext';
import { DateBooking } from '@/types/venue';
import EventDetails from './EventDetails';
import StatsCard from './StatsCard';

const EVENT_TYPE_LABELS: Record<string, string> = {
  'wedding': 'Wedding',
  'baptism': 'Baptism',
  'kids-party': 'Kids Party',
  'corporate-dinner': 'Corporate Dinner',
  'other': 'Other',
};

interface ListViewProps {
  bookedCount: number;
  onHoldCount: number;
  total: number;
  viewMode: 'calendar' | 'list';
  setViewMode: Dispatch<SetStateAction<'calendar' | 'list'>>;
}

export default function ListView({ bookedCount, onHoldCount, total, viewMode, setViewMode }: ListViewProps) {
  const { getAllBookings, holdDuration } = useVenue();
  const { getEventByDate } = useEvents();
  const { getPlannerById } = usePlanners();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showEventDetails, setShowEventDetails] = useState<boolean>(false);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short' as const, 
      month: 'short' as const, 
      day: 'numeric' as const, 
      year: 'numeric' as const 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getTimeRemaining = (booking: DateBooking): string => {
    if (booking.status !== 'on-hold') return '';
    
    const now = Date.now();
    const expiresAt = booking.setAt + holdDuration;
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    return `${hours}h remaining`;
  };

  const groupedBookings = getAllBookings.reduce<Record<string, DateBooking[]>>((acc, booking) => {
    const status = booking.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(booking);
    return acc;
  }, {});

  const handleBookingPress = (booking: DateBooking) => {
    const event = getEventByDate(booking.date);
    if (event) {
      setSelectedEventId(event.id);
      setShowEventDetails(true);
    }
  };

  const handleCloseDetails = () => {
    setShowEventDetails(false);
    setSelectedEventId(null);
  };

  const renderSection = (title: string, bookings: DateBooking[], color: string) => {
    if (!bookings || bookings.length === 0) return null;

    return (
      <View style={styles.section} key={title}>
        <View style={styles.sectionHeader}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCount}>({bookings.length})</Text>
        </View>
        
        {bookings.map((booking) => {
          const event = getEventByDate(booking.date);
          
          return (
            <TouchableOpacity 
              key={booking.date} 
              style={styles.bookingCard}
              onPress={() => handleBookingPress(booking)}
              disabled={!event}
            >
              <View style={styles.bookingHeader}>
                <View style={styles.dateContainer}>
                  <Calendar size={18} color={AutumnColors.warmGray} />
                  <Text style={styles.dateText}>{formatDate(booking.date)}</Text>
                </View>
                
                {booking.status === 'on-hold' && (
                  <View style={styles.timeContainer}>
                    <Clock size={14} color={AutumnColors.mutedOrange} />
                    <Text style={styles.timeText}>{getTimeRemaining(booking)}</Text>
                  </View>
                )}
              </View>
              
              {event && (
                <View style={styles.eventInfo}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={styles.eventType}>{EVENT_TYPE_LABELS[event.eventType]}</Text>
                  {event.timeline && (
                    <Text style={styles.eventTime}>
                      {event.timeline.startTime} - {event.timeline.endTime}
                    </Text>
                  )}
                  <View style={styles.eventFinancials}>
                    <DollarSign size={14} color="#7FA979" />
                    <Text style={styles.eventRevenue}>
                      €{(event.financials.venueRentalFee + event.financials.incomeFromExtras).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
              
              {!event && booking.note && (
                <View style={styles.clientInfoContainer}>
                  <User size={14} color={AutumnColors.sage} />
                  <Text style={styles.clientText}>{booking.note}</Text>
                </View>
              )}
              
              {booking.plannerId && (
                <View style={styles.plannerInfoContainer}>
                  <Text style={styles.plannerLabel}>Planner:</Text>
                  <Text style={styles.plannerNameText}>
                    {getPlannerById(booking.plannerId)?.name || 'Unknown'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const selectedEvent = selectedEventId ? (getEventByDate(getAllBookings.find(b => getEventByDate(b.date)?.id === selectedEventId)?.date || '') || null) : null;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <StatsCard 
          bookedCount={bookedCount}
          onHoldCount={onHoldCount}
          total={total}
        />
        
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[styles.viewToggleButton, viewMode === 'calendar' && styles.viewToggleButtonActive]}
            onPress={() => setViewMode('calendar')}
            testID="toggle-calendar-view"
          >
            <CalendarIcon 
              size={20} 
              color={viewMode === 'calendar' ? '#FFFFFF' : AutumnColors.warmGray} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
            onPress={() => setViewMode('list')}
            testID="toggle-list-view"
          >
            <List 
              size={20} 
              color={viewMode === 'list' ? '#FFFFFF' : AutumnColors.warmGray} 
            />
          </TouchableOpacity>
        </View>

        {getAllBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={64} color={AutumnColors.warmGray} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptyText}>
              Tap on dates in the calendar to mark them as booked or on-hold
            </Text>
          </View>
        ) : (
          <>
            {renderSection('Booked', groupedBookings['booked'] || [], StatusColors.booked)}
            {renderSection('On Hold', groupedBookings['on-hold'] || [], StatusColors['on-hold'])}
          </>
        )}
      </ScrollView>

      <EventDetails
        visible={showEventDetails}
        onClose={handleCloseDetails}
        event={selectedEvent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AutumnColors.cream,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: AutumnColors.warmGray,
    opacity: 0.5,
    marginLeft: 4,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: AutumnColors.warmGray,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: AutumnColors.warmGray,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AutumnColors.paleGold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: AutumnColors.mutedOrange,
  },
  noteText: {
    fontSize: 14,
    color: AutumnColors.warmGray,
    opacity: 0.7,
    marginTop: 8,
    fontStyle: 'italic' as const,
  },
  clientInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: AutumnColors.paleGold,
  },
  clientText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: AutumnColors.sage,
  },
  plannerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: AutumnColors.paleGold,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  plannerLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
    opacity: 0.7,
  },
  plannerNameText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
  },
  eventInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AutumnColors.paleGold,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: AutumnColors.warmGray,
    marginBottom: 2,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: AutumnColors.warmGray,
    opacity: 0.8,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 13,
    color: AutumnColors.warmGray,
    opacity: 0.7,
    marginBottom: 6,
  },
  eventFinancials: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventRevenue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#7FA979',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: AutumnColors.warmGray,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 22,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: AutumnColors.cream,
  },
  viewToggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: AutumnColors.warmGray,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  viewToggleButtonActive: {
    backgroundColor: AutumnColors.sage,
  },
});
