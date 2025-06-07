
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, LogIn, Settings, Play, Stop, Bot } from 'lucide-react';
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

  const defaultBotScript = `// OMNIA BOT Trading Script
// This script will execute trading operations after successful MT5 login

console.log("OMNIA BOT initialized at", new Date().toISOString());

// Example trading parameters
const tradingConfig = {
  symbol: "XAUUSD", // Gold
  lotSize: 0.01,
  stopLoss: 50,
  takeProfit: 100,
  maxTrades: 5
};

// Bot trading logic
function executeTradingStrategy() {
  console.log("Executing trading strategy...");
  
  // Simulate trading decisions
  const signals = analyzeMarket();
  
  if (signals.shouldBuy) {
    console.log("BUY signal detected for", tradingConfig.symbol);
    // Execute buy order logic here
  } else if (signals.shouldSell) {
    console.log("SELL signal detected for", tradingConfig.symbol);
    // Execute sell order logic here
  }
}

function analyzeMarket() {
  // Simplified market analysis
  const random = Math.random();
  return {
    shouldBuy: random > 0.7,
    shouldSell: random < 0.3
  };
}

// Execute strategy every 30 seconds
setInterval(executeTradingStrategy, 30000);`;

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
          console.log("OMNIA BOT: Executing periodic check...");
          // Execute periodic bot logic here
        } catch (error) {
          console.error("OMNIA BOT Error:", error);
        }
      }, 30000); // Every 30 seconds
      
      toast({
        title: "OMNIA BOT Started",
        description: "Trading bot is now running",
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
                Bot Active
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
                  Bot Config
                </Button>
                {isBotRunning ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopBotScript}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Stop className="w-4 h-4 mr-1" />
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
              Connect to MT5 & Start Bot
            </Button>
          </div>
        )}

        {showBotConfig && isLoggedIn && (
          <div className="p-4 border-b border-tech-blue/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 text-sm font-semibold">OMNIA BOT Script Configuration</Label>
                <div className="flex gap-2">
                  {isBotRunning ? (
                    <Button
                      size="sm"
                      onClick={stopBotScript}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Stop className="w-3 h-3 mr-1" />
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
                placeholder="Enter your bot trading script here..."
                value={botScript}
                onChange={(e) => setBotScript(e.target.value)}
                className="bg-tech-dark border-tech-blue/30 text-white font-mono text-sm min-h-[200px]"
                disabled={isBotRunning}
              />
              <p className="text-xs text-gray-400">
                Bot script will execute automatically after successful MT5 login. 
                {isBotRunning && " Bot is currently running - stop to edit script."}
              </p>
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
                <h3 className="text-xl font-semibold text-white mb-2">MT5 WebTrader</h3>
                <p className="text-gray-400 mb-4">Connect to your MT5 account to start trading with OMNIA BOT</p>
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
