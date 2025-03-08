
import React, { useState } from 'react';
import { WebhookConfig, WebhookEvent } from '../../services/webhookService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface WebhookFormProps {
  initialData?: WebhookConfig;
  onSave: (data: WebhookConfig) => void;
  onCancel: () => void;
}

const WebhookForm: React.FC<WebhookFormProps> = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [enabled, setEnabled] = useState(initialData?.enabled !== false);
  const [events, setEvents] = useState<WebhookEvent[]>(initialData?.events || ['pedido_criado']);
  const [headers, setHeaders] = useState<Record<string, string>>(
    initialData?.headers || {}
  );

  // Header management
  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');
  
  const handleAddHeader = () => {
    if (!headerKey.trim()) return;
    
    setHeaders({
      ...headers,
      [headerKey]: headerValue
    });
    
    setHeaderKey('');
    setHeaderValue('');
  };
  
  const handleRemoveHeader = (key: string) => {
    const newHeaders = { ...headers };
    delete newHeaders[key];
    setHeaders(newHeaders);
  };
  
  const toggleEvent = (event: WebhookEvent) => {
    if (events.includes(event)) {
      setEvents(events.filter(e => e !== event));
    } else {
      setEvents([...events, event]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      id: initialData?.id || '',
      name,
      url,
      enabled,
      events,
      headers,
      maxRetries: initialData?.maxRetries || 3
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-left">{initialData ? 'Editar Webhook' : 'Adicionar Webhook'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-left block">Nome do Webhook</Label>
            <Input
              id="name"
              placeholder="Ex: Notificação de Pedidos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url" className="text-left block">URL do Webhook</Label>
            <Input
              id="url"
              placeholder="https://exemplo.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground text-left">
              Este endereço receberá notificações dos eventos selecionados abaixo.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-left block mb-2">Eventos para notificar</Label>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="event-new-order" 
                  checked={events.includes('pedido_criado')}
                  onCheckedChange={() => toggleEvent('pedido_criado')}
                />
                <Label htmlFor="event-new-order" className="text-left">Novo Pedido Criado</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="event-status-updated" 
                  checked={events.includes('status_atualizado')}
                  onCheckedChange={() => toggleEvent('status_atualizado')}
                />
                <Label htmlFor="event-status-updated" className="text-left">Status do Pedido Atualizado</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="event-order-canceled" 
                  checked={events.includes('pedido_cancelado')}
                  onCheckedChange={() => toggleEvent('pedido_cancelado')}
                />
                <Label htmlFor="event-order-canceled" className="text-left">Pedido Cancelado</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox 
                  id="event-account-created" 
                  checked={events.includes('conta_criada')}
                  onCheckedChange={() => toggleEvent('conta_criada')}
                />
                <Label htmlFor="event-account-created" className="text-left">Nova Conta Criada</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 border-t pt-4">
            <Label className="text-left block mb-2">Headers Personalizados</Label>
            
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <Input
                  placeholder="Nome do Header"
                  value={headerKey}
                  onChange={(e) => setHeaderKey(e.target.value)}
                />
              </div>
              <div className="col-span-5">
                <Input
                  placeholder="Valor"
                  value={headerValue}
                  onChange={(e) => setHeaderValue(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleAddHeader}
                  className="w-full"
                >
                  Adicionar
                </Button>
              </div>
            </div>
            
            {Object.keys(headers).length > 0 && (
              <div className="border rounded-md p-2 mt-2 text-left">
                <p className="text-sm font-medium mb-2">Headers Configurados:</p>
                <div className="space-y-1">
                  {Object.entries(headers).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveHeader(key)}
                        className="h-6 w-6 p-0"
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="webhook-enabled" className="text-left">Webhook Ativo</Label>
            <Switch 
              id="webhook-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default WebhookForm;
