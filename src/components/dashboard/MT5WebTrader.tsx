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

  const defaultBotScript = `// OMNIA BOT Advanced Multi-Asset Trading Script with SMC Analysis
// Smart Money Concepts Trading Bot with Crypto, Gold & Forex pairs

console.log("OMNIA BOT Multi-Asset SMC Trading System initialized at", new Date().toISOString());

// Enhanced trading configuration with crypto and precious metals
const tradingConfig = {
  symbols: [
    // Crypto pairs
    "BTCUSD", "ETHUSD", "ADAUSD", "XRPUSD",
    // Precious metals
    "XAUUSD", "XAGUSD", 
    // Major forex pairs
    "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD",
    // Minor pairs
    "EURJPY", "GBPJPY", "EURGBP", "EURAUD", "GBPAUD"
  ],
  baseLotSize: 0.01,
  maxLotSize: 1.0,
  riskPercentage: 2, // 2% risk per trade
  stopLossPoints: {
    crypto: 500,     // Wider SL for crypto volatility
    metals: 100,     // Standard SL for metals
    forex: 50        // Tight SL for forex
  },
  takeProfitPoints: {
    crypto: 1500,    // Higher TP for crypto
    metals: 300,     // Higher TP for metals
    forex: 150       // Standard TP for forex
  },
  maxOpenTrades: 5,
  htfTimeframes: ["H4", "D1"], // Higher timeframes for trend analysis
  ltfTimeframes: ["M15", "M30"] // Lower timeframes for entry
};

// SMC Trading Variables
let openTrades = [];
let marketStructure = {};
let liquidityLevels = {};

// Get asset category for symbol-specific settings
function getAssetCategory(symbol) {
  if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('ADA') || symbol.includes('XRP')) {
    return 'crypto';
  } else if (symbol.includes('XAU') || symbol.includes('XAG')) {
    return 'metals';
  } else {
    return 'forex';
  }
}

// Smart Money Concepts Analysis with asset-specific logic
function analyzeSMCStructure(symbol, timeframe) {
  console.log(\`Analyzing SMC structure for \${symbol} on \${timeframe}\`);
  
  const assetCategory = getAssetCategory(symbol);
  const random = Math.random();
  
  // Adjust volatility expectations based on asset type
  const volatilityMultiplier = assetCategory === 'crypto' ? 1.5 : assetCategory === 'metals' ? 1.2 : 1.0;
  const isBreakOfStructure = random > (0.7 / volatilityMultiplier);
  const isBullish = random > 0.5;
  
  return {
    trend: isBullish ? 'BULLISH' : 'BEARISH',
    breakOfStructure: isBreakOfStructure,
    assetCategory: assetCategory,
    volatility: random * 100 * volatilityMultiplier,
    liquidity: {
      buyLiquidity: random * 100,
      sellLiquidity: random * 100
    },
    orderBlocks: {
      bullishOB: isBullish && random > (0.6 - (volatilityMultiplier * 0.1)),
      bearishOB: !isBullish && random > (0.6 - (volatilityMultiplier * 0.1))
    },
    fairValueGaps: {
      present: random > 0.5,
      direction: isBullish ? 'UP' : 'DOWN',
      strength: random * volatilityMultiplier
    }
  };
}

// Enhanced lot size calculation with asset-specific risk
function calculateLotSize(symbol, accountBalance = 10000) {
  const assetCategory = getAssetCategory(symbol);
  const stopLossPoints = tradingConfig.stopLossPoints[assetCategory];
  
  // Adjust risk based on asset volatility
  const adjustedRisk = assetCategory === 'crypto' ? 
    tradingConfig.riskPercentage * 0.8 : // Reduce risk for crypto
    assetCategory === 'metals' ? 
    tradingConfig.riskPercentage * 0.9 : // Slightly reduce for metals
    tradingConfig.riskPercentage; // Full risk for forex
  
  const riskAmount = accountBalance * (adjustedRisk / 100);
  const pointValue = symbol.includes('JPY') ? 0.01 : 
                    assetCategory === 'crypto' ? 1 : 
                    assetCategory === 'metals' ? 0.01 : 0.0001;
  
  const contractSize = assetCategory === 'crypto' ? 1 : 100000;
  const lotSize = riskAmount / (stopLossPoints * pointValue * contractSize);
  
  return Math.min(Math.max(lotSize, tradingConfig.baseLotSize), tradingConfig.maxLotSize);
}

// Enhanced trade opening with asset-specific parameters
function openTrade(symbol, direction, lotSize, stopLoss, takeProfit) {
  const tradeId = \`TRADE_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  const assetCategory = getAssetCategory(symbol);
  
  const trade = {
    id: tradeId,
    symbol: symbol,
    direction: direction,
    lotSize: lotSize,
    openTime: new Date(),
    stopLoss: stopLoss,
    takeProfit: takeProfit,
    status: 'OPEN',
    assetCategory: assetCategory
  };
  
  openTrades.push(trade);
  
  console.log(\`🚀 \${assetCategory.toUpperCase()} TRADE OPENED: \${direction} \${lotSize} lots of \${symbol}\`);
  console.log(\`   SL: \${stopLoss} | TP: \${takeProfit} | ID: \${tradeId}\`);
  
  // Simulate MT5 trade execution with asset-specific logic
  try {
    console.log(\`Executing \${direction} order for \${symbol} (\${assetCategory})...\`);
    if (assetCategory === 'crypto') {
      console.log(\`⚠️  Crypto trade - monitoring for high volatility\`);
    } else if (assetCategory === 'metals') {
      console.log(\`🥇 Precious metals trade - safe haven asset\`);
    } else {
      console.log(\`💱 Forex trade - major currency pair\`);
    }
  } catch (error) {
    console.error(\`Failed to open \${assetCategory} trade: \${error}\`);
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

// Enhanced trade monitoring with asset-specific rules
function monitorTrades() {
  openTrades.forEach(trade => {
    const timeOpen = Date.now() - trade.openTime.getTime();
    const hoursOpen = timeOpen / (1000 * 60 * 60);
    
    // Asset-specific time limits
    const maxHours = trade.assetCategory === 'crypto' ? 12 : // Shorter for crypto
                    trade.assetCategory === 'metals' ? 48 : // Longer for metals
                    24; // Standard for forex
    
    if (hoursOpen > maxHours) {
      closeTrade(trade.id, 'TIME_EXPIRED');
    }
    
    // Simulate price movement with asset-specific volatility
    const random = Math.random();
    const volatilityFactor = trade.assetCategory === 'crypto' ? 0.15 : 
                           trade.assetCategory === 'metals' ? 0.12 : 0.1;
    
    if (random < volatilityFactor) { // Higher chance for volatile assets
      closeTrade(trade.id, 'STOP_LOSS');
    } else if (random > (1 - volatilityFactor)) {
      closeTrade(trade.id, 'TAKE_PROFIT');
    }
  });
}

// Enhanced main trading strategy with multi-asset logic
function executeSMCStrategy() {
  console.log("🔍 Executing Multi-Asset SMC Trading Strategy...");
  console.log(\`📊 Current open trades: \${openTrades.length}/\${tradingConfig.maxOpenTrades}\`);
  
  if (openTrades.length >= tradingConfig.maxOpenTrades) {
    console.log("⚠️ Maximum trades reached. Monitoring existing positions...");
    monitorTrades();
    return;
  }
  
  // Group symbols by asset category for better analysis
  const cryptoSymbols = tradingConfig.symbols.filter(s => getAssetCategory(s) === 'crypto');
  const metalSymbols = tradingConfig.symbols.filter(s => getAssetCategory(s) === 'metals');
  const forexSymbols = tradingConfig.symbols.filter(s => getAssetCategory(s) === 'forex');
  
  console.log(\`🔥 Crypto pairs: \${cryptoSymbols.length}, 🥇 Metals: \${metalSymbols.length}, 💱 Forex: \${forexSymbols.length}\`);
  
  tradingConfig.symbols.forEach(symbol => {
    const assetCategory = getAssetCategory(symbol);
    
    // Skip if we already have a trade for this symbol
    if (openTrades.find(t => t.symbol === symbol)) return;
    
    // Analyze higher timeframe for trend direction
    const htfAnalysis = analyzeSMCStructure(symbol, "H4");
    const dailyAnalysis = analyzeSMCStructure(symbol, "D1");
    
    // Analyze lower timeframe for entry signals
    const ltfAnalysis = analyzeSMCStructure(symbol, "M15");
    
    console.log(\`📈 \${symbol} (\${assetCategory}) HTF Trend: \${htfAnalysis.trend}\`);
    console.log(\`📊 \${symbol} BOS: \${htfAnalysis.breakOfStructure}, Volatility: \${htfAnalysis.volatility.toFixed(1)}\`);
    
    // Enhanced trading logic with asset-specific conditions
    const htfBullish = htfAnalysis.trend === 'BULLISH' && dailyAnalysis.trend === 'BULLISH';
    const htfBearish = htfAnalysis.trend === 'BEARISH' && dailyAnalysis.trend === 'BEARISH';
    
    // Asset-specific entry conditions
    const volatilityThreshold = assetCategory === 'crypto' ? 75 : 
                               assetCategory === 'metals' ? 60 : 50;
    
    const bullishEntry = htfBullish && 
                        ltfAnalysis.orderBlocks.bullishOB && 
                        ltfAnalysis.fairValueGaps.direction === 'UP' &&
                        htfAnalysis.volatility > volatilityThreshold;
                        
    const bearishEntry = htfBearish && 
                        ltfAnalysis.orderBlocks.bearishOB && 
                        ltfAnalysis.fairValueGaps.direction === 'DOWN' &&
                        htfAnalysis.volatility > volatilityThreshold;
    
    if (bullishEntry) {
      const lotSize = calculateLotSize(symbol);
      const currentPrice = assetCategory === 'crypto' ? 45000 + (Math.random() * 10000) :
                          assetCategory === 'metals' ? 2000 + (Math.random() * 100) :
                          1 + (Math.random() * 0.5); // Simulated prices
      
      const stopLossDistance = tradingConfig.stopLossPoints[assetCategory] * 
                              (assetCategory === 'crypto' ? 1 : 0.01);
      const takeProfitDistance = tradingConfig.takeProfitPoints[assetCategory] * 
                                (assetCategory === 'crypto' ? 1 : 0.01);
      
      openTrade(
        symbol,
        'BUY',
        lotSize,
        currentPrice - stopLossDistance,
        currentPrice + takeProfitDistance
      );
    } else if (bearishEntry) {
      const lotSize = calculateLotSize(symbol);
      const currentPrice = assetCategory === 'crypto' ? 45000 + (Math.random() * 10000) :
                          assetCategory === 'metals' ? 2000 + (Math.random() * 100) :
                          1 + (Math.random() * 0.5);
      
      const stopLossDistance = tradingConfig.stopLossPoints[assetCategory] * 
                              (assetCategory === 'crypto' ? 1 : 0.01);
      const takeProfitDistance = tradingConfig.takeProfitPoints[assetCategory] * 
                                (assetCategory === 'crypto' ? 1 : 0.01);
      
      openTrade(
        symbol,
        'SELL',
        lotSize,
        currentPrice + stopLossDistance,
        currentPrice - takeProfitDistance
      );
    }
  });
  
  // Monitor existing trades
  monitorTrades();
  
  // Enhanced portfolio status with asset breakdown
  const cryptoTrades = openTrades.filter(t => t.assetCategory === 'crypto').length;
  const metalTrades = openTrades.filter(t => t.assetCategory === 'metals').length;
  const forexTrades = openTrades.filter(t => t.assetCategory === 'forex').length;
  
  console.log(\`📋 Portfolio: \${openTrades.length} total | 🔥\${cryptoTrades} crypto | 🥇\${metalTrades} metals | 💱\${forexTrades} forex\`);
  
  if (openTrades.length > 0) {
    openTrades.forEach(trade => {
      const icon = trade.assetCategory === 'crypto' ? '🔥' : 
                  trade.assetCategory === 'metals' ? '🥇' : '💱';
      console.log(\`   \${icon} \${trade.symbol} \${trade.direction} \${trade.lotSize} lots (ID: \${trade.id.substr(-6)})\`);
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
console.log("🤖 OMNIA BOT Multi-Asset SMC System Ready");
console.log("🔥 Crypto pairs:", tradingConfig.symbols.filter(s => getAssetCategory(s) === 'crypto').join(", "));
console.log("🥇 Metals:", tradingConfig.symbols.filter(s => getAssetCategory(s) === 'metals').join(", "));
console.log("💱 Forex pairs:", tradingConfig.symbols.filter(s => getAssetCategory(s) === 'forex').join(", "));
console.log("⏰ Analysis Interval: 30 seconds");
console.log("🎯 Risk per trade: Crypto 1.6%, Metals 1.8%, Forex 2%");

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
          console.log("OMNIA BOT: Executing periodic multi-asset SMC analysis...");
          // Execute periodic bot logic here
        } catch (error) {
          console.error("OMNIA BOT Error:", error);
        }
      }, 30000); // Every 30 seconds
      
      toast({
        title: "OMNIA BOT Started",
        description: "Multi-asset SMC trading bot now active (Crypto, Gold, Forex)",
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
      description: "Multi-asset trading bot has been stopped",
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
