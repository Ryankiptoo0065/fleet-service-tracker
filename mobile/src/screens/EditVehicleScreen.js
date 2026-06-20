// src/screens/EditVehicleScreen.js
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { api } from '../api/client';
import { colors, spacing, radii } from '../theme';

export default function EditVehicleScreen({ route, navigation }) {
  const { vehicle } = route.params;

  const [form, setForm] = useState({
    plate_number: vehicle.plate_number || '',
    make: vehicle.make || '',
    model: vehicle.model || '',
    year: vehicle.year ? String(vehicle.year) : '',
    service_interval_km: String(vehicle.service_interval_km || 5000),
    status: vehicle.status || 'active',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.plate_number.trim()) {
      setError('Plate number is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.updateVehicle(vehicle.id, {
        ...form,
        year: form.year ? parseInt(form.year) : undefined,
        service_interval_km: parseFloat(form.service_interval_km) || 5000,
      });
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete vehicle?',
      `This will permanently delete ${vehicle.plate_number} and all its service history. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDelete },
      ]
    );
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.deleteVehicle(vehicle.id);
      // Pop back two screens - past the detail screen, to the list
      navigation.pop(2);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  const STATUSES = [
    { value: 'active', label: 'Active' },
    { value: 'in_service', label: 'In Service' },
    { value: 'retired', label: 'Retired' },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.lg }}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.field}>
        <Text style={styles.label}>Plate number *</Text>
        <TextInput
          style={[styles.input, { fontFamily: 'monospace' }]}
          value={form.plate_number}
          onChangeText={(v) => set('plate_number', v.toUpperCase())}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Make</Text>
          <TextInput style={styles.input} value={form.make} onChangeText={(v) => set('make', v)} />
        </View>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Model</Text>
          <TextInput style={styles.input} value={form.model} onChangeText={(v) => set('model', v)} />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Year</Text>
        <TextInput
          style={styles.input}
          value={form.year}
          onChangeText={(v) => set('year', v)}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Service interval (km)</Text>
        <TextInput
          style={styles.input}
          value={form.service_interval_km}
          onChangeText={(v) => set('service_interval_km', v)}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[styles.statusChip, form.status === s.value && styles.statusChipActive]}
              onPress={() => set('status', s.value)}
            >
              <Text
                style={[
                  styles.statusChipText,
                  form.status === s.value && styles.statusChipTextActive,
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveBtnText}>{loading ? 'Saving…' : 'Save changes'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={confirmDelete}
        disabled={deleting}
      >
        <Text style={styles.deleteBtnText}>
          {deleting ? 'Deleting…' : '🗑 Delete this vehicle'}
        </Text>
      </TouchableOpacity>
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
  statusRow: { flexDirection: 'row', gap: 8 },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  statusChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  statusChipText: { fontSize: 12, fontWeight: '600', color: colors.steel },
  statusChipTextActive: { color: colors.paper },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 24 },
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
  deleteBtn: {
    borderWidth: 1,
    borderColor: colors.signal,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  deleteBtnText: { color: colors.signal, fontWeight: '700' },
});
