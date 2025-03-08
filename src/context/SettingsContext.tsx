
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  WebhookConfig, 
  WebhookLog,
  getWebhookConfigs, 
  saveWebhookConfigs, 
  getWebhookLogs,
  testWebhook
} from '../services/webhookService';

type SettingsContextType = {
  webhookConfigs: WebhookConfig[];
  saveWebhookConfig: (config: WebhookConfig) => void;
  deleteWebhookConfig: (id: string) => void;
  webhookLogs: WebhookLog[];
  refreshWebhookLogs: () => void;
  isLoading: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfig[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      setIsLoading(true);
      try {
        // Load webhook configurations
        setWebhookConfigs(getWebhookConfigs());
        
        // Load webhook logs
        setWebhookLogs(getWebhookLogs());
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);
  
  const saveWebhookConfig = (config: WebhookConfig) => {
    try {
      // Generate ID if it's a new config
      if (!config.id) {
        config.id = Math.random().toString(36).substring(2, 15);
      }
      
      const updatedConfigs = [...webhookConfigs];
      const index = updatedConfigs.findIndex(c => c.id === config.id);
      
      if (index >= 0) {
        updatedConfigs[index] = config;
      } else {
        updatedConfigs.push(config);
      }
      
      setWebhookConfigs(updatedConfigs);
      saveWebhookConfigs(updatedConfigs);
      toast.success(index >= 0 ? 'Webhook atualizado com sucesso' : 'Webhook adicionado com sucesso');
    } catch (error) {
      console.error('Failed to save webhook config:', error);
      toast.error('Erro ao salvar configuração do webhook');
    }
  };
  
  const deleteWebhookConfig = (id: string) => {
    try {
      const updatedConfigs = webhookConfigs.filter(c => c.id !== id);
      setWebhookConfigs(updatedConfigs);
      saveWebhookConfigs(updatedConfigs);
      toast.success('Webhook removido com sucesso');
    } catch (error) {
      console.error('Failed to delete webhook config:', error);
      toast.error('Erro ao remover webhook');
    }
  };
  
  const refreshWebhookLogs = () => {
    setWebhookLogs(getWebhookLogs());
  };

  return (
    <SettingsContext.Provider
      value={{
        webhookConfigs,
        saveWebhookConfig,
        deleteWebhookConfig,
        webhookLogs,
        refreshWebhookLogs,
        isLoading
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
