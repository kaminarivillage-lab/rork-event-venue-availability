import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CalendarView from '@/components/CalendarView';
import ListView from '@/components/ListView';
import { useVenue } from '@/contexts/VenueContext';
import { AutumnColors } from '@/constants/colors';

export default function CalendarScreen() {
  const { stats } = useVenue();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  return (
    <View style={styles.container}>
      {viewMode === 'calendar' ? (
        <CalendarView 
          bookedCount={stats.bookedCount}
          onHoldCount={stats.onHoldCount}
          total={stats.total}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      ) : (
        <ListView 
          bookedCount={stats.bookedCount}
          onHoldCount={stats.onHoldCount}
          total={stats.total}
          viewMode={viewMode}
          setViewMode={setViewMode}
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
});
