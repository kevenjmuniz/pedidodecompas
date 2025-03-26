
import { createClient } from '@supabase/supabase-js';
import { User, AuthUser } from '../types/auth';

// Supabase URL e anon key (deve ser substituído pelos valores reais)
const supabaseUrl = 'https://seu-projeto.supabase.co';
const supabaseKey = 'sua-chave-anon-publica';

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Interface para representar o usuário no banco de dados
export interface DbUser extends Omit<AuthUser, 'id'> {
  id?: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
}

// Função para inicializar a tabela de usuários no Supabase (deve ser chamada apenas uma vez)
export const initializeUserTable = async () => {
  console.log('Inicializando tabela de usuários...');
  
  // Verifica se o admin já existe
  const { data: existingAdmin } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin')
    .single();

  if (!existingAdmin) {
    // Cria o usuário admin padrão
    const adminUser: DbUser = {
      name: 'Administrador',
      email: 'admin',
      password: 'admin123', // Em produção, use hash!
      role: 'admin',
      status: 'approved',
    };

    const { error } = await supabase.from('users').insert(adminUser);
    
    if (error) {
      console.error('Erro ao criar usuário admin:', error);
    } else {
      console.log('Usuário admin criado com sucesso');
    }
  } else {
    console.log('Usuário admin já existe');
  }
};

// Funções para manipulação de usuários
export const getUsers = async (): Promise<AuthUser[]> => {
  const { data, error } = await supabase.from('users').select('*');
  
  if (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
  
  return data as AuthUser[];
};

export const getUserById = async (id: string): Promise<AuthUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    return null;
  }
  
  return data as AuthUser;
};

export const getUserByEmail = async (email: string): Promise<AuthUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  
  if (error) {
    if (error.code !== 'PGRST116') { // Código para "não encontrado"
      console.error('Erro ao buscar usuário por email:', error);
    }
    return null;
  }
  
  return data as AuthUser;
};

export const createUser = async (user: DbUser): Promise<AuthUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select('*')
    .single();
  
  if (error) {
    console.error('Erro ao criar usuário:', error);
    return null;
  }
  
  return data as AuthUser;
};

export const updateUser = async (id: string, updates: Partial<DbUser>): Promise<AuthUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error('Erro ao atualizar usuário:', error);
    return null;
  }
  
  return data as AuthUser;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir usuário:', error);
    return false;
  }
  
  return true;
};

// Funções específicas de autenticação
export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('password', password) // Em produção, use hash!
    .single();
  
  if (error || !data) {
    return null;
  }
  
  const user = data as AuthUser;
  
  // Verifica status do usuário
  if (user.status === 'pending') {
    throw new Error('Sua conta está aguardando aprovação do administrador.');
  }
  
  if (user.status === 'rejected') {
    throw new Error('Sua solicitação de acesso foi rejeitada. Entre em contato com o administrador.');
  }
  
  // Retorna usuário sem a senha
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
