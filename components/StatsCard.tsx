import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AutumnColors } from '@/constants/colors';

interface StatsCardProps {
  bookedCount: number;
  onHoldCount: number;
  total: number;
}

export default function StatsCard({ bookedCount, onHoldCount, total }: StatsCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{bookedCount}</Text>
        <Text style={styles.statLabel}>Booked</Text>
        <View style={[styles.indicator, { backgroundColor: AutumnColors.terracotta }]} />
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{onHoldCount}</Text>
        <Text style={styles.statLabel}>On Hold</Text>
        <View style={[styles.indicator, { backgroundColor: AutumnColors.mutedOrange }]} />
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{total}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: AutumnColors.warmGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: AutumnColors.warmGray,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: AutumnColors.warmGray,
    opacity: 0.7,
  },
  indicator: {
    width: 24,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  divider: {
    width: 1,
    backgroundColor: AutumnColors.paleGold,
    marginHorizontal: 8,
  },
});
