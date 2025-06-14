import { MarketData } from "@/hooks/use-mt5-connection";

export interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  close: number;
  timestamp: Date;
}

export type SignalType = 'BUY' | 'SELL' | 'HOLD';

export interface TradingSignal {
  symbol: string;
  signal: SignalType;
  confidence: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  timestamp: Date;
  reasoning: string;
}

class AITradingEngine {
  constructor() {
    // Initialize any necessary resources here
  }

  public async generateTradingSignals(marketData: MarketData[]): Promise<TradingSignal[]> {
    return this.analyzeMarketConditions(marketData);
  }

  private async analyzeMarketConditions(marketData: MarketData[]): Promise<TradingSignal[]> {
    const signals: TradingSignal[] = [];
    
    for (const data of marketData) {
      const signal = await this.generateSignal(data);
      if (signal.signal !== 'HOLD') {
        signals.push(signal);
      }
    }
    
    return signals;
  }

  private async generateSignal(marketData: MarketData): Promise<TradingSignal> {
    // Perform technical analysis to generate trading signals
    const rsi = this.calculateRSI([marketData.close], 14);
    const macd = this.calculateMACD([marketData.close], 12, 26, 9);
    const macdSignal = macd.macd - macd.signal;
    
    let signal: SignalType = 'HOLD';
    let confidence = 0.5;
    
    // Generate trading signal based on technical indicators
    if (rsi < 30 && macdSignal > 0) {
      signal = 'BUY';
      confidence = 0.75;
    } else if (rsi > 70 && macdSignal < 0) {
      signal = 'SELL';
      confidence = 0.75;
    } else if (rsi < 40 && macdSignal > 0) {
      signal = 'BUY';
      confidence = 0.6;
    } else if (rsi > 60 && macdSignal < 0) {
      signal = 'SELL';
      confidence = 0.6;
    }

    return {
      symbol: marketData.symbol,
      signal,
      confidence,
      entry_price: marketData.bid,
      stop_loss: signal === 'BUY' ? marketData.bid * 0.99 : marketData.ask * 1.01,
      take_profit: signal === 'BUY' ? marketData.bid * 1.02 : marketData.ask * 0.98,
      timestamp: new Date(),
      reasoning: `RSI: ${rsi.toFixed(2)}, MACD Signal: ${macdSignal > 0 ? 'Bullish' : 'Bearish'}`
    };
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    let gains: number[] = [];
    let losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains.push(change);
        losses.push(0);
      } else {
        losses.push(Math.abs(change));
        gains.push(0);
      }
    }

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(prices: number[], shortPeriod: number = 12, longPeriod: number = 26, signalPeriod: number = 9): { macd: number, signal: number } {
    const emaShort = this.calculateEMA(prices, shortPeriod);
    const emaLong = this.calculateEMA(prices, longPeriod);
    const macdValues: number[] = [];

    for (let i = 0; i < prices.length; i++) {
      macdValues[i] = emaShort[i] - emaLong[i];
    }

    const signal = this.calculateEMA(macdValues, signalPeriod);

    return {
      macd: macdValues[prices.length - 1],
      signal: signal[prices.length - 1]
    };
  }

  private calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = new Array(prices.length).fill(0);
    const k = 2 / (period + 1);

    ema[period - 1] = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < prices.length; i++) {
      ema[i] = prices[i] * k + ema[i - 1] * (1 - k);
    }

    return ema;
  }
}

const aiTradingEngine = new AITradingEngine();
export default aiTradingEngine;
