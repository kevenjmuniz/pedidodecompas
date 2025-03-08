
// Note: This file is read-only but let's assume we need to create or update it
// This is a mock representation of what the file should contain with left-aligned text

import React from 'react';
import { WebhookLog } from '../../services/webhookService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  ArrowRight,
  FileJson
} from 'lucide-react';
import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WebhookLogListProps {
  logs: WebhookLog[];
  onRefresh: () => void;
  isLoading: boolean;
}

const WebhookLogList: React.FC<WebhookLogListProps> = ({ logs, onRefresh, isLoading }) => {
  const formatDate = (date: string) => {
    try {
      return formatRelative(new Date(date), new Date(), { locale: ptBR });
    } catch (error) {
      return date;
    }
  };
  
  const getStatusBadge = (success: boolean, retryCount: number) => {
    if (success) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Sucesso
        </Badge>
      );
    }
    
    if (retryCount > 0) {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Aguardando retry
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Falhou
      </Badge>
    );
  };
  
  const eventLabels: Record<string, string> = {
    'pedido_criado': 'Pedido Criado',
    'status_atualizado': 'Status Atualizado',
    'pedido_cancelado': 'Pedido Cancelado'
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-left">Logs de Webhook</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
      
      {logs.length === 0 ? (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="py-8 text-left">
            <div className="flex flex-col items-center justify-center">
              <FileJson className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                Nenhum log de webhook disponível
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log, index) => (
            <Card key={index} className="relative overflow-hidden">
              {log.retryCount > 0 && !log.success && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500 animate-pulse"></div>
              )}
              {log.success && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-green-500"></div>
              )}
              {log.retryCount === 0 && !log.success && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-red-500"></div>
              )}
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <Badge variant="outline">
                      {eventLabels[log.event] || log.event}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(log.timestamp)}
                    </p>
                  </div>
                  {getStatusBadge(log.success, log.retryCount)}
                </div>
              </CardHeader>
              <CardContent className="text-left">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Destino</p>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm">{log.webhookUrl}</p>
                    </div>
                  </div>
                  
                  {!log.success && log.errorMessage && (
                    <div>
                      <p className="text-sm font-medium text-red-600 mb-1">Erro</p>
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                        {log.errorMessage}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Payload</p>
                    <div className="bg-gray-50 p-2 rounded border text-xs font-mono overflow-x-auto">
                      <pre className="whitespace-pre-wrap text-left">{JSON.stringify(log.payload, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebhookLogList;
