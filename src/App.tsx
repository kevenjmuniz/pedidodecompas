
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext";
import { InventoryProvider } from "./context/InventoryContext";
import { AnimatePresence } from "framer-motion";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import OrderDetail from "./pages/OrderDetail";
import NewOrder from "./pages/NewOrder";
import EditOrder from "./pages/EditOrder";
import NotFound from "./pages/NotFound";
import UserManagementPage from "./pages/UserManagement";
import Inventory from "./pages/Inventory";
import ProductDetail from "./pages/ProductDetail";
import NewProduct from "./pages/NewProduct";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <OrderProvider>
          <InventoryProvider>
            <Toaster />
            <Sonner position="top-right" closeButton />
            <BrowserRouter>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/order/:id" element={<OrderDetail />} />
                  <Route path="/new-order" element={<NewOrder />} />
                  <Route path="/edit-order/:id" element={<EditOrder />} />
                  <Route path="/users" element={<UserManagementPage />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/inventory/:id" element={<ProductDetail />} />
                  <Route path="/inventory/new" element={<NewProduct />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </BrowserRouter>
          </InventoryProvider>
        </OrderProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
