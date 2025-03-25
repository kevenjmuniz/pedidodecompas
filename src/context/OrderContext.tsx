
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { 
  WebhookConfig, 
  WebhookEvent,
  createOrderCreatedPayload,
  createOrderStatusUpdatedPayload,
  createOrderCanceledPayload,
  sendWebhook
} from '../services/webhookService';

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
  const { webhookConfigs } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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

  const sendWebhookNotifications = async (
    event: WebhookEvent, 
    payload: any, 
    specificWebhook?: string
  ) => {
    const eligibleWebhooks = webhookConfigs.filter(config => 
      config.enabled && 
      config.events.includes(event) && 
      (specificWebhook ? config.id === specificWebhook : true)
    );
    
    const promises = eligibleWebhooks.map(config => sendWebhook(config, payload));
    await Promise.allSettled(promises);
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByName'>) => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const now = new Date().toISOString();
      const newOrder: Order = {
        ...orderData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: now,
        updatedAt: now,
        createdBy: user.id,
        createdByName: user.name,
      };
      
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      const payload = createOrderCreatedPayload(newOrder);
      await sendWebhookNotifications('pedido_criado', payload);
      
      toast.success('Pedido criado com sucesso');
      return newOrder;
    } catch (error) {
      toast.error('Falha ao criar pedido');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orderIndex = orders.findIndex(order => order.id === id);
      if (orderIndex === -1) throw new Error('Order not found');
      
      const order = orders[orderIndex];
      if (order.createdBy !== user.id && user.role !== 'admin') {
        throw new Error('Not authorized to edit this order');
      }
      
      const statusChanged = updates.status && updates.status !== order.status;
      const previousStatus = order.status;
      
      const updatedOrder = {
        ...order,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      const updatedOrders = [...orders];
      updatedOrders[orderIndex] = updatedOrder;
      
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      if (statusChanged) {
        const payload = createOrderStatusUpdatedPayload(
          updatedOrder, 
          previousStatus, 
          user.name
        );
        await sendWebhookNotifications('status_atualizado', payload);
      }
      
      toast.success('Pedido atualizado com sucesso');
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error instanceof Error ? error.message : 'Falha ao atualizar pedido');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    console.log("Updating order status", id, status);
    if (!user) throw new Error('User not authenticated');
    
    try {
      return await updateOrder(id, { status });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const deleteOrder = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orderIndex = orders.findIndex(order => order.id === id);
      if (orderIndex === -1) throw new Error('Order not found');
      
      const order = orders[orderIndex];
      if (order.createdBy !== user.id && user.role !== 'admin') {
        throw new Error('Not authorized to delete this order');
      }
      
      if (order.status !== 'pendente' && user.role !== 'admin') {
        throw new Error('Can only delete orders with pending status');
      }
      
      const deletedOrder = { ...order };
      
      const updatedOrders = orders.filter(order => order.id !== id);
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      const payload = createOrderCanceledPayload(deletedOrder, user.name);
      await sendWebhookNotifications('pedido_cancelado', payload);
      
      toast.success('Pedido excluído com sucesso');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao excluir pedido');
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
