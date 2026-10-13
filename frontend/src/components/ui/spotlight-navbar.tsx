"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export interface SpotlightNavbarProps {
  items?: NavItem[];
  className?: string;
  onItemClick?: (item: NavItem, index: number) => void;
  defaultActiveIndex?: number;
}

export function SpotlightNavbar({
  items = [
    { label: "Overview", href: "#overview" },
    { label: "Features", href: "#features" },
    { label: "Platform", href: "#preview" },
    { label: "Creators & Mission", href: "#about" },
    { label: "Security Cloud", href: "/app" },
  ],
  className,
  onItemClick,
  defaultActiveIndex = 0,
}: SpotlightNavbarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const spotlightX = useRef(0);
  const ambienceX = useRef(0);

  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = nav.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setHoverX(x);
      spotlightX.current = x;
      nav.style.setProperty("--spotlight-x", `${x}px`);
    };

    const handleMouseLeave = () => {
      setHoverX(null);
      const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
      if (activeItem) {
        const navRect = nav.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        const targetX = itemRect.left - navRect.left + itemRect.width / 2;

        animate(spotlightX.current, targetX, {
          type: "spring",
          stiffness: 220,
          damping: 22,
          onUpdate: (v) => {
            spotlightX.current = v;
            nav.style.setProperty("--spotlight-x", `${v}px`);
          }
        });
      }
    };

    nav.addEventListener("mousemove", handleMouseMove);
    nav.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      nav.removeEventListener("mousemove", handleMouseMove);
      nav.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [activeIndex]);

  // Ambience active position spring
  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;
    const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);

    if (activeItem) {
      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const targetX = itemRect.left - navRect.left + itemRect.width / 2;

      animate(ambienceX.current, targetX, {
        type: "spring",
        stiffness: 220,
        damping: 22,
        onUpdate: (v) => {
          ambienceX.current = v;
          nav.style.setProperty("--ambience-x", `${v}px`);
        },
      });
    }
  }, [activeIndex]);

  const handleItemClick = (item: NavItem, index: number) => {
    setActiveIndex(index);
    onItemClick?.(item, index);
  };

  return (
    <div className={cn("relative flex justify-center", className)}>
      <style>{`
        .aegis-spotlight-nav {
          --spotlight-color: rgba(255, 141, 92, 0.22);
          --ambience-color: #FF8D5C;
          background-color: rgba(241, 226, 212, 0.88);
          border: 1px solid #D7B69B;
          box-shadow: 0 10px 30px -10px rgba(51, 31, 20, 0.15);
        }
        :root:not(.light) .aegis-spotlight-nav {
          --spotlight-color: rgba(56, 189, 248, 0.25);
          --ambience-color: #38BDF8;
          background-color: rgba(11, 17, 30, 0.85);
          border: 1px solid rgba(56, 189, 248, 0.22);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 15px -4px rgba(56, 189, 248, 0.15);
        }
      `}</style>

      <nav
        ref={navRef}
        className={cn(
          "aegis-spotlight-nav",
          "relative h-11 rounded-full backdrop-blur-xl transition-all duration-300 overflow-hidden"
        )}
      >
        {/* Content list */}
        <ul className="relative flex items-center h-full px-2 gap-0 z-[10]">
          {items.map((item, idx) => (
            <li key={idx} className="relative h-full flex items-center justify-center">
              <a
                href={item.href}
                data-index={idx}
                onClick={(e) => {
                  if (item.href.startsWith("#")) {
                    e.preventDefault();
                    const el = document.querySelector(item.href);
                    el?.scrollIntoView({ behavior: "smooth" });
                  }
                  handleItemClick(item, idx);
                }}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold transition-colors duration-200 rounded-full flex items-center gap-1.5",
                  activeIndex === idx
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-[var(--primary-accent-muted)] text-[var(--primary-accent)]">
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>

        {/* 1. Moving Spotlight (cursor follower) */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-full h-full z-[1] transition-opacity duration-300"
          style={{
            opacity: hoverX !== null ? 1 : 0,
            background: `
              radial-gradient(
                130px circle at var(--spotlight-x, 0px) 100%, 
                var(--spotlight-color) 0%, 
                transparent 70%
              )
            `
          }}
        />

        {/* 2. Active Ambient Base Glow */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-full h-[2.5px] z-[2]"
          style={{
            background: `
              radial-gradient(
                70px circle at var(--ambience-x, 0px) 0%, 
                var(--ambience-color) 0%, 
                transparent 100%
              )
            `
          }}
        />
      </nav>
    </div>
  );
}

export default SpotlightNavbar;
