
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
    
    // Candlestick parameters
    const candleWidth = 6;
    const gap = 10;
    const columns = Math.ceil(canvas.width / (candleWidth + gap));
    const candlesticks: {
      x: number;
      y: number;
      height: number;
      isUp: boolean;
      speed: number;
      opacity: number;
      color: string;
      wickHeight: number;
      pulsating: boolean;
      pulseSpeed: number;
      pulseDirection: boolean;
      pulseOpacity: number;
    }[] = [];
    
    // Initialize candlesticks
    for (let i = 0; i < columns; i++) {
      const x = i * (candleWidth + gap);
      const isUp = Math.random() > 0.5;
      const color = isUp 
        ? '#00FF41' // Green for up candles
        : '#ea384c'; // Red for down candles
          
      candlesticks.push({
        x,
        y: Math.random() * canvas.height,
        height: 5 + Math.random() * 15,
        isUp,
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0.1 + Math.random() * 0.4,
        color,
        wickHeight: 8 + Math.random() * 20,
        pulsating: Math.random() > 0.7, // 30% of candlesticks will pulsate
        pulseSpeed: 0.01 + Math.random() * 0.03,
        pulseDirection: true, // true = increasing opacity
        pulseOpacity: 0.1 + Math.random() * 0.3
      });
    }
    
    // Animation loop
    const animate = () => {
      // Create dim transparent background for trail effect
      ctx.fillStyle = 'rgba(10, 12, 21, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw candlesticks
      candlesticks.forEach(candle => {
        // Update position
        candle.y += candle.speed;
        
        // Handle pulsating effect
        if (candle.pulsating) {
          if (candle.pulseDirection) {
            candle.pulseOpacity += candle.pulseSpeed;
            if (candle.pulseOpacity >= 0.8) candle.pulseDirection = false;
          } else {
            candle.pulseOpacity -= candle.pulseSpeed;
            if (candle.pulseOpacity <= 0.2) candle.pulseDirection = true;
          }
        }
        
        // Reset position when it goes off screen
        if (candle.y > canvas.height) {
          candle.y = -20 - Math.random() * 50; // Start above the screen with some variance
          candle.isUp = Math.random() > 0.5;
          candle.height = 5 + Math.random() * 15;
          candle.speed = 0.5 + Math.random() * 2;
          candle.wickHeight = 8 + Math.random() * 20;
          // Update color based on the new isUp value
          candle.color = candle.isUp ? '#00FF41' : '#ea384c';
        }
        
        // Draw candlestick
        ctx.fillStyle = candle.color;
        ctx.globalAlpha = candle.pulsating ? candle.pulseOpacity : candle.opacity;
        
        // Draw candlestick body
        ctx.fillRect(candle.x, candle.y, candleWidth, candle.height);
        
        // Draw wick
        ctx.fillRect(
          candle.x + candleWidth / 2 - 0.5, 
          candle.isUp ? candle.y - candle.wickHeight : candle.y + candle.height, 
          1, 
          candle.wickHeight
        );
        
        // Draw horizontal price lines occasionally
        if (Math.random() < 0.01) {
          ctx.globalAlpha = 0.2;
          ctx.fillRect(
            candle.x - gap, 
            candle.y + (candle.isUp ? 0 : candle.height), 
            candleWidth + gap * 3, 
            1
          );
        }
        
        // Occasionally draw a glowing "data point"
        if (Math.random() < 0.001) {
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(
            candle.x + candleWidth / 2,
            candle.y + candle.height / 2,
            2,
            0,
            Math.PI * 2
          );
          ctx.fill();
          
          // Add a glow effect
          const gradient = ctx.createRadialGradient(
            candle.x + candleWidth / 2,
            candle.y + candle.height / 2,
            0,
            candle.x + candleWidth / 2,
            candle.y + candle.height / 2,
            8
          );
          gradient.addColorStop(0, candle.color);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(
            candle.x + candleWidth / 2,
            candle.y + candle.height / 2,
            8,
            0,
            Math.PI * 2
          );
          ctx.fill();
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
