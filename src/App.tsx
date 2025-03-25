
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ui/theme-provider';
import { Toaster } from './components/ui/sonner';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';
import OrderDetail from './pages/OrderDetail';
import EditOrder from './pages/EditOrder';
import OrdersList from './pages/OrdersList';
import Inventory from './pages/Inventory';
import NewProduct from './pages/NewProduct';
import ProductDetail from './pages/ProductDetail';
import Settings from './pages/Settings';
import Suppliers from './pages/Suppliers';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { OrderProvider } from './context/OrderContext';
import { InventoryProvider } from './context/InventoryContext';
import { SupplierProvider } from './context/SupplierContext';
import NotFound from './pages/NotFound';
import AccountCreated from './pages/AccountCreated';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Toaster />
        <AuthProvider>
          <SettingsProvider>
            {/* Correctly nest the providers to ensure AuthProvider is available for OrderProvider */}
            <OrderProvider>
              <InventoryProvider>
                <SupplierProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/orders" element={<OrdersList />} />
                    <Route path="/orders/new" element={<NewOrder />} />
                    <Route path="/orders/:id" element={<OrderDetail />} />
                    <Route path="/orders/:id/edit" element={<EditOrder />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/inventory/new" element={<NewProduct />} />
                    <Route path="/inventory/:id" element={<ProductDetail />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/account-created" element={<AccountCreated />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SupplierProvider>
              </InventoryProvider>
            </OrderProvider>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
