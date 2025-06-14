
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const HealthSummaryCard = ({ status }: { status: { serverRunning: boolean; mt5Connected: boolean; autoTradingActive: boolean } }) => {
  return (
    <Card className="bg-tech-charcoal border-tech-blue/30">
      <CardHeader>
        <CardTitle className="text-white">Account Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Bridge Server:</span>{" "}
            <span className={status.serverRunning ? "text-green-400" : "text-red-500"}>
              {status.serverRunning ? "Running" : "Down"}
            </span>
          </div>
          <div>
            <span className="font-semibold">MT5 Connection:</span>{" "}
            <span className={status.mt5Connected ? "text-green-400" : "text-red-500"}>
              {status.mt5Connected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div>
            <span className="font-semibold">Auto-Trading:</span>{" "}
            <span className={status.autoTradingActive ? "text-green-400" : "text-yellow-400"}>
              {status.autoTradingActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
export default HealthSummaryCard;
