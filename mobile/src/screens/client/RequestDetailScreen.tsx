import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { serviceRequestsApi, quotesApi, reviewsApi } from '../../services/api';
import { ServiceRequest, Quote, ServiceRequestStatus, QuoteStatus, SERVICE_CATEGORY_LABELS } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { StarRating } from '../../components/StarRating';

interface RequestDetailScreenProps {
  navigation: any;
  route: any;
}

export const RequestDetailScreen: React.FC<RequestDetailScreenProps> = ({ navigation, route }) => {
  const { requestId } = route.params;
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewScore, setReviewScore] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadData();
  }, [requestId]);

  const loadData = async () => {
    try {
      const [sr, quotesData] = await Promise.all([
        serviceRequestsApi.getById(requestId),
        quotesApi.getByServiceRequest(requestId).catch(() => []),
      ]);
      setRequest(sr);
      setQuotes(quotesData);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar detalhes');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      await quotesApi.accept(quoteId);
      Alert.alert('Sucesso', 'Orçamento aceito!');
      loadData();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao aceitar orçamento');
    }
  };

  const handleRejectQuote = async (quoteId: string) => {
    try {
      await quotesApi.reject(quoteId);
      loadData();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao rejeitar');
    }
  };

  const handleCancelRequest = async () => {
    Alert.alert('Cancelar', 'Tem certeza que deseja cancelar?', [
      { text: 'Não' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          try {
            await serviceRequestsApi.updateStatus(requestId, ServiceRequestStatus.CANCELLED, undefined, 'Cancelado pelo cliente');
            loadData();
          } catch (error: any) {
            Alert.alert('Erro', error.response?.data?.message || 'Falha ao cancelar');
          }
        },
      },
    ]);
  };

  const handleSubmitReview = async () => {
    if (reviewScore === 0) {
      Alert.alert('Erro', 'Selecione uma nota');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewsApi.create({
        serviceRequestId: requestId,
        score: reviewScore,
        comment: reviewComment,
      });
      Alert.alert('Obrigado!', 'Sua avaliação foi enviada.');
      loadData();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao enviar avaliação');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  if (!request) return null;

  const canCancel = [
    ServiceRequestStatus.REQUESTED,
    ServiceRequestStatus.QUOTED,
    ServiceRequestStatus.ACCEPTED,
  ].includes(request.status);

  const canReview = request.status === ServiceRequestStatus.COMPLETED && (!request.reviews || request.reviews.length === 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{request.title}</Text>
          <StatusBadge status={request.status} />
        </View>
        <Text style={styles.category}>
          {SERVICE_CATEGORY_LABELS[request.category]} • {request.urgency}
        </Text>
        <Text style={styles.description}>{request.description}</Text>
        {request.address && <Text style={styles.address}>📍 {request.address}</Text>}
        {request.vehicleInfo && <Text style={styles.vehicle}>🚗 {request.vehicleInfo}</Text>}
        {request.finalPrice !== undefined && request.finalPrice > 0 && (
          <Text style={styles.finalPrice}>💰 R$ {request.finalPrice.toFixed(2)}</Text>
        )}
      </View>

      {/* Quotes */}
      {quotes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orçamentos ({quotes.length})</Text>
          {quotes.map((quote) => (
            <View key={quote.id} style={styles.quoteCard}>
              <View style={styles.quoteHeader}>
                <Text style={styles.quoteMechanic}>🔧 {quote.mechanic?.fullName || 'Mecânico'}</Text>
                <Text style={styles.quotePrice}>R$ {quote.estimatedPrice.toFixed(2)}</Text>
              </View>
              {quote.description && <Text style={styles.quoteDesc}>{quote.description}</Text>}
              {quote.estimatedDurationMinutes && (
                <Text style={styles.quoteDuration}>⏱️ ~{quote.estimatedDurationMinutes} min</Text>
              )}
              {quote.status === QuoteStatus.PENDING && request.status !== ServiceRequestStatus.CANCELLED && (
                <View style={styles.quoteActions}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptQuote(quote.id)}
                  >
                    <Text style={styles.acceptBtnText}>Aceitar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleRejectQuote(quote.id)}
                  >
                    <Text style={styles.rejectBtnText}>Recusar</Text>
                  </TouchableOpacity>
                </View>
              )}
              {quote.status !== QuoteStatus.PENDING && (
                <Text style={[styles.quoteStatus, { color: quote.status === QuoteStatus.ACCEPTED ? '#059669' : '#EF4444' }]}>
                  {quote.status === QuoteStatus.ACCEPTED ? '✅ Aceito' : '❌ Recusado'}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Review */}
      {canReview && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliar Serviço</Text>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewLabel}>Sua nota:</Text>
            <StarRating rating={reviewScore} size={32} interactive onRate={setReviewScore} showValue={false} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Deixe um comentário..."
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
            />
            <TouchableOpacity
              style={[styles.submitReviewBtn, submittingReview && { opacity: 0.6 }]}
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitReviewText}>Enviar Avaliação</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Existing reviews */}
      {request.reviews && request.reviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          {request.reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <StarRating rating={review.score} size={16} />
              {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
            </View>
          ))}
        </View>
      )}

      {canCancel && (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelRequest}>
          <Text style={styles.cancelBtnText}>Cancelar Solicitação</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: {
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#1F2937', flex: 1, marginRight: 10 },
  category: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  description: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 10 },
  address: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  vehicle: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  finalPrice: { fontSize: 18, fontWeight: '700', color: '#059669', marginTop: 8 },
  section: { padding: 16, paddingTop: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  quoteCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quoteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  quoteMechanic: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  quotePrice: { fontSize: 18, fontWeight: '700', color: '#059669' },
  quoteDesc: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  quoteDuration: { fontSize: 12, color: '#9CA3AF' },
  quoteActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  acceptBtn: { flex: 1, backgroundColor: '#059669', padding: 12, borderRadius: 8, alignItems: 'center' },
  acceptBtnText: { color: '#FFF', fontWeight: '700' },
  rejectBtn: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
  rejectBtnText: { color: '#EF4444', fontWeight: '700' },
  quoteStatus: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  reviewCard: { backgroundColor: '#FFF', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  reviewLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 14, marginTop: 12 },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitReviewBtn: { backgroundColor: '#1E40AF', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  submitReviewText: { color: '#FFF', fontWeight: '700' },
  reviewItem: { backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  reviewComment: { fontSize: 14, color: '#374151', marginTop: 6 },
  cancelBtn: { marginHorizontal: 16, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center' },
  cancelBtnText: { color: '#EF4444', fontWeight: '700' },
});
