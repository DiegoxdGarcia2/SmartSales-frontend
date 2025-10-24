import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';

import App from './app';
import { routesSection } from './routes/sections';
import { AuthProvider } from './auth/AuthContext';
import { ErrorBoundary } from './routes/components';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';

// ----------------------------------------------------------------------

const router = createBrowserRouter([
  {
    Component: () => (
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <App>
              <Outlet />
            </App>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    ),
    errorElement: <ErrorBoundary />,
    children: routesSection,
  },
]);

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
