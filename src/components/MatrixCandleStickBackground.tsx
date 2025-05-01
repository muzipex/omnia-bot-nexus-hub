
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
    const candleWidth = 3;
    const gap = 8;
    const columns = Math.ceil(canvas.width / (candleWidth + gap));
    const candlesticks: {
      x: number;
      y: number;
      height: number;
      isUp: boolean;
      speed: number;
      opacity: number;
      color: string;
    }[] = [];
    
    // Initialize candlesticks
    for (let i = 0; i < columns; i++) {
      const x = i * (candleWidth + gap);
      const isUp = Math.random() > 0.5;
      const color = Math.random() > 0.7 
        ? '#00FF41' // Green - 30% chance
        : Math.random() > 0.5 
          ? '#1EAEDB' // Blue - 35% chance
          : '#8B5CF6'; // Purple - 35% chance
          
      candlesticks.push({
        x,
        y: Math.random() * canvas.height,
        height: 5 + Math.random() * 15,
        isUp,
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0.1 + Math.random() * 0.3,
        color
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
        
        // Reset position when it goes off screen
        if (candle.y > canvas.height) {
          candle.y = 0;
          candle.isUp = Math.random() > 0.5;
          candle.height = 5 + Math.random() * 15;
          candle.speed = 0.5 + Math.random() * 1.5;
        }
        
        // Draw candlestick
        ctx.fillStyle = candle.color;
        ctx.globalAlpha = candle.opacity;
        
        // Draw candlestick body
        ctx.fillRect(candle.x, candle.y, candleWidth, candle.height);
        
        // Draw wick
        const wickHeight = candle.height * 0.6;
        ctx.fillRect(
          candle.x + candleWidth / 2 - 0.5, 
          candle.isUp ? candle.y - wickHeight : candle.y + candle.height, 
          1, 
          wickHeight
        );
        
        // Draw horizontal price lines occasionally
        if (Math.random() < 0.01) {
          ctx.globalAlpha = 0.2;
          ctx.fillRect(
            candle.x - gap, 
            candle.y + (candle.isUp ? 0 : candle.height), 
            candleWidth + gap * 2, 
            1
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
      className="fixed inset-0 z-0 opacity-60"
      aria-hidden="true"
    />
  );
};

export default MatrixCandleStickBackground;
