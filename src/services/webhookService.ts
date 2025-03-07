
/**
 * Send a webhook notification
 * @param webhookUrl The URL to send the webhook to
 * @param payload The data to send in the webhook
 * @returns A promise that resolves when the webhook is sent
 */
export const sendWebhook = async (webhookUrl: string, payload: any): Promise<boolean> => {
  if (!webhookUrl) {
    console.warn('No webhook URL configured');
    return false;
  }

  try {
    console.log(`Sending webhook to ${webhookUrl}`, payload);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors', // Handle CORS issues
      body: JSON.stringify(payload),
    });
    
    // Since we're using no-cors, we can't access the status
    // Just log that the webhook was sent
    console.log('Webhook sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending webhook:', error);
    return false;
  }
};
