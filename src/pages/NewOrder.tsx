
import React from 'react';
import { Layout } from '../components/Layout';
import { OrderForm } from '../components/OrderForm';

const NewOrder: React.FC = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Novo Pedido de Compra</h1>
        <p className="text-muted-foreground mt-1">
          Preencha o formulário abaixo para criar um novo pedido
        </p>
      </div>
      
      <OrderForm />
    </Layout>
  );
};

export default NewOrder;
