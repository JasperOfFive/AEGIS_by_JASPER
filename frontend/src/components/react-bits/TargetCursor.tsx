'use client';

import React, { useEffect, useRef, useState } from 'react';
import './TargetCursor.css';

interface TargetCursorProps {
  cursorColor?: string;
  cursorColorOnTarget?: string;
  targetSelector?: string;
  size?: number;
  cornerSize?: number;
  thickness?: number;
  hideDefaultCursor?: boolean;
  blendMode?: string;
}

export const TargetCursor: React.FC<TargetCursorProps> = ({
  cursorColor = '#E8C18B',
  cursorColorOnTarget = '#FFFFFF',
  targetSelector = 'button, a, input, select, textarea, [role="button"], .cursor-target',
  size = 32,
  cornerSize = 10,
  thickness = 2,
  hideDefaultCursor = false,
  blendMode = 'normal'
}) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [targetBox, setTargetBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const animRef = useRef<number>(0);

  // Smooth position tracking
  const posRef = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Check if hovering a target element
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const target = el?.closest(targetSelector) as HTMLElement | null;

      if (target) {
        const rect = target.getBoundingClientRect();
        setIsHovering(true);
        setTargetBox({
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height
        });
      } else {
        setIsHovering(false);
        setTargetBox(null);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth lerp loop
    const tick = () => {
      const ease = 0.22;
      posRef.current.x += (posRef.current.targetX - posRef.current.x) * ease;
      posRef.current.y += (posRef.current.targetY - posRef.current.y) * ease;
      setPosition({ x: posRef.current.x, y: posRef.current.y });
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animRef.current);
    };
  }, [targetSelector, isVisible]);

  if (!isVisible) return null;

  const currentColor = isHovering ? cursorColorOnTarget : cursorColor;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden"
      style={{
        display: isVisible ? 'block' : 'none',
        mixBlendMode: (blendMode as any) || 'normal'
      }}
    >
      {isHovering && targetBox ? (
        /* Target bracket frame locking around the hovered element */
        <div
          className="absolute transition-all duration-150 ease-out"
          style={{
            transform: `translate3d(${targetBox.x - 4}px, ${targetBox.y - 4}px, 0)`,
            width: `${targetBox.w + 8}px`,
            height: `${targetBox.h + 8}px`
          }}
        >
          {/* Top Left */}
          <div
            className="absolute top-0 left-0"
            style={{
              width: `${cornerSize}px`,
              height: `${cornerSize}px`,
              borderTop: `${thickness}px solid ${currentColor}`,
              borderLeft: `${thickness}px solid ${currentColor}`
            }}
          />
          {/* Top Right */}
          <div
            className="absolute top-0 right-0"
            style={{
              width: `${cornerSize}px`,
              height: `${cornerSize}px`,
              borderTop: `${thickness}px solid ${currentColor}`,
              borderRight: `${thickness}px solid ${currentColor}`
            }}
          />
          {/* Bottom Left */}
          <div
            className="absolute bottom-0 left-0"
            style={{
              width: `${cornerSize}px`,
              height: `${cornerSize}px`,
              borderBottom: `${thickness}px solid ${currentColor}`,
              borderLeft: `${thickness}px solid ${currentColor}`
            }}
          />
          {/* Bottom Right */}
          <div
            className="absolute bottom-0 right-0"
            style={{
              width: `${cornerSize}px`,
              height: `${cornerSize}px`,
              borderBottom: `${thickness}px solid ${currentColor}`,
              borderRight: `${thickness}px solid ${currentColor}`
            }}
          />
        </div>
      ) : (
        /* Free-roaming spinning 4-bracket reticle cursor */
        <div
          className="absolute"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%) scale(${isClicking ? 0.85 : 1})`,
            width: `${size}px`,
            height: `${size}px`,
            transition: 'transform 0.05s ease-out'
          }}
        >
          {/* Center aiming dot */}
          <div
            className="absolute rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '4px',
              height: '4px',
              backgroundColor: currentColor
            }}
          />

          {/* Top-Left Corner */}
          <div
            className="absolute top-0 left-0"
            style={{
              width: `${cornerSize}px`,
              height: `${cornerSize}px`,
              borderTop: `${thickness}px solid ${currentColor}`,
              borderLeft: `${thickness}px solid ${currentColor}`
            }}
          />

          {/* Top-Right Corner */}
          <div
            className="absolute top-0 right-0"
            style={{
              width: `${cornerSize}px`,
              height: `${cornerSize}px`,
              borderTop: `${thickness}px solid ${currentColor}`,
              borderRight: `${thickness}px solid ${currentColor}`
            }}
          />

          {/* Bottom-Left Corner */}
          <div
            className="absolute bottom-0 left-0"
            style={{
              width: `${cornerSize}px`,
              height: `${cornerSize}px`,
              borderBottom: `${thickness}px solid ${currentColor}`,
              borderLeft: `${thickness}px solid ${currentColor}`
            }}
          />

          {/* Bottom-Right Corner */}
          <div
            className="absolute bottom-0 right-0"
            style={{
              width: `${cornerSize}px`,
              height: `${cornerSize}px`,
              borderBottom: `${thickness}px solid ${currentColor}`,
              borderRight: `${thickness}px solid ${currentColor}`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TargetCursor;
