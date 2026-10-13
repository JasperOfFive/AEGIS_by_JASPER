'use client';

import React, { useState, useRef } from 'react';
import { Shield, Sparkles, RotateCw, ExternalLink, QrCode } from 'lucide-react';
import './Lanyard.css';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  dept: string;
  accessLevel: string;
  badgeId: string;
  photoUrl: string;
  specialty: string;
  status: 'ONLINE' | 'ACTIVE RECON' | 'FIELD';
  clearanceExpiry: string;
}

export const DEMO_MEMBERS: TeamMember[] = [
  {
    id: 'mem-1',
    name: 'Alex Carter',
    role: 'Principal Threat Researcher',
    dept: 'SecOps & OSINT Intelligence',
    accessLevel: 'Level 5 • Full Root Ops',
    badgeId: 'AEGIS-SEC-0941',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    specialty: 'Autonomous OSINT collection, APK reverse engineering, and adversary cluster mapping.',
    status: 'ONLINE',
    clearanceExpiry: 'OCT 2028'
  },
  {
    id: 'mem-2',
    name: 'Elena Rostova',
    role: 'Lead Interaction Architect',
    dept: 'UX Architecture & Visual Systems',
    accessLevel: 'Level 4 • Tactical SOC',
    badgeId: 'AEGIS-ENG-1182',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
    specialty: 'High-density threat telemetry dashboards, low-latency WebGL visualization, and champagne ergonomics.',
    status: 'ACTIVE RECON',
    clearanceExpiry: 'DEC 2027'
  },
  {
    id: 'mem-3',
    name: 'Marcus Vance',
    role: 'Head of Legal Countermeasures',
    dept: 'Brand Abuse Enforcement',
    accessLevel: 'Level 4 • Registrar Liason',
    badgeId: 'AEGIS-LEG-8840',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    specialty: 'Automated DMCA pipelines, registrar takedown protocols, and cross-jurisdictional brand protection.',
    status: 'ONLINE',
    clearanceExpiry: 'AUG 2028'
  },
  {
    id: 'mem-4',
    name: 'Sarah Lin',
    role: 'Senior Adversary Profiler',
    dept: 'Social Vector Intelligence',
    accessLevel: 'Level 4 • Deep Recon',
    badgeId: 'AEGIS-INT-5521',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    specialty: 'Detecting synthetic VIP social impersonation, fraud networks, and weaponized AI clone accounts.',
    status: 'FIELD',
    clearanceExpiry: 'JAN 2029'
  }
];

export const Lanyard: React.FC<{
  members?: TeamMember[];
  onSelectMember?: (m: TeamMember) => void;
}> = ({ members = DEMO_MEMBERS, onSelectMember }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0, initRotX: 0, initRotY: 0 });

  const active = members[selectedIdx] || members[0];

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      initRotX: rotation.x,
      initRotY: rotation.y
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const newY = Math.max(-28, Math.min(28, dragStart.current.initRotY + dx * 0.25));
    const newX = Math.max(-24, Math.min(24, dragStart.current.initRotX - dy * 0.25));
    setRotation({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    const snapBack = () => {
      setRotation(prev => ({
        x: prev.x * 0.85,
        y: prev.y * 0.85
      }));
    };
    const t = setInterval(snapBack, 16);
    setTimeout(() => {
      clearInterval(t);
      setRotation({ x: 0, y: 0 });
    }, 250);
  };

  const selectMember = (idx: number) => {
    setSelectedIdx(idx);
    if (onSelectMember) onSelectMember(members[idx]);
  };

  return (
    <div className="flex flex-col items-center w-full h-full select-none justify-between">
      {/* Team Member Selector Tabs */}
      <div
        className="flex items-center gap-1.5 p-1 rounded-xl border bg-black/10 dark:bg-white/5 mb-3"
        style={{ borderColor: 'var(--border-color)' }}
      >
        {members.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => selectMember(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedIdx === idx
                ? 'shadow-md scale-105'
                : 'opacity-70 hover:opacity-100'
              }`}
            style={{
              backgroundColor: selectedIdx === idx ? 'var(--primary-accent)' : 'transparent',
              color: selectedIdx === idx ? '#FFFFFF' : 'var(--text-primary)'
            }}
          >
            {m.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* 3D Interactive Flipping Security Badge */}
      <div
        className="relative flex flex-col items-center justify-center cursor-grab active:cursor-grabbing w-full flex-1"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Lanyard Strap */}
        <div
          className="w-12 h-14 border-x-2 border-dashed opacity-50 -mb-2 z-0"
          style={{
            borderColor: 'var(--primary-accent)',
            background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, var(--primary-accent-muted) 5px, var(--primary-accent-muted) 10px)'
          }}
        />

        {/* Metal Carabiner Clip */}
        <div
          className="w-8 h-4 rounded-full border-2 z-10 -mb-1 shadow"
          style={{
            backgroundColor: 'var(--card-sub-bg)',
            borderColor: 'var(--primary-accent)'
          }}
        />

        {/* 3D Card Container with Perspective and Flip Transform */}
        <div
          style={{
            perspective: '1200px',
            width: '320px',
            height: '430px'
          }}
        >
          <div
            ref={cardRef}
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y + (isFlipped ? 180 : 0)}deg)`,
              transformStyle: 'preserve-3d',
              transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)'
            }}
            className="w-full h-full relative rounded-2xl cursor-pointer"
            onClick={(e) => {
              // Click to flip
              setIsFlipped(!isFlipped);
            }}
          >
            {/* FRONT FACE: High-Definition Member Portrait Photo & Clearance */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
              className="absolute inset-0 rounded-2xl border p-5 flex flex-col justify-between overflow-hidden shadow-2xl"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-2">
                  <img
                    src="/aegis-logo.png"
                    alt="AEGIS Logo"
                    className="w-7 h-7 object-contain"
                  />
                  <div>
                    <span className="font-extrabold text-xs tracking-wider block font-mono" style={{ color: 'var(--text-primary)' }}>
                      AEGIS SECURITY
                    </span>
                    <span className="text-[9px] uppercase tracking-widest font-mono" style={{ color: 'var(--primary-accent)' }}>
                      SECURITY ID PASS
                    </span>
                  </div>
                </div>

                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#10B981',
                    borderColor: 'rgba(16, 185, 129, 0.3)'
                  }}
                >
                  ● {active.status}
                </span>
              </div>

              {/* Front Photo Showcase */}
              <div className="relative w-full h-56 rounded-xl overflow-hidden border my-2 shadow-inner group/photo" style={{ borderColor: 'var(--border-color)' }}>
                <img
                  src={active.photoUrl}
                  alt={active.name}
                  className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <h3 className="font-extrabold text-base leading-tight drop-shadow-md">
                    {active.name}
                  </h3>
                  <p className="text-xs font-semibold drop-shadow-md opacity-90" style={{ color: 'var(--primary-accent)' }}>
                    {active.role}
                  </p>
                </div>
              </div>

              {/* Clearance Badge & Flip Prompt */}
              <div
                className="p-2.5 rounded-xl border flex items-center justify-between"
                style={{
                  backgroundColor: 'var(--card-sub-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div>
                  <span className="text-[9px] font-mono uppercase block" style={{ color: 'var(--text-muted)' }}>
                    Clearance Level
                  </span>
                  <span className="text-xs font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                    {active.accessLevel.split('•')[0]}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--primary-accent)' }}>
                  <RotateCw size={12} className="animate-spin" />
                  <span>Click to Flip</span>
                </div>
              </div>

              {/* Barcode Footer */}
              <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                <span className="font-mono text-[9px] tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {active.badgeId}
                </span>
                <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  VALID THRU {active.clearanceExpiry}
                </span>
              </div>
            </div>

            {/* BACK FACE: Detailed Credentials, Department, Specialization & Biometrics */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
              className="absolute inset-0 rounded-2xl border p-5 flex flex-col justify-between overflow-hidden shadow-2xl"
            >
              {/* Back Header */}
              <div className="flex items-start justify-between pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-2">
                  <img
                    src="/aegis-logo.png"
                    alt="AEGIS Logo"
                    className="w-7 h-7 object-contain"
                  />
                  <div>
                    <span className="font-extrabold text-xs tracking-wider block font-mono" style={{ color: 'var(--text-primary)' }}>
                      OPERATOR DOSSIER
                    </span>
                    <span className="text-[9px] uppercase tracking-widest font-mono" style={{ color: 'var(--primary-accent)' }}>
                      {active.badgeId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: 'var(--primary-accent)' }}>
                  <RotateCw size={11} />
                  <span>Flip Back</span>
                </div>
              </div>

              {/* Detailed Intel Section */}
              <div className="space-y-3 my-2">
                <div>
                  <h4 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    {active.name}
                  </h4>
                  <p className="text-xs font-semibold" style={{ color: 'var(--primary-accent)' }}>
                    {active.role}
                  </p>
                  <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {active.dept}
                  </p>
                </div>

                {/* Scope & Specialty */}
                <div
                  className="p-3 rounded-xl border text-xs leading-relaxed"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <span className="font-bold block mb-1 font-mono text-[10px] uppercase" style={{ color: 'var(--primary-accent)' }}>
                    Operational Focus
                  </span>
                  "{active.specialty}"
                </div>

                {/* Clearance Specifications */}
                <div
                  className="grid grid-cols-2 gap-2 p-2.5 rounded-xl border text-[11px]"
                  style={{
                    backgroundColor: 'var(--card-sub-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div>
                    <span className="text-[9px] uppercase font-mono block" style={{ color: 'var(--text-muted)' }}>Access Level</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Level 5 High-Trust</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-mono block" style={{ color: 'var(--text-muted)' }}>Key Fingerprint</span>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--primary-accent)' }}>SHA-256 Verified</span>
                  </div>
                </div>
              </div>

              {/* Barcode & Signature */}
              <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-0.5 opacity-60">
                  {[4, 14, 6, 20, 10, 8, 16, 5, 18, 7, 12, 6, 15].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        height: `${h}px`,
                        width: '2px',
                        backgroundColor: 'var(--text-primary)'
                      }}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  SEC-DEPT VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[10px] font-mono mt-2" style={{ color: 'var(--text-muted)' }}>
        Click the card to flip between member photo and security credentials • Drag for 3D tilt
      </div>
    </div>
  );
};

export default Lanyard;
