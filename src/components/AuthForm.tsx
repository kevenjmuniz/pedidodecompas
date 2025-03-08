
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AuthForm() {
  const { login, register, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Check if passwords match for registration
    if (authMode === 'register' && password !== confirmPassword) {
      setFormError('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else if (authMode === 'register') {
        await register(name, email, password);
        // Redirect to account created page instead of switching to login
        navigate('/account-created');
        return; // Return early to prevent form reset and mode change
      } else if (authMode === 'reset') {
        await resetPassword(email);
        setAuthMode('login');
      }
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Auth error:', error);
      setFormError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">
          {authMode === 'login' ? 'Login' : authMode === 'register' ? 'Criar Conta' : 'Resetar Senha'}
        </CardTitle>
        <CardDescription>
          {authMode === 'login'
            ? 'Entre com seu e-mail e senha'
            : authMode === 'register'
            ? 'Crie uma nova conta'
            : 'Insira seu e-mail para resetar sua senha'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit}>
          {authMode === 'register' && (
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Digite seu nome"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="seuemail@exemplo.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {authMode === 'register' && (
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                placeholder="Confirmar Senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          {formError && (
            <p className="text-red-500 text-sm">{formError}</p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? 'Carregando ...'
              : authMode === 'login'
              ? 'Entrar'
              : authMode === 'register'
              ? 'Criar Conta'
              : 'Resetar Senha'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 items-center text-xs">
        {authMode === 'login' ? (
          <>
            <Button 
              variant="link" 
              onClick={() => setAuthMode('register')} 
              className="hover:underline"
            >
              Criar uma conta
            </Button>
            <Button 
              variant="link" 
              onClick={() => setAuthMode('reset')} 
              className="hover:underline"
            >
              Esqueceu sua senha?
            </Button>
          </>
        ) : authMode === 'register' ? (
          <Button 
            variant="link" 
            onClick={() => setAuthMode('login')} 
            className="hover:underline"
          >
            Já tem uma conta?
          </Button>
        ) : (
          <Button 
            variant="link" 
            onClick={() => setAuthMode('login')} 
            className="hover:underline"
          >
            Voltar para o login
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
