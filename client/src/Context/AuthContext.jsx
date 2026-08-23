import { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists and fetch user on mount
  useEffect(() => {
    const token = localStorage.getItem('soas_token');
    if (token) {
      API.get('/users/me')
        .then((res) => setUser(res.data.user))
        .catch(() => localStorage.removeItem('soas_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('soas_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // Register function
  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    localStorage.setItem('soas_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('soas_token');
    setUser(null);
  };

  // Helper to update user after profile changes
  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};