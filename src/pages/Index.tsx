
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/AuthForm';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const { isAuthenticated, isDarkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index component mounted');
    console.log('isDarkMode:', isDarkMode);
    console.log('isAuthenticated:', isAuthenticated);
    
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
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-white to-mcf-lightgray'} py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300`}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className={`rounded-full ${isDarkMode ? 'text-gray-200 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isDarkMode ? 'bg-mcf-orange text-white shadow-[0_0_15px_rgba(255,137,51,0.5)]' : 'bg-mcf-orange text-white shadow-lg'} text-2xl font-bold mb-6`}
            >
              P
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-mcf-darkgray'} mb-3`}
            >
              Sistema de <span className="text-mcf-orange">Pedidos</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`${isDarkMode ? 'text-gray-300' : 'text-mcf-gray'} max-w-sm mx-auto`}
            >
              Gerencie suas solicitações de compra de forma eficiente
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={`${isDarkMode ? 'bg-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' : 'bg-white shadow-xl'} rounded-2xl overflow-hidden`}
          >
            <div className="p-6 sm:p-8">
              <Alert className={`mb-6 ${isDarkMode ? 'bg-blue-900/50 border-blue-800 text-blue-100' : 'bg-blue-50 border-blue-100'} rounded-xl shadow-sm`}>
                <InfoIcon className={`h-4 w-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-500'}`} />
                <AlertTitle className={`${isDarkMode ? 'text-blue-200' : 'text-blue-700'} font-medium`}>Aprovação Necessária</AlertTitle>
                <AlertDescription className={`${isDarkMode ? 'text-blue-300' : 'text-blue-600'} text-sm`}>
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
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-mcf-gray'} text-sm`}>© {new Date().getFullYear()} - Sistema de Pedidos de Compra</p>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Index;
