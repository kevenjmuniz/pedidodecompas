
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type AuthMode = 'login' | 'register' | 'reset';

export const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else if (mode === 'register') {
        await register(name, email, password);
        setMode('login');
        toast.success('Conta criada com sucesso! Faça login para continuar.');
      } else if (mode === 'reset') {
        await resetPassword(email);
        setMode('login');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    // Reset form fields when switching modes
    if (newMode === 'login' || newMode === 'reset') {
      setName('');
    }
    if (newMode === 'reset') {
      setPassword('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="glass-card overflow-hidden">
        <CardHeader className="space-y-1 py-6">
          <CardTitle className="text-center text-2xl font-medium">
            {mode === 'login' && 'Acesso ao Sistema'}
            {mode === 'register' && 'Criar Conta'}
            {mode === 'reset' && 'Recuperar Senha'}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === 'login' && 'Entre com suas credenciais para acessar o sistema'}
            {mode === 'register' && 'Crie uma nova conta para acessar o sistema'}
            {mode === 'reset' && 'Informe seu e-mail para recuperar sua senha'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Digite seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            {mode !== 'reset' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {mode === 'login' && (
                    <Button
                      variant="link"
                      size="sm"
                      className="px-0 text-xs font-medium text-primary"
                      type="button"
                      onClick={() => switchMode('reset')}
                    >
                      Esqueceu a senha?
                    </Button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder={mode === 'login' ? "Digite sua senha" : "Crie uma senha segura"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Processando...</span>
              ) : (
                <>
                  {mode === 'login' && 'Entrar'}
                  {mode === 'register' && 'Criar Conta'}
                  {mode === 'reset' && 'Recuperar Senha'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-0">
          <div className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                Não tem uma conta?{' '}
                <Button
                  variant="link"
                  className="p-0 text-primary"
                  type="button"
                  onClick={() => switchMode('register')}
                >
                  Criar conta
                </Button>
              </>
            ) : (
              <>
                Já tem uma conta?{' '}
                <Button
                  variant="link"
                  className="p-0 text-primary"
                  type="button"
                  onClick={() => switchMode('login')}
                >
                  Fazer login
                </Button>
              </>
            )}
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            <p>Para teste, use:</p>
            <p>Admin: admin@example.com / admin123</p>
            <p>Usuário: user@example.com / user123</p>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
