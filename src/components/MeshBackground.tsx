/**
 * NEURAL: Mesh Gradient Background Component
 * BRAINSAIT: Glass morphism with animated gradients
 */

'use client';

import { useEffect, useRef } from 'react';

interface MeshBackgroundProps {
  className?: string;
  primarySpeed?: number;
  wireframeSpeed?: number;
  colors?: {
    primary: string[];
    accent: string[];
    wireframe: string;
  };
}

export default function MeshBackground({ 
  className = '',
  primarySpeed = 0.3,
  wireframeSpeed = 0.2,
  colors = {
    primary: ['#1a365d', '#2b6cb8', '#0ea5e9'],
    accent: ['#ea580c', '#64748b'],
    wireframe: '#ffffff60'
  }
}: MeshBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;

    const animate = () => {
      time += 0.01;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient mesh
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time * primarySpeed) * 200,
        canvas.height / 2 + Math.cos(time * primarySpeed) * 200,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );
      
      gradient.addColorStop(0, colors.primary[0] + '40');
      gradient.addColorStop(0.3, colors.primary[1] + '30');
      gradient.addColorStop(0.6, colors.primary[2] + '20');
      gradient.addColorStop(1, colors.accent[0] + '10');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add wireframe overlay
      ctx.strokeStyle = colors.wireframe;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      
      const gridSize = 100;
      const offsetX = (time * wireframeSpeed * 50) % gridSize;
      const offsetY = (time * wireframeSpeed * 30) % gridSize;
      
      for (let x = -gridSize + offsetX; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = -gridSize + offsetY; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [primarySpeed, wireframeSpeed, colors]);

  return (
    <div className={`${className} bg-black overflow-hidden`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ filter: 'blur(1px)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-teal-900/20" />
    </div>
  );
}
