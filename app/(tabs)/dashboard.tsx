import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Plus, TrendingUp, DollarSign, Calendar, TrendingDown, Receipt, Trash2, X, Filter, Edit3, AlertCircle } from 'lucide-react-native';
import { useEvents } from '@/contexts/EventContext';
import { useVenue } from '@/contexts/VenueContext';
import { useExpenses } from '@/contexts/ExpenseContext';
import { useAuth } from '@/contexts/AuthContext';
import EventForm from '@/components/EventForm';
import EventDetails from '@/components/EventDetails';
import BlurredMoney from '@/components/BlurredMoney';
import { VenueEvent, ExpenseCategory } from '@/types/venue';
import Colors from '@/constants/colors';
import { AutumnColors } from '@/constants/colors';

const EVENT_TYPE_LABELS: Record<string, string> = {
  'wedding': 'Wedding',
  'baptism': 'Baptism',
  'kids-party': 'Kids Party',
  'corporate-dinner': 'Corporate Dinner',
  'other': 'Other',
};

export default function DashboardScreen() {
  const { getAllEvents, getEventFinancialsSummary, getPendingPayments } = useEvents();
  const { stats } = useVenue();
  const { user, isPlanner } = useAuth();
  const { 
    getExpensesSummary,
    getAllExpenses, 
    addExpense, 
    deleteExpense, 
    expenseCategories,
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
  } = useExpenses();
  const [showEventForm, setShowEventForm] = useState<boolean>(false);
  const [showEventDetails, setShowEventDetails] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<VenueEvent | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>(expenseCategories[0]?.id || 'electricity');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseDescription, setExpenseDescription] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<ExpenseCategory | 'all'>('all');
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState<string>('');

  const filteredEvents = useMemo(() => {
    if (isPlanner && user?.plannerId) {
      return getAllEvents.filter(event => event.financials.plannerId === user.plannerId);
    }
    return getAllEvents;
  }, [getAllEvents, isPlanner, user]);

  const eventFinancials = useMemo(() => {
    const totalIncome = filteredEvents.reduce(
      (sum, event) => sum + event.financials.venueRentalFee + event.financials.incomeFromExtras,
      0
    );
    const totalCosts = filteredEvents.reduce(
      (sum, event) => sum + event.financials.costs,
      0
    );
    const totalCommissions = filteredEvents.reduce(
      (sum, event) => sum + (event.financials.plannerCommission || 0),
      0
    );
    return {
      totalIncome,
      totalCosts,
      totalCommissions,
      totalAllCosts: totalCosts + totalCommissions,
    };
  }, [filteredEvents]);

  const expenseSummary = getExpensesSummary;
  const totalCombinedCosts = eventFinancials.totalAllCosts + (isPlanner ? 0 : expenseSummary.totalExpenses);
  const netProfit = eventFinancials.totalIncome - totalCombinedCosts;

  const receivedIncome = useMemo(() => {
    return filteredEvents
      .filter(event => event.financials.payment.status === 'received')
      .reduce((sum, event) => sum + event.financials.venueRentalFee + event.financials.incomeFromExtras, 0);
  }, [filteredEvents]);

  const pendingIncome = useMemo(() => {
    return filteredEvents
      .filter(event => event.financials.payment.status === 'pending')
      .reduce((sum, event) => sum + event.financials.venueRentalFee + event.financials.incomeFromExtras, 0);
  }, [filteredEvents]);

  const filteredPendingPayments = useMemo(() => {
    if (isPlanner && user?.plannerId) {
      return getPendingPayments.filter(event => event.financials.plannerId === user.plannerId);
    }
    return getPendingPayments;
  }, [getPendingPayments, isPlanner, user]);

  const handleAddEvent = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setShowEventForm(true);
  };

  const handleEventPress = (event: VenueEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleCloseDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  const handleAddExpense = () => {
    const amount = parseFloat(expenseAmount);
    if (!expenseDate || isNaN(amount) || amount <= 0 || !expenseDescription.trim()) {
      Alert.alert('Invalid Input', 'Please fill all fields with valid data');
      return;
    }

    addExpense(expenseDate, expenseCategory, amount, expenseDescription);
    setShowExpenseModal(false);
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setExpenseCategory(expenseCategories[0]?.id || 'electricity');
    setExpenseAmount('');
    setExpenseDescription('');
    Alert.alert('Success', 'Expense added successfully');
  };

  const handleDeleteExpense = (id: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(id),
        },
      ]
    );
  };

  const filteredExpenses = getAllExpenses.filter((expense) => {
    if (selectedFilter === 'all') return true;
    return expense.category === selectedFilter;
  });

  const handleAddCategory = () => {
    if (!newCategoryLabel.trim()) {
      Alert.alert('Invalid Input', 'Category label cannot be empty');
      return;
    }
    addExpenseCategory(newCategoryLabel);
    setNewCategoryLabel('');
    Alert.alert('Success', 'Category added successfully');
  };

  const handleDeleteCategory = (id: string) => {
    const category = expenseCategories.find(cat => cat.id === id);
    if (category?.isDefault) {
      Alert.alert('Cannot Delete', 'Default categories cannot be deleted');
      return;
    }
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (deleteExpenseCategory(id)) {
              Alert.alert('Success', 'Category deleted successfully');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Calendar size={24} color={Colors.light.tint} />
              </View>
              <Text style={styles.statValue}>{filteredEvents.length}</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color={Colors.light.tint} />
              </View>
              <Text style={styles.statValue}>{stats.bookedCount}</Text>
              <Text style={styles.statLabel}>Booked Days</Text>
            </View>
          </View>

          <View style={styles.financialCard}>
            <View style={styles.financialHeader}>
              <View style={styles.iconRow}>
                <DollarSign size={24} color={Colors.light.tint} />
                <Text style={styles.financialTitle}>Financial Overview</Text>
              </View>
            </View>
            
            <View style={styles.incomeExpenseCards}>
              <View style={styles.miniCard}>
                <View style={styles.miniCardIcon}>
                  <TrendingUp size={20} color="#7FA979" />
                </View>
                <Text style={styles.miniCardLabel}>Income</Text>
                <BlurredMoney amount={eventFinancials.totalIncome} style={styles.miniCardValue} />
                <View style={styles.incomeBreakdown}>
                  <View style={styles.incomeRow}>
                    <View style={[styles.statusDot, { backgroundColor: '#7FA979' }]} />
                    <Text style={styles.miniCardSubtext}>
                      Received: <BlurredMoney amount={receivedIncome} style={styles.miniCardSubtext} />
                    </Text>
                  </View>
                  <View style={styles.incomeRow}>
                    <View style={[styles.statusDot, { backgroundColor: '#C17B6B' }]} />
                    <Text style={styles.miniCardSubtext}>
                      Pending: <BlurredMoney amount={pendingIncome} style={styles.miniCardSubtext} />
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.miniCard}>
                <View style={styles.miniCardIcon}>
                  <TrendingDown size={20} color="#C17B6B" />
                </View>
                <Text style={styles.miniCardLabel}>Expenses</Text>
                <BlurredMoney amount={totalCombinedCosts} style={styles.miniCardValue} />
                <Text style={styles.miniCardSubtext}>
                  Event Costs: <BlurredMoney amount={eventFinancials.totalCosts} style={styles.miniCardSubtext} />
                </Text>
                <Text style={styles.miniCardSubtext}>
                  Commissions: <BlurredMoney amount={eventFinancials.totalCommissions} style={styles.miniCardSubtext} />
                </Text>
                {!isPlanner && (
                  <Text style={styles.miniCardSubtext}>
                    Venue Expenses: <BlurredMoney amount={expenseSummary.totalExpenses} style={styles.miniCardSubtext} />
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.financialRow}>
              <Text style={styles.financialLabelBold}>Net Profit:</Text>
              <BlurredMoney 
                amount={netProfit} 
                style={[
                  styles.financialValueBold,
                  { color: netProfit >= 0 ? '#7FA979' : '#C17B6B' }
                ]} 
              />
            </View>
          </View>

          {filteredPendingPayments.length > 0 && (
            <View style={styles.pendingPaymentsSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.expenseHeaderRow}>
                  <AlertCircle size={24} color="#C17B6B" />
                  <Text style={styles.sectionTitle}>Pending Payments</Text>
                </View>
              </View>
              <Text style={styles.sectionDescription}>
                Events awaiting payment confirmation
              </Text>
              <View style={styles.pendingPaymentsList}>
                {filteredPendingPayments.map((event) => {
                  const totalIncome = event.financials.venueRentalFee + event.financials.incomeFromExtras;
                  return (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.pendingPaymentItem}
                      onPress={() => handleEventPress(event)}
                    >
                      <View style={styles.pendingPaymentInfo}>
                        <Text style={styles.pendingPaymentName}>{event.name}</Text>
                        <Text style={styles.pendingPaymentDate}>{event.date}</Text>
                        <Text style={styles.pendingPaymentType}>
                          {EVENT_TYPE_LABELS[event.eventType]}
                        </Text>
                      </View>
                      <View style={styles.pendingPaymentAmount}>
                        <BlurredMoney amount={totalIncome} style={styles.pendingPaymentAmountText} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {!isPlanner && (
          <View style={styles.expensesSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.expenseHeaderRow}>
                <Receipt size={24} color={AutumnColors.terracotta} />
                <Text style={styles.sectionTitle}>Venue Expenses</Text>
              </View>
            </View>
            <Text style={styles.sectionDescription}>
              Track expenses like electricity bills, maintenance, and other venue costs
            </Text>

            <View style={styles.expenseControls}>
              <TouchableOpacity
                style={styles.addExpenseButton}
                onPress={() => setShowExpenseModal(true)}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.addExpenseButtonText}>Add Expense</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editCategoriesButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <Edit3 size={18} color={AutumnColors.sage} />
                <Text style={styles.editCategoriesButtonText}>Edit Categories</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <Filter size={18} color={AutumnColors.warmGray} />
                <Text style={styles.filterTitle}>Filter by Category:</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterContainer}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedFilter === 'all' && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedFilter('all')}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedFilter === 'all' && styles.filterChipTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  {expenseCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.filterChip,
                        selectedFilter === cat.id && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedFilter(cat.id)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedFilter === cat.id && styles.filterChipTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {filteredExpenses.length === 0 ? (
              <View style={styles.emptyExpenses}>
                <Text style={styles.emptyExpensesText}>
                  {getAllExpenses.length === 0 ? 'No expenses recorded yet' : 'No expenses in this category'}
                </Text>
              </View>
            ) : (
              <View style={styles.expensesList}>
                {filteredExpenses.map((expense) => (
                  <View key={expense.id} style={styles.expenseItem}>
                    <View style={styles.expenseInfo}>
                      <View style={styles.expenseHeader}>
                        <Text style={styles.expenseCategoryText}>
                          {expenseCategories.find(c => c.id === expense.category)?.label || expense.category}
                        </Text>
                        <BlurredMoney amount={expense.amount} style={styles.expenseAmount} />
                      </View>
                      <Text style={styles.expenseDescriptionText}>{expense.description}</Text>
                      <Text style={styles.expenseDateText}>{expense.date}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteExpenseButton}
                      onPress={() => handleDeleteExpense(expense.id)}
                    >
                      <Trash2 size={18} color={AutumnColors.terracotta} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        <EventForm
          visible={showEventForm}
          onClose={() => setShowEventForm(false)}
          selectedDate={selectedDate}
        />

        <EventDetails
          visible={showEventDetails}
          onClose={handleCloseDetails}
          event={selectedEvent}
        />

        <Modal
          visible={showExpenseModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowExpenseModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Expense</Text>
                <TouchableOpacity onPress={() => setShowExpenseModal(false)}>
                  <X size={24} color={AutumnColors.warmGray} />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TextInput
                  style={styles.formInput}
                  value={expenseDate}
                  onChangeText={setExpenseDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={AutumnColors.warmGray + '80'}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryContainer}>
                    {expenseCategories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryChip,
                          expenseCategory === cat.id && styles.categoryChipActive,
                        ]}
                        onPress={() => setExpenseCategory(cat.id)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            expenseCategory === cat.id && styles.categoryChipTextActive,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount (€)</Text>
                <TextInput
                  style={styles.formInput}
                  value={expenseAmount}
                  onChangeText={setExpenseAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={AutumnColors.warmGray + '80'}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={expenseDescription}
                  onChangeText={setExpenseDescription}
                  placeholder="Enter expense details"
                  placeholderTextColor={AutumnColors.warmGray + '80'}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddExpense}>
                <Text style={styles.submitButtonText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showCategoryModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Manage Categories</Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                  <X size={24} color={AutumnColors.warmGray} />
                </TouchableOpacity>
              </View>

              <View style={styles.addCategorySection}>
                <Text style={styles.formLabel}>Add New Category</Text>
                <View style={styles.addCategoryRow}>
                  <TextInput
                    style={styles.addCategoryInput}
                    value={newCategoryLabel}
                    onChangeText={setNewCategoryLabel}
                    placeholder="Category name"
                    placeholderTextColor={AutumnColors.warmGray + '80'}
                  />
                  <TouchableOpacity
                    style={styles.addCategoryButton}
                    onPress={handleAddCategory}
                  >
                    <Plus size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.categorySeparator} />

              <ScrollView style={styles.categoryEditList}>
                <Text style={styles.categoryListTitle}>Existing Categories</Text>
                {expenseCategories.map((cat) => (
                  <View key={cat.id} style={styles.categoryEditItem}>
                    <View style={styles.categoryEditRow}>
                      <View style={styles.categoryEditInfo}>
                        <TextInput
                          style={styles.categoryEditInput}
                          value={cat.label}
                          onChangeText={(text) => updateExpenseCategory(cat.id, text)}
                          placeholder="Category Label"
                          placeholderTextColor={AutumnColors.warmGray + '80'}
                          editable={!cat.isDefault}
                        />
                        {cat.isDefault && (
                          <Text style={styles.defaultBadge}>Default</Text>
                        )}
                      </View>
                      {!cat.isDefault && (
                        <TouchableOpacity
                          style={styles.deleteCategoryButton}
                          onPress={() => handleDeleteCategory(cat.id)}
                        >
                          <Trash2 size={18} color={AutumnColors.terracotta} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.submitButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B7E74',
    fontWeight: '500' as const,
  },
  financialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  financialHeader: {
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  financialTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  financialLabel: {
    fontSize: 14,
    color: '#8B7E74',
    fontWeight: '500' as const,
  },
  financialLabelBold: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '700' as const,
  },
  financialValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '600' as const,
  },
  financialValueBold: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '700' as const,
  },
  financialValueRed: {
    fontSize: 14,
    color: '#C17B6B',
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8D7C3',
    marginVertical: 12,
  },
  incomeExpenseCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  miniCard: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  miniCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  miniCardLabel: {
    fontSize: 12,
    color: '#8B7E74',
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  miniCardValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  miniCardSubtext: {
    fontSize: 11,
    color: '#8B7E74',
    marginBottom: 2,
  },
  incomeBreakdown: {
    gap: 4,
    marginTop: 4,
  },
  incomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#8B7E74',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#A99B88',
    marginTop: 8,
    textAlign: 'center',
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventType: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#8B7E74',
  },
  eventCardBody: {
    gap: 8,
  },
  eventTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTime: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  eventFinancialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventFinancialLabel: {
    fontSize: 14,
    color: '#8B7E74',
  },
  eventFinancialValue: {
    fontSize: 14,
    color: '#7FA979',
    fontWeight: '600' as const,
  },
  bottomPadding: {
    height: 40,
  },
  expensesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  expenseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: AutumnColors.warmGray,
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 20,
  },
  expenseControls: {
    gap: 12,
    marginBottom: 16,
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AutumnColors.sage,
    paddingVertical: 12,
    borderRadius: 12,
  },
  editCategoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AutumnColors.cream,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AutumnColors.sage,
  },
  editCategoriesButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: AutumnColors.sage,
  },
  addExpenseButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  emptyExpenses: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyExpensesText: {
    fontSize: 14,
    color: AutumnColors.warmGray,
    opacity: 0.6,
  },
  expensesList: {
    gap: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    backgroundColor: AutumnColors.cream,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: AutumnColors.terracotta,
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseCategoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: AutumnColors.terracotta,
  },
  expenseDescriptionText: {
    fontSize: 13,
    color: AutumnColors.warmGray,
    marginBottom: 4,
  },
  expenseDateText: {
    fontSize: 11,
    color: AutumnColors.warmGray,
    opacity: 0.7,
  },
  deleteExpenseButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: AutumnColors.warmGray,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 2,
    borderColor: AutumnColors.paleGold,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: AutumnColors.warmGray,
    backgroundColor: AutumnColors.cream,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AutumnColors.cream,
    borderWidth: 1,
    borderColor: AutumnColors.paleGold,
  },
  categoryChipActive: {
    backgroundColor: AutumnColors.sage,
    borderColor: AutumnColors.sage,
  },
  categoryChipText: {
    fontSize: 13,
    color: AutumnColors.warmGray,
    fontWeight: '500' as const,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  submitButton: {
    backgroundColor: AutumnColors.sage,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
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
    fontSize: 13,
    color: AutumnColors.warmGray,
    fontWeight: '500' as const,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  categoryEditList: {
    maxHeight: 300,
  },
  categoryEditItem: {
    marginBottom: 12,
  },
  categoryEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryEditInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryEditInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: AutumnColors.paleGold,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: AutumnColors.warmGray,
    backgroundColor: AutumnColors.cream,
  },
  defaultBadge: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: AutumnColors.sage,
    backgroundColor: AutumnColors.paleGold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteCategoryButton: {
    padding: 8,
  },
  addCategorySection: {
    marginBottom: 16,
  },
  addCategoryRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addCategoryInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: AutumnColors.paleGold,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: AutumnColors.warmGray,
    backgroundColor: AutumnColors.cream,
  },
  addCategoryButton: {
    backgroundColor: AutumnColors.sage,
    padding: 10,
    borderRadius: 8,
  },
  categorySeparator: {
    height: 1,
    backgroundColor: AutumnColors.paleGold,
    marginVertical: 16,
  },
  categoryListTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
    marginBottom: 12,
  },
  pendingPaymentsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  pendingPaymentsList: {
    gap: 12,
  },
  pendingPaymentItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#C17B6B',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingPaymentInfo: {
    flex: 1,
  },
  pendingPaymentName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  pendingPaymentDate: {
    fontSize: 14,
    color: '#8B7E74',
    marginBottom: 2,
  },
  pendingPaymentType: {
    fontSize: 12,
    color: '#A99B88',
  },
  pendingPaymentAmount: {
    alignItems: 'flex-end',
  },
  pendingPaymentAmountText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#C17B6B',
  },
});
