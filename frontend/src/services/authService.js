import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data.token;
};

export const register = async (fullName, email, password) => {
  const response = await api.post('/api/auth/register', { fullName, email, password });
  return response.data.token;
};
