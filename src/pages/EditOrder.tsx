
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { OrderForm } from '../components/OrderForm';
import { useOrders } from '../context/OrderContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EditOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();
  
  // Get order details
  const order = id ? getOrderById(id) : undefined;
  
  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold">Pedido não encontrado</h2>
            <p className="text-muted-foreground mt-2">O pedido solicitado não existe ou foi removido</p>
            <Button className="mt-6" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate('/orders')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Editar Pedido</h1>
        </div>
        
        <OrderForm initialData={order} isEditing={true} />
      </div>
    </Layout>
  );
};

export default EditOrder;
