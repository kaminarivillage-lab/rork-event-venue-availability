import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Calendar as CalendarIcon, MapPin, Filter } from 'lucide-react-native';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import EventForm from '@/components/EventForm';
import EventDetails from '@/components/EventDetails';
import BlurredMoney from '@/components/BlurredMoney';
import { AutumnColors } from '@/constants/colors';
import { VenueEvent } from '@/types/venue';

const EVENT_TYPE_LABELS: Record<string, string> = {
  'wedding': 'Wedding',
  'baptism': 'Baptism',
  'kids-party': 'Kids Party',
  'corporate-dinner': 'Corporate Dinner',
  'meetings': 'Meeting',
  'other': 'Other',
};

export default function EventsScreen() {
  const { getAllEvents } = useEvents();
  const { user, isPlanner } = useAuth();
  const insets = useSafeAreaInsets();
  const [showAddEvent, setShowAddEvent] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<VenueEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<VenueEvent | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    if (isPlanner && user?.plannerId) {
      return getAllEvents.filter(event => event.financials.plannerId === user.plannerId);
    }
    return getAllEvents;
  }, [getAllEvents, isPlanner, user]);

  console.log('EventsScreen render - filteredEvents.length:', filteredEvents.length);
  console.log('EventsScreen - filtered events:', filteredEvents.map(e => ({ date: e.date, name: e.name })));

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = filteredEvents.filter(event => {
    const isUpcoming = event.date >= todayStr;
    const matchesType = selectedEventType === 'all' || event.eventType === selectedEventType;
    console.log('Comparing:', event.date, 'vs today:', todayStr, 'isUpcoming:', isUpcoming, 'matchesType:', matchesType);
    return isUpcoming && matchesType;
  });

  console.log('EventsScreen - upcomingEvents.length:', upcomingEvents.length);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        {!isPlanner && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddEvent(true)}
            testID="add-event-button"
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Event</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <Filter size={16} color={AutumnColors.warmGray} />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedEventType === 'all' && styles.filterChipActive
            ]}
            onPress={() => setSelectedEventType('all')}
          >
            <Text style={[
              styles.filterChipText,
              selectedEventType === 'all' && styles.filterChipTextActive
            ]}>All Events</Text>
          </TouchableOpacity>
          {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterChip,
                selectedEventType === key && styles.filterChipActive
              ]}
              onPress={() => setSelectedEventType(key)}
            >
              <Text style={[
                styles.filterChipText,
                selectedEventType === key && styles.filterChipTextActive
              ]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {upcomingEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <CalendarIcon size={48} color={AutumnColors.warmGray} />
            <Text style={styles.emptyStateTitle}>No Upcoming Events</Text>
            <Text style={styles.emptyStateText}>
              Add your first event to get started
            </Text>
          </View>
        ) : (
          upcomingEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => setSelectedEvent(event)}
              testID={`event-card-${event.id}`}
            >
              <View style={styles.eventHeader}>
                <View style={styles.eventDateBadge}>
                  <Text style={styles.eventDateDay}>
                    {new Date(event.date).getDate()}
                  </Text>
                  <Text style={styles.eventDateMonth}>
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.eventInfo}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <View style={styles.eventMeta}>
                    <View style={styles.eventMetaItem}>
                      <CalendarIcon size={14} color={AutumnColors.warmGray} />
                      <Text style={styles.eventMetaText}>
                        {formatDate(event.date)}
                      </Text>
                    </View>
                    {event.timeline && (
                      <View style={styles.eventMetaItem}>
                        <MapPin size={14} color={AutumnColors.warmGray} />
                        <Text style={styles.eventMetaText}>
                          {event.timeline.startTime} - {event.timeline.endTime}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.eventFooter}>
                <View style={styles.eventType}>
                  <Text style={styles.eventTypeText}>{EVENT_TYPE_LABELS[event.eventType] || event.eventType}</Text>
                  {event.weddingCategory && (
                    <Text style={styles.eventCategoryText}> • {event.weddingCategory}</Text>
                  )}
                </View>
                {event.eventType !== 'meetings' && (
                  <View style={styles.eventFooterRight}>
                    <View style={[
                      styles.paymentBadge,
                      event.financials.payment.status === 'received' 
                        ? styles.paymentReceivedBadge 
                        : styles.paymentPendingBadge
                    ]}>
                      <Text style={[
                        styles.paymentText,
                        event.financials.payment.status === 'received'
                          ? styles.paymentReceivedText
                          : styles.paymentPendingText
                      ]}>
                        {event.financials.payment.status === 'received' ? 'Received' : 'Pending'}
                      </Text>
                    </View>
                    <View style={styles.eventFinancials}>
                      <BlurredMoney
                        amount={event.financials.venueRentalFee}
                        style={styles.eventPrice}
                      />
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <EventForm
        visible={showAddEvent || editingEvent !== null}
        onClose={() => {
          setShowAddEvent(false);
          setEditingEvent(null);
        }}
        editEvent={editingEvent}
      />

      {selectedEvent && (
        <EventDetails
          visible={selectedEvent !== null && editingEvent === null}
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={(event) => {
            setEditingEvent(event);
            setSelectedEvent(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AutumnColors.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: AutumnColors.paleGold,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: AutumnColors.softBrown,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AutumnColors.terracotta,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    shadowColor: AutumnColors.terracotta,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: AutumnColors.softBrown,
    marginTop: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: AutumnColors.warmGray,
    textAlign: 'center' as const,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: AutumnColors.warmGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: AutumnColors.terracotta,
  },
  eventHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  eventDateBadge: {
    backgroundColor: AutumnColors.paleGold,
    borderRadius: 12,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AutumnColors.mutedOrange,
  },
  eventDateDay: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: AutumnColors.softBrown,
  },
  eventDateMonth: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: AutumnColors.terracotta,
    marginTop: -2,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: AutumnColors.softBrown,
  },
  eventMeta: {
    gap: 8,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: 13,
    color: AutumnColors.warmGray,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AutumnColors.paleGold,
  },
  eventFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  paymentReceivedBadge: {
    backgroundColor: '#E8F5E9',
  },
  paymentPendingBadge: {
    backgroundColor: '#FFEBEE',
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  paymentReceivedText: {
    color: '#2E7D32',
  },
  paymentPendingText: {
    color: '#C62828',
  },
  eventType: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventTypeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: AutumnColors.sage,
  },
  eventCategoryText: {
    fontSize: 13,
    color: AutumnColors.warmGray,
  },
  eventFinancials: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventPrice: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: AutumnColors.softBrown,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: AutumnColors.paleGold,
    gap: 8,
  },
  filterScrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AutumnColors.cream,
    borderWidth: 1,
    borderColor: AutumnColors.paleGold,
  },
  filterChipActive: {
    backgroundColor: AutumnColors.terracotta,
    borderColor: AutumnColors.terracotta,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: AutumnColors.warmGray,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
});
