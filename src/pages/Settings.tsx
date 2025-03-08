import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useSettings } from '../context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, FileText, Plus } from 'lucide-react';
import { WebhookConfig } from '../services/webhookService';
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
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const { 
    webhookConfigs,
    saveWebhookConfig,
    deleteWebhookConfig,
    webhookLogs,
    refreshWebhookLogs
  } = useSettings();
  
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | undefined>(undefined);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  const [refreshingLogs, setRefreshingLogs] = useState(false);

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
