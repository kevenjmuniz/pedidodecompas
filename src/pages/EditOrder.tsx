
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
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Pedido não encontrado</h2>
          <p className="text-muted-foreground mt-2">O pedido solicitado não existe ou foi removido</p>
          <Button className="mt-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Pedido</h1>
        <p className="text-muted-foreground mt-1">
          Atualize as informações do pedido
        </p>
      </div>
      
      <OrderForm initialData={order} isEditing={true} />
    </Layout>
  );
};

export default EditOrder;
