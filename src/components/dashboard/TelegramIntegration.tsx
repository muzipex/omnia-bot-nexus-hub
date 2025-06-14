
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { telegramBot } from '@/services/telegram-bot';
import { toast } from '@/hooks/use-toast';
import { MessageCircle, CheckCircle, XCircle, Send } from 'lucide-react';

const TelegramIntegration = () => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // Load config from Supabase
    const loadConfig = async () => {
      const config = await telegramBot.getConfig();
      if (config) {
        setBotToken(config.botToken);
        setChatId(config.chatId);
        checkConnection(config);
      }
    };
    loadConfig();
    // eslint-disable-next-line
  }, []);

  const checkConnection = async (configOverride?: { botToken: string, chatId: string }) => {
    setIsConnected(false);
    // Always check against current input in case user just typed a new token
    const config = configOverride || { botToken, chatId };
    if (!config.botToken) {
      setIsConnected(false);
      return;
    }
    const ok = await telegramBot.testConnection();
    setIsConnected(ok);
  };

  const handleSave = async () => {
    if (!botToken || !chatId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    await telegramBot.setConfig({ botToken, chatId });

    const connected = await telegramBot.testConnection();
    setIsConnected(connected);

    if (connected) {
      toast({
        title: "Success",
        description: "Telegram bot connected successfully!"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to connect to Telegram bot. Please check your credentials.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const handleTestMessage = async () => {
    setIsTesting(true);

    const success = await telegramBot.sendUpdate({
      type: 'alert',
      message: 'Test message from OMNIA BOT! Your Telegram integration is working perfectly.',
      timestamp: new Date().toISOString()
    });

    if (success) {
      toast({
        title: "Test Successful",
        description: "Test message sent to Telegram!"
      });
    } else {
      toast({
        title: "Test Failed",
        description: "Failed to send test message",
        variant: "destructive"
      });
    }

    setIsTesting(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <CardTitle>Telegram Integration</CardTitle>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center space-x-1">
            {isConnected ? (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                <span>Disconnected</span>
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          Connect your Telegram bot to receive real-time trading updates and notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="botToken">Bot Token</Label>
          <Input
            id="botToken"
            type="password"
            placeholder="1234567890:ABCdefGhIJklmNOPqrsTUVwxyz"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-gray-500">
            Get your bot token from @BotFather on Telegram
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chatId">Chat ID</Label>
          <Input
            id="chatId"
            placeholder="-1001234567890"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-gray-500">
            Your personal chat ID or group chat ID (use @userinfobot to find it)
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Connecting...' : 'Save & Connect'}
          </Button>

          {isConnected && (
            <Button
              variant="outline"
              onClick={handleTestMessage}
              disabled={isTesting}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isTesting ? 'Sending...' : 'Test'}</span>
            </Button>
          )}
        </div>

        {isConnected && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            ✅ Your bot is connected and will send notifications for:
            <ul className="mt-2 space-y-1">
              <li>• Trade openings and closings</li>
              <li>• Account balance updates</li>
              <li>• Risk management alerts</li>
              <li>• AI trading signals</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TelegramIntegration;
