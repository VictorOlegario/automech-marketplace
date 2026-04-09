import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Switch,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { serviceRequestsApi, mechanicsApi } from '../../services/api';
import { ServiceRequest, MechanicProfile } from '../../types';
import { ServiceRequestCard } from '../../components/ServiceRequestCard';

interface MechanicHomeScreenProps {
  navigation: any;
}

export const MechanicHomeScreen: React.FC<MechanicHomeScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [availableRequests, setAvailableRequests] = useState<ServiceRequest[]>([]);
  const [myJobs, setMyJobs] = useState<ServiceRequest[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<MechanicProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const lat = user?.latitude || -23.5505;
      const lng = user?.longitude || -46.6333;

      const [available, jobs, prof] = await Promise.all([
        serviceRequestsApi.getAvailable(lat, lng, 20).catch(() => []),
        serviceRequestsApi.getMyJobs().catch(() => []),
        mechanicsApi.getProfile(user!.id).catch(() => null),
      ]);
      setAvailableRequests(available);
      setMyJobs(jobs);
      if (prof) {
        setProfile(prof);
        setIsAvailable(prof.isAvailable);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleAvailability = async (value: boolean) => {
    setIsAvailable(value);
    try {
      await mechanicsApi.toggleAvailability(value);
    } catch {
      setIsAvailable(!value);
    }
  };

  const activeJobs = myJobs.filter((j) =>
    ['accepted', 'in_transit', 'in_progress'].includes(j.status),
  );
  const completedJobs = myJobs.filter((j) => j.status === 'completed');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.fullName?.split(' ')[0]} 🔧</Text>
          <Text style={styles.subGreeting}>Painel do Mecânico</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Availability Toggle */}
      <View style={styles.availabilityCard}>
        <View>
          <Text style={styles.availabilityLabel}>Status</Text>
          <Text style={[styles.availabilityStatus, { color: isAvailable ? '#059669' : '#EF4444' }]}>
            {isAvailable ? '🟢 Disponível' : '🔴 Indisponível'}
          </Text>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={toggleAvailability}
          trackColor={{ false: '#FCA5A5', true: '#BBF7D0' }}
          thumbColor={isAvailable ? '#059669' : '#EF4444'}
        />
      </View>

      {/* Stats */}
      {profile && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.averageRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>⭐ Nota</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.completedServices}</Text>
            <Text style={styles.statLabel}>✅ Serviços</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.totalReviews}</Text>
            <Text style={styles.statLabel}>💬 Avaliações</Text>
          </View>
        </View>
      )}

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Em Andamento ({activeJobs.length})</Text>
          {activeJobs.map((job) => (
            <ServiceRequestCard
              key={job.id}
              request={job}
              showCustomer
              onPress={() => navigation.navigate('JobDetail', { requestId: job.id })}
            />
          ))}
        </View>
      )}

      {/* Available Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Chamados Disponíveis ({availableRequests.length})
        </Text>
        {availableRequests.length > 0 ? (
          availableRequests.map((req) => (
            <ServiceRequestCard
              key={req.id}
              request={req}
              showCustomer
              onPress={() => navigation.navigate('JobDetail', { requestId: req.id })}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Nenhum chamado disponível no momento</Text>
          </View>
        )}
      </View>

      {/* Completed */}
      {completedJobs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimos Finalizados</Text>
          {completedJobs.slice(0, 3).map((job) => (
            <ServiceRequestCard
              key={job.id}
              request={job}
              showCustomer
              onPress={() => navigation.navigate('JobDetail', { requestId: job.id })}
            />
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#0F172A',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  subGreeting: { fontSize: 14, color: '#94A3B8', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 8 },
  logoutText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  availabilityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  availabilityLabel: { fontSize: 13, color: '#6B7280' },
  availabilityStatus: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  emptyState: { alignItems: 'center', padding: 30 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
});
