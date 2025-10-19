import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Plus, Edit2, Trash2, Building2, Mail, Phone, Globe, ChevronDown, ChevronUp, Calendar as CalendarIcon, Instagram } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { usePlanners } from '@/contexts/PlannerContext';
import { useVendors } from '@/contexts/VendorContext';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { Planner } from '@/types/venue';
import { Vendor } from '@/types/vendor';
import PlannerStatsComponent from '@/components/PlannerStats';
import BlurredMoney from '@/components/BlurredMoney';

type SegmentType = 'planners' | 'vendors';
type ViewType = 'manage' | 'stats';

export default function ContactsScreen() {
  const [segment, setSegment] = useState<SegmentType>('planners');
  const [activeTab, setActiveTab] = useState<ViewType>('manage');
  
  const { getAllPlanners, addPlanner, updatePlanner, deletePlanner, getPlannerById, isLoading: plannersLoading } = usePlanners();
  const { getAllVendors, addVendor, updateVendor, deleteVendor, isLoaded: vendorsLoaded } = useVendors();
  const { getAllEvents } = useEvents();
  const { user, isPlanner, isLoading: authLoading } = useAuth();
  
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingPlanner, setEditingPlanner] = useState<Planner | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [name, setName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [instagram, setInstagram] = useState<string>('');

  const openAddPlannerModal = () => {
    setEditingPlanner(null);
    setEditingVendor(null);
    setName('');
    setCompanyName('');
    setEmail('');
    setTelephone('');
    setWebsite('');
    setInstagram('');
    setModalVisible(true);
  };

  const openEditPlannerModal = (planner: Planner) => {
    setEditingPlanner(planner);
    setEditingVendor(null);
    setName(planner.name);
    setCompanyName(planner.companyName);
    setEmail(planner.email);
    setTelephone(planner.telephone);
    setWebsite(planner.website || '');
    setInstagram('');
    setModalVisible(true);
  };

  const openAddVendorModal = () => {
    setEditingPlanner(null);
    setEditingVendor(null);
    setName('');
    setCompanyName('');
    setEmail('');
    setTelephone('');
    setWebsite('');
    setInstagram('');
    setModalVisible(true);
  };

  const openEditVendorModal = (vendor: Vendor) => {
    setEditingPlanner(null);
    setEditingVendor(vendor);
    setName(vendor.name);
    setCompanyName('');
    setEmail(vendor.email);
    setTelephone(vendor.telephone);
    setWebsite(vendor.website || '');
    setInstagram(vendor.instagram || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (segment === 'planners') {
      if (!name.trim() || !companyName.trim() || !email.trim() || !telephone.trim()) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      if (editingPlanner) {
        await updatePlanner(editingPlanner.id, {
          name: name.trim(),
          companyName: companyName.trim(),
          email: email.trim(),
          telephone: telephone.trim(),
          website: website.trim() || undefined,
        });
      } else {
        await addPlanner(
          name.trim(),
          companyName.trim(),
          email.trim(),
          telephone.trim(),
          website.trim() || undefined
        );
      }
    } else {
      if (!name.trim() || !email.trim() || !telephone.trim()) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      if (editingVendor) {
        updateVendor(editingVendor.id, {
          name: name.trim(),
          email: email.trim(),
          telephone: telephone.trim(),
          website: website.trim() || undefined,
          instagram: instagram.trim() || undefined,
        });
      } else {
        addVendor(
          name.trim(),
          telephone.trim(),
          email.trim(),
          website.trim() || undefined,
          instagram.trim() || undefined
        );
      }
    }

    setModalVisible(false);
  };

  const handleDeletePlanner = (planner: Planner) => {
    Alert.alert(
      'Delete Planner',
      `Are you sure you want to delete ${planner.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePlanner(planner.id),
        },
      ]
    );
  };

  const handleDeleteVendor = (vendor: Vendor) => {
    Alert.alert(
      'Delete Vendor',
      `Are you sure you want to delete ${vendor.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteVendor(vendor.id),
        },
      ]
    );
  };

  const planners = React.useMemo(() => {
    if (isPlanner && user?.plannerId) {
      const planner = getPlannerById(user.plannerId);
      return planner ? [planner] : [];
    }
    return getAllPlanners;
  }, [isPlanner, user, getAllPlanners, getPlannerById]);

  const getPlannerEvents = (plannerId: string) => {
    return getAllEvents
      .filter(event => event.financials.plannerId === plannerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getVendorEvents = (vendorId: string) => {
    return getAllEvents
      .filter(event => event.vendorIds?.includes(vendorId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getVendorStats = (vendorId: string) => {
    const vendorEvents = getVendorEvents(vendorId);
    return {
      totalEvents: vendorEvents.length,
      upcomingEvents: vendorEvents.filter(e => new Date(e.date) > new Date()).length,
      completedEvents: vendorEvents.filter(e => new Date(e.date) <= new Date()).length,
    };
  };

  const renderPlannerContent = () => {
    if (activeTab === 'stats') {
      return (
        <View style={styles.statsContainer}>
          <PlannerStatsComponent />
        </View>
      );
    }

    if (plannersLoading || authLoading) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      );
    }

    if (planners.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No planners added yet</Text>
          <Text style={styles.emptySubtext}>Add planners to manage event bookings</Text>
        </View>
      );
    }

    return (
      <View style={styles.itemsList}>
        {planners.map((planner) => (
          <View key={planner.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{planner.name}</Text>
              {!isPlanner && (
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditPlannerModal(planner)}
                  >
                    <Edit2 size={18} color={Colors.light.tint} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeletePlanner(planner)}
                  >
                    <Trash2 size={18} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.itemDetails}>
              <View style={styles.detailRow}>
                <Building2 size={16} color="#666" />
                <Text style={styles.detailText}>{planner.companyName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Mail size={16} color="#666" />
                <Text style={styles.detailText}>{planner.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Phone size={16} color="#666" />
                <Text style={styles.detailText}>{planner.telephone}</Text>
              </View>
              {planner.website && (
                <View style={styles.detailRow}>
                  <Globe size={16} color="#666" />
                  <Text style={styles.detailText}>{planner.website}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.eventsToggle}
              onPress={() => toggleExpand(planner.id)}
            >
              <CalendarIcon size={18} color={Colors.light.tint} />
              <Text style={styles.eventsToggleText}>
                Events ({getPlannerEvents(planner.id).length})
              </Text>
              {expandedId === planner.id ? (
                <ChevronUp size={18} color={Colors.light.tint} />
              ) : (
                <ChevronDown size={18} color={Colors.light.tint} />
              )}
            </TouchableOpacity>

            {expandedId === planner.id && (
              <View style={styles.eventsList}>
                {getPlannerEvents(planner.id).length === 0 ? (
                  <Text style={styles.noEventsText}>No events found</Text>
                ) : (
                  getPlannerEvents(planner.id).map((event) => (
                    <View key={event.id} style={styles.eventItem}>
                      <View style={styles.eventHeader}>
                        <Text style={styles.eventName}>{event.name}</Text>
                        <Text style={styles.eventDate}>
                          {new Date(event.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                      <View style={styles.eventDetails}>
                        <View style={styles.eventDetailItem}>
                          <Text style={styles.eventDetailLabel}>Type:</Text>
                          <Text style={styles.eventDetailValue}>
                            {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1).replace('-', ' ')}
                          </Text>
                        </View>
                        <View style={styles.eventDetailItem}>
                          <Text style={styles.eventDetailLabel}>Rental Fee:</Text>
                          <BlurredMoney 
                            amount={event.financials.venueRentalFee} 
                            style={styles.eventDetailValue}
                          />
                        </View>
                        {event.financials.plannerCommission && (
                          <View style={styles.eventDetailItem}>
                            <Text style={styles.eventDetailLabel}>Commission:</Text>
                            <Text style={styles.eventDetailValue}>
                              <BlurredMoney 
                                amount={event.financials.plannerCommission} 
                                style={styles.eventDetailValue}
                              />
                              {event.financials.plannerCommissionPercentage && (
                                <Text style={styles.percentageText}>
                                  {' '}({event.financials.plannerCommissionPercentage}%)
                                </Text>
                              )}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderVendorContent = () => {
    if (activeTab === 'stats') {
      return (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Vendor Statistics</Text>
          {getAllVendors.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No vendors to show statistics</Text>
            </View>
          ) : (
            <ScrollView style={styles.statsScroll}>
              {getAllVendors.map((vendor) => {
                const stats = getVendorStats(vendor.id);
                return (
                  <View key={vendor.id} style={styles.statsCard}>
                    <Text style={styles.statsCardTitle}>{vendor.name}</Text>
                    <View style={styles.statsGrid}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.totalEvents}</Text>
                        <Text style={styles.statLabel}>Total Events</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.upcomingEvents}</Text>
                        <Text style={styles.statLabel}>Upcoming</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.completedEvents}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      );
    }

    if (!vendorsLoaded) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      );
    }

    if (getAllVendors.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No vendors added yet</Text>
          <Text style={styles.emptySubtext}>Add vendors to track event suppliers</Text>
        </View>
      );
    }

    return (
      <View style={styles.itemsList}>
        {getAllVendors.map((vendor) => (
          <View key={vendor.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{vendor.name}</Text>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditVendorModal(vendor)}
                >
                  <Edit2 size={18} color={Colors.light.tint} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteVendor(vendor)}
                >
                  <Trash2 size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.itemDetails}>
              <View style={styles.detailRow}>
                <Mail size={16} color="#666" />
                <Text style={styles.detailText}>{vendor.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Phone size={16} color="#666" />
                <Text style={styles.detailText}>{vendor.telephone}</Text>
              </View>
              {vendor.website && (
                <View style={styles.detailRow}>
                  <Globe size={16} color="#666" />
                  <Text style={styles.detailText}>{vendor.website}</Text>
                </View>
              )}
              {vendor.instagram && (
                <View style={styles.detailRow}>
                  <Instagram size={16} color="#666" />
                  <Text style={styles.detailText}>{vendor.instagram}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.eventsToggle}
              onPress={() => toggleExpand(vendor.id)}
            >
              <CalendarIcon size={18} color={Colors.light.tint} />
              <Text style={styles.eventsToggleText}>
                Events ({getVendorEvents(vendor.id).length})
              </Text>
              {expandedId === vendor.id ? (
                <ChevronUp size={18} color={Colors.light.tint} />
              ) : (
                <ChevronDown size={18} color={Colors.light.tint} />
              )}
            </TouchableOpacity>

            {expandedId === vendor.id && (
              <View style={styles.eventsList}>
                {getVendorEvents(vendor.id).length === 0 ? (
                  <Text style={styles.noEventsText}>No events found</Text>
                ) : (
                  getVendorEvents(vendor.id).map((event) => (
                    <View key={event.id} style={styles.eventItem}>
                      <View style={styles.eventHeader}>
                        <Text style={styles.eventName}>{event.name}</Text>
                        <Text style={styles.eventDate}>
                          {new Date(event.date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                      <View style={styles.eventDetails}>
                        <View style={styles.eventDetailItem}>
                          <Text style={styles.eventDetailLabel}>Type:</Text>
                          <Text style={styles.eventDetailValue}>
                            {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1).replace('-', ' ')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Contacts</Text>
          {segment === 'planners' && (
            <Text style={styles.subtitle}>
              {isPlanner ? `Planner View${user?.plannerId ? ': ' + user.plannerId : ''}` : 'Admin View'}
            </Text>
          )}
        </View>
        {((segment === 'planners' && !isPlanner) || segment === 'vendors') && (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={segment === 'planners' ? openAddPlannerModal : openAddVendorModal}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>
              Add {segment === 'planners' ? 'Planner' : 'Vendor'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.segmentControl}>
        <TouchableOpacity
          style={[styles.segmentButton, segment === 'planners' && styles.segmentButtonActive]}
          onPress={() => setSegment('planners')}
        >
          <Text style={[styles.segmentText, segment === 'planners' && styles.segmentTextActive]}>
            Planners
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, segment === 'vendors' && styles.segmentButtonActive]}
          onPress={() => setSegment('vendors')}
        >
          <Text style={[styles.segmentText, segment === 'vendors' && styles.segmentTextActive]}>
            Vendors
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'manage' && styles.activeTab]}
          onPress={() => setActiveTab('manage')}
        >
          <Text style={[styles.tabText, activeTab === 'manage' && styles.activeTabText]}>
            Manage
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
            Statistics
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {segment === 'planners' ? renderPlannerContent() : renderVendorContent()}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {segment === 'planners'
                ? (editingPlanner ? 'Edit Planner' : 'Add Planner')
                : (editingVendor ? 'Edit Vendor' : 'Add Vendor')}
            </Text>

            <ScrollView style={styles.formScroll}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder={`Enter ${segment === 'planners' ? 'planner' : 'vendor'} name`}
                placeholderTextColor="#999"
              />

              {segment === 'planners' && (
                <>
                  <Text style={styles.label}>Company Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={companyName}
                    onChangeText={setCompanyName}
                    placeholder="Enter company name"
                    placeholderTextColor="#999"
                  />
                </>
              )}

              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Telephone *</Text>
              <TextInput
                style={styles.input}
                value={telephone}
                onChangeText={setTelephone}
                placeholder="Enter telephone"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                value={website}
                onChangeText={setWebsite}
                placeholder="Enter website (optional)"
                keyboardType="url"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />

              {segment === 'vendors' && (
                <>
                  <Text style={styles.label}>Instagram</Text>
                  <TextInput
                    style={styles.input}
                    value={instagram}
                    onChangeText={setInstagram}
                    placeholder="Enter Instagram handle (optional)"
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {(editingPlanner || editingVendor) ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
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
    padding: 16,
  },
  statsContainer: {
    flex: 1,
  },
  statsScroll: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  statsCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8D7C3',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    margin: 16,
    marginBottom: 0,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8D7C3',
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8D7C3',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  itemDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  eventsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    gap: 8,
  },
  eventsToggleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  eventsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8D7C3',
    gap: 12,
  },
  noEventsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  eventItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.tint,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.tint,
  },
  eventDetails: {
    gap: 6,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    minWidth: 110,
  },
  eventDetailValue: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: '600',
    flex: 1,
  },
  percentageText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 20,
  },
  formScroll: {
    maxHeight: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8D7C3',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
