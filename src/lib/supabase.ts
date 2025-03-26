
import { createClient } from '@supabase/supabase-js';
import { User, AuthUser } from '../types/auth';

// Supabase URL e anon key (substituindo por valores que funcionam em desenvolvimento)
const supabaseUrl = 'https://supabase.io';  // Este é um valor temporário
const supabaseKey = 'temporarykey'; // Este é um valor temporário

// Criação do cliente Supabase com fallback para armazenamento local
export const supabase = {
  from: (table: string) => {
    console.log(`Accessing table: ${table}`);
    return {
      select: (fields: string = '*') => {
        console.log(`Selecting fields: ${fields} from ${table}`);
        return {
          eq: (field: string, value: any) => {
            console.log(`Filtering ${field} = ${value}`);
            return {
              single: async () => {
                console.log(`Getting single record from ${table}`);
                try {
                  // Simular dados do localStorage quando Supabase não está conectado
                  const storedUsers = localStorage.getItem('users');
                  if (table === 'users' && storedUsers) {
                    const users = JSON.parse(storedUsers);
                    const user = users.find((u: any) => u[field] === value);
                    return { data: user || null, error: null };
                  }
                  return { data: null, error: null };
                } catch (error) {
                  console.error('Error in single query:', error);
                  return { data: null, error };
                }
              },
              execute: async () => {
                console.log(`Getting multiple records from ${table}`);
                try {
                  // Simular dados do localStorage quando Supabase não está conectado
                  const storedUsers = localStorage.getItem('users');
                  if (table === 'users' && storedUsers) {
                    const users = JSON.parse(storedUsers);
                    const filteredUsers = users.filter((u: any) => u[field] === value);
                    return { data: filteredUsers, error: null };
                  }
                  return { data: [], error: null };
                } catch (error) {
                  console.error('Error in query:', error);
                  return { data: [], error };
                }
              }
            };
          },
          execute: async () => {
            console.log(`Getting all records from ${table}`);
            try {
              // Simular dados do localStorage quando Supabase não está conectado
              const storedUsers = localStorage.getItem('users');
              if (table === 'users' && storedUsers) {
                return { data: JSON.parse(storedUsers), error: null };
              }
              return { data: [], error: null };
            } catch (error) {
              console.error('Error in query:', error);
              return { data: [], error };
            }
          }
        };
      },
      insert: async (data: any) => {
        console.log(`Inserting data into ${table}:`, data);
        try {
          if (table === 'users') {
            // Simular inserção no localStorage quando Supabase não está conectado
            const storedUsers = localStorage.getItem('users');
            const users = storedUsers ? JSON.parse(storedUsers) : [];
            
            // Verificar se o e-mail já existe
            if (users.some((u: any) => u.email === data.email)) {
              return { error: { message: 'E-mail já está em uso' } };
            }
            
            // Adicionar ID se não foi fornecido
            const newUser = { ...data };
            if (!newUser.id) {
              newUser.id = Date.now().toString();
            }
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            return { data: newUser, error: null };
          }
          return { data: null, error: null };
        } catch (error) {
          console.error('Error in insert:', error);
          return { data: null, error };
        }
      },
      update: (updates: any) => {
        console.log(`Updating data in ${table}:`, updates);
        return {
          eq: async (field: string, value: any) => {
            console.log(`Updating where ${field} = ${value}`);
            try {
              if (table === 'users') {
                // Simular atualização no localStorage quando Supabase não está conectado
                const storedUsers = localStorage.getItem('users');
                if (storedUsers) {
                  const users = JSON.parse(storedUsers);
                  const index = users.findIndex((u: any) => u[field] === value);
                  
                  if (index !== -1) {
                    users[index] = { ...users[index], ...updates };
                    localStorage.setItem('users', JSON.stringify(users));
                    return { 
                      data: users[index], 
                      error: null,
                      select: () => ({
                        single: async () => ({ data: users[index], error: null })
                      })
                    };
                  }
                }
              }
              return { 
                data: null, 
                error: { message: 'Record not found' },
                select: () => ({
                  single: async () => ({ data: null, error: { message: 'Record not found' } })
                })
              };
            } catch (error) {
              console.error('Error in update:', error);
              return { 
                data: null, 
                error,
                select: () => ({
                  single: async () => ({ data: null, error })
                })
              };
            }
          }
        };
      },
      delete: () => {
        console.log(`Deleting data from ${table}`);
        return {
          eq: async (field: string, value: any) => {
            console.log(`Deleting where ${field} = ${value}`);
            try {
              if (table === 'users') {
                // Simular exclusão no localStorage quando Supabase não está conectado
                const storedUsers = localStorage.getItem('users');
                if (storedUsers) {
                  const users = JSON.parse(storedUsers);
                  const filteredUsers = users.filter((u: any) => u[field] !== value);
                  
                  if (users.length !== filteredUsers.length) {
                    localStorage.setItem('users', JSON.stringify(filteredUsers));
                    return { error: null };
                  }
                }
              }
              return { error: { message: 'Record not found' } };
            } catch (error) {
              console.error('Error in delete:', error);
              return { error };
            }
          }
        };
      }
    };
  }
};

// Interface para representar o usuário no banco de dados
export interface DbUser extends Omit<AuthUser, 'id'> {
  id?: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected';
}

// Função para inicializar a tabela de usuários no Supabase (deve ser chamada apenas uma vez)
export const initializeUserTable = async () => {
  console.log('Inicializando tabela de usuários...');
  
  // Verificar usuários existentes
  const storedUsers = localStorage.getItem('users');
  let users = storedUsers ? JSON.parse(storedUsers) : [];
  
  // Verificar se o admin padrão já existe
  const adminExists = users.some((u: any) => u.email === 'admin@mcfinfo.com.br');
  
  if (!adminExists) {
    // Cria o usuário admin padrão
    const adminUser: DbUser = {
      id: 'admin-' + Date.now(),
      name: 'Administrador',
      email: 'admin@mcfinfo.com.br',
      password: '123@mudar', // Em produção, use hash!
      role: 'admin',
      status: 'approved',
    };

    users.push(adminUser);
    localStorage.setItem('users', JSON.stringify(users));
    console.log('Usuário admin criado com sucesso:', adminUser);
  } else {
    console.log('Usuário admin já existe');
  }
  
  // Verifica se o admin original também existe (para compatibilidade)
  const originalAdminExists = users.some((u: any) => u.email === 'admin');
  
  if (!originalAdminExists) {
    // Cria o usuário admin original (para compatibilidade)
    const originalAdminUser: DbUser = {
      id: 'original-admin-' + Date.now(),
      name: 'Administrador Original',
      email: 'admin',
      password: 'admin123', // Em produção, use hash!
      role: 'admin',
      status: 'approved',
    };

    users.push(originalAdminUser);
    localStorage.setItem('users', JSON.stringify(users));
    console.log('Usuário admin original criado com sucesso');
  }
};

// Funções para manipulação de usuários
export const getUsers = async (): Promise<AuthUser[]> => {
  const { data, error } = await supabase.from('users').select('*').execute();
  
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
    // Tentar encontrar por email exato ou username
    const { data: usersData } = await supabase.from('users').select('*').execute();
    if (usersData) {
      const users = usersData as AuthUser[];
      const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() || 
        u.email === email
      );
      if (user) return user;
    }
    
    console.error('Erro ao buscar usuário por email:', error);
    return null;
  }
  
  return data as AuthUser;
};

export const createUser = async (user: DbUser): Promise<AuthUser | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert(user);
  
  if (error) {
    console.error('Erro ao criar usuário:', error);
    return null;
  }
  
  return data as AuthUser;
};

export const updateUser = async (id: string, updates: Partial<DbUser>): Promise<AuthUser | null> => {
  const response = await supabase
    .from('users')
    .update(updates)
    .eq('id', id);
  
  // Agora usamos o método select no objeto retornado, não na Promise
  const { data, error } = await response.select().single();
  
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
  console.log('Tentando autenticar usuário:', email);
  
  // Buscar todos os usuários (para melhorar a busca)
  const { data: usersData, error: usersError } = await supabase.from('users').select('*').execute();
  
  if (usersError || !usersData) {
    console.error('Erro ao buscar usuários para autenticação:', usersError);
    return null;
  }
  
  const users = usersData as AuthUser[];
  console.log('Usuários disponíveis:', users.length);
  
  // Procurar por usuário com email ou nome de usuário correspondente
  const user = users.find(u => 
    (u.email.toLowerCase() === email.toLowerCase() || u.email === email) && 
    u.password === password
  );
  
  if (!user) {
    console.log('Nenhum usuário encontrado com essas credenciais');
    return null;
  }
  
  console.log('Usuário encontrado:', user.email, 'Status:', user.status);
  
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
