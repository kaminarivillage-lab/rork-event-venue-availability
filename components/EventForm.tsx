import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { X, Calendar } from 'lucide-react-native';
import { EventType, WeddingCategory, PaymentStatus, PaymentMethod, CommissionPaymentStatus, VenueEvent } from '@/types/venue';
import { useEvents } from '@/contexts/EventContext';
import { useVenue } from '@/contexts/VenueContext';
import { usePlanners } from '@/contexts/PlannerContext';
import { useVendors } from '@/contexts/VendorContext';
import Colors from '@/constants/colors';

interface EventFormProps {
  visible: boolean;
  onClose: () => void;
  selectedDate?: string;
  editEvent?: VenueEvent | null;
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'baptism', label: 'Baptism' },
  { value: 'kids-party', label: 'Kids Party' },
  { value: 'corporate-dinner', label: 'Corporate Dinner' },
  { value: 'meetings', label: 'Meetings' },
  { value: 'other', label: 'Other' },
];

const WEDDING_CATEGORIES: { value: WeddingCategory; label: string }[] = [
  { value: 'reception', label: 'Reception' },
  { value: 'ceremony-reception', label: 'Ceremony & Reception' },
  { value: 'prep-reception', label: 'Prep & Reception' },
  { value: 'prep-ceremony-reception', label: 'Prep, Ceremony & Reception' },
];

export default function EventForm({ visible, onClose, selectedDate: initialDate, editEvent }: EventFormProps) {
  const { addEvent, updateEvent } = useEvents();
  const { setDateStatus } = useVenue();
  const { getAllPlanners } = usePlanners();
  const { getAllVendors } = useVendors();
  
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const [eventName, setEventName] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayStr);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showPaymentDatePicker, setShowPaymentDatePicker] = useState<boolean>(false);
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [weddingCategory, setWeddingCategory] = useState<WeddingCategory>('reception');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [timelineDescription, setTimelineDescription] = useState<string>('');
  const [venueRentalFee, setVenueRentalFee] = useState<string>('');
  const [incomeFromExtras, setIncomeFromExtras] = useState<string>('');
  const [costs, setCosts] = useState<string>('');
  const [plannerCommission, setPlannerCommission] = useState<string>('');
  const [commissionPercentage, setCommissionPercentage] = useState<string>('');
  const [selectedPlannerId, setSelectedPlannerId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [paymentDateReceived, setPaymentDateReceived] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [commissionPaymentStatus, setCommissionPaymentStatus] = useState<CommissionPaymentStatus>('pending');
  const [commissionDatePaid, setCommissionDatePaid] = useState<string>('');
  const [showCommissionDatePicker, setShowCommissionDatePicker] = useState<boolean>(false);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [meetingTime, setMeetingTime] = useState<string>('');

  useEffect(() => {
    if (visible) {
      if (editEvent) {
        setEventName(editEvent.name);
        setSelectedDate(editEvent.date);
        setEventType(editEvent.eventType);
        setWeddingCategory(editEvent.weddingCategory || 'reception');
        setStartTime(editEvent.timeline?.startTime || '');
        setEndTime(editEvent.timeline?.endTime || '');
        setTimelineDescription(editEvent.timeline?.description || '');
        setVenueRentalFee(editEvent.financials.venueRentalFee.toString());
        setIncomeFromExtras(editEvent.financials.incomeFromExtras.toString());
        setCosts(editEvent.financials.costs.toString());
        setPlannerCommission(editEvent.financials.plannerCommission?.toString() || '');
        setCommissionPercentage(editEvent.financials.plannerCommissionPercentage?.toString() || '');
        setSelectedPlannerId(editEvent.financials.plannerId || '');
        setNotes(editEvent.notes || '');
        setPaymentStatus(editEvent.financials.payment.status);
        setPaymentDateReceived(editEvent.financials.payment.dateReceived || '');
        setPaymentMethod(editEvent.financials.payment.method || 'cash');
        setCommissionPaymentStatus(editEvent.financials.commissionPayment?.status || 'pending');
        setCommissionDatePaid(editEvent.financials.commissionPayment?.datePaid || '');
        setSelectedVendorIds(editEvent.vendorIds || []);
        setMeetingTime(editEvent.meetingDetails?.meetingTime || '');
      } else if (initialDate) {
        setSelectedDate(initialDate);
      }
    }
  }, [initialDate, visible, editEvent]);

  const handleSubmit = () => {
    if (!eventName.trim()) {
      alert('Please enter an event name');
      return;
    }

    if (editEvent) {
      updateEvent(editEvent.id, {
        name: eventName.trim(),
        date: selectedDate,
        eventType,
        weddingCategory: eventType === 'wedding' ? weddingCategory : undefined,
        timeline: eventType !== 'meetings' && startTime && endTime ? {
          startTime,
          endTime,
          description: timelineDescription,
        } : undefined,
        meetingDetails: eventType === 'meetings' && meetingTime ? {
          meetingTime,
        } : undefined,
        financials: {
          venueRentalFee: parseFloat(venueRentalFee) || 0,
          incomeFromExtras: parseFloat(incomeFromExtras) || 0,
          costs: parseFloat(costs) || 0,
          plannerCommission: parseFloat(plannerCommission) || 0,
          plannerCommissionPercentage: parseFloat(commissionPercentage) || undefined,
          plannerId: selectedPlannerId || undefined,
          payment: {
            status: paymentStatus,
            dateReceived: paymentStatus === 'received' ? paymentDateReceived : undefined,
            method: paymentStatus === 'received' ? paymentMethod : undefined,
          },
          commissionPayment: selectedPlannerId && parseFloat(plannerCommission) > 0 ? {
            status: commissionPaymentStatus,
            datePaid: commissionPaymentStatus === 'paid' ? commissionDatePaid : undefined,
          } : undefined,
        },
        notes,
        vendorIds: selectedVendorIds.length > 0 ? selectedVendorIds : undefined,
      });

      if (editEvent.date !== selectedDate) {
        setDateStatus(editEvent.date, 'available');
        setDateStatus(selectedDate, 'booked');
      }
    } else {
      addEvent(
        eventName.trim(),
        selectedDate,
        eventType,
        eventType !== 'meetings' && startTime && endTime ? {
          startTime,
          endTime,
          description: timelineDescription,
        } : undefined,
        {
          venueRentalFee: parseFloat(venueRentalFee) || 0,
          incomeFromExtras: parseFloat(incomeFromExtras) || 0,
          costs: parseFloat(costs) || 0,
          plannerCommission: parseFloat(plannerCommission) || 0,
          plannerCommissionPercentage: parseFloat(commissionPercentage) || undefined,
          plannerId: selectedPlannerId || undefined,
          payment: {
            status: paymentStatus,
            dateReceived: paymentStatus === 'received' ? paymentDateReceived : undefined,
            method: paymentStatus === 'received' ? paymentMethod : undefined,
          },
          commissionPayment: selectedPlannerId && parseFloat(plannerCommission) > 0 ? {
            status: commissionPaymentStatus,
            datePaid: commissionPaymentStatus === 'paid' ? commissionDatePaid : undefined,
          } : undefined,
        },
        eventType === 'wedding' ? weddingCategory : undefined,
        notes,
        selectedVendorIds.length > 0 ? selectedVendorIds : undefined,
        eventType === 'meetings' && meetingTime ? { meetingTime } : undefined
      );

      setDateStatus(selectedDate, 'booked');
    }

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setEventName('');
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDate(initialDate || todayStr);
    setEventType('wedding');
    setWeddingCategory('reception');
    setStartTime('');
    setEndTime('');
    setTimelineDescription('');
    setVenueRentalFee('');
    setIncomeFromExtras('');
    setCosts('');
    setPlannerCommission('');
    setCommissionPercentage('');
    setSelectedPlannerId('');
    setNotes('');
    setPaymentStatus('pending');
    setPaymentDateReceived('');
    setSelectedVendorIds([]);
    setPaymentMethod('cash');
    setCommissionPaymentStatus('pending');
    setCommissionDatePaid('');
    setMeetingTime('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{editEvent ? 'Edit Event' : 'Add Event'}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Name *</Text>
            <TextInput
              style={styles.input}
              value={eventName}
              onChangeText={setEventName}
              placeholder="e.g., Johnson Wedding, Smith Birthday Party"
              placeholderTextColor="#A99B88"
              editable={true}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Date</Text>
            <TouchableOpacity 
              style={styles.datePickerButton} 
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color={Colors.light.text} />
              <Text style={styles.dateText}>{selectedDate}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Type</Text>
            <View style={styles.optionsGrid}>
              {EVENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.optionButton,
                    eventType === type.value && styles.optionButtonSelected,
                  ]}
                  onPress={() => setEventType(type.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      eventType === type.value && styles.optionTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {eventType === 'meetings' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meeting Details</Text>
              <Text style={styles.label}>Meeting Time</Text>
              <TextInput
                style={styles.input}
                value={meetingTime}
                onChangeText={setMeetingTime}
                placeholder="10:00 AM"
                placeholderTextColor="#A99B88"
              />
            </View>
          )}

          {eventType === 'wedding' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wedding Category</Text>
              <View style={styles.optionsGrid}>
                {WEDDING_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.optionButton,
                      weddingCategory === category.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => setWeddingCategory(category.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        weddingCategory === category.value && styles.optionTextSelected,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {eventType !== 'meetings' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline (Optional)</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Text style={styles.label}>Start Time</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="14:00"
                  placeholderTextColor="#A99B88"
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={styles.label}>End Time</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="23:00"
                  placeholderTextColor="#A99B88"
                />
              </View>
            </View>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={timelineDescription}
              onChangeText={setTimelineDescription}
              placeholder="Event schedule details..."
              placeholderTextColor="#A99B88"
              multiline
              numberOfLines={3}
            />
          </View>
          )}

          {eventType !== 'meetings' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Financials (Optional)</Text>
            <Text style={styles.label}>Venue Rental Fee</Text>
            <TextInput
              style={styles.input}
              value={venueRentalFee}
              onChangeText={(value) => {
                setVenueRentalFee(value);
                const rentalFee = parseFloat(value) || 0;
                const commission = parseFloat(plannerCommission) || 0;
                if (rentalFee > 0 && commission > 0) {
                  const percentage = (commission / rentalFee) * 100;
                  setCommissionPercentage(percentage.toFixed(2));
                } else if (commission > 0) {
                  setCommissionPercentage('');
                }
              }}
              placeholder="0.00"
              placeholderTextColor="#A99B88"
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>Income from Extras</Text>
            <TextInput
              style={styles.input}
              value={incomeFromExtras}
              onChangeText={setIncomeFromExtras}
              placeholder="0.00"
              placeholderTextColor="#A99B88"
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>Costs</Text>
            <TextInput
              style={styles.input}
              value={costs}
              onChangeText={setCosts}
              placeholder="0.00"
              placeholderTextColor="#A99B88"
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>Planner Commission (€)</Text>
            <TextInput
              style={styles.input}
              value={plannerCommission}
              onChangeText={(value) => {
                setPlannerCommission(value);
                const rentalFee = parseFloat(venueRentalFee) || 0;
                const commission = parseFloat(value) || 0;
                if (rentalFee > 0 && commission > 0) {
                  const percentage = (commission / rentalFee) * 100;
                  setCommissionPercentage(percentage.toFixed(2));
                } else {
                  setCommissionPercentage('');
                }
              }}
              placeholder="0.00"
              placeholderTextColor="#A99B88"
              keyboardType="decimal-pad"
            />
            {commissionPercentage && (
              <Text style={styles.calculatedText}>
                {commissionPercentage}% of rental fee
              </Text>
            )}
            <Text style={styles.label}>Associated Planner</Text>
            <View style={styles.plannerPicker}>
              <TouchableOpacity
                style={[styles.plannerOption, !selectedPlannerId && styles.plannerOptionSelected]}
                onPress={() => setSelectedPlannerId('')}
              >
                <Text style={[styles.plannerText, !selectedPlannerId && styles.plannerTextSelected]}>None</Text>
              </TouchableOpacity>
              {getAllPlanners.map((planner) => (
                <TouchableOpacity
                  key={planner.id}
                  style={[styles.plannerOption, selectedPlannerId === planner.id && styles.plannerOptionSelected]}
                  onPress={() => setSelectedPlannerId(planner.id)}
                >
                  <Text style={[styles.plannerText, selectedPlannerId === planner.id && styles.plannerTextSelected]}>
                    {planner.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedPlannerId && parseFloat(plannerCommission) > 0 && (
              <>
                <Text style={styles.label}>Commission Payment Status</Text>
                <View style={styles.optionsGrid}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      commissionPaymentStatus === 'pending' && styles.optionButtonSelected,
                    ]}
                    onPress={() => setCommissionPaymentStatus('pending')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        commissionPaymentStatus === 'pending' && styles.optionTextSelected,
                      ]}
                    >
                      Pending Payment
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      commissionPaymentStatus === 'paid' && styles.optionButtonSelected,
                    ]}
                    onPress={() => setCommissionPaymentStatus('paid')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        commissionPaymentStatus === 'paid' && styles.optionTextSelected,
                      ]}
                    >
                      Paid
                    </Text>
                  </TouchableOpacity>
                </View>

                {commissionPaymentStatus === 'paid' && (
                  <>
                    <Text style={styles.label}>Date Paid</Text>
                    <TouchableOpacity 
                      style={styles.datePickerButton} 
                      onPress={() => setShowCommissionDatePicker(true)}
                    >
                      <Calendar size={20} color={Colors.light.text} />
                      <Text style={styles.dateText}>
                        {commissionDatePaid || 'Select date'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
          )}

          {eventType !== 'meetings' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <Text style={styles.label}>Payment Status</Text>
            <View style={styles.optionsGrid}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  paymentStatus === 'pending' && styles.optionButtonSelected,
                ]}
                onPress={() => setPaymentStatus('pending')}
              >
                <Text
                  style={[
                    styles.optionText,
                    paymentStatus === 'pending' && styles.optionTextSelected,
                  ]}
                >
                  Pending
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  paymentStatus === 'received' && styles.optionButtonSelected,
                ]}
                onPress={() => setPaymentStatus('received')}
              >
                <Text
                  style={[
                    styles.optionText,
                    paymentStatus === 'received' && styles.optionTextSelected,
                  ]}
                >
                  Received
                </Text>
              </TouchableOpacity>
            </View>

            {paymentStatus === 'received' && (
              <>
                <Text style={styles.label}>Date Received</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton} 
                  onPress={() => setShowPaymentDatePicker(true)}
                >
                  <Calendar size={20} color={Colors.light.text} />
                  <Text style={styles.dateText}>
                    {paymentDateReceived || 'Select date'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.label}>Payment Method</Text>
                <View style={styles.optionsGrid}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      paymentMethod === 'cash' && styles.optionButtonSelected,
                    ]}
                    onPress={() => setPaymentMethod('cash')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        paymentMethod === 'cash' && styles.optionTextSelected,
                      ]}
                    >
                      Cash
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      paymentMethod === 'bank' && styles.optionButtonSelected,
                    ]}
                    onPress={() => setPaymentMethod('bank')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        paymentMethod === 'bank' && styles.optionTextSelected,
                      ]}
                    >
                      Bank Transfer
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
          )}

          {eventType !== 'meetings' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Associated Vendors (Optional)</Text>
            <View style={styles.vendorPicker}>
              {getAllVendors.length === 0 ? (
                <Text style={styles.noVendorsText}>No vendors available. Add vendors in the Vendors tab.</Text>
              ) : (
                getAllVendors.map((vendor) => {
                  const isSelected = selectedVendorIds.includes(vendor.id);
                  return (
                    <TouchableOpacity
                      key={vendor.id}
                      style={[
                        styles.vendorOption,
                        isSelected && styles.vendorOptionSelected,
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedVendorIds(selectedVendorIds.filter(id => id !== vendor.id));
                        } else {
                          setSelectedVendorIds([...selectedVendorIds, vendor.id]);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.vendorText,
                          isSelected && styles.vendorTextSelected,
                        ]}
                      >
                        {vendor.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes..."
              placeholderTextColor="#A99B88"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{editEvent ? 'Update Event' : 'Add Event'}</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>

        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Event Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <X size={24} color={Colors.light.text} />
                </TouchableOpacity>
              </View>
              <MiniCalendar 
                selectedDate={selectedDate} 
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setShowDatePicker(false);
                }} 
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={showPaymentDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPaymentDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Payment Date</Text>
                <TouchableOpacity onPress={() => setShowPaymentDatePicker(false)}>
                  <X size={24} color={Colors.light.text} />
                </TouchableOpacity>
              </View>
              <MiniCalendar 
                selectedDate={paymentDateReceived || todayStr} 
                onSelectDate={(date) => {
                  setPaymentDateReceived(date);
                  setShowPaymentDatePicker(false);
                }} 
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={showCommissionDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCommissionDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Commission Payment Date</Text>
                <TouchableOpacity onPress={() => setShowCommissionDatePicker(false)}>
                  <X size={24} color={Colors.light.text} />
                </TouchableOpacity>
              </View>
              <MiniCalendar 
                selectedDate={commissionDatePaid || todayStr} 
                onSelectDate={(date) => {
                  setCommissionDatePaid(date);
                  setShowCommissionDatePicker(false);
                }} 
              />
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8D7C3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8D7C3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    padding: 0,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8D7C3',
  },
  optionButtonSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.text,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  timeInput: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.text,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8D7C3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600' as const,
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  datePickerModal: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  plannerPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  plannerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  plannerOptionSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  plannerText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.text,
  },
  plannerTextSelected: {
    color: '#FFFFFF',
  },
  calculatedText: {
    fontSize: 14,
    color: '#7B1FA2',
    fontWeight: '600' as const,
    marginTop: 4,
  },
  vendorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vendorOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  vendorOptionSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  vendorText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.text,
  },
  vendorTextSelected: {
    color: '#FFFFFF',
  },
  noVendorsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic' as const,
  },
});

interface MiniCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

function MiniCalendar({ selectedDate, onSelectDate }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const parts = selectedDate.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const formatDateString = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <View style={miniCalendarStyles.container}>
      <View style={miniCalendarStyles.header}>
        <TouchableOpacity onPress={previousMonth} style={miniCalendarStyles.navButton}>
          <Text style={miniCalendarStyles.navButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={miniCalendarStyles.monthText}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={miniCalendarStyles.navButton}>
          <Text style={miniCalendarStyles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={miniCalendarStyles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={miniCalendarStyles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={miniCalendarStyles.daysGrid}>
        {days.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={miniCalendarStyles.dayCell} />;
          }

          const dateStr = formatDateString(year, month, day);
          const isSelected = dateStr === selectedDate;

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                miniCalendarStyles.dayCell,
                isSelected && miniCalendarStyles.selectedDay,
              ]}
              onPress={() => onSelectDate(dateStr)}
            >
              <Text
                style={[
                  miniCalendarStyles.dayText,
                  isSelected && miniCalendarStyles.selectedDayText,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const miniCalendarStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 24,
    color: Colors.light.text,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#A99B88',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  selectedDay: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
});
