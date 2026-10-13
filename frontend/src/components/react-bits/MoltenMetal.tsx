'use client';

import React, { useEffect, useRef } from 'react';
import './MoltenMetal.css';

export interface MoltenMetalProps {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  scale?: number;
  detail?: number;
  glow?: number;
  coreSize?: number;
  brightness?: number;
  opacity?: number;
  backgroundColor?: string;
  lightMode?: boolean;
  className?: string;
}

export const MoltenMetal: React.FC<MoltenMetalProps> = ({
  color1 = '#E8C18B',
  color2 = '#B96F4C',
  color3 = '#39251B',
  speed = 0.4,
  scale = 3,
  glow = 1.6,
  opacity = 0.85,
  className = '',
  lightMode = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      width = canvas.width = parent ? parent.offsetWidth : window.innerWidth;
      height = canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse coordinates with smoothing
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Dynamic wave mesh nodes for metallic fluid simulation
    const cols = 28;
    const rows = 18;
    let time = 0;

    const render = () => {
      time += 0.02 * speed;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const cellW = width / (cols - 1);
      const cellH = height / (rows - 1);

      // Create rich fluid undulating bands
      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const x0 = c * cellW;
          const y0 = r * cellH;

          // Multi-frequency sine ripples creating organic metallic waves
          const distMouse = Math.hypot(x0 - mouse.x, y0 - mouse.y);
          const mouseDeform = Math.sin(distMouse * 0.015 - time * 2) * 18 * Math.exp(-distMouse * 0.002);

          const wave1 = Math.sin(x0 * 0.005 + y0 * 0.008 + time) * 22;
          const wave2 = Math.cos(x0 * 0.009 - y0 * 0.004 + time * 1.5) * 16;
          const wave3 = Math.sin((x0 + y0) * 0.004 + time * 0.8) * 12;

          const elevation = (wave1 + wave2 + wave3 + mouseDeform) / 50; // -1 to 1 normalized

          // Interpolate metallic colors based on elevation
          const t = Math.max(0, Math.min(1, (elevation + 1) / 2));

          ctx.save();
          const grad = ctx.createLinearGradient(x0, y0, x0 + cellW * 1.5, y0 + cellH * 1.5);
          if (t > 0.6) {
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);
          } else if (t > 0.3) {
            grad.addColorStop(0, color2);
            grad.addColorStop(1, color3);
          } else {
            grad.addColorStop(0, color3);
            grad.addColorStop(1, 'transparent');
          }

          ctx.globalAlpha = (0.2 + t * 0.45) * opacity;
          ctx.fillStyle = grad;

          // Draw undulating curved organic patches
          ctx.beginPath();
          ctx.moveTo(x0, y0 + wave1);
          ctx.bezierCurveTo(
            x0 + cellW * 0.5, y0 + wave2,
            x0 + cellW * 0.8, y0 + cellH + wave3,
            x0 + cellW, y0 + cellH + wave1
          );
          ctx.lineTo(x0, y0 + cellH + wave2);
          ctx.closePath();
          ctx.fill();

          // Specular metallic highlight crests
          if (t > 0.75) {
            ctx.beginPath();
            ctx.arc(x0 + cellW * 0.5, y0 + cellH * 0.5 + wave1 * 0.5, 3 + t * 4, 0, Math.PI * 2);
            ctx.fillStyle = color1;
            ctx.globalAlpha = 0.5 * opacity;
            ctx.shadowColor = color1;
            ctx.shadowBlur = 15 * glow;
            ctx.fill();
          }

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color1, color2, color3, speed, scale, glow, opacity, lightMode]);

  return (
    <div className={`molten-metal-container ${className}`.trim()} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
};

export default MoltenMetal;
