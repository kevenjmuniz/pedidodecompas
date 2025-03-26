import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AtSign, Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';
import { initializeUserTable } from '../lib/supabase';

export function AuthForm() {
  const { login, register, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeUserTable();
        console.log('User table initialized successfully');
        
        const users = localStorage.getItem('users');
        if (users) {
          console.log('Existing users:', JSON.parse(users));
        } else {
          console.log('No existing users found');
        }
      } catch (error) {
        console.error('Failed to initialize user table:', error);
      }
    };
    
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (authMode === 'register' && password !== confirmPassword) {
      setFormError('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (authMode === 'login') {
        console.log('Tentando login com:', email, password);
        await login(email, password);
        toast.success("Login bem-sucedido. Você está sendo redirecionado para o dashboard.");
        navigate('/dashboard');
      } else if (authMode === 'register') {
        await register(name, email, password);
        navigate('/account-created');
        return;
      } else if (authMode === 'reset') {
        await resetPassword(email);
        setAuthMode('login');
      }
      
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Auth error:', error);
      setFormError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getFormTitle = () => {
    switch (authMode) {
      case 'login': return 'Entrar no Sistema';
      case 'register': return 'Criar Conta';
      case 'reset': return 'Recuperar Senha';
    }
  };

  const getFormDescription = () => {
    switch (authMode) {
      case 'login': return 'Entre com suas credenciais para acessar';
      case 'register': return 'Preencha os dados para criar uma nova conta';
      case 'reset': return 'Informe seu email para redefinir a senha';
    }
  };

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-mcf-darkgray">
            {getFormTitle()}
          </h2>
          <p className="text-sm text-mcf-gray">
            {getFormDescription()}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome completo
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <Input
                  id="name"
                  placeholder="Digite seu nome completo"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:border-mcf-orange"
                  required
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              {authMode === 'login' ? 'Email ou Usuário' : 'Email'}
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <AtSign size={18} />
              </div>
              <Input
                id="email"
                placeholder={authMode === 'login' ? "seuemail@exemplo.com ou nome de usuário" : "seuemail@exemplo.com"}
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:border-mcf-orange"
                required
              />
            </div>
          </div>
          
          {authMode !== 'reset' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('reset')}
                    className="text-xs text-mcf-blue hover:underline focus:outline-none"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <Input
                  id="password"
                  placeholder="Sua senha"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-mcf-orange"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}
          
          {authMode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Senha
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <Input
                  id="confirmPassword"
                  placeholder="Confirme sua senha"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-mcf-orange"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}
          
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-mcf-orange hover:bg-mcf-orange/90 text-white font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              "Processando..."
            ) : (
              <>
                {authMode === 'login' ? 'Entrar' : authMode === 'register' ? 'Criar Conta' : 'Enviar Email'}
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>
        
        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-gray-500">ou</span>
          </div>
        </div>
        
        <div className="text-center">
          {authMode === 'login' ? (
            <button 
              onClick={() => setAuthMode('register')} 
              className="text-mcf-blue hover:text-mcf-blue/80 text-sm font-medium hover:underline transition-colors"
            >
              Não tem uma conta? Cadastre-se
            </button>
          ) : (
            <button 
              onClick={() => setAuthMode('login')} 
              className="text-mcf-blue hover:text-mcf-blue/80 text-sm font-medium hover:underline transition-colors"
            >
              Já tem uma conta? Entre aqui
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
