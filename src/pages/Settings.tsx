
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useSettings } from '../context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Globe, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const { webhookUrl, setWebhookUrl, saveSettings, isLoading } = useSettings();
  const [localWebhookUrl, setLocalWebhookUrl] = useState(webhookUrl);
  const [testLoading, setTestLoading] = useState(false);

  const handleSave = () => {
    setWebhookUrl(localWebhookUrl);
    saveSettings();
  };

  const handleTestWebhook = async () => {
    if (!localWebhookUrl) {
      toast.error('Por favor, configure uma URL de webhook válida');
      return;
    }

    setTestLoading(true);
    try {
      // Import dynamically to avoid circular dependencies
      const { sendWebhook } = await import('../services/webhookService');
      await sendWebhook(localWebhookUrl, {
        event: 'test',
        message: 'Teste de configuração do webhook',
        timestamp: new Date().toISOString(),
      });
      
      toast.success('Webhook de teste enviado. Verifique a aplicação de destino.');
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error('Erro ao testar o webhook');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Configure as opções do sistema de pedidos
          </p>
        </div>

        <Tabs defaultValue="webhooks" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Webhook</CardTitle>
                <CardDescription>
                  Configure um webhook para receber notificações quando novos pedidos forem criados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">URL do Webhook</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://exemplo.com/webhook"
                    value={localWebhookUrl}
                    onChange={(e) => setLocalWebhookUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Informe a URL do webhook que receberá notificações de novos pedidos
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={handleTestWebhook}
                  disabled={testLoading || !localWebhookUrl}
                >
                  {testLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    'Testar Webhook'
                  )}
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default Settings;
