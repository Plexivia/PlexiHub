import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout & Guards
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { MfaPage, ForgotPasswordPage, ResetPasswordPage } from './pages/auth/MfaPage';

// Main Application Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { IssueListPage } from './pages/issues/IssueListPage';
import { IssueCreatePage } from './pages/issues/IssueCreatePage';
import { IssueDetailPage } from './pages/issues/IssueDetailPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SupportListPage } from './pages/support/SupportListPage';
import { SupportCreatePage } from './pages/support/SupportCreatePage';
import { BusinessPage } from './pages/business/BusinessPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mfa" element={<MfaPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Application Shell */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Project Issue Management Routes */}
            <Route path="projects/:projectId/issues" element={<IssueListPage />} />
            <Route path="projects/:projectId/issues/new" element={<IssueCreatePage />} />
            <Route path="projects/:projectId/issues/:issueId" element={<IssueDetailPage />} />
            <Route path="projects/:projectId/reports" element={<ReportsPage />} />

            {/* Support Management Routes */}
            <Route path="support/requests" element={<SupportCreatePage />} />
            <Route path="support/list" element={<SupportListPage />} />

            {/* Business & White-Label Management */}
            <Route path="business" element={<BusinessPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
