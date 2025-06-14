
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Shield, AlertTriangle, Target, Zap } from 'lucide-react';
import aiTradingEngine from '@/services/ai-trading-engine';
import { riskManager } from '@/services/risk-management';
import { toast } from '@/hooks/use-toast';

const AITradingDashboard = () => {
  const [aiSignals, setAiSignals] = useState<any[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<any>(null);
  const [isAIActive, setIsAIActive] = useState(false);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [sentiment, setSentiment] = useState<any>(null);

  useEffect(() => {
    loadAIData();
    const interval = setInterval(loadAIData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAIData = async () => {
    try {
      // Generate AI signals for major pairs
      const symbols = ['EURUSD', 'GBPUSD', 'USDJPY'];
      const signals = await Promise.all(
        symbols.map(symbol => aiTradingEngine.analyzeMarket(symbol))
      );
      
      setAiSignals(signals);
      setPatterns(aiTradingEngine.getPatterns());
      setSentiment(aiTradingEngine.getSentiment());
      
      // Mock portfolio metrics
      setRiskMetrics(riskManager.getPortfolioMetrics([], {}));
    } catch (error) {
      console.error('Error loading AI data:', error);
    }
  };

  const toggleAITrading = () => {
    setIsAIActive(!isAIActive);
    toast({
      title: isAIActive ? "AI Trading Disabled" : "AI Trading Enabled",
      description: isAIActive ? "Manual trading mode activated" : "AI will now assist with trading decisions",
    });
  };

  const executeAISignal = async (signal: any) => {
    toast({
      title: "AI Signal Executed",
      description: `${signal.action} ${signal.symbol} based on AI analysis`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-tech-blue" />
          <div>
            <h2 className="text-2xl font-bold text-white">AI Trading Engine</h2>
            <p className="text-gray-400">Next-generation AI-powered trading decisions</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={isAIActive ? "default" : "secondary"} className="bg-tech-blue">
            <Zap className="w-3 h-3 mr-1" />
            {isAIActive ? 'AI Active' : 'AI Standby'}
          </Badge>
          <Button 
            onClick={toggleAITrading}
            className={isAIActive ? "bg-red-600 hover:bg-red-700" : "bg-tech-blue hover:bg-tech-blue/80"}
          >
            {isAIActive ? 'Disable AI' : 'Enable AI'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border border-gray-700">
          <TabsTrigger value="signals" className="data-[state=active]:bg-cyan-600">AI Signals</TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-cyan-600">Patterns</TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:bg-cyan-600">Sentiment</TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-cyan-600">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="signals">
          <div className="grid gap-4">
            {aiSignals.map((signal, index) => (
              <Card key={index} className="bg-tech-charcoal border-tech-blue/30">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      {signal.symbol}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      AI Confidence: {(signal.confidence * 100).toFixed(1)}%
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={signal.action === 'BUY' ? "default" : signal.action === 'SELL' ? "destructive" : "secondary"}>
                      {signal.action}
                    </Badge>
                    <Button
                      onClick={() => executeAISignal(signal)}
                      disabled={!isAIActive}
                      size="sm"
                      className="bg-tech-blue hover:bg-tech-blue/80"
                    >
                      Execute
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Entry Price</p>
                      <p className="text-white font-mono">{signal.entry_price.toFixed(5)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Stop Loss</p>
                      <p className="text-red-400 font-mono">{signal.stop_loss.toFixed(5)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Take Profit</p>
                      <p className="text-green-400 font-mono">{signal.take_profit.toFixed(5)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">AI Reasoning:</p>
                    <ul className="space-y-1">
                      {signal.reasoning.map((reason: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-tech-blue rounded-full" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Confidence Level</span>
                      <span>{(signal.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={signal.confidence * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns">
          <div className="grid gap-4">
            {patterns.map((pattern, index) => (
              <Card key={index} className="bg-tech-charcoal border-tech-blue/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {pattern.pattern_name}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {pattern.pattern_type} pattern detected
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Confidence</p>
                      <p className="text-white">{(pattern.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Historical Accuracy</p>
                      <p className="text-white">{(pattern.historical_accuracy * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sentiment">
          {sentiment && (
            <Card className="bg-tech-charcoal border-tech-blue/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Market Sentiment Analysis
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AI-powered news and social sentiment analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Overall Sentiment</span>
                  <Badge variant={sentiment.overall === 'bullish' ? "default" : sentiment.overall === 'bearish' ? "destructive" : "secondary"}>
                    {sentiment.overall.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Confidence</span>
                    <span>{(sentiment.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={sentiment.confidence * 100} className="h-2" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Key Factors:</p>
                  <ul className="space-y-1">
                    {sentiment.factors.map((factor: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-tech-green rounded-full" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="risk">
          {riskMetrics && (
            <div className="grid gap-4">
              <Card className="bg-tech-charcoal border-tech-blue/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Portfolio Risk Metrics
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Advanced risk management analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Sharpe Ratio</p>
                      <p className="text-white font-semibold">{riskMetrics.sharpe_ratio.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Max Drawdown</p>
                      <p className="text-red-400 font-semibold">{(riskMetrics.max_drawdown * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Win Rate</p>
                      <p className="text-green-400 font-semibold">{(riskMetrics.win_rate * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Daily P&L</p>
                      <p className={`font-semibold ${riskMetrics.daily_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${riskMetrics.daily_pnl.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Exposure</p>
                      <p className="text-white font-semibold">{riskMetrics.total_exposure.toFixed(2)} lots</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Avg Trade Duration</p>
                      <p className="text-white font-semibold">{riskMetrics.avg_trade_duration.toFixed(1)}h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-tech-charcoal border-tech-blue/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {riskManager.getAlerts().length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No risk alerts at this time</p>
                    ) : (
                      riskManager.getAlerts().slice(0, 5).map((alert, index) => (
                        <div key={index} className={`p-3 rounded border-l-4 ${
                          alert.level === 'critical' ? 'border-red-500 bg-red-500/10' :
                          alert.level === 'high' ? 'border-orange-500 bg-orange-500/10' :
                          alert.level === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                          'border-blue-500 bg-blue-500/10'
                        }`}>
                          <p className="text-white font-medium">{alert.message}</p>
                          <p className="text-gray-400 text-sm">{alert.action_required}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AITradingDashboard;
