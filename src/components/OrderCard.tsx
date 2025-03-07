
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusBadge } from './StatusBadge';
import { Order } from '../context/OrderContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderCardProps {
  order: Order;
  index: number;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, index }) => {
  // Format dates for display
  const formattedCreatedAt = format(new Date(order.createdAt), 'PPP', { locale: ptBR });
  const formattedUpdatedAt = format(new Date(order.updatedAt), 'PPP', { locale: ptBR });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="glass-card overflow-hidden transition-all duration-200 hover:shadow-md border-2 border-gray-100">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{order.name}</CardTitle>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Quantidade</p>
              <p className="font-medium">{order.quantity}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Departamento</p>
              <p className="font-medium">{order.department}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Motivo</p>
              <p className="line-clamp-2">{order.reason}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-3 text-sm text-muted-foreground">
          <div>
            <p>Criado em {formattedCreatedAt}</p>
            <p className="text-xs">Por {order.createdByName}</p>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link to={`/order/${order.id}`}>
              Detalhes
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
