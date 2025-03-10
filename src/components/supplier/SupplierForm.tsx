
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Supplier, SupplierFormData } from '../../types/supplier';

interface SupplierFormProps {
  initialData?: Supplier;
  onSubmit: (data: SupplierFormData) => void;
  onCancel: () => void;
}

const validateCNPJ = (cnpj: string) => {
  // Remove any non-digit characters
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // CNPJ must have 14 digits
  if (cnpj.length !== 14) return false;
  
  // Check if all digits are the same
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // Simple validation for this example - in production, would need more complex validation
  return true;
};

export const SupplierForm: React.FC<SupplierFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SupplierFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      const { name, cnpj, email, phone, address } = initialData;
      setFormData({ name, cnpj, email, phone, address });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof SupplierFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof SupplierFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    } else {
      toast.error('Por favor, corrija os erros no formulário');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Fornecedor</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nome da empresa"
        />
        {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input
          id="cnpj"
          name="cnpj"
          value={formData.cnpj}
          onChange={handleChange}
          placeholder="00.000.000/0000-00"
        />
        {errors.cnpj && <p className="text-destructive text-sm">{errors.cnpj}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="contato@empresa.com"
        />
        {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(00) 00000-0000"
        />
        {errors.phone && <p className="text-destructive text-sm">{errors.phone}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Endereço completo"
        />
        {errors.address && <p className="text-destructive text-sm">{errors.address}</p>}
      </div>
      
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? 'Atualizar' : 'Cadastrar'} Fornecedor
        </Button>
      </div>
    </form>
  );
};
