
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/AuthForm';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard');
      toast.success('Bem-vindo de volta!');
      navigate('/dashboard', { replace: true });
    } else {
      console.log('User is not authenticated');
      
      // Log any stored users for debugging
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        console.log('Stored users:', users.length);
      } else {
        console.log('No stored users found');
      }
    }
  }, [isAuthenticated, navigate]);

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
              P
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl sm:text-4xl font-bold text-mcf-darkgray mb-3"
            >
              Sistema de <span className="text-mcf-orange">Pedidos</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-mcf-gray max-w-sm mx-auto"
            >
              Gerencie suas solicitações de compra de forma eficiente
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white shadow-xl rounded-2xl overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              <Alert className="mb-6 bg-blue-50 border-blue-100 rounded-xl shadow-sm">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-700 font-medium">Aprovação Necessária</AlertTitle>
                <AlertDescription className="text-blue-600 text-sm">
                  Novas contas precisam de aprovação de um administrador antes de acessar o sistema.
                </AlertDescription>
              </Alert>
              
              <AuthForm />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-12 text-center"
          >
            <p className="text-mcf-gray text-sm">© {new Date().getFullYear()} - Sistema de Pedidos de Compra</p>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Index;
