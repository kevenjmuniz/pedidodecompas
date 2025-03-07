
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

type SettingsContextType = {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  saveSettings: () => void;
  isLoading: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      setIsLoading(true);
      try {
        const storedSettings = localStorage.getItem('appSettings');
        if (storedSettings) {
          const settings = JSON.parse(storedSettings);
          setWebhookUrl(settings.webhookUrl || '');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = () => {
    try {
      const settings = {
        webhookUrl
      };
      localStorage.setItem('appSettings', JSON.stringify(settings));
      toast.success('Configurações salvas com sucesso');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        webhookUrl,
        setWebhookUrl,
        saveSettings,
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
