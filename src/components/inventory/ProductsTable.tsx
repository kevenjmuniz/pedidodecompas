
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
import { 
  AlertTriangle, 
  Eye, 
  Edit, 
  Trash, 
  PackageCheck 
} from 'lucide-react';

interface ProductsTableProps {
  products: Product[];
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({ 
  products, 
  isAdmin = false, 
  onEdit,
  onDelete
}) => {
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
            <TableHead className="w-[120px] text-right">Status</TableHead>
            <TableHead className="w-[140px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhum produto encontrado.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const isLowStock = product.quantity <= product.minimumStock;
              
              return (
                <TableRow key={product.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {product.name}
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">R$ {product.price.toFixed(2)}</TableCell>
                  <TableCell className={`text-right ${isLowStock ? 'text-red-600 font-medium' : ''}`}>
                    {product.quantity} un
                  </TableCell>
                  <TableCell className="text-right">
                    {isLowStock ? (
                      <Badge variant="outline" className="ml-auto bg-yellow-100 border-yellow-400 text-yellow-700">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Baixo estoque
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-auto bg-green-100 border-green-400 text-green-700">
                        <PackageCheck className="h-3 w-3 mr-1" />
                        Normal
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => navigate(`/inventory/${product.id}`)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {isAdmin && (
                      <>
                        {onEdit && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onEdit(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {onDelete && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onDelete(product.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
