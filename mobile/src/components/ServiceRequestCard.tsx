import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ServiceRequest, SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS } from '../types';
import { StatusBadge } from './StatusBadge';

interface ServiceRequestCardProps {
  request: ServiceRequest;
  onPress: () => void;
  showCustomer?: boolean;
}

export const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({
  request,
  onPress,
  showCustomer = false,
}) => {
  const categoryLabel = SERVICE_CATEGORY_LABELS[request.category] || request.category;
  const categoryIcon = SERVICE_CATEGORY_ICONS[request.category] || '🔧';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>{categoryIcon}</Text>
          <Text style={styles.categoryText}>{categoryLabel}</Text>
        </View>
        <StatusBadge status={request.status} />
      </View>

      <Text style={styles.title}>{request.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {request.description}
      </Text>

      <View style={styles.footer}>
        {showCustomer && request.customer && (
          <Text style={styles.customerText}>
            👤 {request.customer.fullName}
          </Text>
        )}
        {request.address && (
          <Text style={styles.addressText} numberOfLines={1}>
            📍 {request.address}
          </Text>
        )}
        {request.finalPrice !== undefined && request.finalPrice > 0 && (
          <Text style={styles.priceText}>R$ {request.finalPrice.toFixed(2)}</Text>
        )}
      </View>

      <Text style={styles.date}>
        {new Date(request.createdAt).toLocaleDateString('pt-BR')}
      </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: { flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { fontSize: 16, marginRight: 6 },
  categoryText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  title: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  description: { fontSize: 14, color: '#6B7280', marginBottom: 10, lineHeight: 20 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 6 },
  customerText: { fontSize: 12, color: '#4B5563' },
  addressText: { fontSize: 12, color: '#6B7280', flex: 1 },
  priceText: { fontSize: 14, color: '#059669', fontWeight: '700' },
  date: { fontSize: 11, color: '#9CA3AF' },
});
