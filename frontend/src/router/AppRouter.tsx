import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout';
import ProtectedRoute from './ProtectedRoute';

import { LoginPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { OrdersPage } from '@/pages/orders';
import { ProductionPage } from '@/pages/production';
import { CheeseMakingPage } from '@/pages/cheese-making';
import { CheeseWarehousePage } from '@/pages/cheese-warehouse';
import { MaterialsPage } from '@/pages/materials';
import { PackagingPage } from '@/pages/packaging';
import { ShippingPage } from '@/pages/shipping';
import { PaymentsPage } from '@/pages/payments';
import { ClaimsPage } from '@/pages/claims';
import { ReportsPage } from '@/pages/reports';

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          <Route
            path="orders"
            element={
              <ProtectedRoute requiredModule="orders">
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="production"
            element={
              <ProtectedRoute requiredModule="production">
                <ProductionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="cheese-making"
            element={
              <ProtectedRoute requiredModule="production">
                <CheeseMakingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="cheese-warehouse"
            element={
              <ProtectedRoute requiredModule="production">
                <CheeseWarehousePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="materials"
            element={
              <ProtectedRoute requiredModule="materials">
                <MaterialsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="packaging"
            element={
              <ProtectedRoute requiredModule="packaging">
                <PackagingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="shipping"
            element={
              <ProtectedRoute requiredModule="shipping">
                <ShippingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="payments"
            element={
              <ProtectedRoute requiredModule="payments">
                <PaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="claims"
            element={
              <ProtectedRoute requiredModule="claims">
                <ClaimsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute requiredModule="reports">
                <ReportsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
