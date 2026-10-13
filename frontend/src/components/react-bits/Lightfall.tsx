'use client';

import React, { useEffect, useRef } from 'react';
import './Lightfall.css';

interface LightfallProps {
  colors?: string[];
  speed?: number;
  streakCount?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Lightfall: React.FC<LightfallProps> = ({
  colors = ['#E8C18B', '#F4F0E9', '#D4AF37', '#B8860B'],
  speed = 0.8,
  streakCount = 65,
  className = '',
  style = {}
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

    // Particle streaks
    const streaks: Array<{
      x: number;
      y: number;
      len: number;
      spd: number;
      col: string;
      alpha: number;
      thick: number;
      slant: number;
    }> = [];

    for (let i = 0; i < streakCount; i++) {
      streaks.push({
        x: Math.random() * (width || window.innerWidth),
        y: Math.random() * (height || window.innerHeight),
        len: 80 + Math.random() * 180,
        spd: (2 + Math.random() * 4) * speed,
        col: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.35 + Math.random() * 0.55,
        thick: 1.5 + Math.random() * 2.5,
        slant: 0.25
      });
    }

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      for (const s of streaks) {
        s.y += s.spd;
        s.x += s.spd * s.slant;

        if (s.y - s.len > height) {
          s.y = -s.len;
          s.x = Math.random() * (width + 200) - 100;
        }

        const headX = s.x;
        const headY = s.y;
        const tailX = s.x - s.len * s.slant;
        const tailY = s.y - s.len;

        const grad = ctx.createLinearGradient(headX, headY, tailX, tailY);
        grad.addColorStop(0, s.col);
        grad.addColorStop(0.3, s.col);
        grad.addColorStop(1, 'transparent');

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.thick;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(headX, headY);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Glowing streak tip
        ctx.beginPath();
        ctx.arc(headX, headY, s.thick * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = s.col;
        ctx.shadowColor = s.col;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [colors, speed, streakCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ display: 'block', ...style }}
    />
  );
};

export default Lightfall;
