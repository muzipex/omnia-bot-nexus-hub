
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMT5Connection } from '@/hooks/use-mt5-connection';
import MT5ConnectionCard from './mt5/MT5ConnectionCard';
import MT5AutoTradingCard from './mt5/MT5AutoTradingCard';
import MT5PositionsCard from './mt5/MT5PositionsCard';
import MT5SetupGuide from './mt5/MT5SetupGuide';

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
      <MT5ConnectionCard
        isConnected={isConnected}
        account={account}
        isLoading={isLoading}
        onConnect={connectToMT5}
      />

      <Tabs defaultValue="autobot" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-tech-charcoal">
          <TabsTrigger value="autobot" className="data-[state=active]:bg-tech-blue">Auto Bot</TabsTrigger>
          <TabsTrigger value="positions" className="data-[state=active]:bg-tech-blue">Positions</TabsTrigger>
          <TabsTrigger value="setup" className="data-[state=active]:bg-tech-blue">Setup Guide</TabsTrigger>
        </TabsList>

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

        <TabsContent value="setup">
          <MT5SetupGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MT5TradingInterface;
