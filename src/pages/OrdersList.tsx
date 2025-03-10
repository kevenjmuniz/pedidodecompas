
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { useOrders, OrderStatus, Order } from '../context/OrderContext';
import { OrderCard } from '../components/OrderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle
} from '@/components/ui/card';
import {
  FileBox,
  Eye,
  PackageOpen,
  Package,
  PackageCheck,
  RefreshCw,
  Plus,
  Search,
  LayoutGrid,
  ListChecks,
  Table2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";

// View type for toggling between different views
type ViewType = 'table' | 'todos' | 'cards';

const OrdersList: React.FC = () => {
  const { orders, isLoading, filterOrdersByStatus } = useOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<ViewType>('table'); // Default to table view

  // Filter orders based on status and search query
  const filteredOrders = React.useMemo(() => {
    let result = statusFilter ? filterOrdersByStatus(statusFilter) : orders;
    
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
  }, [orders, statusFilter, filterOrdersByStatus, searchQuery]);

  // Count orders by status
  const statusCounts = React.useMemo(() => {
    const counts = {
      total: orders.length,
      pendente: filterOrdersByStatus('pendente').length,
      aguardando: filterOrdersByStatus('aguardando').length,
      resolvido: filterOrdersByStatus('resolvido').length
    };
    return counts;
  }, [orders, filterOrdersByStatus]);

  // Handle refresh action
  const handleRefresh = () => {
    // In a real app, this would refresh the data from the server
    console.log("Refreshing orders");
  };

  // Todo list view
  const renderTodoList = (orders: Order[]) => {
    if (orders.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-2">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-all">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <StatusBadge status={order.status} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{order.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {order.department} • {order.quantity} item(s) • {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/orders/${order.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  // Cards view
  const renderCardsView = (orders: Order[]) => {
    if (orders.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order, index) => (
          <OrderCard key={order.id} order={order} index={index} />
        ))}
      </div>
    );
  };

  // Render order table
  const renderOrderTable = (orders: Order[]) => {
    if (orders.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Por</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const formattedDate = format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: ptBR });
              
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.name}</TableCell>
                  <TableCell>{order.department}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>{formattedDate}</TableCell>
                  <TableCell>{order.createdByName}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Empty state
  const renderEmptyState = () => {
    return (
      <div className="text-center py-12">
        <FileBox className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
        <h3 className="mt-4 text-lg font-medium">Nenhum pedido encontrado</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Não há pedidos correspondentes aos filtros aplicados
        </p>
        <Button className="mt-4" size="sm" asChild>
          <Link to="/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Criar novo pedido
          </Link>
        </Button>
      </div>
    );
  };

  // Helper function to render loading state
  const renderLoadingState = () => {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
    );
  };

  // Render content based on the view type and loading state
  const renderContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    switch (viewType) {
      case 'todos':
        return renderTodoList(filteredOrders);
      case 'cards':
        return renderCardsView(filteredOrders);
      case 'table':
      default:
        return renderOrderTable(filteredOrders);
    }
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
            <h1 className="text-3xl font-bold">Pedidos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os pedidos de compra
            </p>
          </div>
          
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            
            <Button size="sm" asChild>
              <Link to="/orders/new">
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
                  <div className="flex items-center">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-md">Pendente</span>
                  </div>
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
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-md">Aguardando Compra</span>
                  </div>
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
                  <div className="flex items-center">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-md">Resolvido</span>
                  </div>
                  <span className="text-2xl font-bold">{statusCounts.resolvido}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
          {/* Search field */}
          <div className="relative w-full md:w-64">
            <div className="flex items-center border rounded-md bg-background">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10 border-none"
                placeholder="Buscar por número de pedido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* View type toggle */}
          <div className="flex items-center space-x-2">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    {viewType === 'table' && <Table2 className="h-4 w-4 mr-2" />}
                    {viewType === 'todos' && <ListChecks className="h-4 w-4 mr-2" />}
                    {viewType === 'cards' && <LayoutGrid className="h-4 w-4 mr-2" />}
                    Visualização
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[200px]">
                      <div 
                        className={`flex items-center space-x-2 rounded-md p-2 cursor-pointer ${viewType === 'table' ? 'bg-accent' : 'hover:bg-muted'}`}
                        onClick={() => setViewType('table')}
                      >
                        <Table2 className="h-4 w-4" />
                        <span>Tabela</span>
                      </div>
                      <div 
                        className={`flex items-center space-x-2 rounded-md p-2 cursor-pointer ${viewType === 'todos' ? 'bg-accent' : 'hover:bg-muted'}`}
                        onClick={() => setViewType('todos')}
                      >
                        <ListChecks className="h-4 w-4" />
                        <span>Todos</span>
                      </div>
                      <div 
                        className={`flex items-center space-x-2 rounded-md p-2 cursor-pointer ${viewType === 'cards' ? 'bg-accent' : 'hover:bg-muted'}`}
                        onClick={() => setViewType('cards')}
                      >
                        <LayoutGrid className="h-4 w-4" />
                        <span>Cards</span>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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
            {renderContent()}
          </TabsContent>
          
          <TabsContent value="pendente" className="mt-0">
            {renderContent()}
          </TabsContent>
          
          <TabsContent value="aguardando" className="mt-0">
            {renderContent()}
          </TabsContent>
          
          <TabsContent value="resolvido" className="mt-0">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default OrdersList;
