
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, X, Target, Zap } from 'lucide-react';
import { MT5Trade } from '@/hooks/use-mt5-connection';
import { toast } from '@/hooks/use-toast';

interface MT5PositionsCardProps {
  positions: MT5Trade[];
  isLoading: boolean;
  isConnected: boolean;
  onRefresh: () => void;
  onCloseOrder: (ticket: number, closePrice?: number, profit?: number) => Promise<void>;
}

const MT5PositionsCard = ({ 
  positions, 
  isLoading, 
  isConnected, 
  onRefresh, 
  onCloseOrder 
}: MT5PositionsCardProps) => {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleClosePosition = async (position: MT5Trade) => {
    try {
      await onCloseOrder(position.ticket, position.close_price, position.profit);
      toast({
        title: "Position Closed",
        description: `Successfully closed position #${position.ticket}`,
      });
    } catch (error) {
      console.error('Failed to close position:', error);
    }
  };

  const handleRefresh = () => {
    onRefresh();
    toast({
      title: "Refreshing Positions",
      description: "Loading latest position data...",
    });
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-blue-900/30 border border-blue-500/30 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Neural Trading Positions
          </CardTitle>
          <CardDescription className="text-gray-400">
            Real-time positions from your MT5 neural bridge
          </CardDescription>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Sync Data
        </Button>
      </CardHeader>
      <CardContent>
        {positions.length > 0 ? (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-3 rounded-lg border border-green-500/20">
                <p className="text-green-400 text-xs font-medium">TOTAL POSITIONS</p>
                <p className="text-white text-xl font-bold">{positions.length}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 p-3 rounded-lg border border-blue-500/20">
                <p className="text-blue-400 text-xs font-medium">TOTAL PROFIT</p>
                <p className={`text-xl font-bold ${positions.reduce((sum, pos) => sum + (pos.profit || 0), 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(positions.reduce((sum, pos) => sum + (pos.profit || 0), 0))}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-3 rounded-lg border border-purple-500/20">
                <p className="text-purple-400 text-xs font-medium">TOTAL VOLUME</p>
                <p className="text-white text-xl font-bold">{positions.reduce((sum, pos) => sum + pos.volume, 0).toFixed(2)}</p>
              </div>
            </div>

            {/* Positions Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-500/20">
                    <TableHead className="text-blue-300 font-semibold">TICKET</TableHead>
                    <TableHead className="text-blue-300 font-semibold">SYMBOL</TableHead>
                    <TableHead className="text-blue-300 font-semibold">TYPE</TableHead>
                    <TableHead className="text-blue-300 font-semibold">VOLUME</TableHead>
                    <TableHead className="text-blue-300 font-semibold">OPEN PRICE</TableHead>
                    <TableHead className="text-blue-300 font-semibold">CURRENT P&L</TableHead>
                    <TableHead className="text-blue-300 font-semibold">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position) => (
                    <TableRow key={position.id} className="border-blue-500/20 hover:bg-blue-500/5">
                      <TableCell className="text-white font-mono text-sm">{position.ticket}</TableCell>
                      <TableCell className="text-white font-medium">{position.symbol}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={position.trade_type === 'BUY' ? "default" : "destructive"}
                          className={`${position.trade_type === 'BUY' ? 'bg-green-600' : 'bg-red-600'} border-0`}
                        >
                          {position.trade_type === 'BUY' ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {position.trade_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white font-medium">{position.volume}</TableCell>
                      <TableCell className="text-white font-mono">{position.open_price.toFixed(5)}</TableCell>
                      <TableCell className={`font-bold ${position.profit && position.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {position.profit ? formatCurrency(position.profit) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleClosePosition(position)}
                          disabled={isLoading}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Close
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Positions</h3>
            <p className="text-gray-400 mb-4">
              {isConnected ? 'Start trading to see positions here' : 'Connect to MT5 to view positions'}
            </p>
            {!isConnected && (
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
                <Zap className="w-4 h-4 mr-2" />
                Connect Neural Bridge
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MT5PositionsCard;
