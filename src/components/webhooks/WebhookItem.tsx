
import React from 'react';
import { WebhookConfig } from '../../services/webhookService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, Send, ArrowRight } from 'lucide-react';

interface WebhookItemProps {
  webhook: WebhookConfig;
  onEdit: (webhook: WebhookConfig) => void;
  onDelete: (id: string) => void;
  onTest: (webhook: WebhookConfig) => void;
  isTesting: boolean;
}

const WebhookItem: React.FC<WebhookItemProps> = ({ 
  webhook, 
  onEdit, 
  onDelete, 
  onTest,
  isTesting 
}) => {
  const eventLabels: Record<string, string> = {
    'pedido_criado': 'Pedido Criado',
    'status_atualizado': 'Status Atualizado',
    'pedido_cancelado': 'Pedido Cancelado',
    'conta_criada': 'Conta Criada'
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-left">{webhook.name}</CardTitle>
          <Switch 
            checked={webhook.enabled}
            onCheckedChange={(checked) => {
              onEdit({
                ...webhook,
                enabled: checked
              });
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-left">
            <p className="text-sm font-medium text-muted-foreground mb-1">URL</p>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm truncate">{webhook.url}</p>
            </div>
          </div>
          
          <div className="text-left">
            <p className="text-sm font-medium text-muted-foreground mb-1">Eventos</p>
            <div className="flex flex-wrap gap-2">
              {webhook.events.map(event => (
                <Badge key={event} variant="outline">
                  {eventLabels[event] || event}
                </Badge>
              ))}
            </div>
          </div>
          
          {Object.keys(webhook.headers || {}).length > 0 && (
            <div className="text-left">
              <p className="text-sm font-medium text-muted-foreground mb-1">Headers</p>
              <div className="text-xs space-y-1 border rounded-md p-2">
                {Object.entries(webhook.headers || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="font-medium">{key}:</span> 
                    <span className="truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(webhook.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remover
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onTest(webhook)}
              disabled={isTesting}
            >
              <Send className={`h-4 w-4 mr-1 ${isTesting ? 'animate-pulse' : ''}`} />
              {isTesting ? 'Testando...' : 'Testar'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(webhook)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WebhookItem;
