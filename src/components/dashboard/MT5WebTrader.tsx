
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, LogIn, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MT5WebTraderProps {
  height?: number;
}

const MT5WebTrader: React.FC<MT5WebTraderProps> = ({ height = 600 }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [server, setServer] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
        title: "Connecting to MT5",
        description: "Attempting to connect to your MT5 account"
      });
    }
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
    setIsLoggedIn(false);
    setShowLoginForm(false);
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  };

  return (
    <Card className="bg-tech-charcoal border-tech-blue/30 relative z-10">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            📊 MT5 WebTrader
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
              <Button
                variant="outline"
                size="sm"
                onClick={resetConnection}
                className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
              >
                <Settings className="w-4 h-4 mr-1" />
                Reset
              </Button>
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
              Connect to MT5
            </Button>
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
                <p className="text-gray-400 mb-4">Connect to your MT5 account to start trading</p>
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
