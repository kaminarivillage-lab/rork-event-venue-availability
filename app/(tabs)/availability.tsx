import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Share as RNShare,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Share2, ChevronLeft, ChevronRight, Circle, Plus } from 'lucide-react-native';
import { useEvents } from '@/contexts/EventContext';
import { useVenue } from '@/contexts/VenueContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanners } from '@/contexts/PlannerContext';
import { AutumnColors, StatusColors } from '@/constants/colors';
import type { DateStatus } from '@/types/venue';
import EventForm from '@/components/EventForm';
import EventDetails from '@/components/EventDetails';
import { VenueEvent } from '@/types/venue';
import * as Clipboard from 'expo-clipboard';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type DateStatusInfo = {
  status: DateStatus;
  isExpired?: boolean;
};

export default function AvailabilityScreen() {
  const { getAllEvents, getEventByDate } = useEvents();
  const { bookings, holdDuration, getRemainingDays, getDateStatus, setDateStatus, getBookingByDate, getHoldDurationDays } = useVenue();
  const { user, isPlanner, isAdmin } = useAuth();
  const { getPlannerById, getAllPlanners } = usePlanners();
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [showEventForm, setShowEventForm] = useState<boolean>(false);
  const [showEventDetails, setShowEventDetails] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<VenueEvent | null>(null);
  const [clientName, setClientName] = useState<string>('');
  const [selectedPlannerId, setSelectedPlannerId] = useState<string>('');
  const [customHoldDays, setCustomHoldDays] = useState<string>('');
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const dateStatuses = useMemo(() => {
    const statuses = new Map<string, DateStatusInfo>();
    const now = Date.now();
    
    if (!isPlanner) {
      Object.values(bookings).forEach(booking => {
        if (booking.status === 'on-hold') {
          const expiresAt = booking.setAt + holdDuration;
          if (now <= expiresAt) {
            statuses.set(booking.date, { status: 'on-hold' });
          }
        } else if (booking.status === 'booked') {
          statuses.set(booking.date, { status: 'booked' });
        }
      });
    }
    
    const filteredEvents = isPlanner && user?.plannerId
      ? getAllEvents.filter(event => event.financials.plannerId === user.plannerId)
      : getAllEvents;
    
    filteredEvents.forEach(event => {
      statuses.set(event.date, { status: 'booked' });
    });
    
    return statuses;
  }, [getAllEvents, bookings, holdDuration, isPlanner, user]);

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

  const getDateStatusInfo = useCallback((day: number): DateStatusInfo => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const statusInfo = dateStatuses.get(dateStr);
    return statusInfo || { status: 'available' };
  }, [year, month, dateStatuses]);

  const handleDatePress = (dateStr: string) => {
    const event = getEventByDate(dateStr);
    const status = getDateStatus(dateStr);
    setSelectedDate(dateStr);
    
    if (event) {
      setShowEventDetails(true);
    } else if (status === 'available' || status === 'on-hold' || status === 'booked') {
      setShowStatusModal(true);
    }
  };

  const handleStatusSelect = (status: DateStatus) => {
    if (selectedDate) {
      const plannerId = isPlanner ? user?.plannerId : (selectedPlannerId || undefined);
      const note = clientName.trim() || undefined;
      const holdDays = customHoldDays.trim() ? parseInt(customHoldDays, 10) : undefined;
      setDateStatus(selectedDate, status, note, plannerId, holdDays);
      setShowStatusModal(false);
      setSelectedDate(null);
      setClientName('');
      setSelectedPlannerId('');
      setCustomHoldDays('');
    }
  };

  const handleCloseEventForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    setSelectedDate(null);
  };

  const handleCloseEventDetails = () => {
    setShowEventDetails(false);
    setSelectedDate(null);
  };

  const generateAvailabilityReport = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const monthName = MONTHS[month];
    const available: number[] = [];
    const booked: number[] = [];
    const onHold: number[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const statusInfo = getDateStatusInfo(day);
      if (statusInfo.status === 'booked') {
        booked.push(day);
      } else if (statusInfo.status === 'on-hold') {
        onHold.push(day);
      } else {
        available.push(day);
      }
    }

    let report = `📅 AVAILABILITY REPORT\n`;
    report += `${monthName} ${year}\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    report += `✅ AVAILABLE DATES (${available.length}):\n`;
    if (available.length > 0) {
      report += available.map(d => `${monthName} ${d}`).join(', ');
    } else {
      report += 'No available dates';
    }
    
    report += `\n\n⏳ ON-HOLD DATES (${onHold.length}):\n`;
    if (onHold.length > 0) {
      report += onHold.map(d => `${monthName} ${d}`).join(', ');
    } else {
      report += 'No on-hold dates';
    }
    
    report += `\n\n❌ BOOKED DATES (${booked.length}):\n`;
    if (booked.length > 0) {
      report += booked.map(d => `${monthName} ${d}`).join(', ');
    } else {
      report += 'No booked dates';
    }

    report += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `Total Days: ${daysInMonth}\n`;
    report += `Availability: ${((available.length / daysInMonth) * 100).toFixed(0)}%`;

    return report;
  };

  const handleShare = async () => {
    const report = generateAvailabilityReport();
    
    try {
      if (Platform.OS === 'web') {
        await Clipboard.setStringAsync(report);
        Alert.alert('Copied!', 'Availability report copied to clipboard');
      } else {
        const result = await RNShare.share({
          message: report,
          title: `Availability - ${MONTHS[month]} ${year}`,
        });
        console.log('Share result:', result);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share availability report');
    }
  };

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
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const statusInfo = getDateStatusInfo(day);
      const isToday = 
        day === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();

      const bgColor = StatusColors[statusInfo.status as keyof typeof StatusColors];
      const isBooked = statusInfo.status === 'booked';
      const isOnHold = statusInfo.status === 'on-hold';

      days.push(
        <TouchableOpacity
          key={day}
          style={styles.dayCell}
          onPress={() => handleDatePress(dateStr)}
          testID={`date-${dateStr}`}
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
            {isOnHold && getRemainingDays(dateStr) !== null && (
              <View style={styles.remainingDaysBadge}>
                <Text style={styles.remainingDaysText}>{getRemainingDays(dateStr)}d</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );

      if ((firstDay + day) % 7 === 0) {
        weeks.push(
          <View key={`week-${weeks.length}`} style={styles.weekRow}>
            {days}
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
          {days}
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
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const statusInfo = dateStatuses.get(dateStr) || { status: 'available' as DateStatus };
      if (statusInfo.status === 'available') {
        available++;
      } else if (statusInfo.status === 'booked') {
        booked++;
      } else if (statusInfo.status === 'on-hold') {
        onHold++;
      }
    }
    
    return { available, booked, onHold };
  }, [year, month, dateStatuses]);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
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

        <TouchableOpacity
          onPress={handleShare}
          style={styles.shareButton}
        >
          <Share2 size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share Report</Text>
        </TouchableOpacity>
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
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.todayLegend]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>

      <Modal
        visible={showStatusModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowStatusModal(false);
          setClientName('');
          setSelectedPlannerId('');
          setCustomHoldDays('');
        }}
      >
        <Pressable style={styles.modalOverlay} onPress={() => {
          setShowStatusModal(false);
          setClientName('');
          setSelectedPlannerId('');
          setCustomHoldDays('');
        }}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <Text style={styles.modalTitle}>Options for {selectedDate}</Text>
              {selectedDate && getBookingByDate(selectedDate)?.plannerId && isAdmin && (
                <View style={styles.plannerInfoBox}>
                  <Text style={styles.plannerInfoLabel}>Held by:</Text>
                  <Text style={styles.plannerInfoText}>
                    {getPlannerById(getBookingByDate(selectedDate)?.plannerId || '')?.name || 'Unknown Planner'}
                  </Text>
                </View>
              )}
              {selectedDate && getBookingByDate(selectedDate)?.note && (
                <View style={styles.clientInfoBox}>
                  <Text style={styles.plannerInfoLabel}>Client:</Text>
                  <Text style={styles.plannerInfoText}>
                    {getBookingByDate(selectedDate)?.note}
                  </Text>
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Client Name (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter client or event name"
                  placeholderTextColor={AutumnColors.warmGray + '80'}
                  value={clientName}
                  onChangeText={setClientName}
                  testID="client-name-input"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>On-Hold Days (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={`Default: ${getHoldDurationDays()} days`}
                  placeholderTextColor={AutumnColors.warmGray + '80'}
                  value={customHoldDays}
                  onChangeText={setCustomHoldDays}
                  keyboardType="number-pad"
                  testID="custom-hold-days-input"
                />
                <Text style={styles.inputHint}>Leave empty to use default setting</Text>
              </View>

              {isAdmin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Planner (Optional)</Text>
                  <ScrollView style={styles.plannerList} nestedScrollEnabled>
                    <TouchableOpacity
                      style={[
                        styles.plannerOption,
                        !selectedPlannerId && styles.plannerOptionSelected
                      ]}
                      onPress={() => setSelectedPlannerId('')}
                    >
                      <Text style={styles.plannerOptionText}>No Planner</Text>
                    </TouchableOpacity>
                    {getAllPlanners.map((planner) => (
                      <TouchableOpacity
                        key={planner.id}
                        style={[
                          styles.plannerOption,
                          selectedPlannerId === planner.id && styles.plannerOptionSelected
                        ]}
                        onPress={() => setSelectedPlannerId(planner.id)}
                      >
                        <Text style={styles.plannerOptionText}>{planner.name}</Text>
                        <Text style={styles.plannerCompanyText}>{planner.companyName}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {isAdmin && (
                <>
                  <TouchableOpacity
                    style={[styles.statusOption, styles.addEventOption]}
                    onPress={() => {
                      setShowStatusModal(false);
                      setShowEventForm(true);
                      setClientName('');
                      setSelectedPlannerId('');
                      setCustomHoldDays('');
                    }}
                    testID="add-event"
                  >
                    <Plus size={20} color="#FFFFFF" />
                    <Text style={[styles.statusText, { color: '#FFFFFF' }]}>Add Event</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.separator} />
                </>
              )}
              
              <TouchableOpacity
                style={[styles.statusOption, { backgroundColor: StatusColors.available }]}
                onPress={() => handleStatusSelect('available')}
                testID="status-available"
              >
                <Text style={styles.statusText}>Available</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.statusOption, { backgroundColor: StatusColors['on-hold'] }]}
                onPress={() => handleStatusSelect('on-hold')}
                testID="status-on-hold"
              >
                <Text style={[styles.statusText, { color: '#FFFFFF' }]}>On Hold</Text>
              </TouchableOpacity>
              <Text style={styles.onHoldNote}>Hold duration: {customHoldDays.trim() ? `${customHoldDays} days` : `${getHoldDurationDays()} days (default)`}</Text>
              
              {isAdmin && (
                <TouchableOpacity
                  style={[styles.statusOption, { backgroundColor: StatusColors.booked }]}
                  onPress={() => handleStatusSelect('booked')}
                  testID="status-booked"
                >
                  <Text style={[styles.statusText, { color: '#FFFFFF' }]}>Booked (Status Only)</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowStatusModal(false);
                  setClientName('');
                  setSelectedPlannerId('');
                  setCustomHoldDays('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {(selectedDate || editingEvent) && (
        <EventForm
          visible={showEventForm || editingEvent !== null}
          onClose={handleCloseEventForm}
          selectedDate={selectedDate || undefined}
          editEvent={editingEvent}
        />
      )}

      {selectedDate && (
        <EventDetails
          visible={showEventDetails && editingEvent === null}
          onClose={handleCloseEventDetails}
          event={getEventByDate(selectedDate) || null}
          onEdit={(event) => {
            setEditingEvent(event);
            setShowEventDetails(false);
            setShowEventForm(true);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: '700',
    color: AutumnColors.brown,
  },
  yearText: {
    fontSize: 16,
    color: AutumnColors.warmGray,
    marginTop: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AutumnColors.rust,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '500',
    color: AutumnColors.brown,
  },
  unavailableDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayText: {
    fontWeight: '700',
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
  todayLegend: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: AutumnColors.gold,
  },
  legendText: {
    fontSize: 14,
    color: AutumnColors.warmGray,
  },
  remainingDaysBadge: {
    position: 'absolute' as const,
    top: 2,
    right: 2,
    backgroundColor: AutumnColors.rust,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  remainingDaysText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: AutumnColors.warmGray,
    opacity: 0.6,
  },
  addEventOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AutumnColors.sage,
  },
  separator: {
    height: 1,
    backgroundColor: '#E8D7C3',
    marginVertical: 6,
  },
  plannerInfoBox: {
    backgroundColor: AutumnColors.paleGold,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  plannerInfoLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
    opacity: 0.7,
    marginBottom: 4,
  },
  plannerInfoText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
  },
  clientInfoBox: {
    backgroundColor: AutumnColors.sage + '30',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: AutumnColors.paleGold,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: AutumnColors.warmGray,
  },
  plannerList: {
    maxHeight: 120,
    borderRadius: 8,
    backgroundColor: AutumnColors.paleGold,
  },
  plannerOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: AutumnColors.cream,
  },
  plannerOptionSelected: {
    backgroundColor: AutumnColors.sage + '30',
  },
  plannerOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
  },
  plannerCompanyText: {
    fontSize: 12,
    color: AutumnColors.warmGray,
    opacity: 0.7,
    marginTop: 2,
  },
  inputHint: {
    fontSize: 12,
    color: AutumnColors.warmGray,
    opacity: 0.6,
    marginTop: 4,
  },
  onHoldNote: {
    fontSize: 12,
    color: AutumnColors.warmGray,
    opacity: 0.7,
    marginBottom: 12,
    textAlign: 'center',
  },
});
