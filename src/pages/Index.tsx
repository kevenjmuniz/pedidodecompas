
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from '../components/AuthForm';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

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
          <h1 className="text-4xl font-bold mb-2 text-mcf-orange">Sistema de Pedidos de Compra</h1>
          <p className="text-xl text-mcf-gray max-w-lg mx-auto">
            Plataforma eficiente para gerenciar suas solicitações de compra
          </p>
        </motion.div>
        
        <div className="w-full max-w-md mb-12">
          <AuthForm />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mcf-card"
          >
            <div className="mcf-icon-container">⭐</div>
            <h3 className="font-title font-bold text-mcf-orange mb-2">Experiência</h3>
            <p className="text-sm text-mcf-gray">
              Sistema completo para gerenciamento de pedidos de compra com ampla experiência no setor.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mcf-card"
          >
            <div className="mcf-icon-container">👥</div>
            <h3 className="font-title font-bold text-mcf-orange mb-2">Equipe</h3>
            <p className="text-sm text-mcf-gray">
              Equipe altamente capacitada oferece soluções para impulsionar seu negócio.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mcf-card"
          >
            <div className="mcf-icon-container">📋</div>
            <h3 className="font-title font-bold text-mcf-orange mb-2">Portfólio</h3>
            <p className="text-sm text-mcf-gray">
              Nosso portfólio diversificado abrange desde consultoria até implementação de infraestrutura.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mcf-card"
          >
            <div className="mcf-icon-container">📈</div>
            <h3 className="font-title font-bold text-mcf-orange mb-2">Objetivo</h3>
            <p className="text-sm text-mcf-gray">
              Nosso objetivo é colaborar de perto com nossos clientes, entendendo suas necessidades.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
