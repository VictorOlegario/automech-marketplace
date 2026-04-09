import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MechanicProfile } from '../types';
import { StarRating } from './StarRating';

interface MechanicCardProps {
  mechanic: MechanicProfile;
  onPress: () => void;
}

export const MechanicCard: React.FC<MechanicCardProps> = ({ mechanic, onPress }) => {
  const isNew = mechanic.isNew || mechanic.completedServices < 5;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {mechanic.user?.fullName?.charAt(0)?.toUpperCase() || 'M'}
          </Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {mechanic.user?.fullName || 'Mecânico'}
            </Text>
            {mechanic.verifiedStatus && <Text style={styles.verified}>✓</Text>}
            {isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Novo</Text>
              </View>
            )}
          </View>
          <View style={styles.ratingRow}>
            <StarRating rating={mechanic.averageRating} size={14} />
            <Text style={styles.reviewCount}>({mechanic.totalReviews})</Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>
            {mechanic.distanceKm ? `${mechanic.distanceKm.toFixed(1)} km` : mechanic.serviceRegion || 'N/A'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>🔧</Text>
          <Text style={styles.detailText}>{mechanic.completedServices} serviços</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>⏱️</Text>
          <Text style={styles.detailText}>~{mechanic.responseTimeAvg} min</Text>
        </View>
      </View>

      {mechanic.specialties && mechanic.specialties.length > 0 && (
        <View style={styles.specialties}>
          {mechanic.specialties.slice(0, 3).map((s, i) => (
            <View key={i} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.price}>
          {mechanic.minPrice && mechanic.maxPrice
            ? `R$ ${mechanic.minPrice} - R$ ${mechanic.maxPrice}`
            : 'Consultar'}
        </Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Ver Perfil</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '700', color: '#1F2937', maxWidth: '60%' },
  verified: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  newBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  newBadgeText: { fontSize: 10, color: '#D97706', fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  reviewCount: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  details: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailIcon: { fontSize: 12, marginRight: 4 },
  detailText: { fontSize: 12, color: '#6B7280' },
  specialties: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  specialtyTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  specialtyText: { fontSize: 11, color: '#4B5563' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  price: { fontSize: 14, color: '#059669', fontWeight: '600' },
  button: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
});
