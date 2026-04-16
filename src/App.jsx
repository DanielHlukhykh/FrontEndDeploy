import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import Account from './pages/Account/Account';
import AccountSettings from './pages/AccountSettings/AccountSettings';
import AwardsPage from './pages/AwardsPage/AwardsPage';
import UserProfile from './pages/UserProfile/UserProfile';
import './styles/global.scss';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60 }}>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60 }}>Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={
            <GuestRoute><Login /></GuestRoute>
          } />

          <Route path="/signup" element={
            <GuestRoute><SignUp /></GuestRoute>
          } />

          <Route path="/account" element={
            <PrivateRoute><Account /></PrivateRoute>
          } />

          <Route path="/account/settings" element={
            <PrivateRoute><AccountSettings /></PrivateRoute>
          } />

          <Route path="/awards" element={
            <PrivateRoute><AwardsPage /></PrivateRoute>
          } />

          <Route path="/user/:id" element={<UserProfile />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
