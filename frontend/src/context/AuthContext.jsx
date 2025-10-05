// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading while checking token
  const navigate = useNavigate();

  // Initialize auth state from localStorage token
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // verify token & get user
        const { data } = await API.get('/auth/me');
        setUser(data.user);
      } catch (err) {
        console.warn('Could not fetch user with token. Logging out.', err?.response?.data || err.message);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // signup function
  const signup = async ({ name, email, password }) => {
    try {
      const { data } = await API.post('/auth/signup', { name, email, password });
      // expected: { user, token }
      if (data.token) localStorage.setItem('token', data.token);
      setUser(data.user || null);
      return { ok: true };
    } catch (err) {
      console.error('Signup error', err?.response?.data || err.message);
      return { ok: false, error: err?.response?.data?.message || err.message };
    }
  };

  // login function
  const login = async ({ email, password }) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      if (data.token) localStorage.setItem('token', data.token);
      setUser(data.user || null);
      return { ok: true };
    } catch (err) {
      console.error('Login error', err?.response?.data || err.message);
      return { ok: false, error: err?.response?.data?.message || err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;