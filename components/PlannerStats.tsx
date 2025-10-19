import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { usePlanners } from '@/contexts/PlannerContext';
import { useEvents } from '@/contexts/EventContext';
import { useVenue } from '@/contexts/VenueContext';
import BlurredMoney from '@/components/BlurredMoney';
import Colors from '@/constants/colors';

export default function PlannerStatsComponent() {
  const { getAllPlanners } = usePlanners();
  const { getAllEvents } = useEvents();
  const { bookings } = useVenue();

  const plannerStats = useMemo(() => {
    return getAllPlanners.map((planner) => {
      const plannerEvents = getAllEvents.filter(
        (event) => event.financials.plannerId === planner.id
      );

      const totalVenueRentalFees = plannerEvents.reduce(
        (sum, event) => sum + event.financials.venueRentalFee,
        0
      );

      const totalCommissions = plannerEvents.reduce(
        (sum, event) => sum + (event.financials.plannerCommission || 0),
        0
      );

      const onHoldDates = Object.values(bookings).filter(
        (booking) => booking.plannerId === planner.id && booking.status === 'on-hold'
      ).length;

      return {
        planner,
        totalEvents: plannerEvents.length,
        totalVenueRentalFees,
        totalCommissions,
        onHoldDates,
      };
    });
  }, [getAllPlanners, getAllEvents, bookings]);

  if (plannerStats.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No planners to show statistics</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {plannerStats.map((stat) => (
        <View key={stat.planner.id} style={styles.card}>
          <Text style={styles.plannerName}>{stat.planner.name}</Text>
          <Text style={styles.companyName}>{stat.planner.companyName}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stat.totalEvents}</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stat.onHoldDates}</Text>
              <Text style={styles.statLabel}>On-Hold Dates</Text>
            </View>
          </View>

          <View style={styles.financialsContainer}>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Rental Fees:</Text>
              <BlurredMoney amount={stat.totalVenueRentalFees} style={styles.financialValue} />
            </View>

            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Commissions:</Text>
              <BlurredMoney amount={stat.totalCommissions} style={styles.financialValueGreen} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  plannerName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.tint,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  financialsContainer: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8D7C3',
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  financialValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '600',
  },
  financialValueGreen: {
    fontSize: 16,
    color: '#7FA979',
    fontWeight: '600',
  },
});
