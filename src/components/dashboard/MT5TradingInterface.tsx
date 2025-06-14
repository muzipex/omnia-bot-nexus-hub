
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMT5Connection } from '@/hooks/use-mt5-connection';
import MT5ConnectionCard from './mt5/MT5ConnectionCard';
import MT5AutoTradingCard from './mt5/MT5AutoTradingCard';
import MT5PositionsCard from './mt5/MT5PositionsCard';
import MT5BridgeManager from './MT5BridgeManager';
import MobileTradingDashboard from '../mobile/MobileTradingDashboard';
import TelegramIntegration from './TelegramIntegration';
import FuturisticDashboard from './FuturisticDashboard';
import SubscriptionBridgeDownload from './SubscriptionBridgeDownload';

const MT5TradingInterface = () => {
  const {
    isConnected,
    account,
    positions,
    isLoading,
    connectToMT5,
    closeOrder,
    loadPositions,
    loadAccountInfo,
    startAutoTrading,
    stopAutoTrading,
    isAutoTrading,
    checkBridgeStatus
  } = useMT5Connection();

  useEffect(() => {
    // Initial status check
    checkBridgeStatus();
    
    if (isConnected) {
      const interval = setInterval(() => {
        loadPositions();
        loadAccountInfo();
      }, 2000); // Real-time updates every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isConnected, loadPositions, loadAccountInfo, checkBridgeStatus]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8 bg-gradient-to-r from-gray-800 to-purple-900 border border-cyan-500/30">
          <TabsTrigger 
            value="dashboard" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 transition-all duration-300"
          >
            AI Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="bridge" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 transition-all duration-300"
          >
            Bridge Control
          </TabsTrigger>
          <TabsTrigger 
            value="download" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 transition-all duration-300"
          >
            Downloads
          </TabsTrigger>
          <TabsTrigger 
            value="connection" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 transition-all duration-300"
          >
            Connection
          </TabsTrigger>
          <TabsTrigger 
            value="autobot" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 transition-all duration-300"
          >
            Auto Bot
          </TabsTrigger>
          <TabsTrigger 
            value="positions" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 transition-all duration-300"
          >
            Positions
          </TabsTrigger>
          <TabsTrigger 
            value="mobile" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 transition-all duration-300"
          >
            Mobile
          </TabsTrigger>
          <TabsTrigger 
            value="telegram" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 transition-all duration-300"
          >
            Telegram
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <FuturisticDashboard />
        </TabsContent>

        <TabsContent value="bridge">
          <div className="bg-gradient-to-br from-gray-900 to-purple-900 min-h-screen p-6 rounded-lg">
            <MT5BridgeManager />
          </div>
        </TabsContent>

        <TabsContent value="download">
          <div className="bg-gradient-to-br from-gray-900 to-purple-900 min-h-screen p-6 rounded-lg">
            <SubscriptionBridgeDownload />
          </div>
        </TabsContent>

        <TabsContent value="connection">
          <div className="bg-gradient-to-br from-gray-900 to-purple-900 min-h-screen p-6 rounded-lg space-y-6">
            <MT5ConnectionCard
              isConnected={isConnected}
              account={account}
              isLoading={isLoading}
              onConnect={connectToMT5}
            />
          </div>
        </TabsContent>

        <TabsContent value="autobot">
          <div className="bg-gradient-to-br from-gray-900 to-purple-900 min-h-screen p-6 rounded-lg">
            <MT5AutoTradingCard
              isConnected={isConnected}
              isLoading={isLoading}
              isAutoTrading={isAutoTrading}
              onStartAutoTrading={startAutoTrading}
              onStopAutoTrading={stopAutoTrading}
            />
          </div>
        </TabsContent>

        <TabsContent value="positions">
          <div className="bg-gradient-to-br from-gray-900 to-purple-900 min-h-screen p-6 rounded-lg">
            <MT5PositionsCard
              positions={positions}
              isLoading={isLoading}
              isConnected={isConnected}
              onRefresh={loadPositions}
              onCloseOrder={closeOrder}
            />
          </div>
        </TabsContent>

        <TabsContent value="mobile">
          <div className="bg-gradient-to-br from-gray-900 to-purple-900 min-h-screen p-6 rounded-lg">
            <MobileTradingDashboard />
          </div>
        </TabsContent>

        <TabsContent value="telegram">
          <div className="bg-gradient-to-br from-gray-900 to-purple-900 min-h-screen p-6 rounded-lg">
            <TelegramIntegration />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MT5TradingInterface;
