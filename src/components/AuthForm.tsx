import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AtSign, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  ArrowRight, 
  Smartphone,
  Facebook,
  Mail,
  Key,
  KeyRound
} from 'lucide-react';

export function AuthForm() {
  const { login, register, resetPassword, verifyResetToken, completePasswordReset } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset' | 'reset-confirm'>('login');
  const [formError, setFormError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  const resetEmail = searchParams.get('email');
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(resetEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState(resetToken || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [code, setCode] = useState('');
  
  React.useEffect(() => {
    if (resetToken && resetEmail) {
      const isValid = verifyResetToken(resetEmail, resetToken);
      if (isValid) {
        setAuthMode('reset-confirm');
        setToken(resetToken);
        setEmail(resetEmail);
      } else {
        toast.error('O link de redefinição é inválido ou expirou.');
        setAuthMode('reset');
      }
    }
  }, [resetToken, resetEmail, verifyResetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if ((authMode === 'register' || authMode === 'reset-confirm') && password !== confirmPassword) {
      setFormError('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (authMode === 'login') {
        await login(email, password, rememberMe);
        toast.success("Login bem-sucedido. Você está sendo redirecionado para o dashboard.");
        navigate('/dashboard');
      } else if (authMode === 'register') {
        await register(name, email, password);
        navigate('/account-created');
        return;
      } else if (authMode === 'reset') {
        await resetPassword(email);
        toast.success("E-mail de redefinição de senha enviado. Verifique sua caixa de entrada.");
        setAuthMode('login');
      } else if (authMode === 'reset-confirm') {
        await completePasswordReset(email, token, password);
        toast.success("Senha redefinida com sucesso. Você já pode fazer login.");
        setAuthMode('login');
      }
      
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setToken('');
      setCode('');
    } catch (error: any) {
      console.error('Auth error:', error);
      setFormError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    toast.info(`Login com ${provider} será implementado em breve.`);
  };

  const getFormTitle = () => {
    switch (authMode) {
      case 'login': return 'Entrar no Sistema';
      case 'register': return 'Criar Conta';
      case 'reset': return 'Recuperar Senha';
      case 'reset-confirm': return 'Redefinir Senha';
    }
  };

  const getFormDescription = () => {
    switch (authMode) {
      case 'login': return 'Entre com suas credenciais para acessar';
      case 'register': return 'Preencha os dados para criar uma nova conta';
      case 'reset': return 'Informe seu email para redefinir a senha';
      case 'reset-confirm': return 'Crie uma nova senha para sua conta';
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
      className="w-full max-w-md mx-auto"
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
          
          {authMode !== 'reset-confirm' && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <AtSign size={18} />
                </div>
                <Input
                  id="email"
                  placeholder="seuemail@exemplo.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:border-mcf-orange"
                  required
                  disabled={authMode === 'reset-confirm'}
                />
              </div>
            </div>
          )}
          
          {authMode === 'reset-confirm' && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <AtSign size={18} />
                </div>
                <Input
                  id="email"
                  value={email}
                  className="pl-10 bg-gray-100 border-gray-200"
                  disabled
                />
              </div>
            </div>
          )}
          
          {(authMode === 'login' || authMode === 'register' || authMode === 'reset-confirm') && (
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
          
          {(authMode === 'register' || authMode === 'reset-confirm') && (
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
          
          {authMode === 'login' && (
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox 
                id="rememberMe" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="rememberMe" className="text-sm font-medium cursor-pointer">
                Lembrar-me neste dispositivo
              </Label>
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
                {authMode === 'login' ? 'Entrar' : 
                 authMode === 'register' ? 'Criar Conta' : 
                 authMode === 'reset' ? 'Enviar Email' :
                 'Redefinir Senha'}
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>
        
        {authMode === 'login' && (
          <>
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">ou</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSocialLogin('Google')}
                className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continuar com Google
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSocialLogin('Facebook')}
                className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
              >
                <Facebook className="w-5 h-5 mr-2 text-[#1877F2]" />
                Continuar com Facebook
              </Button>
            </div>
          </>
        )}
        
        <div className="text-center">
          {authMode === 'login' ? (
            <button 
              onClick={() => setAuthMode('register')} 
              className="text-mcf-blue hover:text-mcf-blue/80 text-sm font-medium hover:underline transition-colors"
            >
              Não tem uma conta? Cadastre-se
            </button>
          ) : authMode === 'register' || authMode === 'reset' || authMode === 'reset-confirm' ? (
            <button 
              onClick={() => setAuthMode('login')} 
              className="text-mcf-blue hover:text-mcf-blue/80 text-sm font-medium hover:underline transition-colors"
            >
              Já tem uma conta? Entre aqui
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
