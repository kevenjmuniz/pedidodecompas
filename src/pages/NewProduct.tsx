
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useInventory } from '@/context/InventoryContext';
import { ProductForm } from '@/components/inventory/ProductForm';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NewProduct = () => {
  const navigate = useNavigate();
  const { addProduct } = useInventory();

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-6"
      >
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate('/inventory')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Novo Produto</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar Produto</CardTitle>
            <CardDescription>Preencha as informações para adicionar um novo produto ao inventário</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm 
              onSubmit={async (data) => {
                try {
                  const newProduct = await addProduct(data);
                  navigate(`/inventory/${newProduct.id}`);
                } catch (error) {
                  // Error is already handled in context
                }
              }}
              onCancel={() => navigate('/inventory')}
            />
          </CardContent>
        </Card>
      </motion.div>
    </Layout>
  );
};

export default NewProduct;
