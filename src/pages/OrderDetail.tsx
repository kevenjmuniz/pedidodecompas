import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { useOrders, OrderStatus } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Package, 
  Edit, 
  Trash2, 
  ChevronDown,
  Clock,
  Building,
  FileText,
  Link as LinkIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, updateOrderStatus, deleteOrder, isLoading } = useOrders();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // Get order details
  const order = id ? getOrderById(id) : undefined;
  
  if (!order && !isLoading) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Pedido não encontrado</h2>
          <p className="text-muted-foreground mt-2">O pedido solicitado não existe ou foi removido</p>
          <Button className="mt-6" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Check user permissions
  const canEdit = order && (
    (order.createdBy === user?.id && order.status === 'pendente') || 
    user?.role === 'admin'
  );
  
  const canChangeStatus = order && user?.role === 'admin';
  
  const canDelete = order && (
    (order.createdBy === user?.id && order.status === 'pendente') || 
    user?.role === 'admin'
  );
  
  // Format dates
  const formattedCreatedAt = order 
    ? format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
    : '';
  
  const formattedUpdatedAt = order 
    ? format(new Date(order.updatedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
    : '';
  
  // Handle status change
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || !id) return;
    
    try {
      setIsUpdatingStatus(true);
      await updateOrderStatus(id, newStatus);
      toast.success(`Status atualizado para "${newStatus}"`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!order || !id) return;
    
    try {
      setIsDeleting(true);
      await deleteOrder(id);
      toast.success('Pedido excluído com sucesso');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir pedido');
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      {order && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row items-start justify-between mb-6">
            <div className="flex items-center space-x-3 mb-4 lg:mb-0">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  <Package className="mr-2 h-5 w-5 text-primary" />
                  {order.name}
                </h1>
                <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                  <span>Pedido #{order.id}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {canEdit && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/edit-order/${order.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </Button>
              )}
              
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeleting}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Informações do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                      <Package className="mr-2 h-4 w-4" />
                      Item
                    </h3>
                    <p className="text-lg">{order.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                        <Clock className="mr-2 h-4 w-4" />
                        Quantidade
                      </h3>
                      <p className="text-lg">{order.quantity}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                        <Building className="mr-2 h-4 w-4" />
                        Departamento
                      </h3>
                      <p className="text-lg">{order.department}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                      <FileText className="mr-2 h-4 w-4" />
                      Motivo da Compra
                    </h3>
                    <p className="whitespace-pre-line">{order.reason}</p>
                  </div>
                  
                  {order.itemLink && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Link do Item
                      </h3>
                      <a 
                        href={order.itemLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {order.itemLink}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="glass-card mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={order.status} size="lg" />
                    
                    {canChangeStatus && !isUpdatingStatus && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Alterar
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange('pendente')}
                            disabled={order.status === 'pendente'}
                          >
                            <StatusBadge status="pendente" size="sm" />
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange('aguardando')}
                            disabled={order.status === 'aguardando'}
                          >
                            <StatusBadge status="aguardando" size="sm" />
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange('resolvido')}
                            disabled={order.status === 'resolvido'}
                          >
                            <StatusBadge status="resolvido" size="sm" />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {isUpdatingStatus && (
                      <Button variant="outline" size="sm" disabled>
                        Atualizando...
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Detalhes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Solicitante
                    </h3>
                    <p>{order.createdByName}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Data de Criação
                    </h3>
                    <p>{formattedCreatedAt}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Última Atualização
                    </h3>
                    <p>{formattedUpdatedAt}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      )}
    </Layout>
  );
};

export default OrderDetail;
