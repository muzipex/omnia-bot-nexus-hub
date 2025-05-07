
import React, { useEffect, useRef } from 'react';
import { ChartCandlestick } from 'lucide-react';

interface Candle {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const FallingCandlesAnimation: React.FC = () => {
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
    
    // Candles array
    const candles: Candle[] = [];
    const colors = ['#1EAEDB', '#8B5CF6', '#00FF41'];
    const bullColors = ['#00FF41', '#22c55e', '#4ade80'];
    const bearColors = ['#ef4444', '#dc2626', '#b91c1c'];
    
    // Generate initial candles
    const createCandle = () => {
      // Randomly decide if it's a bullish or bearish candle
      const isBullish = Math.random() > 0.5;
      const colorOptions = isBullish ? bullColors : bearColors;
      
      candles.push({
        x: Math.random() * canvas.width,
        y: -30 - Math.random() * 100, // Start above the visible area
        size: 8 + Math.random() * 16, // Random size between 8 and 24
        speed: 0.5 + Math.random() * 2.5, // Random speed
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        rotation: Math.random() * Math.PI * 2, // Random initial rotation
        rotationSpeed: (Math.random() - 0.5) * 0.03, // Random rotation speed
        opacity: 0.3 + Math.random() * 0.7 // Random opacity
      });
    };
    
    // Create initial batch of candles
    for (let i = 0; i < 15; i++) {
      createCandle();
    }
    
    // Animation function
    const animate = () => {
      // Clear the canvas with a subtle fade effect
      ctx.fillStyle = 'rgba(10, 12, 21, 0.1)'; // Match background color with opacity
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw candles
      candles.forEach((candle, index) => {
        // Update position
        candle.y += candle.speed;
        
        // Update rotation
        candle.rotation += candle.rotationSpeed;
        
        // Remove if off screen
        if (candle.y > canvas.height + 50) {
          candles.splice(index, 1);
          createCandle(); // Create a new one to replace it
          return;
        }
        
        // Draw candle
        ctx.save();
        ctx.translate(candle.x, candle.y);
        ctx.rotate(candle.rotation);
        
        // Draw candlestick
        const width = candle.size;
        const height = candle.size * 2;
        const wickWidth = 1;
        const wickHeight = height * 1.5;
        
        // Draw candle body
        ctx.globalAlpha = candle.opacity;
        ctx.fillStyle = candle.color;
        ctx.fillRect(-width/2, -height/2, width, height);
        
        // Draw wicks
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-wickWidth/2, -wickHeight/2, wickWidth, wickHeight);
        
        ctx.restore();
      });
      
      // Occasionally add new candles
      if (Math.random() < 0.03 && candles.length < 30) {
        createCandle();
      }
      
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
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default FallingCandlesAnimation;
