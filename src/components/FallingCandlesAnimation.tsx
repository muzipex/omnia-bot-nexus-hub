
import React, { useEffect, useRef } from 'react';

const FallingCandlesAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initialize canvas size
    resizeCanvas();

    // Listen for window resize events
    window.addEventListener('resize', resizeCanvas);

    // Create candle class
    class Candle {
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
      speed: number;
      wickHeight: number;

      constructor() {
        this.width = Math.random() * 5 + 2; // Candle width between 2-7px
        this.height = Math.random() * 50 + 10; // Candle height between 10-60px
        this.x = Math.random() * canvas.width;
        this.y = -this.height - Math.random() * 100; // Start above the viewport
        this.color = Math.random() > 0.5 ? '#22c55e' : '#ef4444'; // Green or red
        this.speed = Math.random() * 1 + 0.5; // Speed between 0.5-1.5
        this.wickHeight = this.height * (0.2 + Math.random() * 0.3); // Wick height as % of candle height
      }

      update() {
        this.y += this.speed;
        // Reset if it goes out of screen
        if (this.y > canvas.height) {
          this.y = -this.height - Math.random() * 50;
          this.x = Math.random() * canvas.width;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw candle body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw upper wick
        ctx.fillRect(this.x + this.width / 2 - 0.5, this.y - this.wickHeight, 1, this.wickHeight);
        
        // Draw lower wick
        ctx.fillRect(this.x + this.width / 2 - 0.5, this.y + this.height, 1, this.wickHeight / 2);
      }
    }

    // Create candles
    const numberOfCandles = Math.floor(canvas.width / 30); // 1 candle per 30px of width
    const candles: Candle[] = [];
    for (let i = 0; i < numberOfCandles; i++) {
      candles.push(new Candle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw candles
      candles.forEach(candle => {
        candle.update();
        candle.draw(ctx);
      });
      
      requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-20"
    />
  );
};

export default FallingCandlesAnimation;
