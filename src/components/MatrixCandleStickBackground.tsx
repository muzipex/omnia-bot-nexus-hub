
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
    
    // Futuristic grid setup - with reduced opacity
    const gridSize = 60; // Increased grid size
    const mainGridLineWidth = 0.4; // Decreased line width
    const subGridLineWidth = 0.2; // Decreased line width
    const numberOfParticles = 25; // Reduced from 30 to 25
    
    // Particle properties with price-like movement
    const particles: {
      x: number;
      y: number;
      size: number;
      direction: number; // Direction of price movement (up/down)
      momentumY: number; // Momentum for Y-axis movement
      volatility: number; // How volatile/choppy the price movement is
      color: string;
      alpha: number;
      fadeSpeed: number;
      pulseMagnitude: number;
      timeOffset: number;
      historyPoints: {x: number, y: number}[]; // Store previous positions
      historyLength: number; // Number of history points to keep
    }[] = [];
    
    // Data flow lines (reduced number)
    const dataFlows: {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      speed: number;
      progress: number;
      color: string;
      width: number;
      lifetime: number;
      currentLife: number;
    }[] = [];
    
    // Color themes with glowing effect - darker background and more subtle grid
    const colors = {
      primaryBlue: '#1EAEDB',
      accentPurple: '#8B5CF6',
      accentMagenta: '#D946EF',
      accentCyan: '#0ea5e9',
      neonGreen: '#00FF41',
      background: 'rgba(10, 12, 21, 0.15)', // Increased opacity for darker effect
      gridLines: 'rgba(30, 174, 219, 0.05)', // Reduced opacity for grid
      subGridLines: 'rgba(30, 174, 219, 0.02)', // Even less visible sub-grid
      bullish: '#00FF41', // Green for up movement
      bearish: '#FF4169', // Red for down movement
    };
    
    // Initialize particles with price-like movement behaviors
    for (let i = 0; i < numberOfParticles; i++) {
      const colorOptions = [colors.primaryBlue, colors.accentPurple, colors.accentCyan, colors.neonGreen, colors.accentMagenta];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 1.5 + Math.random() * 2, // Slightly larger size for better visibility
        direction: Math.random() > 0.5 ? 1 : -1, // Initial direction (up/down)
        momentumY: (Math.random() - 0.5) * 0.5, // Initial momentum
        volatility: 0.05 + Math.random() * 0.2, // How quickly direction changes
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        alpha: 0.3 + Math.random() * 0.7,
        fadeSpeed: 0.001 + Math.random() * 0.002, // Slower fade for longer trails
        pulseMagnitude: 0.2 + Math.random() * 1.0,
        timeOffset: Math.random() * Math.PI * 2,
        historyPoints: [], // Empty array to store position history
        historyLength: 5 + Math.floor(Math.random() * 15) // Random trail length
      });
    }
    
    // Function to create new data flow line (reduced frequency)
    const createDataFlow = () => {
      if (dataFlows.length >= 6) return; // Reduced from 8 to 6
      
      // Choose random starting position from top or sides
      const startSide = Math.floor(Math.random() * 3); // 0: top, 1: left, 2: right
      let startX, startY, endX, endY;
      
      switch(startSide) {
        case 0: // Top
          startX = Math.random() * canvas.width;
          startY = -10;
          endX = Math.random() * canvas.width;
          endY = canvas.height + 10;
          break;
        case 1: // Left
          startX = -10;
          startY = Math.random() * canvas.height;
          endX = canvas.width + 10;
          endY = Math.random() * canvas.height;
          break;
        default: // Right
          startX = canvas.width + 10;
          startY = Math.random() * canvas.height;
          endX = -10;
          endY = Math.random() * canvas.height;
          break;
      }
      
      // Choose color based on pattern
      const colorOptions = [colors.primaryBlue, colors.accentPurple, colors.accentCyan, colors.neonGreen];
      
      dataFlows.push({
        startX,
        startY,
        endX,
        endY,
        speed: 0.001 + Math.random() * 0.002, // Slower speed
        progress: 0,
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        width: 1 + Math.random() * 2,
        lifetime: 150 + Math.random() * 200, // Longer lifetime
        currentLife: 0
      });
    };
    
    // Animation loop with price movement simulation
    const animate = () => {
      // Create dim transparent background for trail effect
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      const gridOffsetX = canvas.width / 2 % gridSize;
      const gridOffsetY = canvas.height / 2 % gridSize;
      
      // Draw sub-grid - reduced visibility
      ctx.strokeStyle = colors.subGridLines;
      ctx.lineWidth = subGridLineWidth;
      
      for (let x = gridOffsetX; x < canvas.width; x += gridSize / 4) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = gridOffsetY; y < canvas.height; y += gridSize / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Draw main grid - reduced visibility
      ctx.strokeStyle = colors.gridLines;
      ctx.lineWidth = mainGridLineWidth;
      
      for (let x = gridOffsetX; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = gridOffsetY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Create new data flows randomly (reduced frequency)
      if (Math.random() < 0.01 && dataFlows.length < 6) { // Reduced probability and max flows
        createDataFlow();
      }
      
      // Update and draw data flows
      dataFlows.forEach((flow, i) => {
        flow.currentLife++;
        if (flow.currentLife > flow.lifetime) {
          // Remove old flows
          dataFlows.splice(i, 1);
          return;
        }
        
        // Calculate alpha based on lifetime
        let alpha = 1;
        if (flow.currentLife < 20) {
          alpha = flow.currentLife / 20;
        } else if (flow.currentLife > flow.lifetime - 20) {
          alpha = (flow.lifetime - flow.currentLife) / 20;
        }
        
        // Update progress
        flow.progress += flow.speed;
        if (flow.progress > 1) {
          flow.progress = 1;
        }
        
        // Calculate current position
        const currentX = flow.startX + (flow.endX - flow.startX) * flow.progress;
        const currentY = flow.startY + (flow.endY - flow.startY) * flow.progress;
        
        // Draw line (simpler rendering)
        ctx.globalAlpha = alpha * 0.7; // Reduced opacity
        ctx.strokeStyle = flow.color;
        ctx.lineWidth = flow.width;
        ctx.beginPath();
        ctx.moveTo(flow.startX, flow.startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      });
      
      // Update and draw particles with price-like movement
      ctx.globalAlpha = 1;
      particles.forEach((particle, i) => {
        // Simulate price movement changes (direction changes)
        if (Math.random() < particle.volatility) {
          // Occasionally flip direction
          particle.direction *= -1;
          
          // Change color based on direction
          if (particle.direction > 0) {
            particle.color = colors.bullish; // Green for up
          } else {
            particle.color = colors.bearish; // Red for down
          }
        }
        
        // Add momentum with some randomness (simulates price "noise")
        particle.momentumY += particle.direction * (0.01 + Math.random() * 0.03);
        
        // Apply some friction/resistance to prevent extreme movements
        particle.momentumY *= 0.95;
        
        // Move particle Y based on price movement, X with slight drift
        particle.y += particle.momentumY;
        particle.x += (Math.random() - 0.5) * 0.5;
        
        // Store history point for trail
        particle.historyPoints.unshift({x: particle.x, y: particle.y});
        
        // Limit history length
        if (particle.historyPoints.length > particle.historyLength) {
          particle.historyPoints.pop();
        }
        
        // Contain particles within canvas
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Fade out
        particle.alpha -= particle.fadeSpeed;
        
        // Pulsating effect - Ensure pulseSize is always positive
        const pulseEffect = Math.sin(Date.now() * 0.005 + particle.timeOffset) * particle.pulseMagnitude;
        const pulseSize = Math.max(0.5, particle.size + pulseEffect);
        
        // Remove faded particles and create new ones
        if (particle.alpha <= 0) {
          particles.splice(i, 1);
          
          // Create a new particle to replace the faded one
          const colorOptions = [colors.primaryBlue, colors.accentPurple, colors.accentCyan];
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 1.5 + Math.random() * 2,
            direction: Math.random() > 0.5 ? 1 : -1,
            momentumY: (Math.random() - 0.5) * 0.5,
            volatility: 0.05 + Math.random() * 0.2,
            color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
            alpha: 0.3 + Math.random() * 0.7,
            fadeSpeed: 0.001 + Math.random() * 0.002,
            pulseMagnitude: 0.2 + Math.random() * 1.0,
            timeOffset: Math.random() * Math.PI * 2,
            historyPoints: [],
            historyLength: 5 + Math.floor(Math.random() * 15)
          });
          return;
        }
        
        // Draw particle trails (candlestick-like effect)
        if (particle.historyPoints.length > 1) {
          ctx.beginPath();
          ctx.moveTo(particle.historyPoints[0].x, particle.historyPoints[0].y);
          
          // Draw line connecting history points
          for (let j = 1; j < particle.historyPoints.length; j++) {
            ctx.lineTo(particle.historyPoints[j].x, particle.historyPoints[j].y);
          }
          
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = Math.max(0.5, pulseSize * 0.5);
          ctx.globalAlpha = particle.alpha * 0.5;
          ctx.stroke();
        }
        
        // Draw current particle - Ensure radius is positive
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, Math.max(0.1, pulseSize), 0, Math.PI * 2);
        ctx.fill();
        
        // Draw glow effect - Ensure radius is positive
        const glowSize = Math.max(1, pulseSize * 2);
        const glow = ctx.createRadialGradient(
          particle.x, particle.y, 0, 
          particle.x, particle.y, glowSize
        );
        glow.addColorStop(0, `${particle.color}80`); // 50% opacity
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      });
      
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
      className="fixed inset-0 z-0 opacity-80"
      aria-hidden="true"
    />
  );
};

export default MatrixCandleStickBackground;
