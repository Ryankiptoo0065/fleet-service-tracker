// src/screens/VehicleDetailScreen.js
import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { api } from '../api/client';
import { colors, spacing, radii } from '../theme';
import { ServiceBadge } from '../components/ServiceBadge';

const SERVICE_TYPES = [
  'Oil change',
  'Tyre rotation',
  'Tyre replacement',
  'Brake service',
  'Air filter',
  'Transmission service',
  'Full service',
  'Other',
];

export default function VehicleDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // 'odometer' | 'service' | null

  const load = useCallback(() => {
    return api
      .getVehicle(id)
      .then(setVehicle)
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  useEffect(() => {
    navigation.setOptions({
      title: vehicle?.plate_number || 'Vehicle',
      headerRight: vehicle
        ? () => (
            <TouchableOpacity onPress={() => navigation.navigate('EditVehicle', { vehicle })}>
              <Text style={{ color: colors.paper, fontWeight: '700', fontSize: 13 }}>Edit</Text>
            </TouchableOpacity>
          )
        : undefined,
    });
  }, [vehicle, navigation]);

  if (error) {
    return (
      <View style={styles.screen}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
  if (!vehicle) {
    return (
      <View style={styles.screen}>
        <Text style={{ color: colors.steel }}>Loading…</Text>
      </View>
    );
  }

  const title = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'Vehicle';
  const pct = Math.min(100, (vehicle.km_since_last_service / vehicle.service_interval_km) * 100);
  const barColor = vehicle.is_service_due
    ? colors.signal
    : vehicle.is_service_due_soon
    ? colors.amber
    : colors.go;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.lg }}>
      <View style={styles.headerRow}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={styles.plate}>{vehicle.plate_number}</Text>
            <ServiceBadge vehicle={vehicle} />
          </View>
          <Text style={styles.subtitle}>{title}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.ghostBtn} onPress={() => setModal('odometer')}>
          <Text style={styles.ghostBtnText}>📍 Log mileage</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signalBtn} onPress={() => setModal('service')}>
          <Text style={styles.signalBtnText}>🔧 Record service</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Service status</Text>
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={styles.progressLabel}>
              {Math.round(vehicle.km_since_last_service).toLocaleString()} km since last service
            </Text>
            <Text style={styles.progressLabel}>
              / {Number(vehicle.service_interval_km).toLocaleString()} km
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: barColor }]} />
          </View>
          {vehicle.is_service_due ? (
            <Text style={[styles.progressNote, { color: colors.signal, fontWeight: '700' }]}>
              Overdue by {Math.round(-vehicle.km_until_service_due).toLocaleString()} km
            </Text>
          ) : (
            <Text style={styles.progressNote}>
              {Math.round(vehicle.km_until_service_due).toLocaleString()} km until next service
            </Text>
          )}
        </View>

        <View style={styles.statGrid}>
          <DetailStat label="Current odometer" value={`${Number(vehicle.current_odometer_km).toLocaleString()} km`} />
          <DetailStat label="Last serviced at" value={`${Number(vehicle.last_service_odometer_km).toLocaleString()} km`} />
          <DetailStat label="Status" value={vehicle.status} />
          <DetailStat label="Year" value={vehicle.year || '—'} />
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Service history</Text>
        {vehicle.service_records?.length === 0 && (
          <Text style={styles.empty}>No service records yet.</Text>
        )}
        {vehicle.service_records?.map((sr) => (
          <View key={sr.id} style={styles.historyRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyTitle}>{sr.service_type}</Text>
              {sr.description ? <Text style={styles.historyDesc}>{sr.description}</Text> : null}
              {sr.garage_name ? <Text style={styles.historyMeta}>@ {sr.garage_name}</Text> : null}
              {sr.technician_name ? (
                <Text style={styles.historyMeta}>Mechanic: {sr.technician_name}</Text>
              ) : null}
              <Text style={styles.historyDate}>
                {new Date(sr.service_date).toLocaleDateString()}
                {sr.serviced_by_name ? ` · ${sr.serviced_by_name}` : ''}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.historyOdo}>{Number(sr.odometer_km).toLocaleString()} km</Text>
              {sr.cost ? (
                <Text style={styles.historyCost}>KES {Number(sr.cost).toLocaleString()}</Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Odometer log</Text>
        {vehicle.odometer_logs?.length === 0 && (
          <Text style={styles.empty}>No mileage logged yet.</Text>
        )}
        {vehicle.odometer_logs?.map((log) => (
          <View key={log.id} style={styles.historyRow}>
            <View>
              <Text style={styles.historyOdo}>{Number(log.reading_km).toLocaleString()} km</Text>
              {log.note ? <Text style={styles.historyDesc}>{log.note}</Text> : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.historyDate}>
                {new Date(log.logged_at).toLocaleDateString()}
              </Text>
              {log.logged_by_name ? (
                <Text style={styles.historyMeta}>{log.logged_by_name}</Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      {modal === 'odometer' && (
        <OdometerModal vehicle={vehicle} onClose={() => setModal(null)} onSaved={() => { load(); setModal(null); }} />
      )}
      {modal === 'service' && (
        <ServiceModal vehicle={vehicle} onClose={() => setModal(null)} onSaved={() => { load(); setModal(null); }} />
      )}
    </ScrollView>
  );
}

function DetailStat({ label, value }) {
  return (
    <View style={{ width: '48%', marginBottom: 12 }}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function OdometerModal({ vehicle, onClose, onSaved }) {
  const [reading, setReading] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const km = parseFloat(reading);
    if (isNaN(km)) {
      setError('Enter a valid odometer reading');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.logOdometer(vehicle.id, km, note);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Log odometer reading</Text>
          <Text style={styles.modalSub}>
            Current: {Number(vehicle.current_odometer_km).toLocaleString()} km
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.field}>
            <Text style={styles.label}>New odometer reading (km)</Text>
            <TextInput
              style={styles.input}
              value={reading}
              onChangeText={setReading}
              placeholder={String(Math.ceil(vehicle.current_odometer_km))}
              placeholderTextColor={colors.steel}
              keyboardType="number-pad"
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder="e.g. End of trip to Mombasa"
              placeholderTextColor={colors.steel}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtnDark} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.saveBtnText}>{loading ? 'Saving…' : 'Save reading'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ServiceModal({ vehicle, onClose, onSaved }) {
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [odometerKm, setOdometerKm] = useState(String(Math.ceil(vehicle.current_odometer_km)));
  const [cost, setCost] = useState('');
  const [garageName, setGarageName] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  async function handleSubmit() {
    if (!serviceType) {
      setError('Service type is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.recordService(vehicle.id, {
        service_type: serviceType,
        description,
        odometer_km: parseFloat(odometerKm) || vehicle.current_odometer_km,
        cost: cost ? parseFloat(cost) : undefined,
        garage_name: garageName,
        technician_name: technicianName,
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.modalCardScroll} contentContainerStyle={styles.modalCard}>
          <Text style={styles.modalTitle}>Record service</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.field}>
            <Text style={styles.label}>Service type *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowTypePicker(!showTypePicker)}>
              <Text style={{ color: serviceType ? colors.ink : colors.steel }}>
                {serviceType || 'Select service type…'}
              </Text>
            </TouchableOpacity>
            {showTypePicker && (
              <View style={styles.pickerList}>
                {SERVICE_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={styles.pickerOption}
                    onPress={() => {
                      setServiceType(t);
                      setShowTypePicker(false);
                    }}
                  >
                    <Text>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description / notes</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="What was done?"
              placeholderTextColor={colors.steel}
              multiline
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Odometer at service (km)</Text>
            <TextInput
              style={styles.input}
              value={odometerKm}
              onChangeText={setOdometerKm}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Garage / mechanic</Text>
            <TextInput
              style={styles.input}
              value={garageName}
              onChangeText={setGarageName}
              placeholder="e.g. Nairobi Auto Centre"
              placeholderTextColor={colors.steel}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Technician name</Text>
            <TextInput
              style={styles.input}
              value={technicianName}
              onChangeText={setTechnicianName}
              placeholder="e.g. John Mwangi"
              placeholderTextColor={colors.steel}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Cost (KES)</Text>
            <TextInput
              style={styles.input}
              value={cost}
              onChangeText={setCost}
              placeholder="0"
              placeholderTextColor={colors.steel}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtnSignal} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.saveBtnText}>{loading ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  error: { color: colors.signal, marginBottom: 12 },
  headerRow: { marginBottom: 16 },
  plate: { fontSize: 20, fontWeight: '700', color: colors.ink },
  subtitle: { color: colors.steel, fontSize: 13, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  ghostBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostBtnText: { fontWeight: '600', color: colors.ink, fontSize: 13 },
  signalBtn: {
    flex: 1,
    backgroundColor: colors.signal,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signalBtnText: { fontWeight: '700', color: colors.white, fontSize: 13 },
  panel: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 18,
    marginBottom: 16,
  },
  panelTitle: { fontWeight: '700', fontSize: 16, marginBottom: 14, color: colors.ink },
  progressLabel: { fontSize: 12, color: colors.steel },
  progressTrack: { height: 8, borderRadius: 99, backgroundColor: colors.line, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  progressNote: { fontSize: 12, color: colors.steel, marginTop: 6 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 6 },
  detailLabel: { fontSize: 11, textTransform: 'uppercase', color: colors.steel, fontWeight: '700' },
  detailValue: { fontWeight: '700', color: colors.ink, marginTop: 4 },
  empty: { color: colors.steel, fontSize: 13, paddingVertical: 12, textAlign: 'center' },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  historyTitle: { fontWeight: '700', color: colors.ink },
  historyDesc: { color: colors.steel, fontSize: 12, marginTop: 2 },
  historyMeta: { color: colors.steel, fontSize: 11, marginTop: 2 },
  historyDate: { color: colors.steel, fontSize: 11 },
  historyOdo: { fontWeight: '700', color: colors.ink, fontSize: 13 },
  historyCost: { color: colors.go, fontWeight: '700', fontSize: 12, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28,27,25,0.55)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCardScroll: { maxHeight: '85%' },
  modalCard: {
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  modalSub: { color: colors.steel, fontSize: 13, marginBottom: 16 },
  field: { marginBottom: 14 },
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
  pickerList: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    marginTop: 6,
    backgroundColor: colors.white,
  },
  pickerOption: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: { fontWeight: '600', color: colors.ink },
  saveBtnDark: {
    flex: 1,
    backgroundColor: colors.ink,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnSignal: {
    flex: 1,
    backgroundColor: colors.signal,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { fontWeight: '700', color: colors.white },
});
