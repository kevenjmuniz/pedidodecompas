
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useInventory, Product } from '@/context/InventoryContext';
import { ProductCard } from '@/components/inventory/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Inventory = () => {
  const { products, isLoading, getLowStockProducts } = useInventory();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const navigate = useNavigate();
  
  const lowStockProducts = getLowStockProducts();

  // Get unique categories from products
  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());
      
    const matchesCategory = category === 'all' || product.category === category;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Inventário</h1>
          
          <Button onClick={() => navigate('/inventory/new')} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-sm text-yellow-700">
                <span className="font-bold">Atenção:</span> {lowStockProducts.length} produtos com estoque baixo
              </p>
            </div>
          </div>
        )}

        <Tabs defaultValue="all" className="w-full mb-6">
          <TabsList className="w-full max-w-md mx-auto">
            <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
            <TabsTrigger value="low-stock" className="flex-1">Estoque Baixo</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col sm:flex-row gap-4 my-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'Todas as Categorias' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-10">Carregando produtos...</div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                {search || category !== 'all' 
                  ? "Nenhum produto encontrado com os critérios de busca." 
                  : "Nenhum produto no inventário."}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="low-stock">
            {isLoading ? (
              <div className="text-center py-10">Carregando produtos...</div>
            ) : lowStockProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lowStockProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                Não há produtos com estoque baixo.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default Inventory;
