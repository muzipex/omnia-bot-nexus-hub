import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMT5Connection } from '@/hooks/use-mt5-connection';
import MT5ConnectionCard from './mt5/MT5ConnectionCard';
import MT5AutoTradingCard from './mt5/MT5AutoTradingCard';
import MT5PositionsCard from './mt5/MT5PositionsCard';
import MT5BridgeManager from './MT5BridgeManager';
import MobileTradingDashboard from '../mobile/MobileTradingDashboard';

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
    isAutoTrading
  } = useMT5Connection();

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        loadPositions();
        loadAccountInfo();
      }, 5000); // Refresh every 5 seconds for live trading

      return () => clearInterval(interval);
    }
  }, [isConnected, loadPositions, loadAccountInfo]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="bridge" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800 border border-gray-700">
          <TabsTrigger 
            value="bridge" 
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300"
          >
            Bridge Control
          </TabsTrigger>
          <TabsTrigger 
            value="connection" 
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300"
          >
            Connection
          </TabsTrigger>
          <TabsTrigger 
            value="autobot" 
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300"
          >
            Auto Bot
          </TabsTrigger>
          <TabsTrigger 
            value="positions" 
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300"
          >
            Positions
          </TabsTrigger>
          <TabsTrigger 
            value="mobile" 
            className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300"
          >
            Mobile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bridge">
          <MT5BridgeManager />
        </TabsContent>

        <TabsContent value="connection">
          <MT5ConnectionCard
            isConnected={isConnected}
            account={account}
            isLoading={isLoading}
            onConnect={connectToMT5}
          />
        </TabsContent>

        <TabsContent value="autobot">
          <MT5AutoTradingCard
            isConnected={isConnected}
            isLoading={isLoading}
            isAutoTrading={isAutoTrading}
            onStartAutoTrading={startAutoTrading}
            onStopAutoTrading={stopAutoTrading}
          />
        </TabsContent>

        <TabsContent value="positions">
          <MT5PositionsCard
            positions={positions}
            isLoading={isLoading}
            isConnected={isConnected}
            onRefresh={loadPositions}
            onCloseOrder={closeOrder}
          />
        </TabsContent>

        <TabsContent value="mobile">
          <MobileTradingDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MT5TradingInterface;
