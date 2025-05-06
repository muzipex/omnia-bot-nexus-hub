import React, { useEffect, useRef } from 'react';

const MatrixCandleStickBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to fill the screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initial resize
    resizeCanvas();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Market structure parameters
    const candleWidth = 8;
    const gap = 4;
    const columns = Math.ceil(canvas.width / (candleWidth + gap));
    
    // Create separate price channels for more realistic market structure
    const priceChannels = [];
    const channelCount = 5;
    
    for (let c = 0; c < channelCount; c++) {
      const startX = Math.random() * canvas.width;
      const channelHeight = canvas.height / channelCount;
      const baseY = c * channelHeight + channelHeight / 2;
      const trend = Math.random() > 0.5 ? 'uptrend' : 'downtrend';
      const volatility = 0.5 + Math.random() * 2;
      const speed = 0.3 + Math.random() * 0.7;
      
      priceChannels.push({
        startX,
        baseY,
        trend,
        volatility,
        speed,
        lastPrice: baseY,
        priceHistory: [],
        trendPhase: 0,
        trendDuration: 200 + Math.random() * 300,
        supportLevel: baseY + 30 + Math.random() * 20,
        resistanceLevel: baseY - 30 - Math.random() * 20
      });
    }
    
    const candlesticks: {
      x: number;
      open: number;
      close: number;
      high: number;
      low: number;
      isUp: boolean;
      channelIndex: number;
      opacity: number;
      age: number;
      maxAge: number;
      fadeSpeed: number;
    }[] = [];
    
    // Initialize candlesticks in each channel
    priceChannels.forEach((channel, channelIndex) => {
      const candles = Math.ceil(columns / channelCount);
      
      for (let i = 0; i < candles; i++) {
        const x = channel.startX + i * (candleWidth + gap);
        if (x > canvas.width) continue;
        
        const price = channel.baseY;
        const open = price;
        const close = price + (Math.random() * 20 - 10);
        const high = Math.max(open, close) + Math.random() * 10;
        const low = Math.min(open, close) - Math.random() * 10;
        const isUp = close > open;
        
        candlesticks.push({
          x,
          open,
          close,
          high,
          low,
          isUp,
          channelIndex,
          opacity: 0.5 + Math.random() * 0.5,
          age: 0,
          maxAge: 300 + Math.random() * 300,
          fadeSpeed: 0.01 + Math.random() * 0.01
        });
      }
    });
    
    // Animation loop
    const animate = () => {
      // Create dim transparent background for trail effect
      ctx.fillStyle = 'rgba(10, 12, 21, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update price channels
      priceChannels.forEach((channel, index) => {
        channel.trendPhase++;
        
        // Change trend periodically to create support/resistance patterns
        if (channel.trendPhase > channel.trendDuration) {
          channel.trend = channel.trend === 'uptrend' ? 'downtrend' : 'uptrend';
          channel.trendPhase = 0;
          channel.trendDuration = 200 + Math.random() * 300;
          
          // Update support/resistance levels based on recent price action
          if (channel.trend === 'uptrend') {
            channel.resistanceLevel = channel.lastPrice - 20 - Math.random() * 30;
          } else {
            channel.supportLevel = channel.lastPrice + 20 + Math.random() * 30;
          }
        }
        
        // Calculate next price based on trend
        let priceMove;
        
        if (channel.trend === 'uptrend') {
          // In uptrend, move towards resistance with momentum
          const distToResistance = Math.abs(channel.lastPrice - channel.resistanceLevel);
          if (distToResistance < 15) {
            // Near resistance - higher chance of reversal
            priceMove = Math.random() > 0.7 ? -channel.volatility : channel.volatility * 0.5;
          } else {
            // Normal uptrend movement
            priceMove = (Math.random() * channel.volatility * 2) - (channel.volatility * 0.8);
          }
        } else {
          // In downtrend, move towards support with momentum
          const distToSupport = Math.abs(channel.lastPrice - channel.supportLevel);
          if (distToSupport < 15) {
            // Near support - higher chance of reversal
            priceMove = Math.random() > 0.7 ? channel.volatility : -channel.volatility * 0.5;
          } else {
            // Normal downtrend movement
            priceMove = (Math.random() * channel.volatility * 2) - (channel.volatility * 1.2);
          }
        }
        
        // Update price
        channel.lastPrice += priceMove;
        
        // Keep price within reasonable channel bounds to prevent extreme movements
        const midPoint = (channel.supportLevel + channel.resistanceLevel) / 2;
        const maxDeviation = Math.abs(channel.supportLevel - channel.resistanceLevel);
        
        if (Math.abs(channel.lastPrice - midPoint) > maxDeviation) {
          channel.lastPrice = midPoint + (priceMove > 0 ? 1 : -1) * (maxDeviation * 0.9);
        }
        
        // Store price for history
        channel.priceHistory.push(channel.lastPrice);
        if (channel.priceHistory.length > 100) {
          channel.priceHistory.shift();
        }
        
        // Occasionally draw support/resistance lines
        if (Math.random() < 0.01) {
          ctx.globalAlpha = 0.1;
          ctx.strokeStyle = '#1EAEDB';
          ctx.beginPath();
          ctx.moveTo(0, channel.resistanceLevel);
          ctx.lineTo(canvas.width * 0.3, channel.resistanceLevel);
          ctx.stroke();
          
          ctx.strokeStyle = '#1EAEDB';
          ctx.beginPath();
          ctx.moveTo(0, channel.supportLevel);
          ctx.lineTo(canvas.width * 0.3, channel.supportLevel);
          ctx.stroke();
        }
        
        // Occasionally draw trend lines
        if (Math.random() < 0.005 && channel.priceHistory.length > 30) {
          ctx.globalAlpha = 0.15;
          ctx.strokeStyle = channel.trend === 'uptrend' ? '#00FF41' : '#ea384c';
          ctx.beginPath();
          
          const startIndex = channel.priceHistory.length - 30;
          ctx.moveTo(0, channel.priceHistory[startIndex]);
          
          for (let i = 1; i < 30; i++) {
            ctx.lineTo(i * 5, channel.priceHistory[startIndex + i]);
          }
          ctx.stroke();
        }
      });
      
      // Update and draw candlesticks
      candlesticks.forEach((candle, i) => {
        // Increase age
        candle.age++;
        
        // Fade out old candles
        if (candle.age > candle.maxAge * 0.7) {
          candle.opacity -= candle.fadeSpeed;
        }
        
        // Reset candles that are too old or faded out
        if (candle.age > candle.maxAge || candle.opacity <= 0) {
          const channel = priceChannels[candle.channelIndex];
          const open = channel.lastPrice;
          const close = open + (Math.random() * 16 - 8);
          const high = Math.max(open, close) + Math.random() * 8;
          const low = Math.min(open, close) - Math.random() * 8;
          
          candle.x -= canvas.width * 1.1;
          if (candle.x < -candleWidth) {
            candle.x = canvas.width + Math.random() * 50;
          }
          
          candle.open = open;
          candle.close = close;
          candle.high = high;
          candle.low = low;
          candle.isUp = close > open;
          candle.opacity = 0.5 + Math.random() * 0.5;
          candle.age = 0;
          candle.maxAge = 300 + Math.random() * 300;
        }
        
        // Draw candle
        const color = candle.isUp ? '#00FF41' : '#ea384c';
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.globalAlpha = candle.opacity;
        
        // Draw price action patterns
        const candleBody = Math.abs(candle.close - candle.open);
        const wickTop = candle.isUp ? candle.close : candle.open;
        const wickBottom = candle.isUp ? candle.open : candle.close;
        
        // Draw candle body
        ctx.fillRect(
          candle.x, 
          candle.isUp ? candle.close : candle.open, 
          candleWidth, 
          candleBody || 1
        );
        
        // Draw top wick
        ctx.beginPath();
        ctx.moveTo(candle.x + candleWidth / 2, wickTop);
        ctx.lineTo(candle.x + candleWidth / 2, candle.high);
        ctx.stroke();
        
        // Draw bottom wick
        ctx.beginPath();
        ctx.moveTo(candle.x + candleWidth / 2, wickBottom);
        ctx.lineTo(candle.x + candleWidth / 2, candle.low);
        ctx.stroke();
        
        // Occasionally draw volume bars below candles
        if (Math.random() < 0.3) {
          ctx.globalAlpha = candle.opacity * 0.4;
          const volumeHeight = Math.random() * 20 + 5;
          ctx.fillRect(
            candle.x,
            canvas.height - volumeHeight,
            candleWidth,
            volumeHeight
          );
        }
      });
      
      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 opacity-70"
      aria-hidden="true"
    />
  );
};

export default MatrixCandleStickBackground;
