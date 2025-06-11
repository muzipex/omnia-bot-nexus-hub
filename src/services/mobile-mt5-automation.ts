
export interface MobileTradingBot {
  id: string;
  name: string;
  symbol: string;
  strategy: 'scalping' | 'swing' | 'trend_following';
  isActive: boolean;
  settings: {
    lotSize: number;
    stopLoss: number;
    takeProfit: number;
    maxTrades: number;
  };
}

export class MobileMT5AutomationService {
  private bots: MobileTradingBot[] = [];
  private intervals: Map<string, number> = new Map();
  private isRunning = false;

  async initializeService() {
    console.log('Web-based MT5 automation service initialized');
    await this.loadBots();
  }

  async addBot(bot: MobileTradingBot) {
    this.bots.push(bot);
    await this.saveBots();
    
    if (bot.isActive) {
      await this.startBotAutomation(bot.id);
    }
  }

  async removeBot(botId: string) {
    this.bots = this.bots.filter(bot => bot.id !== botId);
    this.stopBotInterval(botId);
    await this.saveBots();
  }

  async toggleBot(botId: string) {
    const bot = this.bots.find(b => b.id === botId);
    if (!bot) return;

    bot.isActive = !bot.isActive;
    await this.saveBots();

    if (bot.isActive) {
      await this.startBotAutomation(botId);
    } else {
      await this.stopBotAutomation(botId);
    }
  }

  private async startBotAutomation(botId: string) {
    const bot = this.bots.find(b => b.id === botId);
    if (!bot) return;

    // Show browser notification if supported
    this.showNotification('OMNIA Bot Active', `${bot.name} trading bot is now running on ${bot.symbol}`);

    // Start trading simulation
    this.simulateTrading(bot);
  }

  private async stopBotAutomation(botId: string) {
    const bot = this.bots.find(b => b.id === botId);
    if (!bot) return;

    this.stopBotInterval(botId);
    this.showNotification('OMNIA Bot Stopped', `${bot.name} trading bot has been stopped`);
  }

  private stopBotInterval(botId: string) {
    const intervalId = this.intervals.get(botId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(botId);
    }
  }

  private async executeTradeLogic(bot: MobileTradingBot) {
    console.log(`Executing trade logic for ${bot.name}`);
    
    // Simulate trade execution
    const tradeResult = await this.simulateTradeExecution(bot);
    
    if (tradeResult.success) {
      this.showNotification(
        `Trade Executed - ${bot.name}`,
        `${tradeResult.action} ${bot.settings.lotSize} lots ${bot.symbol} at ${tradeResult.price}`
      );
    }
  }

  private async simulateTradeExecution(bot: MobileTradingBot) {
    // Simulate market analysis and trade decision
    const shouldTrade = Math.random() > 0.7; // 30% chance to trade
    
    if (!shouldTrade) {
      return { success: false };
    }

    const action = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const price = 1.1000 + (Math.random() - 0.5) * 0.01; // Simulate EUR/USD price
    
    return {
      success: true,
      action,
      price: price.toFixed(5),
      volume: bot.settings.lotSize
    };
  }

  private simulateTrading(bot: MobileTradingBot) {
    // Clear any existing interval for this bot
    this.stopBotInterval(bot.id);

    // Set up new periodic trading simulation
    const intervalId = setInterval(async () => {
      if (!bot.isActive) {
        this.stopBotInterval(bot.id);
        return;
      }
      
      await this.executeTradeLogic(bot);
    }, 30000); // Execute every 30 seconds

    this.intervals.set(bot.id, intervalId);
  }

  private showNotification(title: string, body: string) {
    // Use browser notifications if supported
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body });
          }
        });
      }
    }
    
    // Also log to console
    console.log(`${title}: ${body}`);
  }

  private async saveBots() {
    localStorage.setItem('omnia-mobile-bots', JSON.stringify(this.bots));
  }

  async loadBots() {
    const savedBots = localStorage.getItem('omnia-mobile-bots');
    if (savedBots) {
      this.bots = JSON.parse(savedBots);
    }
    return this.bots;
  }

  getBots() {
    return this.bots;
  }

  async openMT5App() {
    // Open MT5 web trader in a new tab
    const mt5WebUrl = 'https://trade.mql5.com/trade';
    window.open(mt5WebUrl, '_blank');
  }
}

export const mobileMT5Service = new MobileMT5AutomationService();
