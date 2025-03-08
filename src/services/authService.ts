
import { User, AuthUser } from '../types/auth';
import { toast } from 'sonner';

// Get all users from storage
export const getStoredUsers = (): AuthUser[] => {
  const storedUsers = localStorage.getItem('users');
  
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  
  return [];
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
    throw new Error('Invalid email or password');
  }
  
  // Create user object without password
  const { password: _, ...userWithoutPassword } = foundUser;
  
  // Store in localStorage
  localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  
  toast.success('Login successful');
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
    throw new Error('Email already in use');
  }
  
  // Create new user with admin role for the first user, otherwise regular user
  const newUser: AuthUser = {
    id: String(Date.now()),
    name,
    email,
    password,
    role: currentUsers.length === 0 ? 'admin' : 'user',
  };
  
  // Add the new user
  const updatedUsers = [...currentUsers, newUser];
  
  // Store all users
  storeUsers(updatedUsers);
  
  toast.success('Registration successful! You can now login.');
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
    throw new Error('Email already in use');
  }

  const newUser: AuthUser = {
    id: String(Date.now()),
    name,
    email,
    password,
    role,
  };
  
  // Add the new user
  const updatedUsers = [...currentUsers, newUser];
  
  // Store all users
  storeUsers(updatedUsers);
  
  toast.success('User added successfully!');
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
  return getStoredUsers().map(({ password: _, ...rest }) => rest);
};
