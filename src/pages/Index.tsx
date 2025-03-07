
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/AuthForm';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout requireAuth={false}>
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-primary">Sistema de Pedidos de Compra</h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Plataforma eficiente para gerenciar suas solicitações de compra
          </p>
        </motion.div>
        
        <AuthForm />
      </div>
    </Layout>
  );
};

export default Index;
