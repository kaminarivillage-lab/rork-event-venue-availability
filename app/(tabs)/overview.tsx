import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Clock,
  AlertCircle,
  Users,
  Briefcase,
} from 'lucide-react-native';
import { useEvents } from '@/contexts/EventContext';
import { useVenue } from '@/contexts/VenueContext';
import { useExpenses } from '@/contexts/ExpenseContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanners } from '@/contexts/PlannerContext';
import { useVendors } from '@/contexts/VendorContext';
import { useRouter } from 'expo-router';
import BlurredMoney from '@/components/BlurredMoney';
import Colors, { AutumnColors } from '@/constants/colors';
import { VenueEvent } from '@/types/venue';

const EVENT_TYPE_LABELS: Record<string, string> = {
  'wedding': 'Wedding',
  'baptism': 'Baptism',
  'kids-party': 'Kids Party',
  'corporate-dinner': 'Corporate Dinner',
  'meetings': 'Meeting',
  'other': 'Other',
};

export default function OverviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getAllEvents, getPendingPayments } = useEvents();
  const { stats } = useVenue();
  const { user, isPlanner } = useAuth();
  const { getExpensesSummary } = useExpenses();
  const { getAllPlanners } = usePlanners();
  const { getAllVendors } = useVendors();

  const filteredEvents = useMemo(() => {
    if (isPlanner && user?.plannerId) {
      return getAllEvents.filter(event => event.financials.plannerId === user.plannerId);
    }
    return getAllEvents;
  }, [getAllEvents, isPlanner, user]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filteredEvents
      .filter(event => new Date(event.date) >= today)
      .slice(0, 5);
  }, [filteredEvents]);

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

  const expenseSummary = getExpensesSummary;
  const totalCombinedCosts = eventFinancials.totalAllCosts + (isPlanner ? 0 : expenseSummary.totalExpenses);
  const netProfit = eventFinancials.totalIncome - totalCombinedCosts;

  const filteredPendingPayments = useMemo(() => {
    if (isPlanner && user?.plannerId) {
      return getPendingPayments.filter(event => event.financials.plannerId === user.plannerId);
    }
    return getPendingPayments;
  }, [getPendingPayments, isPlanner, user]);

  const handleEventPress = (event: VenueEvent) => {
    router.push('/events');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingTop: insets.top }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcomeText}>Overview</Text>
        <Text style={styles.subtitleText}>Your venue at a glance</Text>

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

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Clock size={24} color={AutumnColors.terracotta} />
            </View>
            <Text style={styles.statValue}>{stats.onHoldCount}</Text>
            <Text style={styles.statLabel}>On Hold</Text>
          </View>
        </View>

        {!isPlanner && (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Users size={24} color={AutumnColors.sage} />
              </View>
              <Text style={styles.statValue}>{getAllPlanners.length}</Text>
              <Text style={styles.statLabel}>Planners</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Briefcase size={24} color={AutumnColors.sage} />
              </View>
              <Text style={styles.statValue}>{getAllVendors.length}</Text>
              <Text style={styles.statLabel}>Vendors</Text>
            </View>
          </View>
        )}

        <View style={styles.financialCard}>
          <View style={styles.financialHeader}>
            <View style={styles.iconRow}>
              <DollarSign size={24} color={Colors.light.tint} />
              <Text style={styles.financialTitle}>Financial Summary</Text>
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
                <DollarSign size={20} color="#C17B6B" />
              </View>
              <Text style={styles.miniCardLabel}>Expenses</Text>
              <BlurredMoney amount={totalCombinedCosts} style={styles.miniCardValue} />
              <Text style={styles.miniCardSubtext}>
                Event Costs: <BlurredMoney amount={eventFinancials.totalCosts} style={styles.miniCardSubtext} />
              </Text>
              {!isPlanner && (
                <Text style={styles.miniCardSubtext}>
                  Venue: <BlurredMoney amount={expenseSummary.totalExpenses} style={styles.miniCardSubtext} />
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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <AlertCircle size={20} color="#C17B6B" />
                <Text style={styles.sectionTitle}>Pending Payments</Text>
              </View>
              <Text style={styles.sectionCount}>{filteredPendingPayments.length}</Text>
            </View>
            <View style={styles.sectionContent}>
              {filteredPendingPayments.slice(0, 3).map((event) => {
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
                    </View>
                    <BlurredMoney amount={totalIncome} style={styles.pendingPaymentAmount} />
                  </TouchableOpacity>
                );
              })}
              {filteredPendingPayments.length > 3 && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => router.push('/dashboard')}
                >
                  <Text style={styles.viewAllButtonText}>
                    View all {filteredPendingPayments.length} pending
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderRow}>
                <Calendar size={20} color={AutumnColors.sage} />
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
              </View>
              <Text style={styles.sectionCount}>{upcomingEvents.length}</Text>
            </View>
            <View style={styles.sectionContent}>
              {upcomingEvents.map((event) => {
                const isMeeting = event.eventType === 'meetings';
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.eventItem}
                    onPress={() => handleEventPress(event)}
                  >
                    <View style={styles.eventItemLeft}>
                      <View style={styles.eventDateBadge}>
                        <Text style={styles.eventDateMonth}>
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </Text>
                        <Text style={styles.eventDateDay}>
                          {new Date(event.date).getDate()}
                        </Text>
                      </View>
                      <View style={styles.eventItemInfo}>
                        <Text style={styles.eventItemName}>{event.name}</Text>
                        <Text style={styles.eventItemType}>
                          {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                        </Text>
                        {event.timeline && (
                          <Text style={styles.eventItemTime}>
                            {event.timeline.startTime} - {event.timeline.endTime}
                          </Text>
                        )}
                        {isMeeting && event.meetingDetails && (
                          <Text style={styles.eventItemTime}>
                            {event.meetingDetails.meetingTime}
                          </Text>
                        )}
                      </View>
                    </View>
                    {!isMeeting && (
                      <View style={styles.eventItemRight}>
                        <BlurredMoney 
                          amount={event.financials.venueRentalFee + event.financials.incomeFromExtras} 
                          style={styles.eventItemAmount}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
              {filteredEvents.length > upcomingEvents.length && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => router.push('/events')}
                >
                  <Text style={styles.viewAllButtonText}>View all events</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {upcomingEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color={AutumnColors.warmGray} opacity={0.3} />
            <Text style={styles.emptyStateText}>No Upcoming Events</Text>
            <Text style={styles.emptyStateSubtext}>
              Add events to see them here
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  welcomeText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 20,
  },
  subtitleText: {
    fontSize: 16,
    color: AutumnColors.warmGray,
    opacity: 0.7,
    marginTop: 4,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
    textAlign: 'center',
  },
  financialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
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
  divider: {
    height: 1,
    backgroundColor: '#E8D7C3',
    marginVertical: 12,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financialLabelBold: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '700' as const,
  },
  financialValueBold: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: AutumnColors.sage,
    backgroundColor: AutumnColors.cream,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionContent: {
    gap: 8,
  },
  pendingPaymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#C17B6B',
  },
  pendingPaymentInfo: {
    flex: 1,
  },
  pendingPaymentName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  pendingPaymentDate: {
    fontSize: 12,
    color: '#8B7E74',
  },
  pendingPaymentAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#C17B6B',
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AutumnColors.cream,
    padding: 12,
    borderRadius: 8,
  },
  eventItemLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  eventDateBadge: {
    width: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  eventDateMonth: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: AutumnColors.sage,
    textTransform: 'uppercase',
  },
  eventDateDay: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  eventItemInfo: {
    flex: 1,
  },
  eventItemName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  eventItemType: {
    fontSize: 12,
    color: AutumnColors.warmGray,
    marginBottom: 2,
  },
  eventItemTime: {
    fontSize: 11,
    color: AutumnColors.warmGray,
    opacity: 0.7,
  },
  eventItemRight: {
    alignItems: 'flex-end',
  },
  eventItemAmount: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: AutumnColors.sage,
  },
  viewAllButton: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: AutumnColors.cream,
    borderRadius: 8,
    marginTop: 4,
  },
  viewAllButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: AutumnColors.sage,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    marginTop: 24,
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
  bottomPadding: {
    height: 40,
  },
});
