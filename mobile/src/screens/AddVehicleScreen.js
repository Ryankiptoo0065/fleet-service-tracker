// src/screens/AddVehicleScreen.js
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { api } from '../api/client';
import { colors, spacing, radii } from '../theme';

export default function AddVehicleScreen({ navigation }) {
  const [form, setForm] = useState({
    plate_number: '',
    make: '',
    model: '',
    year: '',
    current_odometer_km: '',
    service_interval_km: '5000',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.plate_number.trim()) {
      setError('Plate number is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.createVehicle({
        ...form,
        year: form.year ? parseInt(form.year) : undefined,
        current_odometer_km: form.current_odometer_km ? parseFloat(form.current_odometer_km) : 0,
        service_interval_km: parseFloat(form.service_interval_km) || 5000,
      });
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.lg }}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.field}>
        <Text style={styles.label}>Plate number *</Text>
        <TextInput
          style={[styles.input, { fontFamily: 'monospace' }]}
          value={form.plate_number}
          onChangeText={(v) => set('plate_number', v.toUpperCase())}
          placeholder="KDA 123A"
          placeholderTextColor={colors.steel}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Make</Text>
          <TextInput
            style={styles.input}
            value={form.make}
            onChangeText={(v) => set('make', v)}
            placeholder="Toyota"
            placeholderTextColor={colors.steel}
          />
        </View>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            value={form.model}
            onChangeText={(v) => set('model', v)}
            placeholder="Hiace"
            placeholderTextColor={colors.steel}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Year</Text>
          <TextInput
            style={styles.input}
            value={form.year}
            onChangeText={(v) => set('year', v)}
            placeholder="2021"
            placeholderTextColor={colors.steel}
            keyboardType="number-pad"
          />
        </View>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Current odometer (km)</Text>
          <TextInput
            style={styles.input}
            value={form.current_odometer_km}
            onChangeText={(v) => set('current_odometer_km', v)}
            placeholder="0"
            placeholderTextColor={colors.steel}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Service interval (km)</Text>
        <TextInput
          style={styles.input}
          value={form.service_interval_km}
          onChangeText={(v) => set('service_interval_km', v)}
          placeholder="5000"
          placeholderTextColor={colors.steel}
          keyboardType="number-pad"
        />
        <Text style={styles.helper}>How many km between services? Default is 5,000 km.</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.saveBtnText}>{loading ? 'Adding…' : 'Add vehicle'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  error: { color: colors.signal, marginBottom: 14 },
  field: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontWeight: '600', fontSize: 13, color: colors.ink, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: colors.white,
    color: colors.ink,
  },
  helper: { color: colors.steel, fontSize: 12, marginTop: 6 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: { color: colors.ink, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.signal,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: colors.white, fontWeight: '700' },
});
