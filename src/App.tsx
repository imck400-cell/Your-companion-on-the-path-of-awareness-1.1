/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/layout/Layout';
import Home from '@/pages/Home';
import AdminDashboard from '@/pages/AdminDashboard';
import DynamicPage from '@/pages/DynamicPage';
import '@/lib/i18n';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/p/:slug" element={<DynamicPage />} />
                <Route path="/p/:slug/:itemId" element={<DynamicPage />} />
              </Routes>
            </Layout>
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
