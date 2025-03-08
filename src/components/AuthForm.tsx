
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Captcha } from './Captcha';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClockIcon } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'reset' | 'pending';

export const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  
  const { login, register, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((mode === 'login' || mode === 'register')) {
      if (!showCaptcha) {
        setShowCaptcha(true);
        return;
      }
      
      if (!isCaptchaVerified) {
        toast.error('Por favor, verifique o captcha antes de continuar.');
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else if (mode === 'register') {
        await register(name, email, password);
        setMode('pending');
        // Reset captcha state after successful registration
        setShowCaptcha(false);
        setIsCaptchaVerified(false);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setMode('login');
      }
    } catch (error: any) {
      console.error(error);
      // Check for pending approval error
      if (error.message && error.message.includes('aguardando aprovação')) {
        setMode('pending');
      }
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
    setIsCaptchaVerified(false);
    setShowCaptcha(false);
  };

  // Show pending approval message
  if (mode === 'pending') {
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
              Conta Criada
            </CardTitle>
            <CardDescription className="text-center">
              Sua conta foi criada e está aguardando aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-yellow-50 border-yellow-200 mb-4">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Aguardando aprovação</AlertTitle>
              <AlertDescription className="text-yellow-700">
                Sua conta foi criada com sucesso, mas precisa ser aprovada por um administrador antes que você possa fazer login.
                Você receberá uma notificação quando sua conta for aprovada.
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full mt-4" 
              onClick={() => switchMode('login')}
            >
              Voltar para o Login
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
            
            {/* Only show captcha for login and register after initial button click */}
            {(mode === 'login' || mode === 'register') && showCaptcha && (
              <Captcha onCaptchaVerified={setIsCaptchaVerified} />
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || ((mode === 'login' || mode === 'register') && showCaptcha && !isCaptchaVerified)}
            >
              {isLoading ? (
                <span>Processando...</span>
              ) : (
                <>
                  {mode === 'login' && (showCaptcha ? 'Entrar' : 'Continuar')}
                  {mode === 'register' && (showCaptcha ? 'Criar Conta' : 'Continuar')}
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
        </CardFooter>
      </Card>
    </motion.div>
  );
};
