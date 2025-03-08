
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AccountCreated: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Conta Criada</CardTitle>
            <CardDescription>
              Sua conta foi criada e está aguardando aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 mb-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-center text-lg font-medium text-yellow-800 mb-2">
                Aguardando aprovação
              </h3>
              <p className="text-center text-yellow-700">
                Sua conta foi criada com sucesso, mas precisa ser aprovada por um administrador antes que você
                possa fazer login. Você receberá uma notificação quando sua conta for aprovada.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => navigate('/')}
            >
              Voltar para o Login
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default AccountCreated;
