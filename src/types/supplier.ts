
export type Supplier = {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export type SupplierFormData = Omit<Supplier, 'id' | 'createdAt'>;
