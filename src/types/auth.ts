export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
  avatar?: string;
  lastLogin?: number;
  authProvider?: 'email' | 'google' | 'github' | 'microsoft' | 'facebook'; 
  has2FA?: boolean;
};

export type AuthUser = User & {
  password: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  verificationCode?: string;
  verificationCodeExpiry?: number;
  tfaSecret?: string;
  tfaEnabled?: boolean;
  refreshToken?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type LoginMethod = 'email' | 'google' | 'github' | 'microsoft' | 'facebook';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type SessionInfo = {
  user: User;
  tokens: AuthTokens;
  lastActivity: number;
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionRestored: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithProvider: (provider: LoginMethod) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyResetToken: (email: string, token: string) => boolean;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  completePasswordReset: (email: string, token: string, newPassword: string) => Promise<void>;
  resetPasswordWithOTP: (email: string, otp: string, newPassword: string) => Promise<void>;
  users: Array<User>;
  addUser: (name: string, email: string, password: string, role: 'admin' | 'user') => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  changePassword: (id: string, newPassword: string) => Promise<void>;
  approveUser: (id: string) => Promise<void>;
  rejectUser: (id: string) => Promise<void>;
  setup2FA: () => Promise<string>;
  verify2FA: (code: string) => Promise<boolean>;
  disable2FA: () => Promise<void>;
  checkSessionStatus: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  sessionTimeRemaining: number | null;
};
