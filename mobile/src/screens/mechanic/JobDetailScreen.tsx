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
import { serviceRequestsApi, quotesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ServiceRequest, ServiceRequestStatus, SERVICE_CATEGORY_LABELS } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

interface JobDetailScreenProps {
  route: any;
  navigation: any;
}

export const JobDetailScreen: React.FC<JobDetailScreenProps> = ({ route, navigation }) => {
  const { requestId } = route.params;
  const { user } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteDesc, setQuoteDesc] = useState('');
  const [quoteDuration, setQuoteDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [requestId]);

  const loadData = async () => {
    try {
      const sr = await serviceRequestsApi.getById(requestId);
      setRequest(sr);
    } catch {
      Alert.alert('Erro', 'Falha ao carregar detalhes');
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async () => {
    if (!quotePrice) {
      Alert.alert('Erro', 'Informe o preço estimado');
      return;
    }
    setSubmitting(true);
    try {
      await quotesApi.create({
        serviceRequestId: requestId,
        estimatedPrice: parseFloat(quotePrice),
        description: quoteDesc || undefined,
        estimatedDurationMinutes: quoteDuration ? parseInt(quoteDuration, 10) : undefined,
      });
      Alert.alert('Sucesso', 'Orçamento enviado!');
      loadData();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao enviar orçamento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: ServiceRequestStatus, finalPrice?: number) => {
    try {
      await serviceRequestsApi.updateStatus(requestId, status, finalPrice);
      Alert.alert('Status atualizado!');
      loadData();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao atualizar status');
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

  const isMyJob = request.mechanicId === user?.id;
  const canSendQuote =
    !isMyJob &&
    (request.status === ServiceRequestStatus.REQUESTED || request.status === ServiceRequestStatus.QUOTED);
  const alreadyQuoted = request.quotes?.some((q) => q.mechanicId === user?.id);

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{request.title}</Text>
          <StatusBadge status={request.status} />
        </View>
        <Text style={styles.category}>
          {SERVICE_CATEGORY_LABELS[request.category]} • Urgência: {request.urgency}
        </Text>
        <Text style={styles.description}>{request.description}</Text>

        {request.customer && (
          <View style={styles.customerInfo}>
            <Text style={styles.customerLabel}>👤 Cliente:</Text>
            <Text style={styles.customerName}>{request.customer.fullName}</Text>
          </View>
        )}
        {request.address && <Text style={styles.info}>📍 {request.address}</Text>}
        {request.vehicleInfo && <Text style={styles.info}>🚗 {request.vehicleInfo}</Text>}
      </View>

      {/* Send Quote */}
      {canSendQuote && !alreadyQuoted && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enviar Orçamento</Text>
          <View style={styles.quoteForm}>
            <Text style={styles.label}>Preço Estimado (R$) *</Text>
            <TextInput
              style={styles.input}
              placeholder="250.00"
              value={quotePrice}
              onChangeText={setQuotePrice}
              keyboardType="decimal-pad"
            />
            <Text style={styles.label}>Descrição do Serviço</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva o que será feito..."
              value={quoteDesc}
              onChangeText={setQuoteDesc}
              multiline
            />
            <Text style={styles.label}>Tempo Estimado (minutos)</Text>
            <TextInput
              style={styles.input}
              placeholder="60"
              value={quoteDuration}
              onChangeText={setQuoteDuration}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSendQuote}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Enviar Orçamento</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {alreadyQuoted && canSendQuote && (
        <View style={styles.alreadyQuoted}>
          <Text style={styles.alreadyQuotedText}>✅ Você já enviou um orçamento</Text>
        </View>
      )}

      {/* Status Actions for my jobs */}
      {isMyJob && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>
          {request.status === ServiceRequestStatus.ACCEPTED && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleUpdateStatus(ServiceRequestStatus.IN_TRANSIT)}
            >
              <Text style={styles.actionBtnText}>🚗 Iniciar Deslocamento</Text>
            </TouchableOpacity>
          )}
          {request.status === ServiceRequestStatus.IN_TRANSIT && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleUpdateStatus(ServiceRequestStatus.IN_PROGRESS)}
            >
              <Text style={styles.actionBtnText}>🔧 Iniciar Atendimento</Text>
            </TouchableOpacity>
          )}
          {request.status === ServiceRequestStatus.IN_PROGRESS && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#059669' }]}
              onPress={() => {
                Alert.prompt
                  ? Alert.prompt('Valor Final', 'Informe o valor cobrado:', (price) => {
                      if (price) handleUpdateStatus(ServiceRequestStatus.COMPLETED, parseFloat(price));
                    })
                  : handleUpdateStatus(ServiceRequestStatus.COMPLETED);
              }}
            >
              <Text style={styles.actionBtnText}>✅ Finalizar Serviço</Text>
            </TouchableOpacity>
          )}
        </View>
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
  description: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 12 },
  customerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  customerLabel: { fontSize: 13, color: '#6B7280', marginRight: 4 },
  customerName: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  info: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  section: { padding: 16, paddingTop: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  quoteForm: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: '#1E40AF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  alreadyQuoted: {
    backgroundColor: '#F0FDF4',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  alreadyQuotedText: { color: '#059669', fontWeight: '600', textAlign: 'center' },
  actionBtn: {
    backgroundColor: '#1E40AF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
