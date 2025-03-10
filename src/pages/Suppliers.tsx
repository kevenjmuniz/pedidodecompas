
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSuppliers } from '../context/SupplierContext';
import { SupplierForm } from '../components/supplier/SupplierForm';
import { Search, Pencil, Trash, Plus, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Supplier, SupplierFormData } from '../types/supplier';
import { motion } from 'framer-motion';

const Suppliers: React.FC = () => {
  const { suppliers, isLoading, addSupplier, updateSupplier, deleteSupplier, filterSuppliers } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>(undefined);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  const filteredSuppliers = searchQuery.trim() ? filterSuppliers(searchQuery) : suppliers;

  const handleAddNew = () => {
    setSelectedSupplier(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: SupplierFormData) => {
    if (selectedSupplier) {
      updateSupplier(selectedSupplier.id, data);
    } else {
      addSupplier(data);
    }
    setIsFormOpen(false);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete);
      setSupplierToDelete(null);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Fornecedores</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os fornecedores cadastrados no sistema
            </p>
          </div>
          
          <Button onClick={handleAddNew} className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Button>
        </div>

        {/* Search field */}
        <div className="relative mb-6">
          <div className="flex items-center border rounded-md bg-background">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10 border-none"
              placeholder="Buscar por nome, CNPJ ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Suppliers table */}
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando fornecedores...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
            <h3 className="mt-4 text-lg font-medium">Nenhum fornecedor encontrado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery ? 'Nenhum resultado para esta pesquisa' : 'Comece adicionando um novo fornecedor'}
            </p>
            {!searchQuery && (
              <Button className="mt-4" size="sm" onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Fornecedor
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => {
                  const formattedDate = format(new Date(supplier.createdAt), 'dd/MM/yyyy', { locale: ptBR });
                  
                  return (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.cnpj}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(supplier)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setSupplierToDelete(supplier.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add/Edit Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
              <DialogDescription>
                {selectedSupplier 
                  ? 'Atualize as informações do fornecedor abaixo.' 
                  : 'Preencha os dados para cadastrar um novo fornecedor.'}
              </DialogDescription>
            </DialogHeader>
            <SupplierForm 
              initialData={selectedSupplier} 
              onSubmit={handleFormSubmit} 
              onCancel={handleFormCancel} 
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!supplierToDelete} onOpenChange={(open) => !open && setSupplierToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Deseja realmente excluir este fornecedor do sistema?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
                Sim, excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </Layout>
  );
};

export default Suppliers;
