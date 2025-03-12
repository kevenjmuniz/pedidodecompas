import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types/auth';
import {
  loginService,
  registerService,
  addUserService,
  removeUserService,
  changePasswordService,
  resetPasswordService,
  getUsersWithoutPasswords,
  approveUserService,
  rejectUserService,
  getStoredUsers,
  isSessionValid,
  clearSessionToken,
  resetPasswordWithToken,
  validateResetToken
} from '../services/authService';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isSessionRestored, setIsSessionRestored] = useState(false);

  // Initialize default admin user if no users exist
  const initializeDefaultAdmin = () => {
    const existingUsers = getStoredUsers();
    if (existingUsers.length === 0) {
      console.log('No users found, creating default admin user');
      // Create default admin user
      const defaultAdmin = {
        id: 'default-admin-' + Date.now(),
        name: 'Administrador',
        email: 'admin',
        password: 'admin123',
        role: 'admin' as const,
        status: 'approved' as const,
      };
      
      // Store the default admin
      localStorage.setItem('users', JSON.stringify([defaultAdmin]));
      toast.success('Usuário admin criado com sucesso');
      console.log('Default admin user created');
    }
  };

  // Check session validity
  const checkSession = () => {
    if (isSessionValid()) {
      // Session is valid, restore user from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } else {
      // Session is invalid, clear user and token
      setUser(null);
      clearSessionToken();
      localStorage.removeItem('user');
    }
    
    setIsSessionRestored(true);
  };

  // Load user and users on mount
  useEffect(() => {
    // Initialize default admin if needed
    initializeDefaultAdmin();
    
    // Check and restore session if valid
    checkSession();
    
    // Load users
    refreshUsers();
    
    setIsLoading(false);
  }, []);

  // Refresh users list
  const refreshUsers = () => {
    const loadedUsers = getUsersWithoutPasswords();
    console.log('Refreshing users, found:', loadedUsers.length, 'users');
    console.log('Pending users:', loadedUsers.filter(u => u.status === 'pending').length);
    setUsers(loadedUsers);
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const loggedInUser = await loginService(email, password, rememberMe);
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      refreshUsers(); // Refresh users list after login
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    clearSessionToken();
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await registerService(name, email, password);
      refreshUsers();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await resetPasswordService(email);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyResetToken = (email: string, token: string) => {
    return validateResetToken(email, token);
  };
  
  const completePasswordReset = async (email: string, token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await resetPasswordWithToken(email, token, newPassword);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (name: string, email: string, password: string, role: 'admin' | 'user') => {
    setIsLoading(true);
    try {
      await addUserService(name, email, password, role);
      refreshUsers();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = async (id: string) => {
    setIsLoading(true);
    try {
      await removeUserService(id, user?.id);
      refreshUsers();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (id: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await changePasswordService(id, newPassword);
      refreshUsers();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const approveUser = async (id: string) => {
    setIsLoading(true);
    try {
      await approveUserService(id);
      refreshUsers();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectUser = async (id: string) => {
    setIsLoading(true);
    try {
      await rejectUserService(id);
      refreshUsers();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isSessionRestored,
        login,
        logout,
        register,
        resetPassword,
        verifyResetToken,
        completePasswordReset,
        users,
        addUser,
        removeUser,
        changePassword,
        approveUser,
        rejectUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
