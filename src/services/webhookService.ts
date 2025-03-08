
/**
 * Send a webhook notification
 * @param webhookUrl The URL to send the webhook to
 * @param payload The data to send in the webhook
 * @returns A promise that resolves when the webhook is sent
 */
export const sendWebhook = async (webhookUrl: string, payload: any): Promise<{success: boolean, message: string}> => {
  if (!webhookUrl) {
    console.warn('No webhook URL configured');
    return { 
      success: false, 
      message: 'URL do webhook não configurada'
    };
  }

  try {
    console.log(`Sending webhook to ${webhookUrl}`, payload);
    
    // Use fetch with a timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Try with standard CORS first
      body: JSON.stringify(payload),
      signal: controller.signal
    }).catch(error => {
      // If we get a CORS error, try again with no-cors mode
      if (error.name === 'TypeError') {
        return fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'no-cors',
          body: JSON.stringify(payload),
          signal: controller.signal
        });
      }
      throw error;
    });
    
    clearTimeout(timeoutId);
    
    // Check for response status if available
    if (response.status && response.status >= 400) {
      console.error(`Webhook request failed with status: ${response.status}`);
      return { 
        success: false, 
        message: `Erro na requisição: ${response.status} ${response.statusText || 'Not Found'}`
      };
    }
    
    console.log('Webhook sent successfully');
    return { 
      success: true, 
      message: 'Webhook enviado com sucesso'
    };
  } catch (error: any) {
    console.error('Error sending webhook:', error);
    
    let errorMessage = 'Erro ao enviar webhook';
    
    // Provide more specific error messages
    if (error.name === 'AbortError') {
      errorMessage = 'Tempo limite excedido ao tentar contatar o servidor';
    } else if (error.name === 'TypeError') {
      errorMessage = 'Erro de rede ou URL inválida';
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    return { 
      success: false, 
      message: errorMessage
    };
  }
};
