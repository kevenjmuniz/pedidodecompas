
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { useOrders, OrderStatus, Order } from '../context/OrderContext';
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
  FileBox,
  Eye,
  PackageOpen,
  Package,
  PackageCheck,
  RefreshCw,
  Plus,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const OrdersList: React.FC = () => {
  const { orders, isLoading, filterOrdersByStatus } = useOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders based on status and search query
  const filteredOrders = React.useMemo(() => {
    let result = statusFilter ? filterOrdersByStatus(statusFilter) : orders;
    
    // Filter by search query (order name)
    if (searchQuery.trim()) {
      result = result.filter(order => 
        order.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by most recent first
    return [...result].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [orders, statusFilter, filterOrdersByStatus, searchQuery]);

  // Handle refresh action
  const handleRefresh = () => {
    // In a real app, this would refresh the data from the server
    console.log("Refreshing orders");
  };

  // Render order table
  const renderOrderTable = (orders: Order[]) => {
    if (orders.length === 0) {
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

        {/* Search field */}
        <div className="relative mb-6">
          <div className="flex items-center border rounded-md bg-background">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10 border-none"
              placeholder="Buscar por nome do item..."
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
            {isLoading ? renderLoadingState() : renderOrderTable(filteredOrders)}
          </TabsContent>
          
          <TabsContent value="pendente" className="mt-0">
            {isLoading ? renderLoadingState() : renderOrderTable(filteredOrders)}
          </TabsContent>
          
          <TabsContent value="aguardando" className="mt-0">
            {isLoading ? renderLoadingState() : renderOrderTable(filteredOrders)}
          </TabsContent>
          
          <TabsContent value="resolvido" className="mt-0">
            {isLoading ? renderLoadingState() : renderOrderTable(filteredOrders)}
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default OrdersList;
