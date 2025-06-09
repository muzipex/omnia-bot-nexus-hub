
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MT5SetupGuide = () => {
  return (
    <Card className="bg-tech-charcoal border-tech-blue/30">
      <CardHeader>
        <CardTitle className="text-white">Setup Guide</CardTitle>
        <CardDescription className="text-gray-400">
          Follow these steps to connect your local MT5 terminal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-6">
          <div className="border-l-4 border-tech-blue pl-4">
            <h3 className="text-white font-semibold mb-2">Step 1: Download MT5 Bridge</h3>
            <p className="text-gray-300 mb-2">Download and run the Python MT5 bridge script on your computer where MT5 is installed.</p>
            <Button 
              onClick={() => window.open('/mt5_bridge.py', '_blank')}
              variant="outline"
              className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
            >
              Download MT5 Bridge Script
            </Button>
          </div>
          
          <div className="border-l-4 border-tech-blue pl-4">
            <h3 className="text-white font-semibold mb-2">Step 2: Install Requirements</h3>
            <p className="text-gray-300 mb-2">Install Python packages:</p>
            <code className="bg-tech-dark p-2 rounded text-green-400 block">
              pip install MetaTrader5 fastapi uvicorn requests websockets
            </code>
          </div>
          
          <div className="border-l-4 border-tech-blue pl-4">
            <h3 className="text-white font-semibold mb-2">Step 3: Run Bridge</h3>
            <p className="text-gray-300 mb-2">Run the bridge script:</p>
            <code className="bg-tech-dark p-2 rounded text-green-400 block">
              python mt5_bridge.py
            </code>
          </div>
          
          <div className="border-l-4 border-tech-blue pl-4">
            <h3 className="text-white font-semibold mb-2">Step 4: Enable Auto Trading</h3>
            <p className="text-gray-300">Make sure "AutoTrading" is enabled in your MT5 terminal (Tools → Options → Expert Advisors → Allow automated trading)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MT5SetupGuide;
