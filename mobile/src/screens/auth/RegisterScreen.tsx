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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Mechanic-specific
  const [yearsExperience, setYearsExperience] = useState('');
  const [bio, setBio] = useState('');

  // Client-specific
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Erro', 'Preencha nome, email e senha');
      return;
    }
    setLoading(true);
    try {
      const data: Record<string, unknown> = {
        fullName,
        email,
        password,
        phone,
        role,
      };

      if (role === UserRole.MECHANIC) {
        if (yearsExperience) data.yearsExperience = parseInt(yearsExperience, 10);
        if (bio) data.bio = bio;
      } else {
        if (vehicleMake) data.vehicleMake = vehicleMake;
        if (vehicleModel) data.vehicleModel = vehicleModel;
        if (vehicleYear) data.vehicleYear = parseInt(vehicleYear, 10);
        if (vehiclePlate) data.vehiclePlate = vehiclePlate;
      }

      await register(data);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Escolha seu perfil</Text>

        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[styles.roleButton, role === UserRole.CLIENT && styles.roleActive]}
            onPress={() => setRole(UserRole.CLIENT)}
          >
            <Text style={styles.roleIcon}>🚗</Text>
            <Text style={[styles.roleText, role === UserRole.CLIENT && styles.roleTextActive]}>
              Cliente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === UserRole.MECHANIC && styles.roleActive]}
            onPress={() => setRole(UserRole.MECHANIC)}
          >
            <Text style={styles.roleIcon}>🔧</Text>
            <Text style={[styles.roleText, role === UserRole.MECHANIC && styles.roleTextActive]}>
              Mecânico
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nome Completo *</Text>
        <TextInput style={styles.input} placeholder="Seu nome" value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha *</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          placeholder="11999999999"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {role === UserRole.MECHANIC ? (
          <>
            <Text style={styles.sectionTitle}>Dados Profissionais</Text>
            <Text style={styles.label}>Anos de Experiência</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 5"
              value={yearsExperience}
              onChangeText={setYearsExperience}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Conte sobre sua experiência..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
            />
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Dados do Veículo</Text>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Marca</Text>
                <TextInput style={styles.input} placeholder="Toyota" value={vehicleMake} onChangeText={setVehicleMake} />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Modelo</Text>
                <TextInput style={styles.input} placeholder="Corolla" value={vehicleModel} onChangeText={setVehicleModel} />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Ano</Text>
                <TextInput style={styles.input} placeholder="2022" value={vehicleYear} onChangeText={setVehicleYear} keyboardType="numeric" />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Placa</Text>
                <TextInput style={styles.input} placeholder="ABC-1234" value={vehiclePlate} onChangeText={setVehiclePlate} autoCapitalize="characters" />
              </View>
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>
            Já tem conta? <Text style={styles.linkBold}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#1E40AF', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 20 },
  roleSelector: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  roleActive: { borderColor: '#1E40AF', backgroundColor: '#EFF6FF' },
  roleIcon: { fontSize: 28, marginBottom: 6 },
  roleText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  roleTextActive: { color: '#1E40AF' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 20, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  button: {
    backgroundColor: '#1E40AF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  linkButton: { alignItems: 'center', marginTop: 20 },
  linkText: { fontSize: 14, color: '#6B7280' },
  linkBold: { color: '#1E40AF', fontWeight: '700' },
});
