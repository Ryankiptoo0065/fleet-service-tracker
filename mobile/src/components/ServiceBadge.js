// src/components/ServiceBadge.js
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

export function ServiceBadge({ vehicle }) {
  let style = styles.ok;
  let textStyle = styles.okText;
  let label = 'OK';

  if (vehicle.is_service_due) {
    style = styles.due;
    textStyle = styles.dueText;
    label = 'Due';
  } else if (vehicle.is_service_due_soon) {
    style = styles.soon;
    textStyle = styles.soonText;
    label = 'Soon';
  }

  return (
    <View style={[styles.badge, style]}>
      <Text style={[styles.badgeText, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  due: { backgroundColor: colors.signalDim },
  dueText: { color: colors.signal },
  soon: { backgroundColor: colors.amberDim },
  soonText: { color: colors.amber },
  ok: { backgroundColor: colors.goDim },
  okText: { color: colors.go },
});
