// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('fleet_user').then((stored) => {
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          // ignore corrupted storage
        }
      }
      setLoading(false);
    });
  }, []);

  async function login(userData, token) {
    await AsyncStorage.setItem('fleet_token', token);
    await AsyncStorage.setItem('fleet_user', JSON.stringify(userData));
    setUser(userData);
  }

  async function logout() {
    await AsyncStorage.removeItem('fleet_token');
    await AsyncStorage.removeItem('fleet_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
