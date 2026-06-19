// src/api/client.js
// All API calls go through here. Token is read from localStorage each time,
// so no need to reinitialize after login.

const BASE = '/api';

function getToken() {
  return localStorage.getItem('fleet_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  register: (name, email, password, role) =>
    request('POST', '/auth/register', { name, email, password, role }),

  // Dashboard
  summary: () => request('GET', '/dashboard/summary'),

  // Vehicles
  getVehicles: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/vehicles${qs ? '?' + qs : ''}`);
  },
  getVehicle: (id) => request('GET', `/vehicles/${id}`),
  createVehicle: (data) => request('POST', '/vehicles', data),
  updateVehicle: (id, data) => request('PUT', `/vehicles/${id}`, data),
  deleteVehicle: (id) => request('DELETE', `/vehicles/${id}`),
  logOdometer: (id, reading_km, note) =>
    request('POST', `/vehicles/${id}/odometer`, { reading_km, note }),
  recordService: (id, data) => request('POST', `/vehicles/${id}/service`, data),
};
