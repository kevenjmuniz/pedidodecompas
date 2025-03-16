
import { User, AuthUser, LoginMethod, AuthTokens, SessionInfo } from '../types/auth';
import { toast } from 'sonner';
import {
  getWebhookConfigs,
  createAccountCreatedPayload,
  sendWebhook
} from './webhookService';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import * as OTPAuth from 'otpauth';

// Secret key for JWT signing (in a real app, this would be an environment variable)
const JWT_SECRET = 'sistema-pedidos-secret-key-2024';

// Session durations
const SESSION_DURATION = {
  default: 24 * 60 * 60 * 1000, // 24 hours
  extended: 30 * 24 * 60 * 60 * 1000, // 30 days
};

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

// Generate auth tokens
const generateAuthTokens = (userId: string, rememberMe: boolean): AuthTokens => {
  const now = Date.now();
  const expiresIn = rememberMe ? SESSION_DURATION.extended : SESSION_DURATION.default;
  const expiresAt = now + expiresIn;
  
  const accessToken = jwt.sign(
    { userId, type: 'access', iat: Math.floor(now / 1000) },
    JWT_SECRET,
    { expiresIn: Math.floor(expiresIn / 1000) }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh', iat: Math.floor(now / 1000) },
    JWT_SECRET,
    { expiresIn: Math.floor((expiresIn * 2) / 1000) } // Refresh token lasts twice as long
  );
  
  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
};

// Store session info
export const storeSessionInfo = (sessionInfo: SessionInfo): void => {
  try {
    localStorage.setItem('sessionInfo', JSON.stringify(sessionInfo));
    
    // Store tokens in localStorage for persistence
    localStorage.setItem('accessToken', sessionInfo.tokens.accessToken);
    localStorage.setItem('refreshToken', sessionInfo.tokens.refreshToken);
    localStorage.setItem('tokenExpiry', String(sessionInfo.tokens.expiresAt));
  } catch (error) {
    console.error('Error storing session info:', error);
  }
};

// Get session info
export const getSessionInfo = (): SessionInfo | null => {
  try {
    const sessionInfoStr = localStorage.getItem('sessionInfo');
    if (!sessionInfoStr) return null;
    
    return JSON.parse(sessionInfoStr);
  } catch (error) {
    console.error('Error getting session info:', error);
    return null;
  }
};

// Clear session info
export const clearSessionInfo = (): void => {
  localStorage.removeItem('sessionInfo');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
};

// Check if session is valid
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!accessToken || !expiry) return false;
    
    // Check if token is expired
    if (Date.now() >= Number(expiry)) {
      // Try to refresh the token
      const refreshed = await refreshSessionService();
      return refreshed;
    }
    
    // Update last activity timestamp
    const sessionInfo = getSessionInfo();
    if (sessionInfo) {
      sessionInfo.lastActivity = Date.now();
      storeSessionInfo(sessionInfo);
    }
    
    return true;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
};

// Get session time remaining
export const getSessionTimeRemaining = (): number | null => {
  const expiry = localStorage.getItem('tokenExpiry');
  if (!expiry) return null;
  
  const remaining = Number(expiry) - Date.now();
  return remaining > 0 ? remaining : 0;
};

// Refresh session
export const refreshSessionService = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    
    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
      
      // Get user
      const users = getStoredUsers();
      const user = users.find(u => u.id === decoded.userId);
      
      if (!user) return false;
      
      // Generate new tokens
      const tokens = generateAuthTokens(user.id, true);
      
      // Update session info
      const sessionInfo: SessionInfo = {
        user: sanitizeUser(user),
        tokens,
        lastActivity: Date.now(),
      };
      
      storeSessionInfo(sessionInfo);
      
      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      clearSessionInfo();
      return false;
    }
  } catch (error) {
    console.error('Error in refresh session service:', error);
    return false;
  }
};

// Check session status
export const checkSessionStatusService = async (): Promise<boolean> => {
  return await isSessionValid();
};

// Get session token from storage (legacy method)
export const getSessionToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Set session token (legacy method)
export const setSessionToken = (token: string, rememberMe: boolean): void => {
  // If remember me is checked, set token with longer expiration
  if (rememberMe) {
    localStorage.setItem('sessionToken', token);
    localStorage.setItem('sessionExpiry', String(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days
  } else {
    localStorage.setItem('sessionToken', token);
    localStorage.setItem('sessionExpiry', String(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours
  }
};

// Clear session token (legacy method)
export const clearSessionToken = (): void => {
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('sessionExpiry');
  clearSessionInfo();
};

// Remove sensitive user data before returning
const sanitizeUser = (user: AuthUser): User => {
  const { password: _, refreshToken: __, resetToken: ___, resetTokenExpiry: ____, verificationCode: _____, verificationCodeExpiry: ______, tfaSecret: _______, ...sanitized } = user;
  return sanitized;
};

// Login service
export const loginService = async (
  email: string, 
  password: string,
  rememberMe: boolean = false
): Promise<{ user: User, tokens: AuthTokens }> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
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
  console.log('Users data:', allUsers);
  
  // Find user with matching credentials - case insensitive email comparison
  // Implementar login com "admin" por padrão se não encontrar o email
  let foundUser = null;
  
  if (email === 'admin' && password === 'admin123') {
    // Tenta encontrar o usuário admin padrão
    foundUser = allUsers.find(
      u => u.email === 'admin'
    );
    
    // Se não encontrar, verifica admin por outros critérios
    if (!foundUser) {
      foundUser = allUsers.find(
        u => u.role === 'admin' && u.status === 'approved'
      );
    }
  } else {
    // Login normal via email
    foundUser = allUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
  }
  
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
  
  // Check if user has 2FA enabled
  if (foundUser.tfaEnabled) {
    // In a real app, we would send a code to the user's phone/email
    // and require them to enter it before completing login
    // For this demo, we'll just return a special error code
    throw new Error('2FA_REQUIRED');
  }
  
  // Reset login attempts on successful login
  resetLoginAttempts(ipAddress);
  
  // Update user's last login timestamp
  const updatedUsers = allUsers.map(u => {
    if (u.id === foundUser.id) {
      return { ...u, lastLogin: Date.now() };
    }
    return u;
  });
  storeUsers(updatedUsers);
  
  // Create sanitized user object without sensitive fields
  const sanitizedUser = sanitizeUser(foundUser);
  
  // Generate and store auth tokens
  const tokens = generateAuthTokens(foundUser.id, rememberMe);
  
  // Store session info
  const sessionInfo: SessionInfo = {
    user: sanitizedUser,
    tokens,
    lastActivity: Date.now(),
  };
  storeSessionInfo(sessionInfo);
  
  console.log('Login successful for user:', sanitizedUser.email);
  toast.success('Login realizado com sucesso');
  
  // Return user and tokens
  return {
    user: sanitizedUser,
    tokens,
  };
};

// Login with provider service
export const loginWithProviderService = async (
  provider: LoginMethod
): Promise<{ user: User, tokens: AuthTokens }> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // In a real app, this would integrate with the OAuth provider
  // For this demo, we'll just show toast and throw error
  toast.info(`Login com ${provider} será implementado em breve.`);
  throw new Error(`Autenticação com ${provider} não está disponível nesta versão.`);
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
    authProvider: 'email',
    lastLogin: isFirstUser ? Date.now() : undefined,
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
    authProvider: 'email',
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

// Generate random 6-digit code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Reset password service with email or OTP option
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
  // For this demo, we'll generate a reset token and a verification code
  const resetToken = uuidv4();
  const resetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  
  // Also generate a verification code for OTP
  const verificationCode = generateVerificationCode();
  const verificationCodeExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
  
  // Update user with reset token and verification code
  const updatedUsers = users.map(u => {
    if (u.id === user.id) {
      return {
        ...u,
        resetToken,
        resetTokenExpiry: resetExpiry,
        verificationCode,
        verificationCodeExpiry
      };
    }
    return u;
  });
  
  // Store updated users
  storeUsers(updatedUsers);
  
  // In a real app, this would send the code to the user's email
  console.log('Reset token:', resetToken);
  console.log('Verification code:', verificationCode);
  
  toast.success('Instruções de redefinição de senha enviadas. Verifique sua caixa de entrada.');
};

// Verify OTP service
export const verifyOTPService = async (email: string, otp: string): Promise<boolean> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const users = getStoredUsers();
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.verificationCode === otp &&
    u.verificationCodeExpiry && 
    u.verificationCodeExpiry > Date.now()
  );
  
  return !!user;
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
    resetTokenExpiry: undefined,
    verificationCode: undefined,
    verificationCodeExpiry: undefined
  };
  
  // Store updated users
  storeUsers(updatedUsers);
  
  toast.success('Senha redefinida com sucesso');
};

// Reset password with OTP
export const resetPasswordWithOTPService = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const users = getStoredUsers();
  
  // Find user with valid OTP
  const userIndex = users.findIndex(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.verificationCode === otp &&
    u.verificationCodeExpiry && 
    u.verificationCodeExpiry > Date.now()
  );
  
  if (userIndex === -1) {
    throw new Error('Código de verificação inválido ou expirado');
  }
  
  // Update password and clear codes
  const updatedUsers = [...users];
  updatedUsers[userIndex] = {
    ...updatedUsers[userIndex],
    password: newPassword,
    resetToken: undefined,
    resetTokenExpiry: undefined,
    verificationCode: undefined,
    verificationCodeExpiry: undefined
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

// Setup 2FA
export const setup2FAService = async (userId: string): Promise<string> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Usuário não encontrado');
  }
  
  // Create TOTP object with a random secret
  // Fix for OTPAuth.Secret.fromRandom - we'll create a random secret differently
  const randomBytes = new Uint8Array(20);
  window.crypto.getRandomValues(randomBytes);
  const secret = OTPAuth.Secret.fromUTF8(Array.from(randomBytes).map(b => String.fromCharCode(b)).join(''));
  
  const totp = new OTPAuth.TOTP({
    issuer: 'Sistema de Pedidos',
    label: users[userIndex].email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  });
  
  // Save secret to user
  const updatedUsers = [...users];
  updatedUsers[userIndex] = {
    ...updatedUsers[userIndex],
    tfaSecret: totp.secret.base32,
  };
  
  storeUsers(updatedUsers);
  
  // Return the URL for QR code generation
  return totp.toString();
};

// Verify 2FA code
export const verify2FAService = async (userId: string, code: string): Promise<boolean> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user || !user.tfaSecret) {
    return false;
  }
  
  // Create TOTP object
  const totp = new OTPAuth.TOTP({
    issuer: 'Sistema de Pedidos',
    label: user.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: user.tfaSecret,
  });
  
  // Verify code
  const delta = totp.validate({ token: code, window: 1 });
  
  if (delta !== null) {
    // Code is valid, enable 2FA for user
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, tfaEnabled: true, has2FA: true };
      }
      return u;
    });
    
    storeUsers(updatedUsers);
    return true;
  }
  
  return false;
};

// Disable 2FA
export const disable2FAService = async (userId: string): Promise<void> => {
  // Simulate API request delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Usuário não encontrado');
  }
  
  // Update user
  const updatedUsers = [...users];
  updatedUsers[userIndex] = {
    ...updatedUsers[userIndex],
    tfaSecret: undefined,
    tfaEnabled: false,
    has2FA: false,
  };
  
  storeUsers(updatedUsers);
  
  toast.success('Autenticação de dois fatores desativada com sucesso');
};
