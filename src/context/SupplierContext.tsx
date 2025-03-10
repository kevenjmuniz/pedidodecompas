
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Supplier, SupplierFormData } from '../types/supplier';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface SupplierContextType {
  suppliers: Supplier[];
  isLoading: boolean;
  addSupplier: (data: SupplierFormData) => void;
  updateSupplier: (id: string, data: SupplierFormData) => void;
  deleteSupplier: (id: string) => void;
  getSupplier: (id: string) => Supplier | undefined;
  filterSuppliers: (query: string) => Supplier[];
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export const SupplierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load suppliers from localStorage on mount
  useEffect(() => {
    const storedSuppliers = localStorage.getItem('suppliers');
    if (storedSuppliers) {
      setSuppliers(JSON.parse(storedSuppliers));
    }
    setIsLoading(false);
  }, []);

  // Save suppliers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  const addSupplier = (data: SupplierFormData) => {
    const newSupplier: Supplier = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    setSuppliers(prev => [...prev, newSupplier]);
    toast.success('Fornecedor adicionado com sucesso');
  };

  const updateSupplier = (id: string, data: SupplierFormData) => {
    setSuppliers(prev => 
      prev.map(supplier => 
        supplier.id === id 
          ? { ...supplier, ...data } 
          : supplier
      )
    );
    toast.success('Fornecedor atualizado com sucesso');
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
    toast.success('Fornecedor removido com sucesso');
  };

  const getSupplier = (id: string) => {
    return suppliers.find(supplier => supplier.id === id);
  };

  const filterSuppliers = (query: string) => {
    if (!query.trim()) return suppliers;
    
    const lowercasedQuery = query.toLowerCase();
    return suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(lowercasedQuery) ||
      supplier.cnpj.includes(lowercasedQuery) ||
      supplier.email.toLowerCase().includes(lowercasedQuery)
    );
  };

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        isLoading,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        getSupplier,
        filterSuppliers
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
};
