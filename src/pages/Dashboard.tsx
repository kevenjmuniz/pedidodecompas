import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { OrderCard } from '../components/OrderCard';
import { StatusBadge } from '../components/StatusBadge';
import { useOrders, OrderStatus } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Filter, 
  Plus, 
  RefreshCw, 
  FileBox, 
  PackageCheck, 
  PackageOpen, 
  LayoutGrid,
  Package,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { orders, isLoading, filterOrdersByStatus } = useOrders();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [view, setView] = useState<'all' | 'mine'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders based on status, view type and search query
  const filteredOrders = React.useMemo(() => {
    let result = statusFilter ? filterOrdersByStatus(statusFilter) : orders;
    
    // If not admin or "mine" view is selected, filter by user's orders
    if (user?.role !== 'admin' || view === 'mine') {
      result = result.filter(order => order.createdBy === user?.id);
    }
    
    // Filter by search query (order ID)
    if (searchQuery.trim()) {
      result = result.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by most recent first
    return [...result].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [orders, statusFilter, view, user, filterOrdersByStatus, searchQuery]);

  // Count orders by status
  const statusCounts = React.useMemo(() => {
    const counts = {
      total: 0,
      pendente: 0,
      aguardando: 0,
      resolvido: 0
    };
    
    let ordersToCount = orders;
    if (user?.role !== 'admin' || view === 'mine') {
      ordersToCount = orders.filter(order => order.createdBy === user?.id);
    }
    
    ordersToCount.forEach(order => {
      counts.total++;
      counts[order.status]++;
    });
    
    return counts;
  }, [orders, view, user]);

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
              Gerencie seus pedidos de compra
            </p>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            {user?.role === 'admin' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    {view === 'all' ? 'Todos' : 'Meus Pedidos'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Visualização</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setView('all')}>
                    Todos os Pedidos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setView('mine')}>
                    Meus Pedidos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            
            <Button size="sm" asChild>
              <Link to="/new-order">
                <Plus className="mr-2 h-4 w-4" />
                Novo Pedido
              </Link>
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
                  <span className="text-2xl font-bold">{statusCounts.total}</span>
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
                  <StatusBadge status="pendente" showIcon={false} />
                  <span className="text-2xl font-bold">{statusCounts.pendente}</span>
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
                  <StatusBadge status="aguardando" showIcon={false} />
                  <span className="text-2xl font-bold">{statusCounts.aguardando}</span>
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
                  <StatusBadge status="resolvido" showIcon={false} />
                  <span className="text-2xl font-bold">{statusCounts.resolvido}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search field */}
        <div className="relative mb-6">
          <div className="flex items-center border rounded-md bg-background">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10 border-none"
              placeholder="Buscar por número do pedido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => {
          if (value === 'all') {
            setStatusFilter(undefined);
          } else {
            setStatusFilter(value as OrderStatus);
          }
        }}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all" className="flex items-center">
                <FileBox className="mr-2 h-4 w-4" />
                Todos
              </TabsTrigger>
              <TabsTrigger value="pendente" className="flex items-center">
                <PackageOpen className="mr-2 h-4 w-4" />
                Pendentes
              </TabsTrigger>
              <TabsTrigger value="aguardando" className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                Aguardando
              </TabsTrigger>
              <TabsTrigger value="resolvido" className="flex items-center">
                <PackageCheck className="mr-2 h-4 w-4" />
                Resolvidos
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            {renderOrderList(filteredOrders, isLoading)}
          </TabsContent>
          
          <TabsContent value="pendente" className="mt-0">
            {renderOrderList(filteredOrders, isLoading)}
          </TabsContent>
          
          <TabsContent value="aguardando" className="mt-0">
            {renderOrderList(filteredOrders, isLoading)}
          </TabsContent>
          
          <TabsContent value="resolvido" className="mt-0">
            {renderOrderList(filteredOrders, isLoading)}
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

// Helper function to render order list
const renderOrderList = (orders: any[], isLoading: boolean) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <FileBox className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
        <h3 className="mt-4 text-lg font-medium">Nenhum pedido encontrado</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Não há pedidos correspondentes aos filtros aplicados
        </p>
        <Button className="mt-4" size="sm" asChild>
          <Link to="/new-order">
            <Plus className="mr-2 h-4 w-4" />
            Criar novo pedido
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order, index) => (
        <OrderCard key={order.id} order={order} index={index} />
      ))}
    </div>
  );
};

export default Dashboard;
