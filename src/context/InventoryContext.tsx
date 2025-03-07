
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  supplier: string;
  minimumStock: number;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
};

type InventoryContextType = {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  updateStock: (id: string, quantity: number, isAddition?: boolean) => Promise<Product>;
  getLowStockProducts: () => Product[];
};

// Mock initial products
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Arroz Integral',
    sku: 'ARR001',
    category: 'Alimentos',
    price: 8.99,
    cost: 5.50,
    quantity: 45,
    supplier: 'Distribuidor ABC',
    minimumStock: 10,
    description: 'Arroz integral tipo 1, pacote de 1kg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Feijão Preto',
    sku: 'FEI001',
    category: 'Alimentos',
    price: 6.49,
    cost: 3.80,
    quantity: 32,
    supplier: 'Distribuidor XYZ',
    minimumStock: 15,
    description: 'Feijão preto tipo 1, pacote de 1kg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Detergente',
    sku: 'LIM001',
    category: 'Limpeza',
    price: 2.99,
    cost: 1.20,
    quantity: 78,
    supplier: 'Distribuidor Clean',
    minimumStock: 20,
    description: 'Detergente líquido, 500ml',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load products from localStorage or in the future, from Supabase
    const loadProducts = async () => {
      try {
        const storedProducts = localStorage.getItem('inventory-products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        } else {
          // Use initial mock data if no stored products
          setProducts(INITIAL_PRODUCTS);
          localStorage.setItem('inventory-products', JSON.stringify(INITIAL_PRODUCTS));
        }
      } catch (error) {
        toast.error('Erro ao carregar produtos do inventário');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      localStorage.setItem('inventory-products', JSON.stringify(products));
    }
  }, [products, isLoading]);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    setIsLoading(true);
    try {
      // Check if SKU already exists
      if (products.some(p => p.sku === productData.sku)) {
        throw new Error('Este código SKU já está em uso');
      }

      const now = new Date().toISOString();
      const newProduct: Product = {
        ...productData,
        id: `${products.length + 1}`,
        createdAt: now,
        updatedAt: now
      };

      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      toast.success('Produto adicionado com sucesso');
      return newProduct;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar produto');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> => {
    setIsLoading(true);
    try {
      const productIndex = products.findIndex(p => p.id === id);
      if (productIndex === -1) {
        throw new Error('Produto não encontrado');
      }

      // Check if SKU is being changed and if it already exists
      if (productData.sku && productData.sku !== products[productIndex].sku && 
          products.some(p => p.sku === productData.sku)) {
        throw new Error('Este código SKU já está em uso');
      }

      const updatedProduct: Product = {
        ...products[productIndex],
        ...productData,
        updatedAt: new Date().toISOString()
      };

      const updatedProducts = [...products];
      updatedProducts[productIndex] = updatedProduct;
      setProducts(updatedProducts);
      
      toast.success('Produto atualizado com sucesso');
      return updatedProduct;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar produto');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      if (!products.some(p => p.id === id)) {
        throw new Error('Produto não encontrado');
      }

      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      
      toast.success('Produto removido com sucesso');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover produto');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getProduct = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
  };

  const updateStock = async (id: string, quantity: number, isAddition = true): Promise<Product> => {
    setIsLoading(true);
    try {
      const productIndex = products.findIndex(p => p.id === id);
      if (productIndex === -1) {
        throw new Error('Produto não encontrado');
      }

      const currentProduct = products[productIndex];
      const newQuantity = isAddition 
        ? currentProduct.quantity + quantity 
        : Math.max(0, currentProduct.quantity - quantity);

      const updatedProduct: Product = {
        ...currentProduct,
        quantity: newQuantity,
        updatedAt: new Date().toISOString()
      };

      const updatedProducts = [...products];
      updatedProducts[productIndex] = updatedProduct;
      setProducts(updatedProducts);
      
      toast.success(`Estoque ${isAddition ? 'adicionado' : 'removido'} com sucesso`);
      
      // Alert if stock is below minimum
      if (newQuantity <= currentProduct.minimumStock) {
        toast.warning(`Alerta: Estoque baixo para ${currentProduct.name}`);
      }
      
      return updatedProduct;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar estoque');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getLowStockProducts = (): Product[] => {
    return products.filter(p => p.quantity <= p.minimumStock);
  };

  return (
    <InventoryContext.Provider value={{
      products,
      isLoading,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct,
      updateStock,
      getLowStockProducts
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
