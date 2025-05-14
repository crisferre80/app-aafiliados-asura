import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, initializeAuth } from './store/authStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AffiliatesPage from './pages/AffiliatesPage';
import AffiliateFormPage from './pages/AffiliateFormPage';
import AffiliateDetailPage from './pages/AffiliateDetailPage';
import PaymentsControlPage from './pages/PaymentsControlPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ActivityFormPage from './pages/ActivityFormPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import MembershipCardPage from './pages/MembershipCardPage';
import NotFoundPage from './pages/NotFoundPage';
import AffiliateCredential from './pages/AffiliateCredential';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-16 h-16 border-t-4 border-b-4 border-green-500 rounded-full animate-spin"></div>
    </div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/card/:id" element={<MembershipCardPage />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<DashboardPage />} />
          
          <Route path="affiliates">
            <Route index element={<AffiliatesPage />} />
            <Route path="new" element={<AffiliateFormPage />} />
            <Route path=":id" element={<AffiliateDetailPage />} />
            <Route path=":id/edit" element={<AffiliateFormPage />} />
            <Route path=":id/credential" element={<AffiliateCredential />} />
          </Route>
          
          <Route path="payments" element={<PaymentsControlPage />} />
          
          <Route path="activities">
            <Route index element={<ActivitiesPage />} />
            <Route path="new" element={<ActivityFormPage />} />
            <Route path=":id" element={<ActivityDetailPage />} />
            <Route path=":id/edit" element={<ActivityFormPage />} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;