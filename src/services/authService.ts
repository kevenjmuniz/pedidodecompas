import { User, AuthUser } from '../types/auth';
import { toast } from 'sonner';
import {
  getWebhookConfigs,
  createAccountCreatedPayload,
  sendWebhook
} from './webhookService';

// Get all users from storage
export const getStoredUsers = (): AuthUser[] => {
  const storedUsers = localStorage.getItem('users');
  
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  
  // Initialize with empty array if no users exist
  const emptyUsers: AuthUser[] = [];
  localStorage.setItem('users', JSON.stringify(emptyUsers));
  return emptyUsers;
};

// Store users
export const storeUsers = (users: AuthUser[]): void => {
  localStorage.setItem('users', JSON.stringify(users));
};

// Login service
export const loginService = async (
  email: string, 
  password: string
): Promise<User> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Find user with matching credentials
  const foundUser = getStoredUsers().find(
    u => u.email === email && u.password === password
  );
  
  if (!foundUser) {
    throw new Error('Credenciais inválidas');
  }
  
  // Check if user is approved
  if (foundUser.status === 'pending') {
    throw new Error('Sua conta está aguardando aprovação do administrador.');
  }
  
  if (foundUser.status === 'rejected') {
    throw new Error('Sua solicitação de acesso foi rejeitada. Entre em contato com o administrador.');
  }
  
  // Create user object without password
  const { password: _, ...userWithoutPassword } = foundUser;
  
  // Store in localStorage
  localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  
  toast.success('Login realizado com sucesso');
  
  // Return user without password
  return userWithoutPassword;
};

// Register service
export const registerService = async (
  name: string, 
  email: string, 
  password: string
): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const currentUsers = getStoredUsers();
  
  // Check if email already exists
  if (currentUsers.some(u => u.email === email)) {
    throw new Error('E-mail já está em uso');
  }
  
  // Create new user with admin role for the first user (auto-approved), otherwise pending user
  const isFirstUser = currentUsers.length === 0;
  const newUser: AuthUser = {
    id: String(Date.now()),
    name,
    email,
    password,
    role: isFirstUser ? 'admin' : 'user',
    status: isFirstUser ? 'approved' : 'pending',
  };
  
  // Add the new user
  const updatedUsers = [...currentUsers, newUser];
  
  // Store all users
  storeUsers(updatedUsers);
  
  // Send webhook notification for account creation
  triggerAccountCreatedWebhooks(newUser);
  
  if (isFirstUser) {
    toast.success('Registro realizado com sucesso! Você já pode fazer login.');
  } else {
    toast.success('Registro realizado com sucesso! Aguardando aprovação do administrador.');
  }
  
  console.log('User registered:', newUser);
  console.log('All users after registration:', updatedUsers);
};

// Add user service
export const addUserService = async (
  name: string, 
  email: string, 
  password: string, 
  role: 'admin' | 'user'
): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const currentUsers = getStoredUsers();
  
  // Check if email already exists
  if (currentUsers.some(u => u.email === email)) {
    throw new Error('E-mail já está em uso');
  }

  const newUser: AuthUser = {
    id: String(Date.now()),
    name,
    email,
    password,
    role,
    status: 'approved', // Users added by admin are approved by default
  };
  
  // Add the new user
  const updatedUsers = [...currentUsers, newUser];
  
  // Store all users
  storeUsers(updatedUsers);
  
  // Send webhook notification for account creation
  triggerAccountCreatedWebhooks(newUser);
  
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
  
  const currentUsers = getStoredUsers();
  
  // Check if user exists
  const userToRemove = currentUsers.find(u => u.id === id);
  if (!userToRemove) {
    throw new Error('Usuário não encontrado');
  }
  
  // Remove the user
  const updatedUsers = currentUsers.filter(u => u.id !== id);
  
  // Update localStorage
  storeUsers(updatedUsers);
  
  toast.success('Usuário removido com sucesso');
};

// Change password service
export const changePasswordService = async (
  id: string, 
  newPassword: string
): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const currentUsers = getStoredUsers();
  
  // Find user
  const userIndex = currentUsers.findIndex(u => u.id === id);
  if (userIndex === -1) {
    throw new Error('Usuário não encontrado');
  }
  
  // Update password
  const updatedUsers = [...currentUsers];
  updatedUsers[userIndex] = {
    ...updatedUsers[userIndex],
    password: newPassword
  };
  
  // Update localStorage
  storeUsers(updatedUsers);
  
  toast.success('Senha alterada com sucesso');
};

// Reset password service
export const resetPasswordService = async (email: string): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if email exists
  if (!getStoredUsers().some(u => u.email === email)) {
    throw new Error('Email not found');
  }
  
  toast.success('Password reset email sent. Please check your inbox.');
};

// Get users without passwords
export const getUsersWithoutPasswords = (): User[] => {
  const users = getStoredUsers().map(({ password: _, ...rest }) => rest);
  console.log('Getting users without passwords:', users.length);
  console.log('Users with pending status:', users.filter(u => u.status === 'pending').length);
  return users;
};

// Approve user
export const approveUserService = async (id: string): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const currentUsers = getStoredUsers();
  
  // Find user
  const userIndex = currentUsers.findIndex(u => u.id === id);
  if (userIndex === -1) {
    throw new Error('Usuário não encontrado');
  }
  
  // Update status
  const updatedUsers = [...currentUsers];
  updatedUsers[userIndex] = {
    ...updatedUsers[userIndex],
    status: 'approved'
  };
  
  // Update localStorage
  storeUsers(updatedUsers);
  
  toast.success('Usuário aprovado com sucesso');
  console.log('User approved:', id);
  console.log('All users after approval:', updatedUsers);
};

// Reject user
export const rejectUserService = async (id: string): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const currentUsers = getStoredUsers();
  
  // Find user
  const userIndex = currentUsers.findIndex(u => u.id === id);
  if (userIndex === -1) {
    throw new Error('Usuário não encontrado');
  }
  
  // Update status
  const updatedUsers = [...currentUsers];
  updatedUsers[userIndex] = {
    ...updatedUsers[userIndex],
    status: 'rejected'
  };
  
  // Update localStorage
  storeUsers(updatedUsers);
  
  toast.success('Usuário rejeitado com sucesso');
  console.log('User rejected:', id);
  console.log('All users after rejection:', updatedUsers);
};
