import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import { useAuth } from './context/AuthContext'; // Added for redirect in landing route
import './styles/App.css';

// Layout Component
import Layout from './components/layout/Layout';

// Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ProfileSetup from './components/auth/ProfileSetup';

// Main Components
import Dashboard from './components/dashboard/Dashboard';
import AlignPage from './components/matches/AlignPage';
import Messages from './components/messages/Messages';
import Chat from './components/messages/Chat';
import Profile from './components/profile/Profile';
import Settings from './components/profile/Settings';
import UserProfile from './components/profile/UserProfile';
import Loading from './components/common/Loading';
import MainPage from './components/layout/MainPage';
import LandingPage from './components/landing/LandingPage'; 
const LandingRoute = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return <LandingPage />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            
            <Route path="/" element={<LandingRoute />} />
            <Route path="/home" element={
              <PrivateRoute>
                <MainPage />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/matches" element={
              <PrivateRoute>
                <Layout>
                  <AlignPage />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/messages" element={
              <PrivateRoute>
                <Layout>
                  <Messages />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/messages/:conversationId" element={
              <PrivateRoute>
                <Layout>
                  <Chat />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/chat/new" element={
              <PrivateRoute>
                <Layout>
                  <Chat />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/chat/:conversationId" element={
              <PrivateRoute>
                <Layout>
                  <Chat />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/user/:userId" element={
              <PrivateRoute>
                <Layout>
                  <UserProfile />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/settings" element={
              <PrivateRoute>
                <Layout>
                  <Settings />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Catch-all redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;