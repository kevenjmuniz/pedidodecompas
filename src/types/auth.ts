
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
};

export type AuthUser = User & {
  password: string;
  resetToken?: string;
  resetTokenExpiry?: number;
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionRestored: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyResetToken: (email: string, token: string) => boolean;
  completePasswordReset: (email: string, token: string, newPassword: string) => Promise<void>;
  users: Array<User>;
  addUser: (name: string, email: string, password: string, role: 'admin' | 'user') => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  changePassword: (id: string, newPassword: string) => Promise<void>;
  approveUser: (id: string) => Promise<void>;
  rejectUser: (id: string) => Promise<void>;
};
