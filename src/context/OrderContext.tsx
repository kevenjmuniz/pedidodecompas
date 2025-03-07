
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export type OrderStatus = 'pendente' | 'aguardando' | 'resolvido';

export type Order = {
  id: string;
  name: string;
  quantity: number;
  reason: string;
  department: string;
  status: OrderStatus;
  itemLink?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
};

type OrderContextType = {
  orders: Order[];
  isLoading: boolean;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByName'>) => Promise<Order>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<Order>;
  getOrderById: (id: string) => Order | undefined;
  deleteOrder: (id: string) => Promise<void>;
  filterOrdersByStatus: (status?: OrderStatus) => Order[];
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Sample data
const SAMPLE_ORDERS: Order[] = [
  {
    id: '1',
    name: 'Notebook Dell XPS',
    quantity: 1,
    reason: 'Substituição de equipamento antigo',
    department: 'TI',
    status: 'pendente',
    itemLink: 'https://www.dell.com/pt-br/shop/notebooks-dell/xps-13-plus/spd/xps-13-9320-laptop',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: '1',
    createdByName: 'Admin User',
  },
  {
    id: '2',
    name: 'Material de Escritório',
    quantity: 10,
    reason: 'Reposição de estoque',
    department: 'Administrativo',
    status: 'aguardando',
    itemLink: 'https://www.kalunga.com.br/depto/papelaria/d2',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: '2',
    createdByName: 'Regular User',
  },
  {
    id: '3',
    name: 'Cadeiras Ergonômicas',
    quantity: 5,
    reason: 'Melhoria no ambiente de trabalho',
    department: 'RH',
    status: 'resolvido',
    itemLink: 'https://www.madeiramadeira.com.br/cadeiras-de-escritorio',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: '1',
    createdByName: 'Admin User',
  },
  {
    id: '4',
    name: 'Impressora a Laser',
    quantity: 1,
    reason: 'Nova necessidade do departamento',
    department: 'Marketing',
    status: 'pendente',
    itemLink: 'https://www.hp.com/br-pt/shop/impressoras.html',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: '2',
    createdByName: 'Regular User',
  },
];

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, we would fetch orders from the API
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        } else {
          setOrders(SAMPLE_ORDERS);
          localStorage.setItem('orders', JSON.stringify(SAMPLE_ORDERS));
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadOrders();
    } else {
      setOrders([]);
      setIsLoading(false);
    }
  }, [user]);

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByName'>) => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date().toISOString();
      const newOrder: Order = {
        ...orderData,
        id: Math.random().toString(36).substr(2, 9), // Generate a random ID
        createdAt: now,
        updatedAt: now,
        createdBy: user.id,
        createdByName: user.name,
      };
      
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      toast.success('Order created successfully');
      return newOrder;
    } catch (error) {
      toast.error('Failed to create order');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orderIndex = orders.findIndex(order => order.id === id);
      if (orderIndex === -1) throw new Error('Order not found');
      
      // Check if user is authorized to edit
      const order = orders[orderIndex];
      if (order.createdBy !== user.id && user.role !== 'admin') {
        throw new Error('Not authorized to edit this order');
      }
      
      // Check if order is not pending and user is trying to edit other fields than status
      if (order.status !== 'pendente' && Object.keys(updates).some(key => key !== 'status')) {
        if (user.role !== 'admin') {
          throw new Error('Can only edit orders with pending status');
        }
      }
      
      const updatedOrder = {
        ...order,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      const updatedOrders = [...orders];
      updatedOrders[orderIndex] = updatedOrder;
      
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      toast.success('Order updated successfully');
      return updatedOrder;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update order');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    if (!user) throw new Error('User not authenticated');
    
    return updateOrder(id, { status });
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const deleteOrder = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orderIndex = orders.findIndex(order => order.id === id);
      if (orderIndex === -1) throw new Error('Order not found');
      
      // Check if user is authorized to delete
      const order = orders[orderIndex];
      if (order.createdBy !== user.id && user.role !== 'admin') {
        throw new Error('Not authorized to delete this order');
      }
      
      // Check if order is not pending
      if (order.status !== 'pendente' && user.role !== 'admin') {
        throw new Error('Can only delete orders with pending status');
      }
      
      const updatedOrders = orders.filter(order => order.id !== id);
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      toast.success('Order deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete order');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrdersByStatus = (status?: OrderStatus) => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        createOrder,
        updateOrder,
        updateOrderStatus,
        getOrderById,
        deleteOrder,
        filterOrdersByStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
