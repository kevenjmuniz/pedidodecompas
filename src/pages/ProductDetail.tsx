
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useInventory } from '@/context/InventoryContext';
import { useAuth } from '@/context/AuthContext';
import { ProductForm } from '@/components/inventory/ProductForm';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
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
import { ArrowLeft, Save, Trash, PlusCircle, MinusCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, updateProduct, deleteProduct, updateStock } = useInventory();
  const { user } = useAuth();
  const [stockAdjustment, setStockAdjustment] = useState<number>(1);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  const product = id ? getProduct(id) : undefined;
  const isAdmin = user?.role === 'admin';
  
  useEffect(() => {
    if (id && !product) {
      toast.error('Produto não encontrado');
      navigate('/inventory');
    }
  }, [id, product, navigate]);

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto py-8 text-center">
          Carregando produto...
        </div>
      </Layout>
    );
  }

  const handleStockUpdate = async (isAddition: boolean) => {
    if (!isAdmin) {
      toast.error('Você não tem permissão para alterar o estoque');
      return;
    }
    
    if (stockAdjustment <= 0) {
      toast.error('A quantidade deve ser maior que zero');
      return;
    }
    
    try {
      await updateStock(product.id, stockAdjustment, isAddition);
    } catch (error) {
      // Error is already handled in context
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) {
      toast.error('Você não tem permissão para excluir produtos');
      return;
    }
    
    try {
      await deleteProduct(product.id);
      navigate('/inventory');
    } catch (error) {
      // Error is already handled in context
    }
  };

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
          <h1 className="text-2xl font-bold">Detalhes do Produto</h1>
        </div>

        {!isAdmin && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <div className="flex items-center">
              <ShieldAlert className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-sm text-yellow-700">
                Visualização apenas. Você não tem permissão para editar ou gerenciar este produto.
              </p>
            </div>
          </div>
        )}

        {isEditing && isAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle>Editar Produto</CardTitle>
              <CardDescription>Atualize as informações do produto</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm 
                initialData={product} 
                onSubmit={async (data) => {
                  try {
                    await updateProduct(product.id, data);
                    setIsEditing(false);
                  } catch (error) {
                    // Error is already handled in context
                  }
                }}
                onCancel={() => setIsEditing(false)}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>SKU: {product.sku}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Categoria</h3>
                    <p>{product.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Fornecedor</h3>
                    <p>{product.supplier}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Preço de Venda</h3>
                    <p className="text-lg font-semibold">R$ {product.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Custo de Aquisição</h3>
                    <p>R$ {product.cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Margem de Lucro</h3>
                    <p>{((product.price - product.cost) / product.price * 100).toFixed(2)}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Data de Atualização</h3>
                    <p>{new Date(product.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Descrição</h3>
                  <p className="text-gray-700">{product.description}</p>
                </div>
                
                {isAdmin && (
                  <div className="pt-4 mt-4 border-t">
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                      <Save className="mr-2 h-4 w-4" />
                      Editar Produto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Estoque</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Estoque Atual:</span>
                    <span className="text-lg font-semibold">{product.quantity}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Estoque Mínimo:</span>
                    <span>{product.minimumStock}</span>
                  </div>
                  
                  {isAdmin && (
                    <div className="pt-4 mt-4 border-t">
                      <div className="grid grid-cols-3 gap-4 items-center mb-4">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setStockAdjustment(prev => Math.max(1, prev - 1))}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <div className="text-center font-semibold">{stockAdjustment}</div>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setStockAdjustment(prev => prev + 1)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-col space-y-3">
                        <Button 
                          onClick={() => handleStockUpdate(true)}
                          className="w-full"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Adicionar Estoque
                        </Button>
                        <Button 
                          onClick={() => handleStockUpdate(false)}
                          variant="secondary"
                          className="w-full"
                        >
                          <MinusCircle className="mr-2 h-4 w-4" />
                          Remover Estoque
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {isAdmin && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir Produto
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto
                            "{product.name}" do seu inventário.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default ProductDetail;
