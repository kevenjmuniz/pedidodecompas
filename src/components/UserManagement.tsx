import React, { useState, useEffect } from 'react';
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
import { UserCog, UserMinus, ShieldAlert, LockKeyhole, UserCheck, UserX, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const UserManagement: React.FC = () => {
  const { users, addUser, removeUser, changePassword, approveUser, rejectUser, user: currentUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // State for password change
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Check for pending users and switch to pending tab
  useEffect(() => {
    console.log("UserManagement component mounted, users:", users.length);
    console.log("Pending users:", users.filter(u => u.status === 'pending').map(u => u.email));
    
    const pendingUsers = users.filter(user => user.status === 'pending');
    if (pendingUsers.length > 0) {
      // Only switch tabs if we're on the default 'all' tab
      if (activeTab === 'all') {
        setActiveTab('pending');
        
        // Show notification about pending users
        toast.info(`${pendingUsers.length} usuário(s) aguardando aprovação`, {
          icon: <Bell className="h-5 w-5" />,
          duration: 5000,
        });
      }
    }
  }, [users]);

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

  const pendingUsers = users.filter(user => user.status === 'pending');
  const approvedUsers = users.filter(user => user.status === 'approved');
  const rejectedUsers = users.filter(user => user.status === 'rejected');

  console.log("Rendering with pending users:", pendingUsers.length);

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

  const handleApproveUser = async (id: string) => {
    setIsLoading(true);
    try {
      await approveUser(id);
      toast.success('Usuário aprovado com sucesso');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao aprovar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectUser = async (id: string) => {
    setIsLoading(true);
    try {
      await rejectUser(id);
      toast.success('Usuário rejeitado com sucesso');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao rejeitar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pendente</span>;
      case 'approved':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Aprovado</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Rejeitado</span>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-4"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Usuários</h2>
          {pendingUsers.length > 0 && (
            <p className="text-yellow-600 font-medium mt-1">
              {pendingUsers.length} usuário(s) aguardando aprovação
            </p>
          )}
        </div>
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

      {pendingUsers.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCog className="h-5 w-5 text-yellow-500" /> 
              Solicitações Pendentes
            </CardTitle>
            <CardDescription>
              Existem {pendingUsers.length} usuários aguardando sua aprovação
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              variant="outline" 
              className="text-yellow-600 border-yellow-300 hover:bg-yellow-100"
              onClick={() => setActiveTab('pending')}
            >
              Ver Solicitações
            </Button>
          </CardContent>
        </Card>
      )}

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">
            Todos <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">{users.length}</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className={pendingUsers.length > 0 ? "animate-pulse bg-yellow-100 text-yellow-800" : ""}>
            Pendentes <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">{pendingUsers.length}</span>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprovados <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">{approvedUsers.length}</span>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejeitados <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">{rejectedUsers.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <UserTable 
            users={users} 
            currentUser={currentUser}
            onChangePassword={(id) => {
              setSelectedUserId(id);
              setIsChangingPassword(true);
              setIsAddingUser(false);
            }}
            onRemoveUser={handleRemoveUser}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            renderUserStatus={renderUserStatus}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <UserTable 
            users={pendingUsers} 
            currentUser={currentUser}
            onChangePassword={(id) => {
              setSelectedUserId(id);
              setIsChangingPassword(true);
              setIsAddingUser(false);
            }}
            onRemoveUser={handleRemoveUser}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            renderUserStatus={renderUserStatus}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-0">
          <UserTable 
            users={approvedUsers} 
            currentUser={currentUser}
            onChangePassword={(id) => {
              setSelectedUserId(id);
              setIsChangingPassword(true);
              setIsAddingUser(false);
            }}
            onRemoveUser={handleRemoveUser}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            renderUserStatus={renderUserStatus}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="rejected" className="mt-0">
          <UserTable 
            users={rejectedUsers} 
            currentUser={currentUser}
            onChangePassword={(id) => {
              setSelectedUserId(id);
              setIsChangingPassword(true);
              setIsAddingUser(false);
            }}
            onRemoveUser={handleRemoveUser}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            renderUserStatus={renderUserStatus}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

interface UserTableProps {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
  }>;
  currentUser: any;
  onChangePassword: (id: string) => void;
  onRemoveUser: (id: string) => void;
  onApproveUser: (id: string) => void;
  onRejectUser: (id: string) => void;
  renderUserStatus: (status: string) => React.ReactNode;
  isLoading: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  currentUser,
  onChangePassword,
  onRemoveUser,
  onApproveUser,
  onRejectUser,
  renderUserStatus,
  isLoading
}) => {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Nenhum usuário encontrado nesta categoria.
        </CardContent>
      </Card>
    );
  }

  return (
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
                <th className="px-4 py-2 text-left">Status</th>
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
                  <td className="px-4 py-3">
                    {renderUserStatus(user.status)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {user.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                            onClick={() => onApproveUser(user.id)}
                            disabled={isLoading}
                            title="Aprovar usuário"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            onClick={() => onRejectUser(user.id)}
                            disabled={isLoading}
                            title="Rejeitar usuário"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onChangePassword(user.id)}
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
                              onClick={() => onRemoveUser(user.id)}
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
  );
};
