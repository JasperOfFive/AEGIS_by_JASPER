"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface RadialGlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: "champagne" | "default";
}

export function RadialGlowButton({
  children = "Run Scan",
  className,
  variant = "champagne",
  ...props
}: RadialGlowButtonProps) {
  return (
    <div className="relative inline-block">
      <style>{`
        @property --rg-pos-x { syntax: '<percentage>'; initial-value: 40%; inherits: false; }
        @property --rg-pos-y { syntax: '<percentage>'; initial-value: 140%; inherits: false; }
        @property --rg-spread-x { syntax: '<percentage>'; initial-value: 130%; inherits: false; }
        @property --rg-spread-y { syntax: '<percentage>'; initial-value: 170%; inherits: false; }
        @property --rg-color-1 { syntax: '<color>'; initial-value: #18140c; inherits: false; }
        @property --rg-color-2 { syntax: '<color>'; initial-value: #2e2416; inherits: false; }
        @property --rg-color-3 { syntax: '<color>'; initial-value: #5c4424; inherits: false; }
        @property --rg-color-4 { syntax: '<color>'; initial-value: #e8c18b; inherits: false; }
        @property --rg-color-5 { syntax: '<color>'; initial-value: #0b0d0c; inherits: false; }
        @property --rg-border-angle { syntax: '<angle>'; initial-value: 180deg; inherits: true; }
        @property --rg-border-color-1 { syntax: '<color>'; initial-value: hsla(38, 70%, 75%, 0.8); inherits: true; }
        @property --rg-border-color-2 { syntax: '<color>'; initial-value: hsla(38, 40%, 60%, 0.25); inherits: true; }
        @property --rg-stop-1 { syntax: '<percentage>'; initial-value: 37.35%; inherits: false; }
        @property --rg-stop-2 { syntax: '<percentage>'; initial-value: 61.36%; inherits: false; }
        @property --rg-stop-3 { syntax: '<percentage>'; initial-value: 78.42%; inherits: false; }
        @property --rg-stop-4 { syntax: '<percentage>'; initial-value: 93.52%; inherits: false; }
        @property --rg-stop-5 { syntax: '<percentage>'; initial-value: 100%; inherits: false; }

        .rg-button {
          --transition: 0.25s;
          --spark: 1.8s;
          --speed: 1.2s;
          --cut: 1px;
          --bg: radial-gradient(
            var(--rg-spread-x) var(--rg-spread-y) at var(--rg-pos-x) var(--rg-pos-y),
            var(--rg-color-1) var(--rg-stop-1),
            var(--rg-color-2) var(--rg-stop-2),
            var(--rg-color-3) var(--rg-stop-3),
            var(--rg-color-4) var(--rg-stop-4),
            var(--rg-color-5) var(--rg-stop-5)
          );
          
          position: relative;
          min-width: 140px;
          min-height: 42px;
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          line-height: 18px;
          color: rgba(244, 240, 233, 0.95);
          background: var(--bg);
          cursor: pointer;
          text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
          -webkit-tap-highlight-color: transparent;
          transition: 
            --rg-pos-x .75s, --rg-pos-y .75s,
            --rg-spread-x .75s, --rg-spread-y .75s,
            --rg-color-1 .75s, --rg-color-2 .75s, --rg-color-3 .75s, --rg-color-4 .75s, --rg-color-5 .75s,
            --rg-border-angle .75s, --rg-border-color-1 .75s, --rg-border-color-2 .75s,
            --rg-stop-1 .75s, --rg-stop-2 .75s, --rg-stop-3 .75s, --rg-stop-4 .75s, --rg-stop-5 .75s,
            box-shadow 0.25s ease, transform 0.15s ease;
          box-shadow: 0 4px 20px -2px rgba(232, 193, 139, 0.15), 0 0 0 1px rgba(232, 193, 139, 0.25);
        }

        .rg-button:hover {
          --rg-pos-x: 0%;
          --rg-pos-y: 120%;
          --rg-spread-x: 110.24%;
          --rg-spread-y: 110.2%;
          --rg-color-1: #1a140b;
          --rg-color-2: #e8c18b;
          --rg-color-3: #8a6a3b;
          --rg-color-4: #332414;
          --rg-stop-1: 0%;
          --rg-stop-2: 12%;
          --rg-stop-3: 40%;
          --rg-stop-4: 75%;
          --rg-stop-5: 150%;
          --rg-border-angle: 190deg;
          --rg-border-color-1: hsla(38, 90%, 80%, 0.8);
          --rg-border-color-2: hsla(38, 60%, 70%, 0.45);
          box-shadow: 0 6px 24px -2px rgba(232, 193, 139, 0.35), 0 0 0 1px rgba(232, 193, 139, 0.5);
          transform: translateY(-1px);
        }

        .rg-button:active {
          transform: translateY(1px);
        }

        .rg-button::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: inherit;
          background-image: linear-gradient(var(--rg-border-angle), var(--rg-border-color-1), var(--rg-border-color-2));
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }

        .rg-label {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .rg-bg {
          position: absolute;
          inset: var(--cut);
          background: var(--bg);
          border-radius: inherit;
          transition: background var(--transition), opacity var(--transition);
        }

        .rg-shine {
          position: absolute;
          inset: 0;
          container-type: size;
          border-radius: inherit;
          mix-blend-mode: soft-light;
          opacity: 0.35;
          transition: opacity 0.3s;
          overflow: visible;
        }

        .rg-button:hover .rg-shine {
          opacity: 0.8;
        }

        .rg-shine span {
          position: absolute;
          inset: 0;
          height: 100cqh;
          aspect-ratio: 1;
          animation: rg-slide var(--speed) ease-in-out infinite alternate;
          overflow: visible;
        }

        .rg-shine span::before {
          content: "";
          position: absolute;
          inset: -100%;
          background: conic-gradient(
            from calc(270deg - (90deg * 0.5)),
            transparent 0,
            rgba(255, 235, 200, 0.9) 90deg,
            transparent 90deg
          );
          animation: rg-spin calc(var(--speed) * 2) infinite linear;
        }

        @keyframes rg-spin {
          0% { rotate: 0deg; }
          15%, 35% { rotate: 90deg; }
          65%, 85% { rotate: 270deg; }
          100% { rotate: 360deg; }
        }

        @keyframes rg-slide {
          to { transform: translate(calc(100cqw - 100%), 0); }
        }
      `}</style>
      
      <button className={cn("rg-button", className)} type="button" {...props}>
        <span className="rg-shine">
          <span></span>
        </span>
        <span className="rg-bg"></span>
        <span className="rg-label">{children}</span>
      </button>
    </div>
  );
}

export default RadialGlowButton;
