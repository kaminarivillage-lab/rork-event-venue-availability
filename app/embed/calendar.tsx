import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react-native';
import { AutumnColors, StatusColors } from '@/constants/colors';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EmbedCalendarScreen() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const bookingsQuery = trpc.calendar.getBookings.useQuery(undefined, {
    refetchInterval: 60000,
  });
  const eventsQuery = trpc.calendar.getEvents.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const bookings = bookingsQuery.data?.bookings || {};
  const holdDuration = bookingsQuery.data?.holdDuration || 7 * 24 * 60 * 60 * 1000;
  const events = eventsQuery.data?.events || {};
  const allEvents = Object.values(events);

  const dateStatuses = useMemo(() => {
    const statuses = new Map<string, 'available' | 'on-hold' | 'booked'>();
    const now = Date.now();
    
    Object.values(bookings).forEach(booking => {
      if (booking.status === 'on-hold') {
        const duration = booking.customHoldDays 
          ? booking.customHoldDays * 24 * 60 * 60 * 1000 
          : holdDuration;
        const expiresAt = booking.setAt + duration;
        if (now <= expiresAt) {
          statuses.set(booking.date, 'on-hold');
        }
      } else if (booking.status === 'booked') {
        statuses.set(booking.date, 'booked');
      }
    });
    
    allEvents.forEach(event => {
      statuses.set(event.date, 'booked');
    });
    
    return statuses;
  }, [allEvents, bookings, holdDuration]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getDateStatusInfo = useCallback((day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const statusInfo = dateStatuses.get(dateStr);
    return statusInfo || 'available';
  }, [year, month, dateStatuses]);

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const weeks: React.ReactElement[] = [];
    let days: React.ReactElement[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const status = getDateStatusInfo(day);
      const isToday = 
        day === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();

      const bgColor = StatusColors[status as keyof typeof StatusColors];
      const isBooked = status === 'booked';
      const isOnHold = status === 'on-hold';

      days.push(
        <View
          key={day}
          style={styles.dayCell}
        >
          <View
            style={[
              styles.dayContent,
              { backgroundColor: bgColor },
              isToday && styles.today,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                (isBooked || isOnHold) && styles.unavailableDayText,
                isToday && styles.todayText,
              ]}
            >
              {day}
            </Text>
          </View>
        </View>
      );

      if ((firstDay + day) % 7 === 0) {
        weeks.push(
          <View key={`week-${weeks.length}`} style={styles.weekRow}>
            {[...days]}
          </View>
        );
        days = [];
      }
    }

    if (days.length > 0) {
      while (days.length < 7) {
        days.push(
          <View key={`empty-end-${days.length}`} style={styles.dayCell} />
        );
      }
      weeks.push(
        <View key={`week-${weeks.length}`} style={styles.weekRow}>
          {[...days]}
        </View>
      );
    }

    return weeks;
  };

  const statusCounts = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    let available = 0;
    let booked = 0;
    let onHold = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getDateStatusInfo(day);
      if (status === 'available') {
        available++;
      } else if (status === 'booked') {
        booked++;
      } else if (status === 'on-hold') {
        onHold++;
      }
    }
    
    return { available, booked, onHold };
  }, [year, month, dateStatuses, getDateStatusInfo]);

  if (bookingsQuery.isLoading || eventsQuery.isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.safeContainer, styles.centerContent]}>
          <ActivityIndicator size="large" color={AutumnColors.brown} />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </>
    );
  }

  if (bookingsQuery.error || eventsQuery.error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.safeContainer, styles.centerContent]}>
          <Text style={styles.errorText}>Failed to load calendar</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              bookingsQuery.refetch();
              eventsQuery.refetch();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.safeContainer}>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.contentContainer}
        >
        <View style={styles.header}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              onPress={() => navigateMonth(-1)}
              style={styles.navButton}
            >
              <ChevronLeft size={24} color={AutumnColors.brown} />
            </TouchableOpacity>
            
            <View style={styles.monthInfo}>
              <Text style={styles.monthText}>{MONTHS[month]}</Text>
              <Text style={styles.yearText}>{year}</Text>
            </View>
            
            <TouchableOpacity
              onPress={() => navigateMonth(1)}
              style={styles.navButton}
            >
              <ChevronRight size={24} color={AutumnColors.brown} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Circle size={16} color={AutumnColors.green} fill={AutumnColors.green} />
            <Text style={styles.statNumber}>{statusCounts.available}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          
          <View style={styles.statCard}>
            <Circle size={16} color={StatusColors['on-hold']} fill={StatusColors['on-hold']} />
            <Text style={styles.statNumber}>{statusCounts.onHold}</Text>
            <Text style={styles.statLabel}>On Hold</Text>
          </View>
          
          <View style={styles.statCard}>
            <Circle size={16} color={AutumnColors.rust} fill={AutumnColors.rust} />
            <Text style={styles.statNumber}>{statusCounts.booked}</Text>
            <Text style={styles.statLabel}>Booked</Text>
          </View>
        </View>

        <View style={styles.calendarContainer}>
          <View style={styles.daysHeader}>
            {DAYS.map(day => (
              <View key={day} style={styles.dayHeaderCell}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>
          
          {renderCalendar()}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: StatusColors.available }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: StatusColors['on-hold'] }]} />
            <Text style={styles.legendText}>On Hold</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: StatusColors.booked }]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
        </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: AutumnColors.cream,
  },
  container: {
    flex: 1,
    backgroundColor: AutumnColors.cream,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  monthInfo: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: AutumnColors.brown,
  },
  yearText: {
    fontSize: 16,
    color: AutumnColors.warmGray,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: AutumnColors.brown,
  },
  statLabel: {
    fontSize: 14,
    color: AutumnColors.warmGray,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    padding: 2,
  },
  dayContent: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: {
    borderWidth: 2,
    borderColor: AutumnColors.gold,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: AutumnColors.brown,
  },
  unavailableDayText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  todayText: {
    fontWeight: '700' as const,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 24,
    paddingVertical: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: AutumnColors.warmGray,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: AutumnColors.brown,
  },
  errorText: {
    fontSize: 16,
    color: AutumnColors.rust,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: AutumnColors.sage,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
