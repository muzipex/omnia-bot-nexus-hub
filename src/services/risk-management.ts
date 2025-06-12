
interface RiskParameters {
  max_daily_loss: number;
  max_position_size: number;
  max_concurrent_trades: number;
  risk_per_trade: number;
  correlation_limit: number;
}

interface PortfolioMetrics {
  total_exposure: number;
  daily_pnl: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  avg_trade_duration: number;
}

interface RiskAlert {
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  action_required: string;
  timestamp: string;
}

export class AdvancedRiskManager {
  private riskParams: RiskParameters = {
    max_daily_loss: 500,
    max_position_size: 1.0,
    max_concurrent_trades: 5,
    risk_per_trade: 0.02,
    correlation_limit: 0.7
  };

  private alerts: RiskAlert[] = [];

  async assessTradeRisk(
    symbol: string,
    volume: number,
    account_balance: number,
    open_positions: any[]
  ): Promise<{ approved: boolean; risk_score: number; warnings: string[] }> {
    const warnings: string[] = [];
    let risk_score = 0;

    // Position size risk
    const position_value = volume * 100000; // Assuming standard lot
    const account_exposure = position_value / account_balance;
    
    if (account_exposure > 0.1) {
      risk_score += 0.3;
      warnings.push('High position size relative to account balance');
    }

    // Correlation risk
    const correlation_risk = this.assessCorrelation(symbol, open_positions);
    if (correlation_risk > this.riskParams.correlation_limit) {
      risk_score += 0.2;
      warnings.push('High correlation with existing positions');
    }

    // Concurrent trades limit
    if (open_positions.length >= this.riskParams.max_concurrent_trades) {
      risk_score += 0.4;
      warnings.push('Maximum concurrent trades reached');
    }

    // Daily loss limit
    const daily_pnl = this.calculateDailyPnL(open_positions);
    if (daily_pnl < -this.riskParams.max_daily_loss) {
      risk_score += 0.5;
      warnings.push('Daily loss limit exceeded');
    }

    const approved = risk_score < 0.7 && warnings.length < 3;

    if (!approved) {
      this.addAlert({
        level: 'high',
        message: 'Trade rejected due to risk assessment',
        action_required: 'Review risk parameters or reduce position size',
        timestamp: new Date().toISOString()
      });
    }

    return { approved, risk_score, warnings };
  }

  async calculateOptimalPositionSize(
    symbol: string,
    entry_price: number,
    stop_loss: number,
    account_balance: number
  ): Promise<number> {
    const risk_amount = account_balance * this.riskParams.risk_per_trade;
    const pip_value = 10; // Simplified pip value
    const stop_distance = Math.abs(entry_price - stop_loss) * 10000; // Convert to pips
    
    const optimal_lots = risk_amount / (stop_distance * pip_value);
    
    return Math.min(optimal_lots, this.riskParams.max_position_size);
  }

  private assessCorrelation(symbol: string, positions: any[]): number {
    // Simplified correlation assessment
    const related_pairs = positions.filter(pos => 
      pos.symbol.includes(symbol.slice(0, 3)) || 
      pos.symbol.includes(symbol.slice(3, 6))
    );
    
    return related_pairs.length / Math.max(1, positions.length);
  }

  private calculateDailyPnL(positions: any[]): number {
    return positions.reduce((total, pos) => total + (pos.profit || 0), 0);
  }

  getPortfolioMetrics(positions: any[], account: any): PortfolioMetrics {
    const total_exposure = positions.reduce((sum, pos) => sum + (pos.volume || 0), 0);
    const daily_pnl = this.calculateDailyPnL(positions);
    
    return {
      total_exposure,
      daily_pnl,
      sharpe_ratio: 1.2 + Math.random() * 0.8, // Simulated
      max_drawdown: Math.random() * 0.15,
      win_rate: 0.65 + Math.random() * 0.2,
      avg_trade_duration: 4.5 + Math.random() * 3
    };
  }

  private addAlert(alert: RiskAlert) {
    this.alerts.unshift(alert);
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }
  }

  getAlerts(): RiskAlert[] {
    return this.alerts;
  }

  updateRiskParameters(params: Partial<RiskParameters>) {
    this.riskParams = { ...this.riskParams, ...params };
  }
}

export const riskManager = new AdvancedRiskManager();
