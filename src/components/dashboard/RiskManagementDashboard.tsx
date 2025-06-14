
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Settings, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RiskSettings {
  maxDailyLoss: number;
  maxPositionSize: number;
  maxConcurrentTrades: number;
  riskPerTrade: number;
  enableDailyLossLimit: boolean;
  enablePositionSizeLimit: boolean;
  enableDrawdownProtection: boolean;
  maxDrawdownPercent: number;
}

const RiskManagementDashboard = () => {
  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    maxDailyLoss: 500,
    maxPositionSize: 1.0,
    maxConcurrentTrades: 5,
    riskPerTrade: 2.0,
    enableDailyLossLimit: true,
    enablePositionSizeLimit: true,
    enableDrawdownProtection: true,
    maxDrawdownPercent: 10
  });

  const [currentMetrics, setCurrentMetrics] = useState({
    dailyPnL: -150,
    currentPositions: 3,
    totalExposure: 2.5,
    drawdownPercent: 3.2,
    accountBalance: 10000
  });

  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Check risk violations
    const newAlerts = [];
    
    if (riskSettings.enableDailyLossLimit && Math.abs(currentMetrics.dailyPnL) >= riskSettings.maxDailyLoss) {
      newAlerts.push({
        type: 'critical',
        message: 'Daily loss limit reached',
        action: 'Trading suspended for today'
      });
    }
    
    if (currentMetrics.currentPositions >= riskSettings.maxConcurrentTrades) {
      newAlerts.push({
        type: 'warning',
        message: 'Maximum concurrent trades reached',
        action: 'No new positions allowed'
      });
    }
    
    if (riskSettings.enableDrawdownProtection && currentMetrics.drawdownPercent >= riskSettings.maxDrawdownPercent) {
      newAlerts.push({
        type: 'critical',
        message: 'Maximum drawdown exceeded',
        action: 'All positions will be closed'
      });
    }
    
    setAlerts(newAlerts);
  }, [riskSettings, currentMetrics]);

  const updateRiskSetting = (key: keyof RiskSettings, value: number | boolean) => {
    setRiskSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Risk Settings Updated",
      description: `${key} has been updated successfully.`,
    });
  };

  const getProgressColor = (value: number, max: number, warning: number = 80) => {
    const percentage = (value / max) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= warning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskLevel = () => {
    const riskFactors = [
      currentMetrics.dailyPnL < -riskSettings.maxDailyLoss * 0.8,
      currentMetrics.currentPositions >= riskSettings.maxConcurrentTrades * 0.8,
      currentMetrics.drawdownPercent >= riskSettings.maxDrawdownPercent * 0.8
    ];
    
    const riskCount = riskFactors.filter(Boolean).length;
    if (riskCount >= 2) return { level: 'HIGH', color: 'text-red-400' };
    if (riskCount === 1) return { level: 'MEDIUM', color: 'text-yellow-400' };
    return { level: 'LOW', color: 'text-green-400' };
  };

  const riskLevel = getRiskLevel();

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Risk Management Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-r from-gray-800/50 to-purple-900/20 rounded-lg">
              <p className="text-purple-400 text-sm">Risk Level</p>
              <p className={`text-2xl font-bold ${riskLevel.color}`}>{riskLevel.level}</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-gray-800/50 to-blue-900/20 rounded-lg">
              <p className="text-blue-400 text-sm">Daily P&L</p>
              <p className={`text-2xl font-bold ${currentMetrics.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${currentMetrics.dailyPnL.toFixed(2)}
              </p>
              <Progress 
                value={(Math.abs(currentMetrics.dailyPnL) / riskSettings.maxDailyLoss) * 100} 
                className="mt-2 h-2"
              />
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-gray-800/50 to-green-900/20 rounded-lg">
              <p className="text-green-400 text-sm">Positions</p>
              <p className="text-2xl font-bold text-white">
                {currentMetrics.currentPositions}/{riskSettings.maxConcurrentTrades}
              </p>
              <Progress 
                value={(currentMetrics.currentPositions / riskSettings.maxConcurrentTrades) * 100} 
                className="mt-2 h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert 
              key={index} 
              className={`${alert.type === 'critical' ? 'border-red-500 bg-red-900/20' : 'border-yellow-500 bg-yellow-900/20'}`}
            >
              <AlertTriangle className={`h-4 w-4 ${alert.type === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
              <AlertDescription className="text-white">
                <strong>{alert.message}</strong> - {alert.action}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Risk Settings */}
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-purple-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Risk Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">Daily Loss Limit</Label>
                <Switch
                  checked={riskSettings.enableDailyLossLimit}
                  onCheckedChange={(checked) => updateRiskSetting('enableDailyLossLimit', checked)}
                />
              </div>
              {riskSettings.enableDailyLossLimit && (
                <div>
                  <Label className="text-gray-300">Max Daily Loss ($)</Label>
                  <Input
                    type="number"
                    value={riskSettings.maxDailyLoss}
                    onChange={(e) => updateRiskSetting('maxDailyLoss', Number(e.target.value))}
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Label className="text-white">Position Size Limit</Label>
                <Switch
                  checked={riskSettings.enablePositionSizeLimit}
                  onCheckedChange={(checked) => updateRiskSetting('enablePositionSizeLimit', checked)}
                />
              </div>
              {riskSettings.enablePositionSizeLimit && (
                <div>
                  <Label className="text-gray-300">Max Position Size (lots)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={riskSettings.maxPositionSize}
                    onChange={(e) => updateRiskSetting('maxPositionSize', Number(e.target.value))}
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Max Concurrent Trades</Label>
                <Input
                  type="number"
                  value={riskSettings.maxConcurrentTrades}
                  onChange={(e) => updateRiskSetting('maxConcurrentTrades', Number(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                />
              </div>
              
              <div>
                <Label className="text-gray-300">Risk Per Trade (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={riskSettings.riskPerTrade}
                  onChange={(e) => updateRiskSetting('riskPerTrade', Number(e.target.value))}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-white">Drawdown Protection</Label>
                <Switch
                  checked={riskSettings.enableDrawdownProtection}
                  onCheckedChange={(checked) => updateRiskSetting('enableDrawdownProtection', checked)}
                />
              </div>
              {riskSettings.enableDrawdownProtection && (
                <div>
                  <Label className="text-gray-300">Max Drawdown (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={riskSettings.maxDrawdownPercent}
                    onChange={(e) => updateRiskSetting('maxDrawdownPercent', Number(e.target.value))}
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
              Save Settings
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300">
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskManagementDashboard;
