
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useSettings } from '@/context/SettingsContext';
import { WebhookConfig, testWebhook } from '@/services/webhookService';
import { Save, X, Plus, Trash2, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

interface WebhookFormProps {
  initialData?: WebhookConfig;
  onCancel: () => void;
  onSave: (config: WebhookConfig) => void;
}

const WebhookForm: React.FC<WebhookFormProps> = ({ initialData, onCancel, onSave }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [events, setEvents] = useState<string[]>(initialData?.events || ['pedido_criado']);
  const [enabled, setEnabled] = useState(initialData?.enabled ?? true);
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>(
    initialData?.headers 
      ? Object.entries(initialData.headers).map(([key, value]) => ({ key, value }))
      : [{ key: '', value: '' }]
  );
  const [maxRetries, setMaxRetries] = useState(initialData?.maxRetries || 3);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const isEditing = !!initialData;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !url) {
      toast.error('Por favor, preencha o nome e a URL do webhook');
      return;
    }
    
    if (events.length === 0) {
      toast.error('Selecione pelo menos um evento');
      return;
    }
    
    // Format headers
    const headersObject: Record<string, string> = {};
    headers.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) {
        headersObject[key.trim()] = value.trim();
      }
    });
    
    const webhookConfig: WebhookConfig = {
      id: initialData?.id || '',
      name,
      url,
      events: events as any[],
      enabled,
      headers: Object.keys(headersObject).length > 0 ? headersObject : undefined,
      maxRetries: maxRetries > 0 ? maxRetries : 3
    };
    
    onSave(webhookConfig);
  };
  
  const handleEventToggle = (event: string) => {
    if (events.includes(event)) {
      setEvents(events.filter(e => e !== event));
    } else {
      setEvents([...events, event]);
    }
  };
  
  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };
  
  const handleRemoveHeader = (index: number) => {
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    setHeaders(newHeaders);
  };
  
  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };
  
  const handleTestWebhook = async () => {
    if (!url) {
      toast.error('Por favor, informe a URL do webhook para testar');
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Format headers
      const headersObject: Record<string, string> = {};
      headers.forEach(({ key, value }) => {
        if (key.trim() && value.trim()) {
          headersObject[key.trim()] = value.trim();
        }
      });
      
      const webhookConfig: WebhookConfig = {
        id: initialData?.id || 'test',
        name: name || 'Teste',
        url,
        events: events as any[],
        enabled: true,
        headers: Object.keys(headersObject).length > 0 ? headersObject : undefined,
        maxRetries: 0 // Don't retry during test
      };
      
      const result = await testWebhook(webhookConfig);
      
      setTestResult({
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        toast.success('Webhook testado com sucesso');
      } else {
        toast.error(`Erro ao testar webhook: ${result.message}`);
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      setTestResult({
        success: false,
        message: 'Erro ao testar webhook'
      });
      toast.error('Erro ao testar webhook');
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Webhook' : 'Novo Webhook'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do webhook (ex: Sistema de CRM)"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL do Webhook</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://exemplo.com/api/webhook"
              required
            />
            <p className="text-sm text-muted-foreground">
              URL que receberá as notificações dos eventos
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Eventos</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="event-pedido_criado" 
                  checked={events.includes('pedido_criado')}
                  onCheckedChange={() => handleEventToggle('pedido_criado')}
                />
                <label htmlFor="event-pedido_criado" className="text-sm font-medium leading-none cursor-pointer">
                  Novo Pedido Criado
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="event-status_atualizado" 
                  checked={events.includes('status_atualizado')}
                  onCheckedChange={() => handleEventToggle('status_atualizado')}
                />
                <label htmlFor="event-status_atualizado" className="text-sm font-medium leading-none cursor-pointer">
                  Pedido Atualizado (mudança de status)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="event-pedido_cancelado" 
                  checked={events.includes('pedido_cancelado')}
                  onCheckedChange={() => handleEventToggle('pedido_cancelado')}
                />
                <label htmlFor="event-pedido_cancelado" className="text-sm font-medium leading-none cursor-pointer">
                  Pedido Cancelado
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Headers Personalizados</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddHeader}>
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
            
            {headers.map((header, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Nome do header"
                  value={header.key}
                  onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                  className="w-1/3"
                />
                <Input
                  placeholder="Valor"
                  value={header.value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveHeader(index)}
                  disabled={headers.length === 1 && index === 0 && !header.key && !header.value}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              Headers personalizados para autenticação ou outros parâmetros
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxRetries">Máximo de Tentativas</Label>
            <Input
              id="maxRetries"
              type="number"
              min="0"
              max="10"
              value={maxRetries}
              onChange={(e) => setMaxRetries(Number(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              Número máximo de tentativas caso a notificação falhe
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="enabled" 
              checked={enabled}
              onCheckedChange={(checked) => setEnabled(!!checked)}
            />
            <label htmlFor="enabled" className="text-sm font-medium leading-none cursor-pointer">
              Webhook ativo
            </label>
          </div>
          
          {testResult && (
            <div className={`p-3 rounded-md border flex items-start gap-2 ${
              testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              {testResult.success ? (
                <Check className={`h-5 w-5 text-green-500 mt-0.5`} />
              ) : (
                <AlertCircle className={`h-5 w-5 text-red-500 mt-0.5`} />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? 'Webhook testado com sucesso' : 'Erro no teste do webhook'}
                </p>
                <p className={`text-sm ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleTestWebhook}
              disabled={isTesting || !url}
            >
              {isTesting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                <>Testar Webhook</>
              )}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default WebhookForm;
