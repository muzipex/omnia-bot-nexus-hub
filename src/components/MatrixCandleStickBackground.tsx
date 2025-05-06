
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
    
    // Futuristic grid setup
    const gridSize = 40;
    const mainGridLineWidth = 1;
    const subGridLineWidth = 0.3;
    const numberOfParticles = 80;
    
    // Particle properties
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      fadeSpeed: number;
      pulseSpeed: number;
      pulseMagnitude: number;
      timeOffset: number;
    }[] = [];
    
    // Create data flow lines
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
    
    // Color themes with glowing effect
    const colors = {
      primaryBlue: '#1EAEDB',
      accentPurple: '#8B5CF6',
      accentMagenta: '#D946EF',
      accentCyan: '#0ea5e9',
      neonGreen: '#00FF41',
      background: 'rgba(10, 12, 21, 0.1)',
      gridLines: 'rgba(30, 174, 219, 0.15)',
      subGridLines: 'rgba(30, 174, 219, 0.05)',
    };
    
    // Initialize particles
    for (let i = 0; i < numberOfParticles; i++) {
      const colorOptions = [colors.primaryBlue, colors.accentPurple, colors.accentCyan, colors.neonGreen, colors.accentMagenta];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.5 + Math.random() * 3.5,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8,
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        alpha: 0.1 + Math.random() * 0.9,
        fadeSpeed: 0.001 + Math.random() * 0.005,
        pulseSpeed: 0.01 + Math.random() * 0.05,
        pulseMagnitude: 0.5 + Math.random() * 1.5,
        timeOffset: Math.random() * Math.PI * 2
      });
    }
    
    // Function to create new data flow line
    const createDataFlow = () => {
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
        speed: 0.002 + Math.random() * 0.004,
        progress: 0,
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        width: 1 + Math.random() * 2.5,
        lifetime: 100 + Math.random() * 150,
        currentLife: 0
      });
    };
    
    // Animation loop
    const animate = () => {
      // Create dim transparent background for trail effect
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      const gridOffsetX = canvas.width / 2 % gridSize;
      const gridOffsetY = canvas.height / 2 % gridSize;
      
      // Draw sub-grid
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
      
      // Draw main grid
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
      
      // Create new data flows randomly
      if (Math.random() < 0.05 && dataFlows.length < 15) {
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
        
        // Draw illuminating point at the flow head
        ctx.globalAlpha = alpha;
        const gradient = ctx.createRadialGradient(
          currentX, currentY, 0, 
          currentX, currentY, 70
        );
        gradient.addColorStop(0, flow.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 70, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw line
        ctx.strokeStyle = flow.color;
        ctx.lineWidth = flow.width;
        ctx.beginPath();
        ctx.moveTo(flow.startX, flow.startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        // Create particles at flow head occasionally
        if (Math.random() < 0.2) {
          const particleColor = flow.color;
          particles.push({
            x: currentX,
            y: currentY,
            size: 1 + Math.random() * 3,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            color: particleColor,
            alpha: 0.6 + Math.random() * 0.4,
            fadeSpeed: 0.005 + Math.random() * 0.01,
            pulseSpeed: 0.02 + Math.random() * 0.08,
            pulseMagnitude: 0.5 + Math.random() * 1,
            timeOffset: Math.random() * Math.PI * 2
          });
        }
      });
      
      // Update and draw particles
      ctx.globalAlpha = 1;
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Contain particles within canvas
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -0.9;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -0.9;
        
        // Fade out
        particle.alpha -= particle.fadeSpeed;
        
        // Pulsating effect - FIX: Ensure pulseSize is always positive
        const pulseEffect = Math.sin(Date.now() * particle.pulseSpeed + particle.timeOffset) * particle.pulseMagnitude;
        const pulseSize = Math.max(0.1, particle.size + pulseEffect);
        
        // Remove faded particles
        if (particle.alpha <= 0) {
          particles.splice(i, 1);
          return;
        }
        
        // Draw particle - FIX: Ensure radius is positive
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw glow effect - FIX: Ensure radius is positive
        const glowSize = Math.max(0.1, pulseSize * 2.5);
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
      
      // Occasionally create new particles
      if (particles.length < numberOfParticles && Math.random() < 0.1) {
        const colorOptions = [colors.primaryBlue, colors.accentPurple, colors.accentCyan, colors.neonGreen, colors.accentMagenta];
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 0.5 + Math.random() * 3.5,
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: (Math.random() - 0.5) * 0.8,
          color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
          alpha: 0.1 + Math.random() * 0.9,
          fadeSpeed: 0.001 + Math.random() * 0.005,
          pulseSpeed: 0.01 + Math.random() * 0.05,
          pulseMagnitude: 0.5 + Math.random() * 1.5,
          timeOffset: Math.random() * Math.PI * 2
        });
      }
      
      // Draw circular nodes at grid intersections occasionally
      for (let x = gridOffsetX; x < canvas.width; x += gridSize) {
        for (let y = gridOffsetY; y < canvas.height; y += gridSize) {
          if (Math.random() < 0.001) {
            const nodeSize = 3 + Math.random() * 5;
            const nodeColor = Math.random() > 0.5 ? colors.accentPurple : colors.primaryBlue;
            
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = nodeColor;
            ctx.beginPath();
            ctx.arc(x, y, nodeSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw glow - FIX: Ensure radius is positive
            const nodeGlowSize = Math.max(0.1, nodeSize * 3);
            const nodeGlow = ctx.createRadialGradient(x, y, 0, x, y, nodeGlowSize);
            nodeGlow.addColorStop(0, `${nodeColor}90`);
            nodeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = nodeGlow;
            ctx.beginPath();
            ctx.arc(x, y, nodeGlowSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      // Draw digital rain effect occasionally
      if (Math.random() < 0.05) {
        const startX = Math.random() * canvas.width;
        const characters = "01010101010";
        const fontSize = 14;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillStyle = colors.neonGreen;
        ctx.globalAlpha = 0.7;
        
        for (let i = 0; i < 10; i++) {
          const char = characters.charAt(Math.floor(Math.random() * characters.length));
          ctx.fillText(char, startX, i * fontSize);
        }
      }
      
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
