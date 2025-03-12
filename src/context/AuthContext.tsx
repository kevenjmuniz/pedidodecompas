
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType, LoginMethod, AuthTokens } from '../types/auth';
import {
  loginService,
  loginWithProviderService,
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
  validateResetToken,
  verifyOTPService,
  resetPasswordWithOTPService,
  setup2FAService,
  verify2FAService,
  disable2FAService,
  refreshSessionService,
  checkSessionStatusService,
  getSessionTimeRemaining
} from '../services/authService';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session check interval in milliseconds (1 minute)
const SESSION_CHECK_INTERVAL = 60 * 1000;
// Warning before session expires (5 minutes)
const SESSION_WARNING_THRESHOLD = 5 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) return savedMode === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Initialize default admin user if no users exist
  const initializeDefaultAdmin = useCallback(() => {
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
        authProvider: 'email' as const,
        has2FA: false,
      };
      
      // Store the default admin
      localStorage.setItem('users', JSON.stringify([defaultAdmin]));
      toast.success('Usuário admin criado com sucesso');
      console.log('Default admin user created');
    }
  }, []);

  // Update classes for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Session management
  const checkSession = useCallback(async () => {
    if (await isSessionValid()) {
      // Session is valid, restore user from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      // Get remaining session time
      const remaining = getSessionTimeRemaining();
      setSessionTimeRemaining(remaining);
      
      // Show warning if session is about to expire
      if (remaining && remaining < SESSION_WARNING_THRESHOLD) {
        toast.warning(`Sua sessão expira em ${Math.ceil(remaining / 60000)} minutos`, {
          duration: 10000,
          action: {
            label: 'Renovar',
            onClick: () => refreshSession()
          }
        });
      }
    } else {
      // Session is invalid, clear user and token
      setUser(null);
      clearSessionToken();
      localStorage.removeItem('user');
      setSessionTimeRemaining(null);
    }
    
    setIsSessionRestored(true);
    return !!user;
  }, [user]);

  // Refresh session
  const refreshSession = async (): Promise<boolean> => {
    try {
      const refreshed = await refreshSessionService();
      if (refreshed) {
        const remaining = getSessionTimeRemaining();
        setSessionTimeRemaining(remaining);
        toast.success('Sessão renovada com sucesso');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  };

  // Setup session check interval
  useEffect(() => {
    const checkInterval = setInterval(() => {
      checkSession();
    }, SESSION_CHECK_INTERVAL);
    
    return () => clearInterval(checkInterval);
  }, [checkSession]);

  // Load user and users on mount
  useEffect(() => {
    // Initialize default admin if needed
    initializeDefaultAdmin();
    
    // Check and restore session if valid
    checkSession();
    
    // Load users
    refreshUsers();
    
    setIsLoading(false);
  }, [initializeDefaultAdmin, checkSession]);

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
      const { user: loggedInUser, tokens } = await loginService(email, password, rememberMe);
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      refreshUsers(); // Refresh users list after login
      setSessionTimeRemaining(tokens.expiresAt - Date.now());
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithProvider = async (provider: LoginMethod) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser, tokens } = await loginWithProviderService(provider);
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      refreshUsers();
      setSessionTimeRemaining(tokens.expiresAt - Date.now());
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
    setSessionTimeRemaining(null);
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
  
  const verifyOTP = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      return await verifyOTPService(email, otp);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
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
  
  const resetPasswordWithOTP = async (email: string, otp: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await resetPasswordWithOTPService(email, otp, newPassword);
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
  
  const setup2FA = async () => {
    setIsLoading(true);
    try {
      const secretUrl = await setup2FAService(user?.id || '');
      return secretUrl;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const verify2FA = async (code: string) => {
    setIsLoading(true);
    try {
      const success = await verify2FAService(user?.id || '', code);
      if (success && user) {
        // Update user with 2FA enabled
        const updatedUser = { ...user, has2FA: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return success;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const disable2FA = async () => {
    setIsLoading(true);
    try {
      await disable2FAService(user?.id || '');
      if (user) {
        // Update user with 2FA disabled
        const updatedUser = { ...user, has2FA: false };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkSessionStatus = async () => {
    return await checkSessionStatusService();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isSessionRestored,
        isDarkMode,
        toggleDarkMode,
        login,
        loginWithProvider,
        logout,
        register,
        resetPassword,
        verifyResetToken,
        verifyOTP,
        completePasswordReset,
        resetPasswordWithOTP,
        users,
        addUser,
        removeUser,
        changePassword,
        approveUser,
        rejectUser,
        setup2FA,
        verify2FA,
        disable2FA,
        checkSessionStatus,
        refreshSession,
        sessionTimeRemaining
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
