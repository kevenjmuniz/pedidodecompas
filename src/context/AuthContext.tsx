
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  users: Array<{ id: string; name: string; email: string; role: 'admin' | 'user' }>;
  addUser: (name: string, email: string, password: string, role: 'admin' | 'user') => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes - converting to state so we can update it
const INITIAL_MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin' as const,
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user' as const,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mockUsers, setMockUsers] = useState(INITIAL_MOCK_USERS);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    
    // Check if we have stored additional users
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setMockUsers([...INITIAL_MOCK_USERS, ...JSON.parse(storedUsers)]);
    }
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching credentials
      const foundUser = mockUsers.find(
        u => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // Create user object without password
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Store user in state and localStorage
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      toast.success('Login successful');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      // In a real app, we would make an API call to register the user
      toast.success('Registration successful! You can now login.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to register');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (name: string, email: string, password: string, role: 'admin' | 'user') => {
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }

      const newUser = {
        id: String(mockUsers.length + 1),
        name,
        email,
        password,
        role,
      };
      
      // Add the new user to the mockUsers array
      const updatedUsers = [...mockUsers, newUser];
      setMockUsers(updatedUsers);
      
      // Store the additional users in localStorage
      // We only store the users that are not part of the initial set
      const additionalUsers = updatedUsers.filter(
        u => !INITIAL_MOCK_USERS.some(initial => initial.id === u.id)
      );
      localStorage.setItem('users', JSON.stringify(additionalUsers));
      
      toast.success('User added successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email exists
      if (!mockUsers.some(u => u.email === email)) {
        throw new Error('Email not found');
      }
      
      // In a real app, we would send a password reset email
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a users array for the context without passwords
  const usersWithoutPasswords = mockUsers.map(({ password: _, ...rest }) => rest);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        resetPassword,
        users: usersWithoutPasswords,
        addUser
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
