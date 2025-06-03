
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  height?: number;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = "GOLD",
  interval = "1D",
  theme = "dark",
  height = 500
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Clear any existing content
      containerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: symbol,
        interval: interval,
        timezone: "Etc/UTC",
        theme: theme,
        style: "1",
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: true,
        calendar: false,
        support_host: "https://www.tradingview.com"
      });

      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, theme]);

  return (
    <Card className="bg-tech-charcoal border-tech-blue/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          📈 Live Gold Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          style={{ height: `${height}px` }}
          className="tradingview-widget-container"
        >
          <div className="tradingview-widget-container__widget"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingViewChart;
