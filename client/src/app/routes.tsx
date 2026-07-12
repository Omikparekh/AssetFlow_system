import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ProtectedRoute, PermissionRoute } from '@/components/ProtectedRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignupPage } from '@/features/auth/pages/SignupPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { OrganizationPage } from '@/features/organization/pages/OrganizationPage';
import { AssetDirectoryPage } from '@/features/assets/pages/AssetDirectoryPage';
import { RegisterAssetPage } from '@/features/assets/pages/RegisterAssetPage';
import { AssetDetailsPage } from '@/features/assets/pages/AssetDetailsPage';
import { AllocationsPage } from '@/features/allocations/pages/AllocationsPage';
import { MaintenancePage } from '@/features/maintenance/pages/MaintenancePage';
import { AuditsPage } from '@/features/audits/pages/AuditsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

// Page Placeholders
const Unauthorized = () => <div>403 - Unauthorized</div>;
const NotFound = () => <div>404 - Not Found</div>;

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <AuthLayout />
    ),
    children: [
      { index: true, element: <LoginPage /> },
    ],
  },
  {
    path: '/signup',
    element: <AuthLayout />,
    children: [
      { index: true, element: <SignupPage /> },
    ]
  },
  {
    path: '/forgot-password',
    element: <AuthLayout />,
    children: [
      { index: true, element: <ForgotPasswordPage /> },
    ]
  },
  {
    path: '/reset-password',
    element: <AuthLayout />,
    children: [
      { index: true, element: <ResetPasswordPage /> },
    ]
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'assets',
        children: [
          { index: true, element: <AssetDirectoryPage /> },
          { path: 'new', element: <RegisterAssetPage /> },
          { path: ':id', element: <AssetDetailsPage /> },
        ]
      },
      {
        path: 'allocations',
        element: <AllocationsPage />,
      },
      {
        path: 'maintenance',
        element: <MaintenancePage />,
      },
      {
        path: 'audits',
        element: <AuditsPage />,
      },
      {
        path: 'organization',
        element: (
          <PermissionRoute allowedRoles={['ADMIN']}>
            <OrganizationPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '/403',
    element: <Unauthorized />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
