
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useOrders, OrderStatus } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  RefreshCw, 
  FileBox, 
  PackageCheck, 
  PackageOpen, 
  LayoutGrid,
  Package,
  AlertTriangle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import LowStockAlerts from '../components/inventory/LowStockAlerts';

const Dashboard: React.FC = () => {
  const { orders, isLoading } = useOrders();
  const { products } = useInventory();
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Count of low stock items
  const lowStockItems = products.filter(product => product.quantity <= product.minimumStock);
  
  // Prepare data for orders chart
  const prepareOrderData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date: format(date, 'dd/MM'),
        pendente: 0,
        aguardando: 0,
        resolvido: 0
      };
    });
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const daysAgo = Math.floor((new Date().getTime() - orderDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysAgo >= 0 && daysAgo < 30) {
        const index = 29 - daysAgo;
        last30Days[index][order.status] += 1;
      }
    });
    
    return last30Days;
  };
  
  const chartData = prepareOrderData();
  
  // Get current month days for calendar view
  const today = new Date();
  const currentMonth = {
    start: startOfMonth(today),
    end: endOfMonth(today)
  };
  
  const daysWithOrders = eachDayOfInterval(currentMonth).reduce((acc, day) => {
    const hasOrders = orders.some(order => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getDate() === day.getDate() &&
        orderDate.getMonth() === day.getMonth() &&
        orderDate.getFullYear() === day.getFullYear()
      );
    });
    
    if (hasOrders) {
      acc.push(day);
    }
    
    return acc;
  }, [] as Date[]);

  // Handle refresh action
  const handleRefresh = () => {
    toast.success('Dados atualizados');
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral do sistema
            </p>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Status summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <FileBox className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{orders.length}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-yellow-100 border-yellow-400 text-yellow-700">
                    <PackageOpen className="h-3 w-3 mr-1" />
                    Pendente
                  </Badge>
                  <span className="text-2xl font-bold">
                    {orders.filter(order => order.status === 'pendente').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/5 to-sky-500/5 border border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando Compra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-100 border-blue-400 text-blue-700">
                    <Package className="h-3 w-3 mr-1" />
                    Aguardando
                  </Badge>
                  <span className="text-2xl font-bold">
                    {orders.filter(order => order.status === 'aguardando').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolvidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-100 border-green-400 text-green-700">
                    <PackageCheck className="h-3 w-3 mr-1" />
                    Resolvido
                  </Badge>
                  <span className="text-2xl font-bold">
                    {orders.filter(order => order.status === 'resolvido').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Orders Chart */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Evolução de Pedidos (Últimos 30 dias)</CardTitle>
              <CardDescription>Visualize o histórico de pedidos por status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pendente" fill="#f59e0b" name="Pendente" />
                    <Bar dataKey="aguardando" fill="#3b82f6" name="Aguardando" />
                    <Bar dataKey="resolvido" fill="#10b981" name="Resolvido" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Pedidos</CardTitle>
              <CardDescription>Pedidos por data</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border pointer-events-auto"
                modifiers={{
                  hasOrder: daysWithOrders
                }}
                modifiersStyles={{
                  hasOrder: { 
                    backgroundColor: 'rgba(249, 115, 22, 0.15)',
                    fontWeight: 'bold'
                  }
                }}
              />
              {date && (
                <div className="mt-4">
                  <p className="text-sm font-medium">
                    {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {orders.filter(order => {
                      const orderDate = new Date(order.createdAt);
                      return (
                        orderDate.getDate() === date.getDate() &&
                        orderDate.getMonth() === date.getMonth() &&
                        orderDate.getFullYear() === date.getFullYear()
                      );
                    }).length} pedidos nesta data
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        <div className="mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="flex-1">
                <CardTitle>Alertas de Estoque Baixo</CardTitle>
                <CardDescription>Produtos que precisam de reposição</CardDescription>
              </div>
              {lowStockItems.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {lowStockItems.length} {lowStockItems.length === 1 ? 'item' : 'itens'}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <LowStockAlerts />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
