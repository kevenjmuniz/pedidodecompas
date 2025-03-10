import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders, OrderStatus } from '../context/OrderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderFormProps {
  initialData?: {
    id?: string;
    name: string;
    quantity: number;
    reason: string;
    department: string;
    status: OrderStatus;
    itemLink?: string;
  };
  isEditing?: boolean;
}

const DEPARTMENTS = [
  'Administrativo',
  'Comercial',
  'Financeiro',
  'Marketing',
  'Operações',
  'Recursos Humanos',
  'TI',
  'Outro'
];

export const OrderForm: React.FC<OrderFormProps> = ({ 
  initialData = { 
    name: '', 
    quantity: 1, 
    reason: '', 
    department: '', 
    status: 'pendente',
    itemLink: ''
  },
  isEditing = false
}) => {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createOrder, updateOrder } = useOrders();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseInt(value, 10);
    if (!isNaN(numberValue) && numberValue > 0) {
      setFormData(prev => ({ ...prev, [name]: numberValue }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('O nome do item é obrigatório');
      }
      if (formData.quantity <= 0) {
        throw new Error('A quantidade deve ser maior que zero');
      }
      if (!formData.reason.trim()) {
        throw new Error('O motivo da compra é obrigatório');
      }
      if (!formData.department) {
        throw new Error('O departamento é obrigatório');
      }

      if (isEditing && initialData.id) {
        await updateOrder(initialData.id, formData);
        toast.success('Pedido atualizado com sucesso!');
        navigate(`/orders/${initialData.id}`);
      } else {
        const newOrder = await createOrder(formData);
        toast.success('Pedido criado com sucesso!');
        navigate(`/orders/${newOrder.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao processar o pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="glass-card overflow-hidden">
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Editar Pedido' : 'Novo Pedido de Compra'}
          </CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Atualize as informações do pedido existente' 
              : 'Preencha os dados para criar um novo pedido de compra'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Item</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Notebook Dell XPS"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                value={formData.quantity}
                onChange={handleNumberChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itemLink" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Link do Item
              </Label>
              <Input
                id="itemLink"
                name="itemLink"
                type="url"
                placeholder="https://exemplo.com/produto"
                value={formData.itemLink || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Adicione um link de onde o item pode ser encontrado
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Select
                name="department"
                value={formData.department}
                onValueChange={(value) => handleSelectChange('department', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da Compra</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Descreva o motivo da solicitação..."
                value={formData.reason}
                onChange={handleChange}
                className="min-h-[100px]"
                required
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar Pedido' : 'Criar Pedido'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};
