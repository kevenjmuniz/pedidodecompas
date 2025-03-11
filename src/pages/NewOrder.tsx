
import React from 'react';
import { Layout } from '../components/Layout';
import { OrderForm } from '../components/OrderForm';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate('/orders')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Novo Pedido de Compra</h1>
        </div>
        
        <OrderForm />
      </div>
    </Layout>
  );
};

export default NewOrder;
