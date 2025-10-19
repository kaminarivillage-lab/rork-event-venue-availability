import React, { useState, useMemo, Dispatch, SetStateAction } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView, TextInput } from 'react-native';
import { ChevronLeft, ChevronRight, Circle, Plus, ChevronsLeft, ChevronsRight, Calendar as CalendarIcon, List } from 'lucide-react-native';
import { AutumnColors, StatusColors, DateStatus } from '@/constants/colors';
import { useVenue } from '@/contexts/VenueContext';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanners } from '@/contexts/PlannerContext';
import EventForm from './EventForm';
import EventDetails from './EventDetails';
import { VenueEvent } from '@/types/venue';
import StatsCard from './StatsCard';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface CalendarViewProps {
  bookedCount: number;
  onHoldCount: number;
  total: number;
  viewMode: 'calendar' | 'list';
  setViewMode: Dispatch<SetStateAction<'calendar' | 'list'>>;
}

export default function CalendarView({ bookedCount, onHoldCount, total, viewMode, setViewMode }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [showEventForm, setShowEventForm] = useState<boolean>(false);
  const [showEventDetails, setShowEventDetails] = useState<boolean>(false);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<VenueEvent | null>(null);
  const [clientName, setClientName] = useState<string>('');
  const [selectedPlannerId, setSelectedPlannerId] = useState<string>('');
  const [customHoldDays, setCustomHoldDays] = useState<string>('');
  
  const { getDateStatus, setDateStatus, getBookingByDate, getRemainingDays, getHoldDurationDays } = useVenue();
  const { getEventByDate } = useEvents();
  const { user, isAdmin, isPlanner } = useAuth();
  const { getPlannerById, getAllPlanners } = usePlanners();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: { date: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDate = new Date(year, month, -startingDayOfWeek + i + 1);
      const y = prevMonthDate.getFullYear();
      const m = prevMonthDate.getMonth();
      const d = prevMonthDate.getDate();
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: prevMonthDate.getDate(),
        dateStr,
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: i,
        dateStr,
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      const y = nextMonthDate.getFullYear();
      const m = nextMonthDate.getMonth();
      const d = nextMonthDate.getDate();
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        date: i,
        dateStr,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const previousYear = () => {
    setCurrentDate(new Date(year - 1, month, 1));
  };

  const nextYear = () => {
    setCurrentDate(new Date(year + 1, month, 1));
  };

  const goToMonth = (monthIndex: number) => {
    setCurrentDate(new Date(year, monthIndex, 1));
    setShowMonthYearPicker(false);
  };

  const goToYear = (targetYear: number) => {
    setCurrentDate(new Date(targetYear, month, 1));
  };

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

  const hasEvent = (dateStr: string): boolean => {
    return !!getEventByDate(dateStr);
  };

  const getStatusColor = (dateStr: string): string => {
    const status = getDateStatus(dateStr);
    return StatusColors[status];
  };

  const isToday = (dateStr: string): boolean => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateStr === todayStr;
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
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

      <View style={styles.header}>
        <View style={styles.navControls}>
          <TouchableOpacity onPress={previousYear} style={styles.navButton} testID="prev-year">
            <ChevronsLeft size={20} color={AutumnColors.warmGray} />
          </TouchableOpacity>
          <TouchableOpacity onPress={previousMonth} style={styles.navButton} testID="prev-month">
            <ChevronLeft size={24} color={AutumnColors.warmGray} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={() => setShowMonthYearPicker(true)} style={styles.monthYearButton}>
          <Text style={styles.monthYear}>
            {MONTHS[month]} {year}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.navControls}>
          <TouchableOpacity onPress={nextMonth} style={styles.navButton} testID="next-month">
            <ChevronRight size={24} color={AutumnColors.warmGray} />
          </TouchableOpacity>
          <TouchableOpacity onPress={nextYear} style={styles.navButton} testID="next-year">
            <ChevronsRight size={20} color={AutumnColors.warmGray} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.daysHeader}>
        {DAYS.map((day) => (
          <View key={day} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          const bgColor = getStatusColor(day.dateStr);
          const today = isToday(day.dateStr);
          const eventExists = hasEvent(day.dateStr);
          
          return (
            <TouchableOpacity
              key={`${day.dateStr}-${index}`}
              style={[
                styles.dayCell,
                { backgroundColor: bgColor },
                today && styles.todayCell,
              ]}
              onPress={() => handleDatePress(day.dateStr)}
              testID={`date-${day.dateStr}`}
            >
              <Text
                style={[
                  styles.dayText,
                  !day.isCurrentMonth && styles.otherMonthText,
                  today && styles.todayText,
                ]}
              >
                {day.date}
              </Text>
              {eventExists && (
                <View style={styles.eventIndicator}>
                  <Circle size={6} color={AutumnColors.warmGray} fill={AutumnColors.warmGray} />
                </View>
              )}
              {getDateStatus(day.dateStr) === 'on-hold' && getRemainingDays(day.dateStr) !== null && (
                <View style={styles.remainingDaysBadge}>
                  <Text style={styles.remainingDaysText}>{getRemainingDays(day.dateStr)}d</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
                  }}
                  testID="add-event"
                >
                  <Plus size={20} color={AutumnColors.warmGray} />
                  <Text style={styles.statusText}>Add Event</Text>
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
              <Text style={styles.statusText}>On Hold</Text>
            </TouchableOpacity>
            <Text style={styles.onHoldNote}>Hold duration: {customHoldDays.trim() ? `${customHoldDays} days` : `${getHoldDurationDays()} days (default)`}</Text>
            
            {isAdmin && (
              <TouchableOpacity
                style={[styles.statusOption, { backgroundColor: StatusColors.booked }]}
                onPress={() => handleStatusSelect('booked')}
                testID="status-booked"
              >
                <Text style={styles.statusText}>Booked (Status Only)</Text>
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

      <Modal
        visible={showMonthYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthYearPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMonthYearPicker(false)}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerTitle}>Select Month & Year</Text>
            
            <View style={styles.yearSelector}>
              <TouchableOpacity onPress={() => goToYear(year - 1)} style={styles.yearButton}>
                <ChevronLeft size={20} color={AutumnColors.warmGray} />
              </TouchableOpacity>
              <Text style={styles.yearText}>{year}</Text>
              <TouchableOpacity onPress={() => goToYear(year + 1)} style={styles.yearButton}>
                <ChevronRight size={20} color={AutumnColors.warmGray} />
              </TouchableOpacity>
            </View>

            <View style={styles.monthGrid}>
              {MONTHS.map((monthName, index) => (
                <TouchableOpacity
                  key={monthName}
                  style={[
                    styles.monthOption,
                    index === month && styles.monthOptionActive,
                  ]}
                  onPress={() => goToMonth(index)}
                >
                  <Text
                    style={[
                      styles.monthOptionText,
                      index === month && styles.monthOptionTextActive,
                    ]}
                  >
                    {monthName.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.pickerCancelButton}
              onPress={() => setShowMonthYearPicker(false)}
            >
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: AutumnColors.cream,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButton: {
    padding: 8,
  },
  monthYearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: AutumnColors.warmGray,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
  },
  daysHeader: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
    opacity: 0.6,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  dayCell: {
    width: '14.285%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: AutumnColors.paleGold,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: AutumnColors.sage,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: AutumnColors.warmGray,
  },
  otherMonthText: {
    opacity: 0.3,
  },
  todayText: {
    fontWeight: '700' as const,
    color: AutumnColors.sage,
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
  eventIndicator: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
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
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 380,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
    marginBottom: 20,
    textAlign: 'center',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 16,
  },
  yearButton: {
    padding: 8,
    backgroundColor: AutumnColors.paleGold,
    borderRadius: 8,
  },
  yearText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: AutumnColors.warmGray,
    minWidth: 80,
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  monthOption: {
    width: '23%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: AutumnColors.paleGold,
    borderRadius: 8,
    alignItems: 'center',
  },
  monthOptionActive: {
    backgroundColor: AutumnColors.sage,
  },
  monthOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
  },
  monthOptionTextActive: {
    color: '#FFFFFF',
  },
  pickerCancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
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
