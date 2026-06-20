// src/screens/VehiclesScreen.js
import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { api } from '../api/client';
import { colors, spacing, radii } from '../theme';
import { ServiceBadge } from '../components/ServiceBadge';

export default function VehiclesScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'due' | 'active'
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    return api
      .getVehicles()
      .then(setVehicles)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const filtered = vehicles.filter((v) => {
    if (filter === 'due' && !v.is_service_due) return false;
    if (filter === 'active' && v.status !== 'active') return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.plate_number.toLowerCase().includes(q) ||
      (v.make || '').toLowerCase().includes(q) ||
      (v.model || '').toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.screen}>
      <View style={styles.chipsRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'due', label: '⚠️ Due' },
          { key: 'active', label: 'Active' },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search plate / make / model…"
          placeholderTextColor={colors.steel}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddVehicle')}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {vehicles.length === 0 ? 'No vehicles yet. Add one to get started.' : 'No matches.'}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VehicleDetail', { id: item.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.plate}>{item.plate_number}</Text>
              <Text style={styles.vehicleName}>
                {[item.year, item.make, item.model].filter(Boolean).join(' ') || '—'}
              </Text>
              <Text style={styles.odo}>
                {Number(item.current_odometer_km).toLocaleString()} km ·{' '}
                {Math.round(item.km_since_last_service).toLocaleString()} km since service
              </Text>
            </View>
            <ServiceBadge vehicle={item} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  chipsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 12, fontWeight: '600', color: colors.steel },
  chipTextActive: { color: colors.paper },
  searchRow: { flexDirection: 'row', padding: spacing.lg, paddingBottom: spacing.md, gap: 10 },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: colors.signal,
    borderRadius: radii.sm,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  error: { color: colors.signal, marginHorizontal: spacing.lg, marginBottom: 10 },
  empty: { textAlign: 'center', color: colors.steel, marginTop: 40 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plate: { fontWeight: '700', fontSize: 15, color: colors.ink },
  vehicleName: { color: colors.steel, fontSize: 13, marginTop: 2 },
  odo: { color: colors.steel, fontSize: 11, marginTop: 4 },
});
