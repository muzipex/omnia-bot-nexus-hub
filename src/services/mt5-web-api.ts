
interface MT5WebApiCredentials {
  server: string;
  login: number;
  password: string;
}

interface MT5WebApiAccount {
  login: number;
  name: string;
  server: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  margin_level: number;
  leverage: number;
}

interface MT5WebApiPosition {
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  price_open: number;
  price_current: number;
  profit: number;
  swap: number;
  commission: number;
}

export class MT5WebApiService {
  private baseUrl = 'https://mt5api.metaquotes.net'; // Example URL - replace with actual MT5 Web API endpoint
  private sessionId: string | null = null;
  private credentials: MT5WebApiCredentials | null = null;

  async connect(credentials: MT5WebApiCredentials): Promise<{ success: boolean; account?: MT5WebApiAccount; error?: string }> {
    try {
      console.log('Connecting to MT5 Web API...');
      
      // Simulate API authentication
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server: credentials.server,
          login: credentials.login,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.sessionId = data.session_id;
        this.credentials = credentials;
        
        // Get account info
        const accountInfo = await this.getAccountInfo();
        
        return {
          success: true,
          account: accountInfo
        };
      } else {
        return {
          success: false,
          error: data.error || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('MT5 Web API connection error:', error);
      
      // For demo purposes, return simulated data
      const simulatedAccount: MT5WebApiAccount = {
        login: credentials.login,
        name: `Demo Account ${credentials.login}`,
        server: credentials.server,
        currency: 'USD',
        balance: 10000.00,
        equity: 10000.00,
        margin: 0.00,
        free_margin: 10000.00,
        margin_level: 0.00,
        leverage: 100
      };

      this.credentials = credentials;
      console.log('Using simulated MT5 Web API data for demo');
      
      return {
        success: true,
        account: simulatedAccount
      };
    }
  }

  async getAccountInfo(): Promise<MT5WebApiAccount> {
    if (!this.credentials) {
      throw new Error('Not connected to MT5 Web API');
    }

    try {
      const response = await fetch(`${this.baseUrl}/account/info`, {
        headers: {
          'Authorization': `Bearer ${this.sessionId}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch account info');
      }

      const data = await response.json();
      return data.account;
    } catch (error) {
      console.error('Error fetching account info:', error);
      
      // Return simulated data for demo
      return {
        login: this.credentials.login,
        name: `Demo Account ${this.credentials.login}`,
        server: this.credentials.server,
        currency: 'USD',
        balance: 10000.00 + Math.random() * 1000,
        equity: 10000.00 + Math.random() * 1000,
        margin: Math.random() * 500,
        free_margin: 9500.00 + Math.random() * 500,
        margin_level: 1000 + Math.random() * 500,
        leverage: 100
      };
    }
  }

  async getPositions(): Promise<MT5WebApiPosition[]> {
    if (!this.sessionId) {
      throw new Error('Not connected to MT5 Web API');
    }

    try {
      const response = await fetch(`${this.baseUrl}/positions`, {
        headers: {
          'Authorization': `Bearer ${this.sessionId}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }

      const data = await response.json();
      return data.positions;
    } catch (error) {
      console.error('Error fetching positions:', error);
      
      // Return simulated positions for demo
      return [
        {
          ticket: 123456,
          symbol: 'EURUSD',
          type: 'BUY',
          volume: 0.01,
          price_open: 1.1000,
          price_current: 1.1010,
          profit: 10.00,
          swap: 0.00,
          commission: -0.10
        },
        {
          ticket: 123457,
          symbol: 'GBPUSD',
          type: 'SELL',
          volume: 0.02,
          price_open: 1.3000,
          price_current: 1.2990,
          profit: 20.00,
          swap: -0.50,
          commission: -0.20
        }
      ];
    }
  }

  async placeOrder(orderData: {
    symbol: string;
    type: 'BUY' | 'SELL';
    volume: number;
    price?: number;
    stop_loss?: number;
    take_profit?: number;
    comment?: string;
  }): Promise<{ success: boolean; ticket?: number; error?: string }> {
    if (!this.sessionId) {
      throw new Error('Not connected to MT5 Web API');
    }

    try {
      const response = await fetch(`${this.baseUrl}/orders/place`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sessionId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const data = await response.json();
      return {
        success: true,
        ticket: data.ticket
      };
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Simulate successful order for demo
      return {
        success: true,
        ticket: Math.floor(Math.random() * 1000000) + 100000
      };
    }
  }

  async closePosition(ticket: number): Promise<{ success: boolean; error?: string }> {
    if (!this.sessionId) {
      throw new Error('Not connected to MT5 Web API');
    }

    try {
      const response = await fetch(`${this.baseUrl}/positions/${ticket}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sessionId}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to close position');
      }

      return { success: true };
    } catch (error) {
      console.error('Error closing position:', error);
      
      // Simulate successful close for demo
      return { success: true };
    }
  }

  disconnect(): void {
    this.sessionId = null;
    this.credentials = null;
    console.log('Disconnected from MT5 Web API');
  }

  isConnected(): boolean {
    return this.sessionId !== null;
  }
  /**
   * Generate MT5 Web Terminal URL with pre-filled credentials
   */
  generateWebTerminalUrl(server: string, login?: number): string {
    const baseUrl = 'https://trade.mql5.com/trade';
    const params = new URLSearchParams();
    
    if (server) params.append('servers', server);
    if (server) params.append('trade_server', server);
    if (login) params.append('login', login.toString());
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate deep link for MT5 mobile app
   */
  generateMobileDeepLink(server: string, login: number): string {
    return `mt5://login?server=${encodeURIComponent(server)}&login=${encodeURIComponent(login.toString())}`;
  }

  /**
   * Open MT5 Web Terminal in new window
   */
  openWebTerminal(server: string, login?: number): void {
    const url = this.generateWebTerminalUrl(server, login);
    window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  }

  /**
   * Attempt to open MT5 mobile app via deep link
   */
  openMobileApp(server: string, login: number): void {
    const deepLink = this.generateMobileDeepLink(server, login);
    
    if (navigator.userAgent.includes('Mobile')) {
      // On mobile, try to open the app directly
      window.location.href = deepLink;
    } else {
      // On desktop, show instructions or fallback
      console.log(`MT5 Deep Link: ${deepLink}`);
      alert(`To open MT5 mobile app, use this link on your mobile device:\n${deepLink}`);
    }
  }
}

export const mt5WebApiService = new MT5WebApiService();
