import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false, error: null };
    case 'USER_LOADED':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false, error: action.payload || null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Extract best error message from any API error response
const extractError = (err) => {
  const data = err.response?.data;
  if (!data) return 'Network error — is the backend running?';
  if (data.message) return data.message;
  if (data.errors && Array.isArray(data.errors)) {
    return data.errors.map((e) => e.msg || e.message).join(', ');
  }
  return 'Something went wrong';
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      loadUser();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      dispatch({ type: 'USER_LOADED', payload: res.data.user });
    } catch {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      setAuthToken(res.data.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: res.data });
      return { success: true };
    } catch (err) {
      const message = extractError(err);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, message };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setAuthToken(res.data.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: res.data });
      return { success: true };
    } catch (err) {
      const message = extractError(err);
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, message };
    }
  };

  const logout = () => {
    setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/users/profile', profileData);
      dispatch({ type: 'UPDATE_USER', payload: res.data.user });
      return { success: true };
    } catch (err) {
      const message = extractError(err);
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout, updateProfile, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
