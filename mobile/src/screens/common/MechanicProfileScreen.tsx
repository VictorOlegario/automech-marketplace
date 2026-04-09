import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { mechanicsApi, reviewsApi } from '../../services/api';
import { MechanicProfile, Review, ReviewsResponse } from '../../types';
import { StarRating } from '../../components/StarRating';

interface MechanicProfileScreenProps {
  route: any;
  navigation: any;
}

export const MechanicProfileScreen: React.FC<MechanicProfileScreenProps> = ({ route }) => {
  const { mechanicUserId } = route.params;
  const [profile, setProfile] = useState<MechanicProfile | null>(null);
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [mechanicUserId]);

  const loadProfile = async () => {
    try {
      const [prof, revs] = await Promise.all([
        mechanicsApi.getProfile(mechanicUserId),
        reviewsApi.getByMechanic(mechanicUserId, 1, 10, 'recent').catch(() => null),
      ]);
      setProfile(prof);
      setReviewsData(revs);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  if (!profile) return <Text style={styles.errorText}>Perfil não encontrado</Text>;

  const isNew = profile.isNew || profile.completedServices < 5;
  const distribution = reviewsData?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalDist = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>
            {profile.user?.fullName?.charAt(0)?.toUpperCase() || 'M'}
          </Text>
        </View>
        <Text style={styles.name}>{profile.user?.fullName}</Text>
        <View style={styles.badgesRow}>
          {profile.verifiedStatus && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verificado</Text>
            </View>
          )}
          {isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>Novo na plataforma</Text>
            </View>
          )}
        </View>
        <View style={styles.ratingLarge}>
          <StarRating rating={profile.averageRating} size={24} />
          <Text style={styles.reviewCountLarge}>({profile.totalReviews} avaliações)</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.completedServices}</Text>
          <Text style={styles.statLabel}>Serviços</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.yearsExperience} anos</Text>
          <Text style={styles.statLabel}>Experiência</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.acceptanceRate}%</Text>
          <Text style={styles.statLabel}>Aceite</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>~{profile.responseTimeAvg} min</Text>
          <Text style={styles.statLabel}>Resposta</Text>
        </View>
      </View>

      {/* Bio */}
      {profile.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>
      )}

      {/* Specialties */}
      {profile.specialties && profile.specialties.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Especialidades</Text>
          <View style={styles.tagsRow}>
            {profile.specialties.map((s, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certificações</Text>
          {profile.certifications.map((c, i) => (
            <View key={i} style={styles.certItem}>
              <Text style={styles.certIcon}>🏆</Text>
              <Text style={styles.certText}>{c}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        {profile.serviceRegion && (
          <Text style={styles.infoItem}>📍 Região: {profile.serviceRegion}</Text>
        )}
        {profile.serviceRadiusKm && (
          <Text style={styles.infoItem}>🗺️ Raio: {profile.serviceRadiusKm} km</Text>
        )}
        {profile.minPrice !== undefined && profile.maxPrice !== undefined && (
          <Text style={styles.infoItem}>
            💰 Faixa: R$ {profile.minPrice} - R$ {profile.maxPrice}
          </Text>
        )}
        <Text style={styles.infoItem}>
          📅 Na plataforma desde {new Date(profile.platformJoinDate).toLocaleDateString('pt-BR')}
        </Text>
      </View>

      {/* Rating Distribution */}
      {profile.totalReviews > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribuição das Notas</Text>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const pct = totalDist > 0 ? (count / totalDist) * 100 : 0;
            return (
              <View key={star} style={styles.distRow}>
                <Text style={styles.distStar}>{star} ★</Text>
                <View style={styles.distBarBg}>
                  <View style={[styles.distBarFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.distCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Reviews */}
      {reviewsData && reviewsData.reviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliações Recentes</Text>
          {reviewsData.reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>
                  {review.reviewer?.fullName || 'Cliente'}
                </Text>
                <StarRating rating={review.score} size={14} />
              </View>
              {review.comment && (
                <Text style={styles.reviewComment}>{review.comment}</Text>
              )}
              <View style={styles.reviewFooter}>
                <Text style={styles.reviewDate}>
                  {new Date(review.reviewDate).toLocaleDateString('pt-BR')}
                </Text>
                {review.helpfulCount > 0 && (
                  <Text style={styles.helpfulText}>👍 {review.helpfulCount}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#EF4444', textAlign: 'center', marginTop: 40 },
  header: {
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    paddingTop: 30,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#1E40AF', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  badgesRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  verifiedBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  verifiedText: { fontSize: 12, color: '#1E40AF', fontWeight: '600' },
  newBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  newBadgeText: { fontSize: 12, color: '#D97706', fontWeight: '600' },
  ratingLarge: { alignItems: 'center' },
  reviewCountLarge: { color: '#BFDBFE', fontSize: 13, marginTop: 4 },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 10 },
  bioText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tagText: { fontSize: 13, color: '#1E40AF', fontWeight: '500' },
  certItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  certIcon: { fontSize: 16, marginRight: 8 },
  certText: { fontSize: 14, color: '#374151' },
  infoItem: { fontSize: 14, color: '#4B5563', marginBottom: 6, lineHeight: 22 },
  distRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  distStar: { fontSize: 13, color: '#F59E0B', width: 36, fontWeight: '600' },
  distBarBg: { flex: 1, height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, marginHorizontal: 8 },
  distBarFill: { height: 8, backgroundColor: '#F59E0B', borderRadius: 4 },
  distCount: { fontSize: 12, color: '#6B7280', width: 24, textAlign: 'right' },
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  reviewComment: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  reviewFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  reviewDate: { fontSize: 12, color: '#9CA3AF' },
  helpfulText: { fontSize: 12, color: '#6B7280' },
});
