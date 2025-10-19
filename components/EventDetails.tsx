import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { X, Calendar, Clock, DollarSign, FileText, Trash2, CreditCard, CheckCircle, AlertCircle, Edit2 } from 'lucide-react-native';
import { VenueEvent } from '@/types/venue';
import { useEvents } from '@/contexts/EventContext';
import { useVenue } from '@/contexts/VenueContext';
import Colors from '@/constants/colors';

interface EventDetailsProps {
  visible: boolean;
  onClose: () => void;
  event: VenueEvent | null;
  onEdit?: (event: VenueEvent) => void;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  'wedding': 'Wedding',
  'baptism': 'Baptism',
  'kids-party': 'Kids Party',
  'corporate-dinner': 'Corporate Dinner',
  'meetings': 'Meeting',
  'other': 'Other',
};

const WEDDING_CATEGORY_LABELS: Record<string, string> = {
  'reception': 'Reception',
  'ceremony-reception': 'Ceremony & Reception',
  'prep-reception': 'Prep & Reception',
  'prep-ceremony-reception': 'Prep, Ceremony & Reception',
};

export default function EventDetails({ visible, onClose, event, onEdit }: EventDetailsProps) {
  const { deleteEvent } = useEvents();
  const { setDateStatus } = useVenue();

  if (!event) return null;

  const handleDelete = () => {
    console.log('handleDelete called for event:', event.id);
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            console.log('Delete cancelled');
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Delete confirmed for event:', event.id);
            try {
              deleteEvent(event.id);
              setDateStatus(event.date, 'available');
              console.log('Event deleted successfully, closing modal');
              onClose();
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const totalIncome = event.financials.venueRentalFee + event.financials.incomeFromExtras;
  const totalCosts = event.financials.costs + (event.financials.plannerCommission || 0);
  const netProfit = totalIncome - totalCosts;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Event Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Calendar size={20} color={Colors.light.tint} />
              <Text style={styles.cardTitle}>Event Information</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{event.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{event.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{EVENT_TYPE_LABELS[event.eventType]}</Text>
            </View>
            {event.weddingCategory && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Category:</Text>
                <Text style={styles.value}>{WEDDING_CATEGORY_LABELS[event.weddingCategory]}</Text>
              </View>
            )}
          </View>

          {event.eventType === 'meetings' && event.meetingDetails && (
            <View style={styles.card}>
              <View style={styles.iconRow}>
                <Clock size={20} color={Colors.light.tint} />
                <Text style={styles.cardTitle}>Meeting Details</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Meeting Time:</Text>
                <Text style={styles.value}>{event.meetingDetails.meetingTime}</Text>
              </View>
            </View>
          )}

          {event.timeline && event.eventType !== 'meetings' && (
            <View style={styles.card}>
              <View style={styles.iconRow}>
                <Clock size={20} color={Colors.light.tint} />
                <Text style={styles.cardTitle}>Timeline</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Start:</Text>
                <Text style={styles.value}>{event.timeline.startTime}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>End:</Text>
                <Text style={styles.value}>{event.timeline.endTime}</Text>
              </View>
              {event.timeline.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.label}>Description:</Text>
                  <Text style={styles.descriptionText}>{event.timeline.description}</Text>
                </View>
              )}
            </View>
          )}

          {event.eventType !== 'meetings' && (
            <View style={styles.card}>
              <View style={styles.iconRow}>
                <CreditCard size={20} color={Colors.light.tint} />
                <Text style={styles.cardTitle}>Payment Status</Text>
              </View>
            <View style={styles.paymentStatusRow}>
              {event.financials.payment.status === 'received' ? (
                <View style={styles.paymentBadgeReceived}>
                  <CheckCircle size={16} color="#7FA979" />
                  <Text style={styles.paymentStatusTextReceived}>Payment Received</Text>
                </View>
              ) : (
                <View style={styles.paymentBadgePending}>
                  <AlertCircle size={16} color="#C17B6B" />
                  <Text style={styles.paymentStatusTextPending}>Payment Pending</Text>
                </View>
              )}
            </View>
            {event.financials.payment.status === 'received' && (
              <>
                {event.financials.payment.dateReceived && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Date Received:</Text>
                    <Text style={styles.value}>{event.financials.payment.dateReceived}</Text>
                  </View>
                )}
                {event.financials.payment.method && (
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Payment Method:</Text>
                    <Text style={styles.value}>
                      {event.financials.payment.method === 'cash' ? 'Cash' : 'Bank Transfer'}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
          )}

          {event.eventType !== 'meetings' && (
            <View style={styles.card}>
              <View style={styles.iconRow}>
                <DollarSign size={20} color={Colors.light.tint} />
                <Text style={styles.cardTitle}>Financials</Text>
              </View>
            <View style={styles.financialRow}>
              <Text style={styles.label}>Venue Rental Fee:</Text>
              <Text style={styles.valueGreen}>€{event.financials.venueRentalFee.toFixed(2)}</Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.label}>Income from Extras:</Text>
              <Text style={styles.valueGreen}>€{event.financials.incomeFromExtras.toFixed(2)}</Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.label}>Total Income:</Text>
              <Text style={styles.valueBold}>€{totalIncome.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.financialRow}>
              <Text style={styles.label}>Costs:</Text>
              <Text style={styles.valueRed}>€{event.financials.costs.toFixed(2)}</Text>
            </View>
            {event.financials.plannerCommission && event.financials.plannerCommission > 0 && (
              <View style={styles.financialRow}>
                <Text style={styles.label}>Planner Commission:</Text>
                <Text style={styles.valueRed}>€{event.financials.plannerCommission.toFixed(2)}</Text>
              </View>
            )}
            {event.financials.plannerCommission && event.financials.plannerCommission > 0 && (
              <View style={styles.financialRow}>
                <Text style={styles.label}>Total Costs:</Text>
                <Text style={styles.valueBold}>€{totalCosts.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.financialRow}>
              <Text style={styles.labelBold}>Net Profit:</Text>
              <Text style={[styles.valueBold, netProfit >= 0 ? styles.valueGreen : styles.valueRed]}>
                €{netProfit.toFixed(2)}
              </Text>
            </View>
          </View>
          )}

          {event.notes && (
            <View style={styles.card}>
              <View style={styles.iconRow}>
                <FileText size={20} color={Colors.light.tint} />
                <Text style={styles.cardTitle}>Notes</Text>
              </View>
              <Text style={styles.notesText}>{event.notes}</Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => {
                if (event && onEdit) {
                  onEdit(event);
                }
              }}
            >
              <Edit2 size={20} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Edit Event</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Trash2 size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete Event</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#8B7E74',
    fontWeight: '500' as const,
  },
  labelBold: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '700' as const,
  },
  value: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  valueBold: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '700' as const,
  },
  valueGreen: {
    fontSize: 14,
    color: '#7FA979',
    fontWeight: '600' as const,
  },
  valueRed: {
    fontSize: 14,
    color: '#C17B6B',
    fontWeight: '600' as const,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.light.text,
    marginTop: 4,
    lineHeight: 20,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8D7C3',
    marginVertical: 8,
  },
  notesText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#C17B6B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  bottomPadding: {
    height: 40,
  },
  paymentStatusRow: {
    marginBottom: 12,
  },
  paymentBadgeReceived: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7FA979',
    alignSelf: 'flex-start',
  },
  paymentBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C17B6B',
    alignSelf: 'flex-start',
  },
  paymentStatusTextReceived: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#7FA979',
  },
  paymentStatusTextPending: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#C17B6B',
  },
});
