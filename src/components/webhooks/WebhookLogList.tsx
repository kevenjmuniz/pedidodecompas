
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WebhookLog } from '@/services/webhookService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface WebhookLogListProps {
  logs: WebhookLog[];
  onRefresh: () => void;
  isLoading?: boolean;
}

const WebhookLogList: React.FC<WebhookLogListProps> = ({ 
  logs, 
  onRefresh,
  isLoading = false
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  const getEventoDisplay = (evento: string) => {
    switch (evento) {
      case 'pedido_criado': return 'Novo pedido criado';
      case 'status_atualizado': return 'Status de pedido atualizado';
      case 'pedido_cancelado': return 'Pedido cancelado';
      default: return evento;
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Log de Notificações</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Nenhum log de webhook encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Collapsible key={log.id} className="border rounded-md">
                <div className="px-4 py-3 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {log.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    
                    <div>
                      <div className="font-medium">
                        {log.payload.evento && (
                          <span className="mr-2">
                            {getEventoDisplay(log.payload.evento)}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        {log.webhookUrl.length > 60 
                          ? log.webhookUrl.substring(0, 60) + '...'
                          : log.webhookUrl
                        }
                      </div>
                      
                      <div className="text-sm mt-1">
                        {log.success ? (
                          <span className="text-green-600">
                            {log.message || 'Enviado com sucesso'}
                          </span>
                        ) : (
                          <span className="text-red-600">
                            {log.message || 'Falha no envio'}
                          </span>
                        )}
                        
                        {log.retryCount > 0 && (
                          <span className="ml-2 text-amber-600">
                            (Tentativa {log.retryCount})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent>
                  <div className="px-4 py-3 border-t bg-gray-50">
                    <h4 className="text-sm font-medium mb-2">Payload</h4>
                    <pre className="text-xs bg-black text-white p-3 rounded overflow-auto max-h-60">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                    
                    {log.statusCode && (
                      <div className="text-sm mt-3">
                        <span className="font-medium">Status code:</span> {log.statusCode}
                      </div>
                    )}
                    
                    {log.retryOf && (
                      <div className="text-sm mt-1 text-amber-600">
                        Essa é uma retentativa de uma notificação anterior
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookLogList;
