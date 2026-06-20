// src/screens/DashboardScreen.js
import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radii } from '../theme';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    return api
      .summary()
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: spacing.lg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.heading}>Good day, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
      <Text style={styles.subheading}>Here's your fleet at a glance.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {summary && (
        <>
          <View style={styles.statRow}>
            <StatCard label="Total Vehicles" value={summary.total_vehicles} />
            <StatCard label="Active" value={summary.active_vehicles} />
          </View>
          <View style={styles.statRow}>
            <StatCard label="Service Due" value={summary.due_for_service} alert={summary.due_for_service > 0} />
            <StatCard label="Due Soon" value={summary.due_soon} />
          </View>
          <View style={styles.statRow}>
            <StatCard label="Total Service Records" value={summary.total_service_records} />
            <StatCard
              label="Total Service Cost"
              value={`KES ${Number(summary.total_service_cost || 0).toLocaleString()}`}
            />
          </View>

          {summary.due_vehicles.length > 0 ? (
            <View style={[styles.panel, { borderLeftWidth: 3, borderLeftColor: colors.signal }]}>
              <Text style={[styles.panelTitle, { color: colors.signal }]}>
                ⚠️ Vehicles requiring service now
              </Text>
              {summary.due_vehicles.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={styles.dueRow}
                  onPress={() =>
                    navigation.navigate('VehiclesTab', {
                      screen: 'VehicleDetail',
                      params: { id: v.id },
                    })
                  }
                >
                  <Text style={styles.plateMono}>{v.plate_number}</Text>
                  <Text style={styles.overdueText}>
                    +{Math.round(v.km_overdue).toLocaleString()} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={[styles.panel, { borderLeftWidth: 3, borderLeftColor: colors.go, alignItems: 'center', paddingVertical: 28 }]}>
              <Text style={{ fontSize: 28, marginBottom: 6 }}>✅</Text>
              <Text style={{ fontWeight: '700', color: colors.go }}>
                All vehicles are up to date
              </Text>
              <Text style={{ color: colors.steel, fontSize: 12, marginTop: 4 }}>
                Nothing due right now.
              </Text>
            </View>
          )}
        </>
      )}

      {!summary && !error && <Text style={{ color: colors.steel }}>Loading…</Text>}
    </ScrollView>
  );
}

function StatCard({ label, value, alert }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[styles.statValue, alert && { color: colors.signal }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  heading: { fontSize: 22, fontWeight: '700', color: colors.ink },
  subheading: { color: colors.steel, fontSize: 13, marginTop: 2, marginBottom: 20 },
  error: { color: colors.signal, marginBottom: 14 },
  statRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 16,
  },
  statLabel: { fontSize: 11, textTransform: 'uppercase', color: colors.steel, fontWeight: '700' },
  statValue: { fontSize: 28, fontWeight: '700', color: colors.ink, marginTop: 4 },
  panel: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 18,
    marginTop: 8,
  },
  panelTitle: { fontWeight: '700', marginBottom: 12, fontSize: 15 },
  dueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  plateMono: { fontWeight: '700', color: colors.ink },
  overdueText: { color: colors.signal, fontWeight: '700' },
});
