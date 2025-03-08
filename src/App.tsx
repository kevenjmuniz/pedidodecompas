
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { InventoryProvider } from './context/InventoryContext';
import { SettingsProvider } from './context/SettingsContext';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';
import EditOrder from './pages/EditOrder';
import OrderDetail from './pages/OrderDetail';
import NotFound from './pages/NotFound';
import Inventory from './pages/Inventory';
import NewProduct from './pages/NewProduct';
import ProductDetail from './pages/ProductDetail';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <AuthProvider>
        <SettingsProvider>
          <OrderProvider>
            <InventoryProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/new-order" element={<NewOrder />} />
                  <Route path="/edit-order/:id" element={<EditOrder />} />
                  <Route path="/order/:id" element={<OrderDetail />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/new-product" element={<NewProduct />} />
                  <Route path="/inventory/new" element={<NewProduct />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
              <Toaster />
            </InventoryProvider>
          </OrderProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
