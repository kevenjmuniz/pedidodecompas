export interface WebhookConfig {
  url: string;
  id: string;
  name: string;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  enabled: boolean;
  maxRetries?: number;
}

export type WebhookEvent = 'pedido_criado' | 'status_atualizado' | 'pedido_cancelado' | 'conta_criada';

export interface WebhookPayload {
  evento: WebhookEvent;
  [key: string]: any;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  webhookUrl: string;
  payload: any;
  success: boolean;
  statusCode?: number;
  message: string;
  timestamp: string;
  retryCount: number;
  retryOf?: string;
}

export const sendWebhook = async (
  webhookConfig: WebhookConfig,
  payload: WebhookPayload,
  retryCount = 0,
  retryOf?: string
): Promise<WebhookLog> => {
  if (!webhookConfig.url) {
    console.warn('No webhook URL configured');
    return createWebhookLog(webhookConfig.id, '', payload, false, undefined, 'URL do webhook não configurada', retryCount, retryOf);
  }

  const logId = generateId();
  
  try {
    console.log(`Sending webhook to ${webhookConfig.url}`, payload);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...webhookConfig.headers,
    };
    
    const response = await fetch(webhookConfig.url, {
      method: 'POST',
      headers,
      mode: 'cors',
      body: JSON.stringify(payload),
      signal: controller.signal
    }).catch(error => {
      if (error.name === 'TypeError') {
        return fetch(webhookConfig.url, {
          method: 'POST',
          headers,
          mode: 'no-cors',
          body: JSON.stringify(payload),
          signal: controller.signal
        });
      }
      throw error;
    });
    
    clearTimeout(timeoutId);
    
    if (response.status && response.status >= 400) {
      console.error(`Webhook request failed with status: ${response.status}`);
      const log = createWebhookLog(
        webhookConfig.id, 
        webhookConfig.url, 
        payload, 
        false, 
        response.status, 
        `Erro na requisição: ${response.status} ${response.statusText || 'Not Found'}`, 
        retryCount,
        retryOf,
        logId
      );
      
      if (retryCount < (webhookConfig.maxRetries || 3)) {
        setTimeout(() => {
          sendWebhook(webhookConfig, payload, retryCount + 1, logId);
        }, getRetryDelay(retryCount));
      }
      
      return log;
    }
    
    console.log('Webhook sent successfully');
    return createWebhookLog(
      webhookConfig.id, 
      webhookConfig.url, 
      payload, 
      true, 
      response.status, 
      'Webhook enviado com sucesso', 
      retryCount,
      retryOf,
      logId
    );
  } catch (error: any) {
    console.error('Error sending webhook:', error);
    
    let errorMessage = 'Erro ao enviar webhook';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Tempo limite excedido ao tentar contatar o servidor';
    } else if (error.name === 'TypeError') {
      errorMessage = 'Erro de rede ou URL inválida';
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    const log = createWebhookLog(
      webhookConfig.id, 
      webhookConfig.url, 
      payload, 
      false, 
      undefined, 
      errorMessage, 
      retryCount,
      retryOf,
      logId
    );
    
    if (retryCount < (webhookConfig.maxRetries || 3)) {
      setTimeout(() => {
        sendWebhook(webhookConfig, payload, retryCount + 1, logId);
      }, getRetryDelay(retryCount));
    }
    
    return log;
  }
};

const getRetryDelay = (retryCount: number): number => {
  const jitter = Math.random() * 1000;
  return Math.min(Math.pow(2, retryCount) * 1000 + jitter, 30000);
};

const createWebhookLog = (
  webhookId: string,
  webhookUrl: string,
  payload: any,
  success: boolean,
  statusCode?: number,
  message: string = '',
  retryCount: number = 0,
  retryOf?: string,
  id?: string
): WebhookLog => {
  const log: WebhookLog = {
    id: id || generateId(),
    webhookId,
    webhookUrl,
    payload,
    success,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    retryCount,
    retryOf
  };
  
  saveWebhookLog(log);
  
  return log;
};

const saveWebhookLog = (log: WebhookLog): void => {
  try {
    const logs = getWebhookLogs();
    logs.unshift(log);
    
    const limitedLogs = logs.slice(0, 100);
    localStorage.setItem('webhookLogs', JSON.stringify(limitedLogs));
  } catch (error) {
    console.error('Failed to save webhook log:', error);
  }
};

export const getWebhookLogs = (): WebhookLog[] => {
  try {
    const logsJson = localStorage.getItem('webhookLogs');
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (error) {
    console.error('Failed to retrieve webhook logs:', error);
    return [];
  }
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const testWebhook = async (webhookConfig: WebhookConfig): Promise<WebhookLog> => {
  const testPayload: WebhookPayload = {
    evento: 'pedido_criado',
    teste: true,
    mensagem: 'Teste de configuração do webhook',
    timestamp: new Date().toISOString(),
  };
  
  return sendWebhook(webhookConfig, testPayload);
};

export const getWebhookConfigs = (): WebhookConfig[] => {
  try {
    const configsJson = localStorage.getItem('webhookConfigs');
    return configsJson ? JSON.parse(configsJson) : [];
  } catch (error) {
    console.error('Failed to retrieve webhook configs:', error);
    return [];
  }
};

export const saveWebhookConfigs = (configs: WebhookConfig[]): void => {
  try {
    localStorage.setItem('webhookConfigs', JSON.stringify(configs));
  } catch (error) {
    console.error('Failed to save webhook configs:', error);
  }
};

export const saveWebhookConfig = (config: WebhookConfig): WebhookConfig => {
  const configs = getWebhookConfigs();
  const index = configs.findIndex(c => c.id === config.id);
  
  if (index >= 0) {
    configs[index] = config;
  } else {
    configs.push(config);
  }
  
  saveWebhookConfigs(configs);
  return config;
};

export const deleteWebhookConfig = (id: string): void => {
  const configs = getWebhookConfigs();
  const filteredConfigs = configs.filter(c => c.id !== id);
  saveWebhookConfigs(filteredConfigs);
};

export const createOrderCreatedPayload = (order: any): WebhookPayload => {
  return {
    evento: 'pedido_criado',
    pedido_id: order.id,
    solicitante: order.createdByName,
    item: order.name,
    quantidade: order.quantity,
    status: order.status,
    departamento: order.department,
    motivo: order.reason,
    data_criacao: order.createdAt
  };
};

export const createOrderStatusUpdatedPayload = (
  order: any, 
  previousStatus: string, 
  updatedBy: string
): WebhookPayload => {
  return {
    evento: 'status_atualizado',
    pedido_id: order.id,
    status_anterior: previousStatus,
    status_novo: order.status,
    solicitante: order.createdByName,
    item: order.name,
    atualizado_por: updatedBy,
    data_atualizacao: order.updatedAt
  };
};

export const createOrderCanceledPayload = (order: any, canceledBy: string): WebhookPayload => {
  return {
    evento: 'pedido_cancelado',
    pedido_id: order.id,
    solicitante: order.createdByName,
    item: order.name,
    motivo_cancelamento: "Pedido cancelado pelo usuário",
    cancelado_por: canceledBy,
    data_cancelamento: new Date().toISOString()
  };
};

export const createAccountCreatedPayload = (user: any): WebhookPayload => {
  return {
    evento: 'conta_criada',
    usuario_id: user.id,
    nome: user.name,
    email: user.email,
    perfil: user.role,
    data_criacao: new Date().toISOString()
  };
};
