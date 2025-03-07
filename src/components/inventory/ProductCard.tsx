
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/context/InventoryContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  
  // Calculate stock status
  const getStockStatus = () => {
    if (product.quantity <= 0) {
      return { color: 'bg-red-500', text: 'Sem estoque' };
    } else if (product.quantity <= product.minimumStock) {
      return { color: 'bg-yellow-500', text: 'Estoque baixo' };
    } else {
      return { color: 'bg-green-500', text: 'Em estoque' };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow border-2 border-gray-100">
      <div className="p-4 flex items-center justify-center bg-slate-50 border-b">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="h-40 w-full object-contain"
          />
        ) : (
          <Package className="h-32 w-32 text-slate-300" />
        )}
      </div>
      
      <CardContent className="flex-1 p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <div className={`${stockStatus.color} text-white text-xs px-2 py-1 rounded-full`}>
            {stockStatus.text}
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">SKU: {product.sku}</span>
          <span className="text-sm text-gray-500">{product.category}</span>
        </div>
        
        <div className="mt-2 mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Preço:</span>
            <span className="text-sm font-bold">R$ {product.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Estoque:</span>
            <span className="text-sm">{product.quantity} unidades</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mt-2">{product.description}</p>
      </CardContent>
      
      <CardFooter className="border-t bg-gray-50 p-4">
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={() => navigate(`/inventory/${product.id}`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Gerenciar
        </Button>
      </CardFooter>
    </Card>
  );
};
