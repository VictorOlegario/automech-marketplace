import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { serviceRequestsApi, geolocationApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  ServiceCategory,
  UrgencyLevel,
  SERVICE_CATEGORY_LABELS,
  SERVICE_CATEGORY_ICONS,
} from '../../types';

interface NewRequestScreenProps {
  navigation: any;
  route: any;
}

export const NewRequestScreen: React.FC<NewRequestScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<ServiceCategory>(
    route.params?.category || ServiceCategory.GENERAL,
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>(UrgencyLevel.MEDIUM);
  const [loading, setLoading] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<{ min: number; max: number; average: number } | null>(null);

  const handleCategoryChange = async (cat: ServiceCategory) => {
    setCategory(cat);
    try {
      const estimate = await geolocationApi.estimatePrice(cat);
      setPriceEstimate(estimate);
    } catch {
      setPriceEstimate(null);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Erro', 'Preencha o título e a descrição do problema');
      return;
    }

    setLoading(true);
    try {
      const lat = user?.latitude || -23.5505;
      const lng = user?.longitude || -46.6333;

      await serviceRequestsApi.create({
        category,
        title,
        description,
        latitude: lat,
        longitude: lng,
        address,
        vehicleInfo,
        urgency,
      });

      Alert.alert('Sucesso!', 'Solicitação enviada. Mecânicos próximos serão notificados.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao criar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.values(ServiceCategory);
  const urgencyLevels = [
    { value: UrgencyLevel.LOW, label: 'Baixa', color: '#22C55E', icon: '🟢' },
    { value: UrgencyLevel.MEDIUM, label: 'Média', color: '#F59E0B', icon: '🟡' },
    { value: UrgencyLevel.HIGH, label: 'Alta', color: '#F97316', icon: '🟠' },
    { value: UrgencyLevel.EMERGENCY, label: 'Urgente', color: '#EF4444', icon: '🔴' },
  ];

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nova Solicitação</Text>

      {/* Category Selection */}
      <Text style={styles.label}>Tipo de Problema</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
            onPress={() => handleCategoryChange(cat)}
          >
            <Text style={styles.categoryChipIcon}>{SERVICE_CATEGORY_ICONS[cat]}</Text>
            <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
              {SERVICE_CATEGORY_LABELS[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {priceEstimate && (
        <View style={styles.priceEstimate}>
          <Text style={styles.priceEstimateTitle}>💰 Estimativa de Preço</Text>
          <Text style={styles.priceEstimateValue}>
            R$ {priceEstimate.min} - R$ {priceEstimate.max}
          </Text>
          <Text style={styles.priceEstimateAvg}>Média: R$ {priceEstimate.average}</Text>
        </View>
      )}

      {/* Urgency */}
      <Text style={styles.label}>Urgência</Text>
      <View style={styles.urgencyRow}>
        {urgencyLevels.map((u) => (
          <TouchableOpacity
            key={u.value}
            style={[styles.urgencyChip, urgency === u.value && { borderColor: u.color, backgroundColor: u.color + '15' }]}
            onPress={() => setUrgency(u.value)}
          >
            <Text>{u.icon}</Text>
            <Text style={[styles.urgencyText, urgency === u.value && { color: u.color }]}>
              {u.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Título *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Carro não liga"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Descrição *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descreva o problema com detalhes..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Endereço</Text>
      <TextInput
        style={styles.input}
        placeholder="Onde você está?"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Veículo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Toyota Corolla 2022 - Branco"
        value={vehicleInfo}
        onChangeText={setVehicleInfo}
      />

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitText}>Enviar Solicitação</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1F2937', marginBottom: 20, marginTop: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  categoryScroll: { marginBottom: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipActive: { borderColor: '#1E40AF', backgroundColor: '#EFF6FF' },
  categoryChipIcon: { fontSize: 16, marginRight: 6 },
  categoryChipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  categoryChipTextActive: { color: '#1E40AF' },
  priceEstimate: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  priceEstimateTitle: { fontSize: 13, fontWeight: '600', color: '#166534' },
  priceEstimateValue: { fontSize: 18, fontWeight: '700', color: '#059669', marginTop: 4 },
  priceEstimateAvg: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  urgencyRow: { flexDirection: 'row', gap: 8 },
  urgencyChip: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  urgencyText: { fontSize: 11, fontWeight: '600', color: '#6B7280', marginTop: 4 },
  submitButton: {
    backgroundColor: '#1E40AF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
