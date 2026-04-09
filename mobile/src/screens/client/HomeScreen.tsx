import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { mechanicsApi, serviceRequestsApi } from '../../services/api';
import { MechanicProfile, ServiceRequest, SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS, ServiceCategory } from '../../types';
import { MechanicCard } from '../../components/MechanicCard';
import { ServiceRequestCard } from '../../components/ServiceRequestCard';

interface HomeScreenProps {
  navigation: any;
}

export const ClientHomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [nearbyMechanics, setNearbyMechanics] = useState<MechanicProfile[]>([]);
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const lat = user?.latitude || -23.5505;
      const lng = user?.longitude || -46.6333;

      const [mechanics, requests] = await Promise.all([
        mechanicsApi.findNearby(lat, lng, 20, 'rating').catch(() => []),
        serviceRequestsApi.getMyRequests().catch(() => []),
      ]);
      setNearbyMechanics(mechanics);
      setMyRequests(requests);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const categories = Object.values(ServiceCategory);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.fullName?.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreeting}>Precisa de um mecânico?</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Serviços</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={styles.categoryCard}
              onPress={() => navigation.navigate('NewRequest', { category: cat })}
            >
              <Text style={styles.categoryIcon}>{SERVICE_CATEGORY_ICONS[cat]}</Text>
              <Text style={styles.categoryLabel}>{SERVICE_CATEGORY_LABELS[cat]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Active Requests */}
      {myRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meus Pedidos</Text>
          {myRequests.slice(0, 3).map((req) => (
            <ServiceRequestCard
              key={req.id}
              request={req}
              onPress={() => navigation.navigate('RequestDetail', { requestId: req.id })}
            />
          ))}
          {myRequests.length > 3 && (
            <TouchableOpacity onPress={() => navigation.navigate('MyRequests')}>
              <Text style={styles.seeAll}>Ver todos ({myRequests.length})</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Nearby Mechanics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mecânicos Próximos</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SearchMechanics')}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {nearbyMechanics.length > 0 ? (
          nearbyMechanics.slice(0, 5).map((mech) => (
            <MechanicCard
              key={mech.id}
              mechanic={mech}
              onPress={() => navigation.navigate('MechanicProfile', { mechanicUserId: mech.userId })}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Nenhum mecânico encontrado na região</Text>
          </View>
        )}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => navigation.navigate('NewRequest', {})}
      >
        <Text style={styles.ctaIcon}>🚗</Text>
        <Text style={styles.ctaText}>Solicitar Serviço</Text>
      </TouchableOpacity>

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
    backgroundColor: '#1E40AF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  subGreeting: { fontSize: 14, color: '#BFDBFE', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 },
  logoutText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  seeAll: { fontSize: 14, color: '#1E40AF', fontWeight: '600' },
  categoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginRight: 10,
    alignItems: 'center',
    width: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: { fontSize: 28, marginBottom: 6 },
  categoryLabel: { fontSize: 11, color: '#4B5563', textAlign: 'center', fontWeight: '500' },
  emptyState: { alignItems: 'center', padding: 30 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: '#1E40AF',
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaIcon: { fontSize: 24 },
  ctaText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
