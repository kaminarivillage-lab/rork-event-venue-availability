import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Share2, Copy, User, Trash2, Eye, EyeOff } from 'lucide-react-native';
import { AutumnColors } from '@/constants/colors';
import { useVenue } from '@/contexts/VenueContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanners } from '@/contexts/PlannerContext';
import { useEvents } from '@/contexts/EventContext';
import { usePrivacy } from '@/contexts/PrivacyContext';
import * as Clipboard from 'expo-clipboard';

export default function SettingsScreen() {
  const { getHoldDurationDays, updateHoldDuration } = useVenue();
  const { user, isAdmin, switchToAdmin, switchToPlanner } = useAuth();
  const { getAllPlanners } = usePlanners();
  const { clearAllEvents, getAllEvents } = useEvents();
  const { isMoneyBlurred, toggleMoneyBlur } = usePrivacy();
  const insets = useSafeAreaInsets();
  const [days, setDays] = useState<string>(getHoldDurationDays().toString());
  
  const wordpressUrl = `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8081'}/api/calendar-sync`;

  const handleSave = () => {
    const numDays = parseInt(days, 10);
    if (isNaN(numDays) || numDays < 1) {
      Alert.alert('Invalid Input', 'Please enter a valid number of days (minimum 1)');
      return;
    }
    
    updateHoldDuration(numDays);
    Alert.alert('Success', `On-hold period updated to ${numDays} days`);
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(wordpressUrl);
    Alert.alert('Copied', 'API URL copied to clipboard');
  };

  const shareUrl = () => {
    Alert.alert(
      'WordPress Integration',
      `To integrate this calendar with your WordPress site:\n\n1. Install a plugin like "Code Snippets" or add to your theme's functions.php\n\n2. Add this code:\n\n<?php\nfunction display_venue_calendar() {\n  $response = wp_remote_get('${wordpressUrl}');\n  if (is_wp_error($response)) {\n    return 'Unable to load calendar';\n  }\n  $data = json_decode(wp_remote_retrieve_body($response));\n  // Process and display $data\n}\nadd_shortcode('venue_calendar', 'display_venue_calendar');\n?>\n\n3. Use [venue_calendar] shortcode on any page`,
      [{ text: 'OK' }]
    );
  };

  const handleClearAllEvents = () => {
    Alert.alert(
      'Clear All Events',
      `Are you sure you want to delete all ${getAllEvents.length} events? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await clearAllEvents();
            Alert.alert('Success', 'All events have been deleted');
          },
        },
      ]
    );
  };





  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          {isMoneyBlurred ? (
            <EyeOff size={24} color={AutumnColors.terracotta} />
          ) : (
            <Eye size={24} color={AutumnColors.terracotta} />
          )}
          <Text style={styles.sectionTitle}>Privacy</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Control the visibility of sensitive financial information
        </Text>
        
        <View style={styles.toggleContainer}>
          <View style={styles.toggleContent}>
            <Text style={styles.toggleLabel}>Blur Money Data</Text>
            <Text style={styles.toggleSubLabel}>
              Hide all currency amounts throughout the app
            </Text>
          </View>
          <Switch
            value={isMoneyBlurred}
            onValueChange={toggleMoneyBlur}
            trackColor={{ false: AutumnColors.paleGold, true: AutumnColors.sage }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <User size={24} color={AutumnColors.terracotta} />
          <Text style={styles.sectionTitle}>User Role</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Switch between admin and planner views for testing
        </Text>
        
        <View style={styles.roleContainer}>
          <Text style={styles.currentRoleLabel}>Current Role:</Text>
          <Text style={styles.currentRole}>{user?.role.toUpperCase()}</Text>
        </View>

        <TouchableOpacity 
          style={styles.switchButton} 
          onPress={switchToAdmin}
          disabled={isAdmin}
        >
          <Text style={styles.switchButtonText}>Switch to Admin</Text>
        </TouchableOpacity>

        {getAllPlanners.length > 0 && (
          <>
            <Text style={styles.orText}>or</Text>
            <Text style={styles.switchLabel}>Switch to Planner View:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.plannerContainer}>
                {getAllPlanners.map((planner) => (
                  <TouchableOpacity
                    key={planner.id}
                    style={[
                      styles.plannerChip,
                      user?.plannerId === planner.id && styles.plannerChipActive,
                    ]}
                    onPress={() => switchToPlanner(planner.id)}
                  >
                    <Text
                      style={[
                        styles.plannerChipText,
                        user?.plannerId === planner.id && styles.plannerChipTextActive,
                      ]}
                    >
                      {planner.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={24} color={AutumnColors.terracotta} />
          <Text style={styles.sectionTitle}>On-Hold Period</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Set how many days a date should remain on-hold before automatically becoming available again
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={days}
            onChangeText={setDays}
            keyboardType="number-pad"
            placeholder="Enter number of days"
            placeholderTextColor={AutumnColors.warmGray + '80'}
          />
          <Text style={styles.inputLabel}>days</Text>
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Share2 size={24} color={AutumnColors.terracotta} />
          <Text style={styles.sectionTitle}>WordPress Integration</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Sync this calendar with your WordPress website so partners can view availability
        </Text>
        
        <View style={styles.urlContainer}>
          <Text style={styles.urlLabel}>API Endpoint:</Text>
          <View style={styles.urlBox}>
            <Text style={styles.urlText} numberOfLines={2}>
              {wordpressUrl}
            </Text>
            <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
              <Copy size={20} color={AutumnColors.sage} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.infoButton} 
          onPress={shareUrl}
          activeOpacity={0.7}
        >
          <Text style={styles.infoButtonText}>View Integration Instructions</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>API Response Format:</Text>
          <Text style={styles.infoCode}>
            {`{\n  "bookings": [\n    {\n      "date": "2024-01-15",\n      "status": "booked"\n    }\n  ],\n  "stats": {\n    "bookedCount": 5,\n    "onHoldCount": 3\n  }\n}`}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Trash2 size={24} color={AutumnColors.terracotta} />
          <Text style={styles.sectionTitle}>Data Management</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Clear all events from the system. This is useful for testing or starting fresh.
        </Text>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Total Events:</Text>
          <Text style={styles.statsValue}>{getAllEvents.length}</Text>
        </View>

        <TouchableOpacity 
          style={styles.dangerButton} 
          onPress={handleClearAllEvents}
          disabled={getAllEvents.length === 0}
        >
          <Text style={styles.dangerButtonText}>Clear All Events</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AutumnColors.cream,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
  },
  sectionDescription: {
    fontSize: 14,
    color: AutumnColors.warmGray,
    opacity: 0.7,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 2,
    borderColor: AutumnColors.paleGold,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: AutumnColors.warmGray,
    backgroundColor: AutumnColors.cream,
  },
  inputLabel: {
    fontSize: 16,
    color: AutumnColors.warmGray,
    fontWeight: '500' as const,
  },
  saveButton: {
    backgroundColor: AutumnColors.sage,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  urlContainer: {
    marginBottom: 16,
  },
  urlLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
    marginBottom: 8,
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AutumnColors.cream,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AutumnColors.paleGold,
  },
  urlText: {
    flex: 1,
    fontSize: 12,
    color: AutumnColors.warmGray,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  infoButton: {
    backgroundColor: AutumnColors.paleGold,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  infoButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
  },
  infoBox: {
    backgroundColor: AutumnColors.cream,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: AutumnColors.sage,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
    marginBottom: 8,
  },
  infoCode: {
    fontSize: 11,
    color: AutumnColors.warmGray,
    fontFamily: 'monospace',
    lineHeight: 16,
  },

  roleContainer: {
    backgroundColor: AutumnColors.cream,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentRoleLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: AutumnColors.warmGray,
  },
  currentRole: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: AutumnColors.sage,
  },
  switchButton: {
    backgroundColor: AutumnColors.sage,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  orText: {
    textAlign: 'center',
    fontSize: 12,
    color: AutumnColors.warmGray,
    opacity: 0.6,
    marginVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: AutumnColors.warmGray,
    marginBottom: 12,
  },
  plannerContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  plannerChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AutumnColors.cream,
    borderWidth: 2,
    borderColor: AutumnColors.paleGold,
  },
  plannerChipActive: {
    backgroundColor: AutumnColors.sage,
    borderColor: AutumnColors.sage,
  },
  plannerChipText: {
    fontSize: 14,
    color: AutumnColors.warmGray,
    fontWeight: '500' as const,
  },
  plannerChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AutumnColors.cream,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: AutumnColors.warmGray,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: AutumnColors.terracotta,
  },
  dangerButton: {
    backgroundColor: AutumnColors.terracotta,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AutumnColors.cream,
    padding: 16,
    borderRadius: 12,
  },
  toggleContent: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: AutumnColors.warmGray,
    marginBottom: 4,
  },
  toggleSubLabel: {
    fontSize: 13,
    color: AutumnColors.warmGray,
    opacity: 0.7,
    lineHeight: 18,
  },
});
