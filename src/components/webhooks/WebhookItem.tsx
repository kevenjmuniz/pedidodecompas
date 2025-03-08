
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit2, 
  Trash2, 
  ExternalLink, 
  AlertTriangle,
  Check,
  FileText,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { WebhookConfig } from '@/services/webhookService';

interface WebhookItemProps {
  webhook: WebhookConfig;
  onEdit: (webhook: WebhookConfig) => void;
  onDelete: (id: string) => void;
  onTest: (webhook: WebhookConfig) => void;
  isTesting?: boolean;
}

const WebhookItem: React.FC<WebhookItemProps> = ({ 
  webhook, 
  onEdit, 
  onDelete,
  onTest,
  isTesting = false
}) => {
  const eventLabels: Record<string, string> = {
    'pedido_criado': 'Novo Pedido',
    'status_atualizado': 'Status Atualizado',
    'pedido_cancelado': 'Pedido Cancelado'
  };
  
  return (
    <Card className={`mb-4 ${!webhook.enabled ? 'opacity-70' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{webhook.name}</h3>
              {webhook.enabled ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" /> Ativo
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                  Inativo
                </Badge>
              )}
            </div>
            <a 
              href={webhook.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center mt-1"
            >
              {webhook.url.length > 50 ? webhook.url.substring(0, 50) + '...' : webhook.url}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Eventos configurados:</h4>
          <div className="flex flex-wrap gap-2">
            {webhook.events.map(event => (
              <Badge key={event} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                {eventLabels[event] || event}
              </Badge>
            ))}
            
            {webhook.events.length === 0 && (
              <Badge variant="outline" className="bg-gray-50 text-gray-500">
                <AlertTriangle className="h-3 w-3 mr-1" /> Nenhum evento configurado
              </Badge>
            )}
          </div>
        </div>
        
        {webhook.headers && Object.keys(webhook.headers).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Headers personalizados:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.keys(webhook.headers).map(key => (
                <Badge key={key} variant="outline" className="bg-gray-50">
                  {key}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {webhook.maxRetries !== undefined && (
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium">Máx. tentativas:</span> {webhook.maxRetries}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2 pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onTest(webhook)}
          disabled={isTesting}
        >
          {isTesting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <>Testar</>
          )}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(webhook)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(webhook.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WebhookItem;
