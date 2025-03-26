import { User, AuthUser } from '../types/auth';
import { toast } from 'sonner';
import {
  getWebhookConfigs,
  createAccountCreatedPayload,
  sendWebhook
} from './webhookService';
import {
  supabase,
  getUsers,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  authenticateUser,
  initializeUserTable,
  DbUser
} from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Inicializa a tabela de usuários e garante que o admin exista
export const ensureDefaultAdminExists = async (): Promise<AuthUser[]> => {
  await initializeUserTable(); // Isso vai criar admin@mcfinfo.com.br se não existir
  return await getUsers();
};

// Login service
export const loginService = async (
  email: string, 
  password: string
): Promise<User> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Debug logging
  console.log('Attempting login with:', email);
  
  try {
    // Force create default admin user if not exists
    await ensureDefaultAdminExists();
    
    // Find user with matching credentials
    const user = await authenticateUser(email, password);
    
    if (!user) {
      console.log('No user found with these credentials');
      throw new Error('Credenciais inválidas');
    }
    
    console.log('Login successful for user:', user.email);
    toast.success('Login realizado com sucesso');
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Return user without password
    return user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register service
export const registerService = async (
  name: string, 
  email: string, 
  password: string
): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Ensure admin exists first
  await ensureDefaultAdminExists();
  
  // Check if email already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('E-mail já está em uso');
  }
  
  // Verifica quantos usuários existem para determinar se é o primeiro usuário real
  const allUsers = await getUsers();
  const isFirstUser = allUsers.length === 1 && allUsers[0].email === 'admin'; // Só o admin existe
  
  // Create new user
  const newUser: DbUser = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    password,
    role: isFirstUser ? 'admin' : 'user',
    status: isFirstUser ? 'approved' : 'pending',
  };
  
  // Salva o usuário no banco de dados
  const createdUser = await createUser(newUser);
  
  if (!createdUser) {
    throw new Error('Erro ao criar usuário');
  }
  
  // Send webhook notification for account creation
  triggerAccountCreatedWebhooks(createdUser);
  
  if (isFirstUser) {
    toast.success('Registro realizado com sucesso! Você já pode fazer login.');
  } else {
    toast.success('Registro realizado com sucesso! Aguardando aprovação do administrador.');
  }
  
  console.log('User registered:', newUser);
};

// Add user service
export const addUserService = async (
  name: string, 
  email: string, 
  password: string, 
  role: 'admin' | 'user'
): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if email already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('E-mail já está em uso');
  }

  // Create new user
  const newUser: DbUser = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    password,
    role,
    status: 'approved' as 'approved', // Users added by admin are approved by default
  };
  
  // Salva o usuário no banco de dados
  const createdUser = await createUser(newUser);
  
  if (!createdUser) {
    throw new Error('Erro ao adicionar usuário');
  }
  
  // Send webhook notification for account creation
  triggerAccountCreatedWebhooks(createdUser);
  
  toast.success('Usuário adicionado com sucesso!');
};

// Function to trigger account created webhooks
const triggerAccountCreatedWebhooks = (user: AuthUser) => {
  const { password: _, ...userWithoutPassword } = user;
  
  // Get all active webhooks that listen for account creation events
  const webhooks = getWebhookConfigs().filter(
    webhook => webhook.enabled && webhook.events.includes('conta_criada')
  );
  
  // Send webhook notifications
  webhooks.forEach(webhook => {
    const payload = createAccountCreatedPayload(userWithoutPassword);
    sendWebhook(webhook, payload).catch(error => {
      console.error('Failed to send account creation webhook:', error);
    });
  });
};

// Remove user service
export const removeUserService = async (
  id: string, 
  currentUserId: string | undefined
): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if user is trying to remove themselves
  if (currentUserId && currentUserId === id) {
    throw new Error('Você não pode remover seu próprio usuário');
  }
  
  // Delete user from database
  const success = await deleteUser(id);
  
  if (!success) {
    throw new Error('Erro ao remover usuário');
  }
  
  toast.success('Usuário removido com sucesso');
};

// Change password service
export const changePasswordService = async (
  id: string, 
  newPassword: string
): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Update user password
  const updatedUser = await updateUser(id, { password: newPassword });
  
  if (!updatedUser) {
    throw new Error('Erro ao alterar senha');
  }
  
  console.log('Senha alterada com sucesso para o usuário:', updatedUser.email);
  
  toast.success('Senha alterada com sucesso');
};

// Reset password service
export const resetPasswordService = async (email: string): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if email exists
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('E-mail não encontrado');
  }
  
  toast.success('E-mail de redefinição de senha enviado. Verifique sua caixa de entrada.');
};

// Get users without passwords
export const getUsersWithoutPasswords = async (): Promise<User[]> => {
  const allUsers = await getUsers();
  const users = allUsers.map(({ password: _, ...rest }) => rest);
  console.log('Getting users without passwords:', users.length);
  console.log('Users with pending status:', users.filter(u => u.status === 'pending').length);
  return users;
};

// Approve user
export const approveUserService = async (id: string): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Update user status to approved
  const updatedUser = await updateUser(id, { status: 'approved' });
  
  if (!updatedUser) {
    throw new Error('Erro ao aprovar usuário');
  }
  
  toast.success('Usuário aprovado com sucesso');
  console.log('User approved:', id);
};

// Reject user
export const rejectUserService = async (id: string): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Update user status to rejected
  const updatedUser = await updateUser(id, { status: 'rejected' });
  
  if (!updatedUser) {
    throw new Error('Erro ao rejeitar usuário');
  }
  
  toast.success('Usuário rejeitado com sucesso');
  console.log('User rejected:', id);
};
