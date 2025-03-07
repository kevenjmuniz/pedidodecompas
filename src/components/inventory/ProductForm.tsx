
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/context/InventoryContext';
import { X, Save } from 'lucide-react';

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ 
  initialData = {}, 
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    sku: initialData.sku || '',
    category: initialData.category || '',
    price: initialData.price || 0,
    cost: initialData.cost || 0,
    quantity: initialData.quantity || 0,
    supplier: initialData.supplier || '',
    minimumStock: initialData.minimumStock || 0,
    description: initialData.description || '',
    image: initialData.image || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseFloat(value);
    if (!isNaN(numberValue) && numberValue >= 0) {
      setFormData(prev => ({ ...prev, [name]: numberValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto*</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sku">Código SKU*</Label>
          <Input
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Categoria*</Label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="supplier">Fornecedor*</Label>
          <Input
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Preço de Venda (R$)*</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleNumberChange}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cost">Custo de Aquisição (R$)*</Label>
          <Input
            id="cost"
            name="cost"
            type="number"
            min="0"
            step="0.01"
            value={formData.cost}
            onChange={handleNumberChange}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade em Estoque*</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={handleNumberChange}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minimumStock">Estoque Mínimo*</Label>
          <Input
            id="minimumStock"
            name="minimumStock"
            type="number"
            min="0"
            value={formData.minimumStock}
            onChange={handleNumberChange}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="image">URL da Imagem</Label>
          <Input
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://exemplo.com/imagem.jpg"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição*</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Salvando...' : initialData.id ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};
