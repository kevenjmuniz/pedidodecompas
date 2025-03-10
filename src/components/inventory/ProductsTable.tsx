
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/context/InventoryContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye } from 'lucide-react';

interface ProductsTableProps {
  products: Product[];
  isAdmin?: boolean;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({ products, isAdmin = false }) => {
  const navigate = useNavigate();
  
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[200px]">Nome</TableHead>
            <TableHead className="w-[100px]">SKU</TableHead>
            <TableHead className="w-[120px]">Categoria</TableHead>
            <TableHead className="w-[100px] text-right">Preço</TableHead>
            <TableHead className="w-[100px] text-right">Estoque</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isLowStock = product.quantity <= product.minimumStock;
            
            return (
              <TableRow key={product.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {product.name}
                    {isLowStock && (
                      <Badge variant="outline" className="ml-2 bg-yellow-100 border-yellow-400 text-yellow-700">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Baixo
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">R$ {product.price.toFixed(2)}</TableCell>
                <TableCell className={`text-right ${isLowStock ? 'text-red-600 font-medium' : ''}`}>
                  {product.quantity} un
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
