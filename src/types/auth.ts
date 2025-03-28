
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
};

export type AuthUser = User & {
  password: string;
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>; // Changed from Promise<void> to Promise<User>
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  users: Array<User>;
  addUser: (name: string, email: string, password: string, role: 'admin' | 'user') => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  changePassword: (id: string, newPassword: string) => Promise<void>;
  approveUser: (id: string) => Promise<void>;
  rejectUser: (id: string) => Promise<void>;
};
