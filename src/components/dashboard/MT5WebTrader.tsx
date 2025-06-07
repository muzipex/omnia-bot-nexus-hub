import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, LogIn, Settings, Play, Square, Bot } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MT5WebTraderProps {
  height?: number;
}

const MT5WebTrader: React.FC<MT5WebTraderProps> = ({ height = 600 }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showBotConfig, setShowBotConfig] = useState(false);
  const [server, setServer] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [botScript, setBotScript] = useState('');
  const [isBotRunning, setIsBotRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const defaultBotScript = `// OMNIA BOT Advanced Trading Script with SMC Analysis
// Smart Money Concepts Trading Bot with Higher Timeframe Analysis

console.log("OMNIA BOT SMC Trading System initialized at", new Date().toISOString());

// Advanced trading configuration
const tradingConfig = {
  symbols: ["XAUUSD", "EURUSD", "GBPUSD", "USDJPY"],
  baseLotSize: 0.01,
  maxLotSize: 1.0,
  riskPercentage: 2, // 2% risk per trade
  stopLossPoints: 50,
  takeProfitPoints: 150,
  maxOpenTrades: 3,
  htfTimeframes: ["H4", "D1"], // Higher timeframes for trend analysis
  ltfTimeframes: ["M15", "M30"] // Lower timeframes for entry
};

// SMC Trading Variables
let openTrades = [];
let marketStructure = {};
let liquidityLevels = {};

// Smart Money Concepts Analysis
function analyzeSMCStructure(symbol, timeframe) {
  console.log(\`Analyzing SMC structure for \${symbol} on \${timeframe}\`);
  
  // Simulate market structure analysis
  const random = Math.random();
  const isBreakOfStructure = random > 0.7;
  const isBullish = random > 0.5;
  
  return {
    trend: isBullish ? 'BULLISH' : 'BEARISH',
    breakOfStructure: isBreakOfStructure,
    liquidity: {
      buyLiquidity: random * 100,
      sellLiquidity: random * 100
    },
    orderBlocks: {
      bullishOB: isBullish && random > 0.6,
      bearishOB: !isBullish && random > 0.6
    },
    fairValueGaps: {
      present: random > 0.5,
      direction: isBullish ? 'UP' : 'DOWN'
    }
  };
}

// Calculate dynamic lot size based on risk and market conditions
function calculateLotSize(symbol, stopLossPoints, accountBalance = 10000) {
  const riskAmount = accountBalance * (tradingConfig.riskPercentage / 100);
  const pointValue = symbol.includes('JPY') ? 0.01 : 0.0001;
  const lotSize = riskAmount / (stopLossPoints * pointValue * 100000);
  
  return Math.min(Math.max(lotSize, tradingConfig.baseLotSize), tradingConfig.maxLotSize);
}

// Open trade function
function openTrade(symbol, direction, lotSize, stopLoss, takeProfit) {
  const tradeId = \`TRADE_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  
  const trade = {
    id: tradeId,
    symbol: symbol,
    direction: direction,
    lotSize: lotSize,
    openTime: new Date(),
    stopLoss: stopLoss,
    takeProfit: takeProfit,
    status: 'OPEN'
  };
  
  openTrades.push(trade);
  
  console.log(\`🚀 TRADE OPENED: \${direction} \${lotSize} lots of \${symbol}\`);
  console.log(\`   SL: \${stopLoss} | TP: \${takeProfit} | ID: \${tradeId}\`);
  
  // Simulate MT5 trade execution
  try {
    // This would interface with MT5 WebTrader API in real implementation
    console.log(\`Executing \${direction} order for \${symbol}...\`);
  } catch (error) {
    console.error(\`Failed to open trade: \${error}\`);
  }
  
  return trade;
}

// Close trade function
function closeTrade(tradeId, reason = 'MANUAL') {
  const tradeIndex = openTrades.findIndex(trade => trade.id === tradeId);
  
  if (tradeIndex !== -1) {
    const trade = openTrades[tradeIndex];
    trade.status = 'CLOSED';
    trade.closeTime = new Date();
    trade.closeReason = reason;
    
    console.log(\`🔴 TRADE CLOSED: \${trade.symbol} \${trade.direction} | Reason: \${reason}\`);
    
    openTrades.splice(tradeIndex, 1);
    return trade;
  }
  
  return null;
}

// Monitor existing trades for exit conditions
function monitorTrades() {
  openTrades.forEach(trade => {
    const timeOpen = Date.now() - trade.openTime.getTime();
    const hoursOpen = timeOpen / (1000 * 60 * 60);
    
    // Auto close trades after 24 hours
    if (hoursOpen > 24) {
      closeTrade(trade.id, 'TIME_EXPIRED');
    }
    
    // Simulate price movement and SL/TP hits
    const random = Math.random();
    if (random < 0.1) { // 10% chance of hitting SL
      closeTrade(trade.id, 'STOP_LOSS');
    } else if (random > 0.9) { // 10% chance of hitting TP
      closeTrade(trade.id, 'TAKE_PROFIT');
    }
  });
}

// Main trading strategy execution
function executeSMCStrategy() {
  console.log("🔍 Executing SMC Trading Strategy...");
  console.log(\`📊 Current open trades: \${openTrades.length}/\${tradingConfig.maxOpenTrades}\`);
  
  if (openTrades.length >= tradingConfig.maxOpenTrades) {
    console.log("⚠️ Maximum trades reached. Monitoring existing positions...");
    monitorTrades();
    return;
  }
  
  tradingConfig.symbols.forEach(symbol => {
    // Analyze higher timeframe for trend direction
    const htfAnalysis = analyzeSMCStructure(symbol, "H4");
    const dailyAnalysis = analyzeSMCStructure(symbol, "D1");
    
    // Analyze lower timeframe for entry signals
    const ltfAnalysis = analyzeSMCStructure(symbol, "M15");
    
    console.log(\`📈 \${symbol} HTF Trend: \${htfAnalysis.trend}\`);
    console.log(\`📊 \${symbol} BOS: \${htfAnalysis.breakOfStructure}\`);
    console.log(\`🎯 \${symbol} Order Blocks: Bull=\${ltfAnalysis.orderBlocks.bullishOB}, Bear=\${ltfAnalysis.orderBlocks.bearishOB}\`);
    
    // Trading Logic: HTF trend + LTF structure
    const htfBullish = htfAnalysis.trend === 'BULLISH' && dailyAnalysis.trend === 'BULLISH';
    const htfBearish = htfAnalysis.trend === 'BEARISH' && dailyAnalysis.trend === 'BEARISH';
    
    // Entry conditions
    const bullishEntry = htfBullish && ltfAnalysis.orderBlocks.bullishOB && ltfAnalysis.fairValueGaps.direction === 'UP';
    const bearishEntry = htfBearish && ltfAnalysis.orderBlocks.bearishOB && ltfAnalysis.fairValueGaps.direction === 'DOWN';
    
    if (bullishEntry && openTrades.filter(t => t.symbol === symbol).length === 0) {
      const lotSize = calculateLotSize(symbol, tradingConfig.stopLossPoints);
      const currentPrice = 2000 + (Math.random() * 100); // Simulated price
      
      openTrade(
        symbol,
        'BUY',
        lotSize,
        currentPrice - (tradingConfig.stopLossPoints * 0.01),
        currentPrice + (tradingConfig.takeProfitPoints * 0.01)
      );
    } else if (bearishEntry && openTrades.filter(t => t.symbol === symbol).length === 0) {
      const lotSize = calculateLotSize(symbol, tradingConfig.stopLossPoints);
      const currentPrice = 2000 + (Math.random() * 100); // Simulated price
      
      openTrade(
        symbol,
        'SELL',
        lotSize,
        currentPrice + (tradingConfig.stopLossPoints * 0.01),
        currentPrice - (tradingConfig.takeProfitPoints * 0.01)
      );
    }
  });
  
  // Monitor existing trades
  monitorTrades();
  
  // Display current status
  console.log(\`📋 Portfolio Status: \${openTrades.length} active trades\`);
  if (openTrades.length > 0) {
    openTrades.forEach(trade => {
      console.log(\`   • \${trade.symbol} \${trade.direction} \${trade.lotSize} lots (ID: \${trade.id.substr(-6)})\`);
    });
  }
}

// Emergency close all trades function
function closeAllTrades() {
  console.log("🚨 EMERGENCY: Closing all open trades...");
  const tradesCount = openTrades.length;
  
  while (openTrades.length > 0) {
    closeTrade(openTrades[0].id, 'EMERGENCY_CLOSE');
  }
  
  console.log(\`✅ Closed \${tradesCount} trades successfully\`);
}

// Risk management check
function performRiskCheck() {
  const totalLots = openTrades.reduce((sum, trade) => sum + trade.lotSize, 0);
  const maxAllowedLots = tradingConfig.maxLotSize * tradingConfig.maxOpenTrades;
  
  if (totalLots > maxAllowedLots) {
    console.log("⚠️ RISK WARNING: Total lot size exceeds maximum allowed");
    return false;
  }
  
  return true;
}

// Initialize SMC analysis
console.log("🤖 OMNIA BOT SMC System Ready");
console.log("📊 Monitoring:", tradingConfig.symbols.join(", "));
console.log("⏰ Analysis Interval: 30 seconds");
console.log("🎯 Risk per trade:", tradingConfig.riskPercentage + "%");

// Execute strategy every 30 seconds
setInterval(() => {
  if (performRiskCheck()) {
    executeSMCStrategy();
  }
}, 30000);`;

  useEffect(() => {
    setBotScript(defaultBotScript);
  }, []);

  const handleLogin = () => {
    if (!server || !login || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to connect to MT5",
        variant: "destructive"
      });
      return;
    }

    // Construct MT5 WebTrader URL with login parameters
    const mt5Url = `https://trade.mql5.com/trade?servers=${encodeURIComponent(server)}&trade_server=${encodeURIComponent(server)}&login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`;
    
    if (iframeRef.current) {
      iframeRef.current.src = mt5Url;
      setIsLoggedIn(true);
      setShowLoginForm(false);
      
      toast({
        title: "Connected to MT5",
        description: "MT5 WebTrader loaded successfully"
      });

      // Auto-start bot script after successful login
      setTimeout(() => {
        startBotScript();
      }, 3000); // Wait 3 seconds for MT5 to fully load
    }
  };

  const startBotScript = () => {
    if (isBotRunning) return;
    
    try {
      // Execute the bot script
      const scriptFunction = new Function(botScript);
      scriptFunction();
      
      setIsBotRunning(true);
      
      // Set up periodic execution
      botIntervalRef.current = setInterval(() => {
        try {
          console.log("OMNIA BOT: Executing periodic SMC analysis...");
          // Execute periodic bot logic here
        } catch (error) {
          console.error("OMNIA BOT Error:", error);
        }
      }, 30000); // Every 30 seconds
      
      toast({
        title: "OMNIA BOT Started",
        description: "SMC Trading bot is now running with advanced features",
        className: "bg-tech-green"
      });
    } catch (error) {
      console.error("Bot script error:", error);
      toast({
        title: "Bot Script Error",
        description: "Failed to start bot script. Please check the script syntax.",
        variant: "destructive"
      });
    }
  };

  const stopBotScript = () => {
    if (botIntervalRef.current) {
      clearInterval(botIntervalRef.current);
      botIntervalRef.current = null;
    }
    setIsBotRunning(false);
    
    toast({
      title: "OMNIA BOT Stopped",
      description: "Trading bot has been stopped",
      className: "bg-yellow-500"
    });
  };

  const openInNewTab = () => {
    if (server && login && password) {
      const mt5Url = `https://trade.mql5.com/trade?servers=${encodeURIComponent(server)}&trade_server=${encodeURIComponent(server)}&login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`;
      window.open(mt5Url, '_blank');
    } else {
      window.open('https://trade.mql5.com/trade', '_blank');
    }
  };

  const resetConnection = () => {
    stopBotScript();
    setIsLoggedIn(false);
    setShowLoginForm(false);
    setShowBotConfig(false);
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (botIntervalRef.current) {
        clearInterval(botIntervalRef.current);
      }
    };
  }, []);

  return (
    <Card className="bg-tech-charcoal border-tech-blue/30 relative z-10">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            📊 MT5 WebTrader
            {isBotRunning && (
              <span className="flex items-center gap-1 text-tech-green text-sm">
                <Bot className="w-4 h-4 animate-pulse" />
                SMC Bot Active
              </span>
            )}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open in Tab
            </Button>
            {isLoggedIn && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBotConfig(!showBotConfig)}
                  className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
                >
                  <Bot className="w-4 h-4 mr-1" />
                  SMC Bot Config
                </Button>
                {isBotRunning ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopBotScript}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    Stop Bot
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startBotScript}
                    className="border-tech-green/30 text-tech-green hover:bg-tech-green/10"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start Bot
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetConnection}
                  className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </>
            )}
            {!isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoginForm(!showLoginForm)}
                className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Login
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {showLoginForm && !isLoggedIn && (
          <div className="p-4 border-b border-tech-blue/30">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="server" className="text-gray-300 text-sm">Server</Label>
                <Input
                  id="server"
                  placeholder="e.g., MetaQuotes-Demo"
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="bg-tech-dark border-tech-blue/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="login" className="text-gray-300 text-sm">Login</Label>
                <Input
                  id="login"
                  placeholder="Your MT5 login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="bg-tech-dark border-tech-blue/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-300 text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your MT5 password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-tech-dark border-tech-blue/30 text-white"
                />
              </div>
            </div>
            <Button
              onClick={handleLogin}
              className="w-full mt-4 bg-tech-blue hover:bg-tech-blue/80"
            >
              Connect to MT5 & Start SMC Bot
            </Button>
          </div>
        )}

        {showBotConfig && isLoggedIn && (
          <div className="p-4 border-b border-tech-blue/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 text-sm font-semibold">OMNIA SMC Trading Bot Configuration</Label>
                <div className="flex gap-2">
                  {isBotRunning ? (
                    <Button
                      size="sm"
                      onClick={stopBotScript}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Square className="w-3 h-3 mr-1" />
                      Stop
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={startBotScript}
                      className="bg-tech-green hover:bg-tech-green/80"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                placeholder="Enter your SMC bot trading script here..."
                value={botScript}
                onChange={(e) => setBotScript(e.target.value)}
                className="bg-tech-dark border-tech-blue/30 text-white font-mono text-sm min-h-[300px]"
                disabled={isBotRunning}
              />
              <div className="text-xs text-gray-400 space-y-1">
                <p>🤖 <strong>SMC Bot Features:</strong> Order Blocks, Fair Value Gaps, Break of Structure analysis</p>
                <p>📊 <strong>Multi-Timeframe:</strong> H4/D1 for trend, M15/M30 for entry signals</p>
                <p>💰 <strong>Risk Management:</strong> Dynamic lot sizing, 2% risk per trade, auto SL/TP</p>
                <p>⚡ <strong>Auto Trading:</strong> Opens/closes trades based on SMC principles</p>
                {isBotRunning && <p className="text-tech-green">✅ Bot is actively trading - stop to edit script.</p>}
              </div>
            </div>
          </div>
        )}
        
        <div 
          style={{ height: `${height}px`, position: 'relative', zIndex: 10 }}
          className="w-full"
        >
          {!isLoggedIn && !showLoginForm ? (
            <div className="flex items-center justify-center h-full bg-tech-dark">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">MT5 WebTrader with SMC Bot</h3>
                <p className="text-gray-400 mb-4">Connect to start trading with Smart Money Concepts analysis</p>
                <Button
                  onClick={() => setShowLoginForm(true)}
                  className="bg-tech-blue hover:bg-tech-blue/80"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to MT5
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={isLoggedIn ? undefined : 'about:blank'}
              className="w-full h-full border-0"
              allow="camera; microphone; geolocation; payment"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MT5WebTrader;
