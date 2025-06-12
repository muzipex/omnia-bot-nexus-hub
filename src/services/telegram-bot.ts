
interface TelegramConfig {
  botToken: string;
  chatId: string;
  webhookUrl?: string;
}

interface TradingUpdate {
  type: 'trade_opened' | 'trade_closed' | 'account_update' | 'alert';
  symbol?: string;
  action?: string;
  profit?: number;
  balance?: number;
  message: string;
  timestamp: string;
}

export class TelegramBot {
  private config: TelegramConfig | null = null;

  setConfig(config: TelegramConfig) {
    this.config = config;
    localStorage.setItem('telegram_config', JSON.stringify(config));
  }

  getConfig(): TelegramConfig | null {
    if (this.config) return this.config;
    
    const stored = localStorage.getItem('telegram_config');
    if (stored) {
      this.config = JSON.parse(stored);
      return this.config;
    }
    
    return null;
  }

  async sendUpdate(update: TradingUpdate): Promise<boolean> {
    const config = this.getConfig();
    if (!config?.botToken || !config?.chatId) {
      console.log('Telegram not configured, skipping notification');
      return false;
    }

    const message = this.formatMessage(update);
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (response.ok) {
        console.log('Telegram notification sent successfully');
        return true;
      } else {
        console.error('Failed to send Telegram notification:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      return false;
    }
  }

  private formatMessage(update: TradingUpdate): string {
    const emoji = this.getEmoji(update.type);
    const timestamp = new Date(update.timestamp).toLocaleString();
    
    let message = `${emoji} <b>OMNIA BOT Update</b>\n\n`;
    message += `📊 <b>Type:</b> ${update.type.replace('_', ' ').toUpperCase()}\n`;
    message += `⏰ <b>Time:</b> ${timestamp}\n`;
    
    if (update.symbol) {
      message += `💱 <b>Symbol:</b> ${update.symbol}\n`;
    }
    
    if (update.action) {
      message += `🎯 <b>Action:</b> ${update.action}\n`;
    }
    
    if (update.profit !== undefined) {
      const profitEmoji = update.profit >= 0 ? '💰' : '📉';
      message += `${profitEmoji} <b>P&L:</b> $${update.profit.toFixed(2)}\n`;
    }
    
    if (update.balance !== undefined) {
      message += `💳 <b>Balance:</b> $${update.balance.toFixed(2)}\n`;
    }
    
    message += `\n📝 <b>Details:</b> ${update.message}`;
    
    return message;
  }

  private getEmoji(type: string): string {
    switch (type) {
      case 'trade_opened': return '🚀';
      case 'trade_closed': return '🎯';
      case 'account_update': return '📊';
      case 'alert': return '⚠️';
      default: return '📱';
    }
  }

  async testConnection(): Promise<boolean> {
    const config = this.getConfig();
    if (!config?.botToken) return false;

    try {
      const response = await fetch(`https://api.telegram.org/bot${config.botToken}/getMe`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const telegramBot = new TelegramBot();
