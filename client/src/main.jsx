import React, { createContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import axios from 'axios';
import setAuthToken from './utils/setAuthToken';

// --- IMPORT BOOTSTRAP CSS ---
import 'bootstrap/dist/css/bootstrap.min.css';
// --- IMPORT YOUR CUSTOM CSS ---
import './index.css';

// 1. Create Auth Context
export const AuthContext = createContext();

// 2. Create Auth Provider
const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
  });

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
    try {
      const res = await axios.get('/api/auth');
      setAuth({
        token: token,
        isAuthenticated: true,
        loading: false,
        user: res.data,
      });
    } catch (err) {
      localStorage.removeItem('token');
      setAuth({
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
      });
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    const body = { email, password };
    const res = await axios.post('/api/auth/login', body);
    localStorage.setItem('token', res.data.token);
    setAuthToken(res.data.token);
    await loadUser();
  };

  const register = async (username, email, password) => {
    const body = { username, email, password };
    const res = await axios.post('/api/auth/register', body);
    localStorage.setItem('token', res.data.token);
    setAuthToken(res.data.token);
    await loadUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setAuth({
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null,
    });
  };

  const updateUser = (newUserData) => {
    setAuth(prev => ({ ...prev, user: newUserData }));
  };

  if (auth.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-white">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ auth, login, register, logout, loadUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Render App
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);