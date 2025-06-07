
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize, Minimize, Settings } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(height);

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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    setCurrentHeight(isExpanded ? height : window.innerHeight - 200);
  };

  const cardClasses = isExpanded 
    ? "bg-tech-charcoal border-tech-blue/30 fixed inset-4 z-50 flex flex-col"
    : "bg-tech-charcoal border-tech-blue/30 relative z-10";

  return (
    <>
      {isExpanded && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleExpanded} />
      )}
      
      <Card className={cardClasses}>
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              📈 Live Gold Chart
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleExpanded}
                className="border-tech-blue/30 text-gray-300 hover:bg-tech-blue/10"
              >
                {isExpanded ? (
                  <>
                    <Minimize className="w-4 h-4 mr-1" />
                    Minimize
                  </>
                ) : (
                  <>
                    <Maximize className="w-4 h-4 mr-1" />
                    Expand
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className={`p-0 ${isExpanded ? 'flex-1 overflow-hidden' : ''}`}>
          <div 
            ref={containerRef}
            style={{ 
              height: isExpanded ? '100%' : `${currentHeight}px`, 
              position: 'relative', 
              zIndex: 10 
            }}
            className="tradingview-widget-container"
          >
            <div className="tradingview-widget-container__widget"></div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TradingViewChart;
