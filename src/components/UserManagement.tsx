
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { UserCog, UserMinus, ShieldAlert, LockKeyhole } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { users, addUser, removeUser, changePassword, user: currentUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  // State for password change
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Only admin users should be able to access this component
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso Restrito</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta área.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await addUser(name, email, password, role);
      // Reset form after successful addition
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
      setIsAddingUser(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (id: string) => {
    setIsLoading(true);
    try {
      await removeUser(id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    setIsLoading(true);
    try {
      await changePassword(selectedUserId, newPassword);
      setNewPassword('');
      setIsChangingPassword(false);
      setSelectedUserId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
        <Button 
          onClick={() => {
            setIsAddingUser(!isAddingUser);
            setIsChangingPassword(false);
          }}
          variant={isAddingUser ? "secondary" : "default"}
        >
          {isAddingUser ? "Cancelar" : "Adicionar Usuário"}
        </Button>
      </div>

      {isAddingUser && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Usuário</CardTitle>
            <CardDescription>
              Preencha os dados para adicionar um novo usuário ao sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Crie uma senha segura"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Select 
                  value={role} 
                  onValueChange={(value: 'admin' | 'user') => setRole(value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Adicionar Usuário"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isChangingPassword && selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>
              Digite a nova senha para o usuário selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isLoading}
                >
                  {isLoading ? "Processando..." : "Salvar Senha"}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setSelectedUserId(null);
                    setNewPassword('');
                  }}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Usuários cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2 text-left">E-mail</th>
                  <th className="px-4 py-2 text-left">Perfil</th>
                  <th className="px-4 py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/30">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-secondary/20 text-secondary'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setIsChangingPassword(true);
                            setIsAddingUser(false);
                          }}
                          title="Alterar senha"
                        >
                          <LockKeyhole className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              title="Remover usuário"
                              disabled={currentUser.id === user.id}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover o usuário <strong>{user.name}</strong>?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleRemoveUser(user.id)}
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
