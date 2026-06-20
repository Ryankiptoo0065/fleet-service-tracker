// src/screens/ForgotPasswordScreen.js
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { api } from '../api/client';
import { colors, spacing, radii } from '../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.brand}>
          Fleet<Text style={{ color: colors.signal }}>Track</Text>
        </Text>
        <Text style={styles.sub}>Reset your password</Text>

        {sent ? (
          <>
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>Check your inbox</Text>
              <Text style={styles.successText}>
                If an account exists for {email}, we've sent a link to reset your password. It
                expires in 30 minutes. Open the email on this phone to complete the reset.
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.backLink}>Back to sign in</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.helper}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.field}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@company.com"
                placeholderTextColor={colors.steel}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.submitBtnText}>{loading ? 'Sending…' : 'Send reset link'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 18 }}>
              <Text style={styles.backLinkMuted}>Back to sign in</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink, justifyContent: 'center', padding: spacing.lg },
  card: { backgroundColor: colors.paper, borderRadius: radii.lg, padding: spacing.xl },
  brand: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  sub: { color: colors.steel, fontSize: 14, marginBottom: 16 },
  helper: { color: colors.steel, fontSize: 13, marginBottom: 18 },
  error: { color: colors.signal, marginBottom: 14, fontSize: 13 },
  field: { marginBottom: 16 },
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
  submitBtn: {
    backgroundColor: colors.signal,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  backLink: { color: colors.signal, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  backLinkMuted: { color: colors.steel, textAlign: 'center', fontSize: 13 },
  successBox: {
    borderLeftWidth: 3,
    borderLeftColor: colors.go,
    backgroundColor: colors.goDim,
    borderRadius: radii.sm,
    padding: 14,
    marginBottom: 18,
  },
  successTitle: { fontWeight: '700', color: colors.ink, marginBottom: 6 },
  successText: { color: colors.ink, fontSize: 13, lineHeight: 19 },
});
