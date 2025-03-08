import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useSettings } from '../context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Globe, RefreshCw, AlertCircle, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { testWebhook, WebhookConfig } from '../services/webhookService';
import WebhookForm from '../components/webhooks/WebhookForm';
import WebhookItem from '../components/webhooks/WebhookItem';
import WebhookLogList from '../components/webhooks/WebhookLogList';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Settings: React.FC = () => {
  const { 
    webhookUrl, 
    setWebhookUrl, 
    saveSettings, 
    isLoading,
    webhookConfigs,
    saveWebhookConfig,
    deleteWebhookConfig,
    webhookLogs,
    refreshWebhookLogs
  } = useSettings();
  
  const [localWebhookUrl, setLocalWebhookUrl] = useState(webhookUrl);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{success?: boolean; message?: string} | null>(null);
  
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | undefined>(undefined);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  const [refreshingLogs, setRefreshingLogs] = useState(false);

  const handleTestWebhook = async () => {
    if (!localWebhookUrl) {
      toast.error('Por favor, configure uma URL de webhook válida');
      return;
    }

    setTestLoading(true);
    setTestResult(null);
    
    try {
      const result = await testWebhook({
        id: 'legacy',
        name: 'Webhook Padrão (Legado)',
        url: localWebhookUrl,
        events: ['pedido_criado', 'status_atualizado', 'pedido_cancelado'],
        enabled: true
      });
      
      setTestResult({
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error('Erro ao testar o webhook');
      setTestResult({
        success: false,
        message: 'Erro inesperado ao tentar testar o webhook'
      });
    } finally {
      setTestLoading(false);
    }
  };
  
  const handleLegacySave = () => {
    setWebhookUrl(localWebhookUrl);
    saveSettings();
  };
  
  const handleAddWebhook = () => {
    setEditingWebhook(undefined);
    setShowWebhookForm(true);
  };
  
  const handleEditWebhook = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setShowWebhookForm(true);
  };
  
  const handleCancelWebhookForm = () => {
    setShowWebhookForm(false);
    setEditingWebhook(undefined);
  };
  
  const handleSaveWebhook = (webhook: WebhookConfig) => {
    saveWebhookConfig(webhook);
    setShowWebhookForm(false);
    setEditingWebhook(undefined);
  };
  
  const handleDeleteWebhook = (id: string) => {
    setWebhookToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteWebhook = () => {
    if (webhookToDelete) {
      deleteWebhookConfig(webhookToDelete);
      setWebhookToDelete(null);
    }
    setDeleteDialogOpen(false);
  };
  
  const handleTestWebhookItem = async (webhook: WebhookConfig) => {
    setTestingWebhook(webhook.id);
    
    try {
      const result = await testWebhook(webhook);
      
      if (result.success) {
        toast.success(`Webhook "${webhook.name}" testado com sucesso`);
      } else {
        toast.error(`Erro ao testar webhook "${webhook.name}": ${result.message}`);
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error(`Erro ao testar webhook "${webhook.name}"`);
    } finally {
      setTestingWebhook(null);
    }
  };
  
  const handleRefreshLogs = () => {
    setRefreshingLogs(true);
    refreshWebhookLogs();
    setTimeout(() => {
      setRefreshingLogs(false);
    }, 500);
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
            <TabsTrigger value="webhook-logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks">
            {!showWebhookForm && (
              <div className="mb-6">
                <Button onClick={handleAddWebhook}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Webhook
                </Button>
              </div>
            )}
            
            {showWebhookForm && (
              <WebhookForm 
                initialData={editingWebhook}
                onCancel={handleCancelWebhookForm}
                onSave={handleSaveWebhook}
              />
            )}
            
            {!showWebhookForm && webhookConfigs.length > 0 && (
              <div className="space-y-4">
                {webhookConfigs.map(webhook => (
                  <WebhookItem 
                    key={webhook.id}
                    webhook={webhook}
                    onEdit={handleEditWebhook}
                    onDelete={handleDeleteWebhook}
                    onTest={handleTestWebhookItem}
                    isTesting={testingWebhook === webhook.id}
                  />
                ))}
              </div>
            )}
            
            {!showWebhookForm && webhookConfigs.length === 0 && (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Globe className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center mb-4">
                    Nenhum webhook configurado
                  </p>
                  <Button onClick={handleAddWebhook}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Webhook
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {!showWebhookForm && (
              <Card className="mt-8 border-dashed bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-gray-600">Configuração de Webhook (Legado)</CardTitle>
                  <CardDescription>
                    Método anterior de configuração de webhook (mantido para compatibilidade)
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
                  
                  {testResult && !testResult.success && (
                    <div className="bg-red-50 p-3 rounded-md border border-red-200 flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Erro no teste do webhook</p>
                        <p className="text-sm text-red-700">{testResult.message}</p>
                        <p className="text-xs text-red-600 mt-1">
                          Verifique se a URL está correta e se o serviço de webhook está disponível.
                          O erro pode ser devido a restrições de CORS, firewall ou indisponibilidade do servidor.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {testResult && testResult.success && (
                    <div className="bg-green-50 p-3 rounded-md border border-green-200 flex items-start gap-2">
                      <Globe className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Webhook testado com sucesso</p>
                        <p className="text-sm text-green-700">{testResult.message}</p>
                        <p className="text-xs text-green-600 mt-1">
                          O teste foi bem-sucedido. Verifique o serviço de webhook para confirmar se a mensagem chegou corretamente.
                        </p>
                      </div>
                    </div>
                  )}
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
                  <Button onClick={handleLegacySave}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="webhook-logs">
            <WebhookLogList 
              logs={webhookLogs}
              onRefresh={handleRefreshLogs}
              isLoading={refreshingLogs}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Webhook</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja remover este webhook? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteWebhook}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Settings;
