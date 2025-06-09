
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';
import { MT5Trade } from '@/hooks/use-mt5-connection';

interface MT5PositionsCardProps {
  positions: MT5Trade[];
  isLoading: boolean;
  isConnected: boolean;
  onRefresh: () => void;
  onCloseOrder: (ticket: number, closePrice: number, profit: number) => Promise<void>;
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

  return (
    <Card className="bg-tech-charcoal border-tech-blue/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Open Positions</CardTitle>
          <CardDescription className="text-gray-400">
            Live trading positions from your MT5 account
          </CardDescription>
        </div>
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {positions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-tech-blue/30">
                <TableHead className="text-gray-300">Ticket</TableHead>
                <TableHead className="text-gray-300">Symbol</TableHead>
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300">Volume</TableHead>
                <TableHead className="text-gray-300">Open Price</TableHead>
                <TableHead className="text-gray-300">Current P&L</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.id} className="border-tech-blue/30">
                  <TableCell className="text-white font-mono">{position.ticket}</TableCell>
                  <TableCell className="text-white">{position.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={position.trade_type === 'BUY' ? "default" : "destructive"}>
                      {position.trade_type === 'BUY' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {position.trade_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">{position.volume}</TableCell>
                  <TableCell className="text-white">{position.open_price.toFixed(5)}</TableCell>
                  <TableCell className={`${position.profit && position.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {position.profit ? formatCurrency(position.profit) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => onCloseOrder(position.ticket, position.open_price, position.profit || 0)}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Close
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No open positions</p>
            <p className="text-gray-500 text-sm mt-2">
              {isConnected ? 'Start auto trading to see positions here' : 'Connect to MT5 to view positions'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MT5PositionsCard;
