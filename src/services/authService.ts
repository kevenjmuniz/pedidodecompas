
import { User, AuthUser } from '../types/auth';
import { toast } from 'sonner';
import {
  getWebhookConfigs,
  createAccountCreatedPayload,
  sendWebhook
} from './webhookService';

// Get all users from storage
export const getStoredUsers = (): AuthUser[] => {
  try {
    const storedUsers = localStorage.getItem('users');
    
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      
      // Validate and fix malformed user records
      const validatedUsers = parsedUsers.map((user: any) => {
        // Fix malformed status field
        if (user.status && typeof user.status === 'object' && user.status._type === 'undefined') {
          return {
            ...user,
            status: 'approved' // Default to approved for legacy records
          };
        }
        return user;
      });
      
      return validatedUsers;
    }
    
    // Initialize with empty array if no users exist
    const emptyUsers: AuthUser[] = [];
    localStorage.setItem('users', JSON.stringify(emptyUsers));
    return emptyUsers;
  } catch (error) {
    console.error('Error getting stored users:', error);
    return [];
  }
};

// Store users
export const storeUsers = (users: AuthUser[]): void => {
  try {
    localStorage.setItem('users', JSON.stringify(users));
  } catch (error) {
    console.error('Error storing users:', error);
  }
};

// Login service
export const loginService = async (
  email: string, 
  password: string
): Promise<User> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Debug logging
  console.log('Attempting login with:', email);
  
  // Force create default admin user if not exists
  const allUsers = ensureDefaultAdminExists();
  console.log('All users in system:', allUsers.length);
  console.log('Users:', allUsers.map(u => ({ id: u.id, email: u.email, status: u.status })));
  
  // Find user with matching credentials - case insensitive email comparison
  const foundUser = allUsers.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  
  if (!foundUser) {
    console.log('No user found with these credentials');
    throw new Error('Credenciais inválidas');
  }
  
  console.log('User found:', foundUser.id, foundUser.status);
  
  // Check if user is approved - handle undefined or malformed status
  const userStatus = typeof foundUser.status === 'object' ? 'approved' : foundUser.status;
  
  if (userStatus === 'pending') {
    throw new Error('Sua conta está aguardando aprovação do administrador.');
  }
  
  if (userStatus === 'rejected') {
    throw new Error('Sua solicitação de acesso foi rejeitada. Entre em contato com o administrador.');
  }
  
  // Create user object without password
  const { password: _, ...userWithoutPassword } = foundUser;
  
  // Fix status if it's malformed
  if (typeof userWithoutPassword.status === 'object') {
    userWithoutPassword.status = 'approved';
  }
  
  // Store in localStorage
  localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  
  console.log('Login successful for user:', userWithoutPassword.email);
  toast.success('Login realizado com sucesso');
  
  // Return user without password
  return userWithoutPassword;
};

// Ensure default admin exists and return all users
export const ensureDefaultAdminExists = (): AuthUser[] => {
  const currentUsers = getStoredUsers();
  
  // Check if admin user already exists
  const adminExists = currentUsers.some(
    user => user.email.toLowerCase() === 'admin' && user.role === 'admin'
  );
  
  if (!adminExists) {
    console.log('Admin user not found, creating default admin user');
    // Create default admin user
    const defaultAdmin = {
      id: 'default-admin-' + Date.now(),
      name: 'Administrador',
      email: 'admin',
      password: 'admin123',
      role: 'admin' as const,
      status: 'approved' as const,
    };
    
    // Add admin to users array
    const updatedUsers = [...currentUsers, defaultAdmin];
    
    // Store the updated users
    storeUsers(updatedUsers);
    console.log('Default admin user created');
    
    return updatedUsers;
  }
  
  return currentUsers;
};

// Register service
export const registerService = async (
  name: string, 
  email: string, 
  password: string
): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Ensure admin exists first
  const currentUsers = ensureDefaultAdminExists();
  
  // Check if email already exists
  if (currentUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('E-mail já está em uso');
  }
  
  // Create new user with admin role for the first user (auto-approved), otherwise pending user
  const isFirstUser = currentUsers.length === 1 && currentUsers[0].email === 'admin'; // Only admin exists
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
  if (currentUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
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
  
  console.log('Changing password for user:', currentUsers[userIndex].email);
  
  // Update password
  const updatedUsers = [...currentUsers];
  updatedUsers[userIndex] = {
    ...updatedUsers[userIndex],
    password: newPassword
  };
  
  // Update localStorage
  storeUsers(updatedUsers);
  
  // If the user in localStorage is the same one, update their stored password
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.id === id) {
      // Update stored user, but don't include password
      localStorage.setItem('user', JSON.stringify({
        ...parsedUser
      }));
    }
  }
  
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
