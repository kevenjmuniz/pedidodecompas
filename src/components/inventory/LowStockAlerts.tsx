
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '@/context/InventoryContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Eye, PackageCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const LowStockAlerts: React.FC = () => {
  const { products } = useInventory();
  const navigate = useNavigate();
  
  // Filter products with low stock
  const lowStockItems = products.filter(product => product.quantity <= product.minimumStock);
  
  if (lowStockItems.length === 0) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <PackageCheck className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-700">Estoque em dia</AlertTitle>
        <AlertDescription className="text-green-600">
          Todos os produtos estão com estoque adequado no momento.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div>
      {lowStockItems.length > 0 && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-700">Atenção</AlertTitle>
          <AlertDescription className="text-yellow-600">
            {lowStockItems.length} {lowStockItems.length === 1 ? 'produto está' : 'produtos estão'} com estoque baixo e {lowStockItems.length === 1 ? 'precisa' : 'precisam'} de reposição.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[250px]">Produto</TableHead>
              <TableHead className="w-[100px]">SKU</TableHead>
              <TableHead className="w-[100px] text-right">Estoque</TableHead>
              <TableHead className="w-[100px] text-right">Mínimo</TableHead>
              <TableHead className="w-[140px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockItems.map((product) => (
              <TableRow key={product.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  {product.name}
                </TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell className="text-right text-red-600 font-medium">
                  {product.quantity} un
                </TableCell>
                <TableCell className="text-right">
                  {product.minimumStock} un
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LowStockAlerts;
