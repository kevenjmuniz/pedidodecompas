
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
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
  Facebook,
  Mail,
  KeyRound,
  Github,
  AlertOctagon,
  Loader2,
  QrCode,
  ShieldCheck,
  ChevronRight,
  SquareCode,
  KeySquare
} from 'lucide-react';
import { LoginMethod } from '@/types/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types for all possible auth modes
type AuthMode = 'login' | 'register' | 'reset' | 'reset-confirm' | 'reset-otp' | 'verify-2fa' | 'setup-2fa';

export function AuthForm() {
  const { 
    login, 
    register, 
    resetPassword, 
    verifyResetToken, 
    completePasswordReset, 
    verifyOTP, 
    resetPasswordWithOTP,
    loginWithProvider, 
    setup2FA,
    verify2FA,
    isDarkMode
  } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  // Explicitly define all possible values for authMode
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [formError, setFormError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  const resetEmail = searchParams.get('email');
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(resetEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState(resetToken || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [otp, setOtp] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [recoveryTab, setRecoveryTab] = useState<'email' | 'otp'>('email');
  
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
    
    if ((authMode === 'register' || authMode === 'reset-confirm' || authMode === 'reset-otp') && password !== confirmPassword) {
      setFormError('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (authMode === 'login') {
        try {
          await login(email, password, rememberMe);
          toast.success("Login bem-sucedido. Você está sendo redirecionado para o dashboard.");
          navigate('/dashboard');
        } catch (error: any) {
          if (error.message === '2FA_REQUIRED') {
            // User has 2FA enabled, redirect to 2FA verification
            setAuthMode('verify-2fa');
            toast.info("Autenticação de dois fatores necessária");
          } else {
            throw error;
          }
        }
      } else if (authMode === 'register') {
        await register(name, email, password);
        navigate('/account-created');
        return;
      } else if (authMode === 'reset') {
        await resetPassword(email);
        toast.success("Instruções de redefinição de senha enviadas. Verifique seu email.");
        if (recoveryTab === 'otp') {
          setAuthMode('reset-otp');
        } else {
          setAuthMode('login');
        }
      } else if (authMode === 'reset-confirm') {
        await completePasswordReset(email, token, password);
        toast.success("Senha redefinida com sucesso. Você já pode fazer login.");
        setAuthMode('login');
      } else if (authMode === 'reset-otp') {
        // Verify OTP first
        const isValid = await verifyOTP(email, otp);
        if (isValid) {
          await resetPasswordWithOTP(email, otp, password);
          toast.success("Senha redefinida com sucesso. Você já pode fazer login.");
          setAuthMode('login');
        } else {
          throw new Error('Código de verificação inválido');
        }
      } else if (authMode === 'verify-2fa') {
        const isValid = await verify2FA(otp);
        if (isValid) {
          toast.success("Autenticação de dois fatores concluída com sucesso.");
          navigate('/dashboard');
        } else {
          throw new Error('Código de verificação inválido');
        }
      } else if (authMode === 'setup-2fa') {
        const isValid = await verify2FA(otp);
        if (isValid) {
          toast.success("Autenticação de dois fatores configurada com sucesso.");
          setAuthMode('login');
        } else {
          throw new Error('Código de verificação inválido');
        }
      }
      
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setToken('');
      setOtp('');
    } catch (error: any) {
      console.error('Auth error:', error);
      setFormError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: LoginMethod) => {
    setIsLoading(true);
    try {
      await loginWithProvider(provider);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Social login error:', error);
      setFormError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetup2FA = async () => {
    setIsLoading(true);
    try {
      const url = await setup2FA();
      setQrCodeUrl(url);
      setAuthMode('setup-2fa');
    } catch (error: any) {
      console.error('2FA setup error:', error);
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
      case 'reset-confirm': return 'Redefinir Senha';
      case 'reset-otp': return 'Verificar Código';
      case 'verify-2fa': return 'Verificação 2FA';
      case 'setup-2fa': return 'Configurar 2FA';
    }
  };

  const getFormDescription = () => {
    switch (authMode) {
      case 'login': return 'Entre com suas credenciais para acessar';
      case 'register': return 'Preencha os dados para criar uma nova conta';
      case 'reset': return 'Escolha como deseja redefinir sua senha';
      case 'reset-confirm': return 'Crie uma nova senha para sua conta';
      case 'reset-otp': return 'Digite o código enviado e sua nova senha';
      case 'verify-2fa': return 'Digite o código do seu aplicativo autenticador';
      case 'setup-2fa': return 'Escaneie o QR code com seu aplicativo autenticador';
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
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-mcf-darkgray'}`}>
            {getFormTitle()}
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-mcf-gray'}`}>
            {getFormDescription()}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Register Form Fields */}
          {authMode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : ''}`}>
                Nome completo
              </Label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <User size={18} />
                </div>
                <Input
                  id="name"
                  placeholder="Digite seu nome completo"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`pl-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-mcf-orange focus:ring-mcf-orange/30' : 'bg-gray-50 border-gray-200 focus:border-mcf-orange'}`}
                  required
                />
              </div>
            </div>
          )}
          
          {/* Email Field - hidden in some modes */}
          {authMode !== 'reset-confirm' && authMode !== 'verify-2fa' && authMode !== 'setup-2fa' && (
            <div className="space-y-2">
              <Label htmlFor="email" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : ''}`}>
                Email
              </Label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <AtSign size={18} />
                </div>
                <Input
                  id="email"
                  placeholder="seuemail@exemplo.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-mcf-orange focus:ring-mcf-orange/30' : 'bg-gray-50 border-gray-200 focus:border-mcf-orange'}`}
                  required
                  disabled={authMode === 'reset-otp'}
                />
              </div>
            </div>
          )}
          
          {/* Readonly Email Field */}
          {authMode === 'reset-confirm' && (
            <div className="space-y-2">
              <Label htmlFor="email" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : ''}`}>
                Email
              </Label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <AtSign size={18} />
                </div>
                <Input
                  id="email"
                  value={email}
                  className={`pl-10 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-100 border-gray-200'}`}
                  disabled
                />
              </div>
            </div>
          )}
          
          {/* Password Reset Options */}
          {authMode === 'reset' && (
            <div className="space-y-4 mt-4">
              <Tabs 
                value={recoveryTab} 
                onValueChange={(value) => setRecoveryTab(value as 'email' | 'otp')}
                className="w-full"
              >
                <TabsList className={`grid w-full grid-cols-2 ${isDarkMode ? 'bg-gray-700' : ''}`}>
                  <TabsTrigger value="email" className={`${isDarkMode ? 'data-[state=active]:bg-gray-600 data-[state=active]:text-white' : ''}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Via Email
                  </TabsTrigger>
                  <TabsTrigger value="otp" className={`${isDarkMode ? 'data-[state=active]:bg-gray-600 data-[state=active]:text-white' : ''}`}>
                    <KeySquare className="mr-2 h-4 w-4" />
                    Via Código
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="email" className="mt-4">
                  <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                    <p className="text-sm">
                      Você receberá um email com instruções para redefinir sua senha.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="otp" className="mt-4">
                  <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                    <p className="text-sm">
                      Você receberá um código de 6 dígitos para verificação.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {/* OTP Input Field */}
          {(authMode === 'reset-otp' || authMode === 'verify-2fa' || authMode === 'setup-2fa') && (
            <div className="space-y-4">
              <Label htmlFor="otp" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : ''}`}>
                Código de verificação
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
                  render={({ slots }) => (
                    <InputOTPGroup className="gap-2">
                      {slots.map((slot, index) => (
                        <InputOTPSlot 
                          key={index} 
                          {...slot} 
                          className={`${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                        />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>
              
              {authMode === 'setup-2fa' && qrCodeUrl && (
                <div className="flex flex-col items-center space-y-4 mt-4">
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-white' : 'bg-gray-100'}`}>
                    <QrCode className="h-32 w-32 text-black" />
                    <p className="text-xs mt-2 text-center text-gray-500">QR Code para autenticador</p>
                  </div>
                  <p className={`text-sm text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Escaneie este QR code com seu aplicativo autenticador (Google Authenticator, Microsoft Authenticator, etc.) e digite o código gerado acima.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Password Fields */}
          {(authMode === 'login' || authMode === 'register' || authMode === 'reset-confirm' || authMode === 'reset-otp') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : ''}`}>
                  Senha
                </Label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('reset')}
                    className={`text-xs ${isDarkMode ? 'text-mcf-orange hover:text-mcf-orange/80' : 'text-mcf-blue hover:text-mcf-blue/80'} hover:underline focus:outline-none`}
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Lock size={18} />
                </div>
                <Input
                  id="password"
                  placeholder="Sua senha"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-mcf-orange focus:ring-mcf-orange/30' : 'bg-gray-50 border-gray-200 focus:border-mcf-orange'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 flex items-center pr-3 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}
          
          {/* Confirm Password Field */}
          {(authMode === 'register' || authMode === 'reset-confirm' || authMode === 'reset-otp') && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : ''}`}>
                Confirmar Senha
              </Label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Lock size={18} />
                </div>
                <Input
                  id="confirmPassword"
                  placeholder="Confirme sua senha"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-mcf-orange focus:ring-mcf-orange/30' : 'bg-gray-50 border-gray-200 focus:border-mcf-orange'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute inset-y-0 right-0 flex items-center pr-3 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}
          
          {/* Remember Me checkbox */}
          {authMode === 'login' && (
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox 
                id="rememberMe" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className={isDarkMode ? 'border-gray-600 data-[state=checked]:bg-mcf-orange data-[state=checked]:border-mcf-orange' : ''}
              />
              <Label htmlFor="rememberMe" className={`text-sm font-medium cursor-pointer ${isDarkMode ? 'text-gray-300' : ''}`}>
                Lembrar-me neste dispositivo
              </Label>
            </div>
          )}
          
          {/* Display Form Errors */}
          {formError && (
            <div className={`${isDarkMode ? 'bg-red-900/30 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-lg text-sm flex items-start gap-2`}>
              <AlertOctagon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}
          
          {/* Submit Button */}
          <Button 
            type="submit" 
            className={`w-full bg-mcf-orange hover:bg-mcf-orange/90 text-white font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-2 ${isDarkMode ? 'shadow-[0_0_10px_rgba(255,137,51,0.3)]' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                {authMode === 'login' ? 'Entrar' : 
                 authMode === 'register' ? 'Criar Conta' : 
                 authMode === 'reset' ? 'Enviar Instruções' :
                 authMode === 'reset-confirm' || authMode === 'reset-otp' ? 'Redefinir Senha' :
                 authMode === 'verify-2fa' || authMode === 'setup-2fa' ? 'Verificar' : 'Continuar'}
                <ArrowRight size={18} />
              </>
            )}
          </Button>
          
          {/* 2FA Setup Button (only shown in login screen) */}
          {authMode === 'login' && (
            <Button
              type="button"
              variant="outline"
              className={`w-full mt-2 ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700/50' : ''}`}
              onClick={handleSetup2FA}
            >
              <ShieldCheck className="mr-2 h-4 w-4" /> Configurar autenticação 2FA
            </Button>
          )}
        </form>
        
        {/* Social Login Options */}
        {authMode === 'login' && (
          <>
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              </div>
              <div className="relative flex justify-center">
                <span className={`${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'} px-4 text-sm`}>ou</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSocialLogin('google')}
                className={`w-full ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700/50' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} font-medium`}
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
                Google
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSocialLogin('github')}
                className={`w-full ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700/50' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} font-medium`}
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSocialLogin('microsoft')}
                className={`w-full ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700/50' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} font-medium`}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23">
                  <path fill="#f1511b" d="M11.5 0h-11.5v11.5h11.5z"></path>
                  <path fill="#80cc28" d="M23 0h-11.5v11.5h11.5z"></path>
                  <path fill="#00adef" d="M11.5 11.5h-11.5v11.5h11.5z"></path>
                  <path fill="#fbbc09" d="M23 11.5h-11.5v11.5h11.5z"></path>
                </svg>
                Microsoft
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSocialLogin('facebook')}
                className={`w-full ${isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700/50' : 'border-gray-300 hover:bg-gray-50 text-gray-700'} font-medium`}
              >
                <Facebook className="w-5 h-5 mr-2 text-[#1877F2]" />
                Facebook
              </Button>
            </div>
          </>
        )}
        
        {/* Footer Links - Registration or Login */}
        <div className="text-center">
          {authMode === 'login' ? (
            <button 
              onClick={() => setAuthMode('register')} 
              className={`${isDarkMode ? 'text-mcf-orange hover:text-mcf-orange/80' : 'text-mcf-blue hover:text-mcf-blue/80'} text-sm font-medium hover:underline transition-colors`}
            >
              Não tem uma conta? Cadastre-se
            </button>
          ) : authMode === 'register' || authMode === 'reset' || authMode === 'reset-confirm' || authMode === 'reset-otp' || authMode === 'verify-2fa' || authMode === 'setup-2fa' ? (
            <button 
              onClick={() => setAuthMode('login')} 
              className={`${isDarkMode ? 'text-mcf-orange hover:text-mcf-orange/80' : 'text-mcf-blue hover:text-mcf-blue/80'} text-sm font-medium hover:underline transition-colors`}
            >
              <ChevronRight className="h-4 w-4 inline-block" /> Voltar para o login
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
