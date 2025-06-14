
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const RiskControlCard = ({
  maxDailyLoss,
  setMaxDailyLoss,
  todayPnL,
  tradingLocked,
  setTradingLocked,
}: {
  maxDailyLoss: number;
  setMaxDailyLoss: (n: number) => void;
  todayPnL: number;
  tradingLocked: boolean;
  setTradingLocked: (b: boolean) => void;
}) => {
  const [input, setInput] = useState(String(maxDailyLoss));

  const handleApply = () => {
    const value = Number(input);
    if (isNaN(value)) {
      toast({ title: "Invalid", description: "Please enter a number.", variant: "destructive" });
      return;
    }
    setMaxDailyLoss(value);
    toast({ title: "Saved", description: "Max daily loss threshold set." });
  };

  // Quick check to lock trading
  React.useEffect(() => {
    if (todayPnL <= -maxDailyLoss && maxDailyLoss > 0) {
      setTradingLocked(true);
    }
  }, [todayPnL, maxDailyLoss, setTradingLocked]);

  return (
    <Card className="bg-tech-charcoal border-tech-blue/30">
      <CardHeader>
        <CardTitle className="text-white">Risk Controls</CardTitle>
        <CardDescription className="text-gray-400">Automatically lock trading for the day if daily loss exceeds a threshold.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div>Max Daily Loss ($):</div>
            <Input
              className="bg-gray-900 border-gray-700 w-28"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="number"
              min={0}
            />
            <Button size="sm" variant="outline" onClick={handleApply}>
              Apply
            </Button>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Today's P&L: <span className={todayPnL < 0 ? "text-red-500" : "text-green-400"}>${todayPnL.toFixed(2)}</span>
          </div>
          {tradingLocked && (
            <div className="mt-3 p-2 bg-red-900 text-red-200 rounded">
              ⚠️ Trading Locked for the day due to loss limit.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export default RiskControlCard;
