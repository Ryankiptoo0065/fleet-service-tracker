// src/screens/LoginScreen.js
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radii } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await api.login(email, password);
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        result = await api.register(name, email, password, 'driver');
      }
      await login(result.user, result.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.brand}>
            Fleet<Text style={{ color: colors.signal }}>Track</Text>
          </Text>
          <Text style={styles.sub}>
            {mode === 'login' ? 'Sign in to manage your fleet' : 'Create a new account'}
          </Text>

          {mode === 'login' && (
            <View style={styles.demoHint}>
              <Text style={styles.demoHintTitle}>Demo credentials</Text>
              <Text style={styles.demoHintText}>Admin: admin@example.com / admin123</Text>
              <Text style={styles.demoHintText}>Driver: john@example.com / driver123</Text>
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {mode === 'register' && (
            <View style={styles.field}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="John Kamau"
                placeholderTextColor={colors.steel}
              />
            </View>
          )}

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

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.steel}
              secureTextEntry
            />
            {mode === 'login' && (
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={{ alignSelf: 'flex-end', marginTop: 6 }}
              >
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitBtnText}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            style={{ marginTop: 18 }}
          >
            <Text style={styles.toggleText}>
              {mode === 'login' ? (
                <>
                  No account? <Text style={styles.toggleLink}>Register here</Text>
                </>
              ) : (
                <>
                  Already have an account? <Text style={styles.toggleLink}>Sign in</Text>
                </>
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  brand: { fontSize: 26, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  sub: { color: colors.steel, fontSize: 14, marginBottom: 20 },
  demoHint: {
    backgroundColor: '#efece0',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    padding: 12,
    marginBottom: 18,
  },
  demoHintTitle: { fontWeight: '700', color: colors.steel, fontSize: 12, marginBottom: 4 },
  demoHintText: { color: colors.steel, fontSize: 12, lineHeight: 18 },
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
  forgotLink: { color: colors.steel, fontSize: 12 },
  submitBtn: {
    backgroundColor: colors.signal,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  toggleText: { textAlign: 'center', color: colors.steel, fontSize: 13 },
  toggleLink: { color: colors.signal, fontWeight: '700' },
});
