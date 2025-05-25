import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { SeriesProvider } from './contexts/SeriesContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import SeriesDetailPage from './pages/SeriesDetailPage';
import DashboardPage from './pages/DashboardPage';
import { useUser } from './hooks/useUser';

function AppContent() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Series Aggregator...</div>
      </div>
    );
  }

  return (
    <Router>
      <SeriesProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/series/:seriesId" element={<SeriesDetailPage />} />
            <Route 
              path="/dashboard" 
              element={user ? <DashboardPage /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/u/:userId" 
              element={<Navigate to="/dashboard" replace />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </SeriesProvider>
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;