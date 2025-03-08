
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/context/InventoryContext';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isAdmin = false }) => {
  const navigate = useNavigate();
  const isLowStock = product.quantity <= product.minimumStock;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          {isLowStock && (
            <Badge variant="outline" className="bg-yellow-100 border-yellow-400 text-yellow-700">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Estoque Baixo
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
      </CardHeader>
      <CardContent className="py-2 flex-1">
        <div className="flex justify-between mb-2">
          <span className="font-medium">R$ {product.price.toFixed(2)}</span>
          <span className={`${isLowStock ? 'text-red-600 font-medium' : ''}`}>
            {product.quantity} un
          </span>
        </div>
        <p className="text-sm line-clamp-2 text-gray-600">{product.description}</p>
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          {isAdmin ? 'Visualizar e Editar' : 'Visualizar Detalhes'}
        </Button>
      </CardFooter>
    </Card>
  );
};
