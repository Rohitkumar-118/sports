import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import FindPartnersPage from './pages/FindPartnerspage';
import RequestsPage from './pages/RequestsPage';
import CommunitiesPage from './pages/CommunitiesPage';
import TournamentsPage from './pages/TournamentsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/find-partners" element={<FindPartnersPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/communities" element={<CommunitiesPage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
