
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';

const PasswordReset: React.FC = () => {
  const { isAuthenticated, verifyResetToken } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetToken = searchParams.get('token');
  const resetEmail = searchParams.get('email');
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // Check token validity
    if (resetToken && resetEmail) {
      const isValid = verifyResetToken(resetEmail, resetToken);
      setTokenStatus(isValid ? 'valid' : 'invalid');
    } else {
      setTokenStatus('invalid');
    }
  }, [isAuthenticated, navigate, resetToken, resetEmail, verifyResetToken]);
  
  return (
    <Layout requireAuth={false}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-mcf-lightgray py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mcf-orange text-white text-2xl font-bold mb-6 shadow-lg"
            >
              <KeyRound size={28} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl sm:text-4xl font-bold text-mcf-darkgray mb-3"
            >
              Redefinir <span className="text-mcf-orange">Senha</span>
            </motion.h1>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white shadow-xl rounded-2xl overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              {tokenStatus === 'loading' ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mcf-orange mx-auto mb-4"></div>
                  <p>Verificando...</p>
                </div>
              ) : tokenStatus === 'valid' ? (
                <AuthForm />
              ) : (
                <div className="text-center py-8 space-y-4">
                  <AlertTriangle size={48} className="mx-auto text-yellow-500" />
                  <h3 className="text-xl font-semibold text-gray-800">Link Inválido</h3>
                  <p className="text-gray-600">
                    Este link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo link.
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-6 py-2 bg-mcf-orange text-white rounded-lg hover:bg-mcf-orange/90 transition-colors"
                  >
                    Voltar para Login
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PasswordReset;
