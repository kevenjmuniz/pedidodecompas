
import React from 'react';
import { Layout } from '../components/Layout';
import { OrderForm } from '../components/OrderForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown } from 'lucide-react';

const NewOrder: React.FC = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Novo Pedido de Compra</h1>
        <p className="text-muted-foreground mt-1">
          Preencha o formulário abaixo para criar um novo pedido
        </p>
      </div>
      
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">📦</span> Sistema em Container Docker
          </CardTitle>
          <CardDescription>
            Este sistema está configurado para rodar em containers Docker
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Para iniciar o sistema usando Docker, execute no terminal:
          </p>
          <div className="bg-slate-950 text-slate-50 p-3 rounded-md text-sm font-mono overflow-x-auto">
            docker-compose up -d
          </div>
          <div className="flex flex-col items-center justify-center text-center py-2">
            <ArrowDown className="h-5 w-5 text-muted-foreground animate-bounce" />
            <p className="text-sm text-muted-foreground">A aplicação estará disponível em <span className="font-medium">http://localhost</span></p>
          </div>
        </CardContent>
      </Card>
      
      <OrderForm />
    </Layout>
  );
};

export default NewOrder;
