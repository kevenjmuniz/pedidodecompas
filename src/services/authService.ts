
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

// Get session token from storage
export const getSessionToken = (): string | null => {
  return localStorage.getItem('sessionToken');
};

// Set session token with simple encoding instead of JWT
export const setSessionToken = (userId: string, rememberMe: boolean): void => {
  // Simple encoding for the session - not using JWT which requires Buffer
  const token = btoa(`${userId}-${Date.now()}`);
  
  // If remember me is checked, set token with longer expiration
  if (rememberMe) {
    localStorage.setItem('sessionToken', token);
    localStorage.setItem('sessionExpiry', String(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days
  } else {
    localStorage.setItem('sessionToken', token);
    localStorage.setItem('sessionExpiry', String(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours
  }
};

// Clear session token
export const clearSessionToken = (): void => {
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('sessionExpiry');
};

// Check if session is valid
export const isSessionValid = (): boolean => {
  const token = localStorage.getItem('sessionToken');
  const expiry = localStorage.getItem('sessionExpiry');
  
  if (!token || !expiry) return false;
  
  return Date.now() < Number(expiry);
};

// Login service
export const loginService = async (
  email: string, 
  password: string,
  rememberMe: boolean = false
): Promise<User> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Track login attempts for security
  const ipAddress = "127.0.0.1"; // In a real app, this would be the client's IP
  incrementLoginAttempts(ipAddress);
  
  // Check for excessive login attempts
  if (isIpBlocked(ipAddress)) {
    throw new Error('Muitas tentativas de login. Tente novamente em 15 minutos.');
  }
  
  // Debug logging
  console.log('Attempting login with:', email);
  const allUsers = getStoredUsers();
  console.log('All users in system:', allUsers.length);
  
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
  
  // Reset login attempts on successful login
  resetLoginAttempts(ipAddress);
  
  // Create user object without password
  const { password: _, ...userWithoutPassword } = foundUser;
  
  // Fix status if it's malformed
  if (typeof userWithoutPassword.status === 'object') {
    userWithoutPassword.status = 'approved';
  }
  
  // Generate and store session token
  setSessionToken(foundUser.id, rememberMe);
  
  // Store user in localStorage
  localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  
  console.log('Login successful for user:', userWithoutPassword.email);
  toast.success('Login realizado com sucesso');
  
  // Return user without password
  return userWithoutPassword;
};

// Login attempts tracking
const loginAttempts: Record<string, { count: number; timestamp: number }> = {};

// Increment login attempts for an IP
const incrementLoginAttempts = (ip: string): void => {
  const now = Date.now();
  if (!loginAttempts[ip]) {
    loginAttempts[ip] = { count: 1, timestamp: now };
  } else {
    // Reset count if more than 15 minutes have passed
    if (now - loginAttempts[ip].timestamp > 15 * 60 * 1000) {
      loginAttempts[ip] = { count: 1, timestamp: now };
    } else {
      loginAttempts[ip].count += 1;
      loginAttempts[ip].timestamp = now;
    }
  }
};

// Reset login attempts for an IP
const resetLoginAttempts = (ip: string): void => {
  delete loginAttempts[ip];
};

// Check if IP is blocked due to excessive attempts
const isIpBlocked = (ip: string): boolean => {
  if (!loginAttempts[ip]) return false;
  
  const now = Date.now();
  const attempts = loginAttempts[ip];
  
  // If more than 15 minutes have passed, reset
  if (now - attempts.timestamp > 15 * 60 * 1000) {
    loginAttempts[ip] = { count: 0, timestamp: now };
    return false;
  }
  
  // Block after 5 failed attempts
  return attempts.count >= 5;
};

// Generate a simple session token, avoiding JWT
const generateSessionToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
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
  if (currentUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
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
  const users = getStoredUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    throw new Error('E-mail não encontrado');
  }
  
  // In a real application, this would send an email with a reset link
  // For this demo, we'll generate a reset token and store it
  const resetToken = Math.random().toString(36).substring(2, 15);
  const resetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  
  // Update user with reset token
  const updatedUsers = users.map(u => {
    if (u.id === user.id) {
      return {
        ...u,
        resetToken,
        resetTokenExpiry: resetExpiry
      };
    }
    return u;
  });
  
  // Store updated users
  storeUsers(updatedUsers);
  
  toast.success('E-mail de redefinição de senha enviado. Verifique sua caixa de entrada.');
};

// Validate password reset token
export const validateResetToken = (email: string, token: string): boolean => {
  const users = getStoredUsers();
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.resetToken === token &&
    u.resetTokenExpiry && 
    u.resetTokenExpiry > Date.now()
  );
  
  return !!user;
};

// Reset password with token
export const resetPasswordWithToken = async (
  email: string, 
  token: string, 
  newPassword: string
): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const users = getStoredUsers();
  
  // Find user with valid token
  const userIndex = users.findIndex(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.resetToken === token &&
    u.resetTokenExpiry && 
    u.resetTokenExpiry > Date.now()
  );
  
  if (userIndex === -1) {
    throw new Error('Token inválido ou expirado');
  }
  
  // Update password and clear token
  const updatedUsers = [...users];
  updatedUsers[userIndex] = {
    ...updatedUsers[userIndex],
    password: newPassword,
    resetToken: undefined,
    resetTokenExpiry: undefined
  };
  
  // Store updated users
  storeUsers(updatedUsers);
  
  toast.success('Senha redefinida com sucesso');
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
