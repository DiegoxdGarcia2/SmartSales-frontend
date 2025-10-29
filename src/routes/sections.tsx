import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { AdminRoute, ProtectedRoute } from './components';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const AdminProductsPage = lazy(() => import('src/pages/admin-products'));
export const MyOrdersPage = lazy(() => import('src/pages/my-orders'));
export const OrderDetailPage = lazy(() => import('src/pages/order-detail'));
export const ProductDetailPage = lazy(() => import('src/pages/product-detail'));
export const CheckoutSuccessPage = lazy(() => import('src/pages/checkout-success'));
export const CheckoutCancelPage = lazy(() => import('src/pages/checkout-cancel'));
export const SalesDashboardPage = lazy(() => import('src/pages/sales-dashboard'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: 'user',
        element: (
          <AdminRoute>
            <UserPage />
          </AdminRoute>
        ),
      },
      { path: 'products', element: <ProductsPage /> },
      { path: 'product/:productId', element: <ProductDetailPage /> },
      {
        path: 'admin/products',
        element: (
          <AdminRoute>
            <AdminProductsPage />
          </AdminRoute>
        ),
      },
      { path: 'blog', element: <BlogPage /> },
      { path: 'my-orders', element: <MyOrdersPage /> },
      { path: 'order/:orderId', element: <OrderDetailPage /> },
      {
        path: 'sales-dashboard',
        element: (
          <AdminRoute>
            <SalesDashboardPage />
          </AdminRoute>
        ),
      },
      { path: 'checkout/success', element: <CheckoutSuccessPage /> },
      { path: 'checkout/cancel', element: <CheckoutCancelPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: 'sign-up',
    element: (
      <AuthLayout>
        <SignUpPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
