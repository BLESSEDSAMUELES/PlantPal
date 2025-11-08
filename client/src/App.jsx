// client/src/App.jsx
import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Toast, ToastContainer } from 'react-bootstrap';
import { AuthContext } from './main'; // Import AuthContext to get user state

// Import components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import AppNavbar from './components/Navbar';
import Chatbot from './components/Chatbot.jsx'; // Import the new Chatbot

function AppContent() {
  const { auth } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  // --- SOCKET CONNECTION ---
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      // Connect to backend socket
      const newSocket = io('http://localhost:5000');

      // Join private room based on user ID
      newSocket.emit('join_room', auth.user._id);

      // Listen for notifications
      newSocket.on('notification', (data) => {
        setNotifications(prev => [{ id: Date.now(), ...data }, ...prev]);
      });

      return () => newSocket.disconnect();
    }
  }, [auth.isAuthenticated]);

  return (
    <Router>
      <AppNavbar />

      {/* --- REAL-TIME TOAST NOTIFICATIONS --- */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999, position: 'fixed' }}>
        {notifications.map(notif => (
          <Toast key={notif.id} onClose={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))} delay={5000} autohide bg={notif.type === 'success' ? 'success' : 'primary'}>
            <Toast.Header><strong className="me-auto">🔔 Notification</strong></Toast.Header>
            <Toast.Body className="text-white">{notif.msg}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>

      {/* --- FLOATING CHATBOT --- */}
      {auth.isAuthenticated && <Chatbot />}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute adminOnly={true}><AdminPanel /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

// We wrap AppContent purely to use useContext inside it
function App() {
  return <AppContent />;
}
export default App;