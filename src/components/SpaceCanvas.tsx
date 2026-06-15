import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MissionStatus, PlanetDestination, MissionType } from "../types";

interface SpaceCanvasProps {
  status: MissionStatus;
  countdown: number;
  ascentProgress: number; // 0 to 1 representing rocket climb progress
  deployProgress: number; // 0 to 1 representing satellite deployment progress
  selectedPlanet: PlanetDestination;
  selectedMissionType: MissionType;
}

// Generate star coordinate arrays to avoid re-generating on every render
const STAR_COUNT = 80;
const starsData = Array.from({ length: STAR_COUNT }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  opacity: Math.random() * 0.7 + 0.3,
  speed: Math.random() * 3 + 2, // seconds for blink cycle
}));

export const SpaceCanvas: React.FC<SpaceCanvasProps> = ({
  status,
  countdown,
  ascentProgress,
  deployProgress,
  selectedPlanet,
  selectedMissionType,
}) => {
  const [clouds, setClouds] = useState<{ id: number; x: number; y: number; scale: number; speed: number }[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, normalizedX: 0, normalizedY: 0, active: false });

  // Initialize atmospheric clouds on mount
  useEffect(() => {
    setClouds(
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 40 + 45, // bottom half of display
        scale: Math.random() * 1.5 + 0.8,
        speed: Math.random() * 5 + 5,
      }))
    );
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normalizedX = (x / rect.width) * 100;
    const normalizedY = (y / rect.height) * 100;
    setMousePos({ x, y, normalizedX, normalizedY, active: true });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, active: false }));
  };

  const isCountdown = status === "COUNTDOWN";
  const isLaunching = status === "LAUNCHING";
  const isOrbit = status === "ORBIT_REACHED" || status === "DEPLOYING" || status === "SATELLITE_ACTIVE" || status === "ENTERING_ATMOSPHERE" || status === "DESCENT" || status === "TOUCHDOWN" || status === "MISSION_COMPLETE";
  const isDeploying = status === "DEPLOYING";
  const isSatelliteActive = status === "SATELLITE_ACTIVE" || (status === "MISSION_COMPLETE" && selectedMissionType === "DEPLOY");

  const isEnteringAtmosphere = status === "ENTERING_ATMOSPHERE";
  const isDescent = status === "DESCENT";
  const isTouchdown = status === "TOUCHDOWN" || (status === "MISSION_COMPLETE" && selectedMissionType === "LANDING");

  const hasActiveVehicle = isDeploying || isSatelliteActive || isEnteringAtmosphere || isDescent || isTouchdown;

  // Parallax Star Offset matching rocket climb
  const starYOffset = isLaunching ? ascentProgress * 150 : 0;
  const cloudsYOffset = isLaunching ? ascentProgress * 300 : 0;

  // Interactive mouse sway calculations for deployed satellite & planetary landing shock capsules (hover response)
  const hoverXOffset = mousePos.active && hasActiveVehicle
    ? (mousePos.normalizedX - 50) * 0.8  // lateral interactive sway drift
    : 0;
  const hoverYOffset = mousePos.active && hasActiveVehicle
    ? (mousePos.normalizedY - 50) * 0.6  // vertical interactive sway drift
    : 0;
  const hoverRotate = mousePos.active && hasActiveVehicle
    ? (mousePos.normalizedX - 50) * 0.25 // interactive flight orientation tilt
    : 0;

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[380px] md:h-[450px] rounded-xl overflow-hidden bg-[#090d16] border border-cyan-500/20 shadow-[0_0_25px_rgba(6,182,212,0.1),inset_0_0_80px_rgba(6,182,212,0.15)] flex flex-col justify-between select-none cursor-crosshair"
    >
      
      {/* Background GRID pattern & Atmosphere Hue */}
      <div className="absolute inset-0 bg-radial-gradient from-cyan-950/20 via-[#090d16] to-black z-0" />
      
      {/* Sky glow effect which changes dark-blue to black as altitude increases */}
      <div 
         className="absolute inset-0 transition-opacity duration-1000 z-0 bg-cyan-950/25"
         style={{
           opacity: isLaunching ? Math.max(0, 1 - ascentProgress * 1.5) : isOrbit ? 0 : 1,
         }}
      />
      
      {/* CRT scanline and grid overlay */}
      <div className="absolute inset-0 crt-grid pointer-events-none z-10 opacity-20" />
      <div className="absolute top-0 left-0 w-full h-[5px] bg-cyan-400/20 shadow-[0_0_12px_#22d3ee] animate-scanline pointer-events-none z-10" />
 
      {/* INTERACTIVE HOVER COORDINATE CROSSHAIRS */}
      {mousePos.active && (
        <>
          {/* Vertical tracking line */}
          <div 
            className="absolute top-0 bottom-0 pointer-events-none border-l border-cyan-500/20 border-dashed z-20"
            style={{ left: `${mousePos.x}px` }}
          />
          {/* Horizontal tracking line */}
          <div 
            className="absolute left-0 right-0 pointer-events-none border-t border-cyan-500/20 border-dashed z-20"
            style={{ top: `${mousePos.y}px` }}
          />
          {/* Corner highlights surrounding cursor */}
          <div 
            className="absolute pointer-events-none z-20 w-8 h-8 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
          >
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#22d3ee]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#22d3ee]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#22d3ee]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#22d3ee]" />
          </div>

          {/* Dynamic Coordinate HUD label next to cursor */}
          <div 
            className="absolute pointer-events-none z-20 font-mono text-[9px] text-[#22d3ee] transition-all duration-75 select-none"
            style={{ 
              left: `${mousePos.x + 16}px`, 
              top: `${mousePos.y + 16}px`,
              transform: mousePos.normalizedX > 75 ? "translateX(-125%)" : "",
            }}
          >
            <div className="bg-[#020617]/95 border border-cyan-550/40 rounded px-2.5 py-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)] flex flex-col gap-0.5 leading-none backdrop-blur-md">
              <div className="font-bold flex items-center justify-between gap-3 text-[8px] text-[#22d3ee] tracking-widest">
                <span>CURSOR LOCK</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-cyan-500/60 text-[8px] tracking-wider mt-1">
                AZ_ANGLE: <span className="text-white font-semibold">{(mousePos.normalizedX * 3.6).toFixed(1)}°</span>
              </div>
              <div className="text-cyan-500/60 text-[8px] tracking-wider">
                EL_RADIAN: <span className="text-white font-semibold">{(90 - mousePos.normalizedY * 0.9).toFixed(1)}°</span>
              </div>
              <div className="text-cyan-500/60 text-[8px] tracking-wider border-t border-cyan-500/10 pt-1 mt-1 flex justify-between gap-2">
                <span>REL_X: {Math.round(mousePos.normalizedX)}%</span>
                <span>REL_Y: {Math.round(mousePos.normalizedY)}%</span>
              </div>
            </div>
          </div>
        </>
      )}
 
      {/* Twinkling Stars (Parallax motion on climb) */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {starsData.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white shadow-[0_0_4px_#ffffff] animate-flicker"
            style={{
              left: `${star.x}%`,
              top: `${(star.y + starYOffset) % 100}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDuration: `${star.speed}s`,
            }}
          />
        ))}
      </div>
 
      {/* VIEWPORT LABELS & RETICLE */}
      <div className="absolute top-3 left-4 z-20 flex flex-col font-mono text-cyan-400/80 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span className="text-[10px] tracking-widest text-[#22d3ee] font-bold uppercase text-glow-cyan">SYS_CAM_01 // VECTOR_FEED</span>
        </div>
        <div className="text-[9px] text-cyan-500/50 mt-0.5">RESOLUTION: 3840x2160 @ 60FPS // COMMS STATUS: NOMINAL</div>
      </div>
 
      <div className="absolute top-3 right-4 z-20 font-mono text-[9px] text-[#22d3ee]/80 tracking-widest text-right pointer-events-none space-y-0.5">
        <div>ORBIT_INC: 28.52°</div>
        <div>TEMP_REF: 294.15 K</div>
        <div>AZIMUTH: {(180.0 + (isLaunching ? ascentProgress * 2.4 : isDeploying ? deployProgress * 5.8 : 0)).toFixed(2)}°</div>
      </div>
 
      {/* Target Reticle Crosshair in Center */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center pointer-events-none z-10">
        <div className="border border-cyan-500/20 w-16 h-16 rounded-full flex items-center justify-center relative">
          <div className="w-3 h-[1px] bg-cyan-400/60 absolute left-0" />
          <div className="w-3 h-[1px] bg-cyan-400/60 absolute right-0" />
          <div className="h-3 w-[1px] bg-cyan-400/60 absolute top-0" />
          <div className="h-3 w-[1px] bg-cyan-400/60 absolute bottom-0" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]/40 animate-pulse shadow-[0_0_4px_#22d3ee]" />
          
          {/* Subtle circular reticle grid */}
          <div className="absolute inset-1.5 border border-dashed border-cyan-500/10 rounded-full" />
        </div>
      </div>

      {/* MAIN CONTAINER SIMULATOR */}
      <div className="relative w-full h-full flex items-end justify-center z-10 overflow-hidden">
        
        {/* LAUNCHPAD MODE SCENE */}
        {!isOrbit && (
          <div className={`w-full h-full flex items-end justify-center relative ${isCountdown ? "animate-shake" : ""}`}>
            
            {/* Launchpad Ground Line */}
            <div 
              className="absolute bottom-0 w-full h-[24px] bg-slate-900 border-t-2 border-slate-700 z-10 transition-transform duration-500"
              style={{
                transform: isLaunching ? `translateY(${ascentProgress * 150}px)` : "translateY(0px)"
              }}
            >
              {/* Ground details */}
              <div className="w-full h-full flex justify-around items-center px-4">
                <div className="w-12 h-2 bg-slate-800 rounded" />
                <div className="w-16 h-2 bg-slate-800 rounded" />
                <div className="w-8 h-2 bg-slate-850 rounded" />
                <div className="w-14 h-2 bg-slate-800 rounded" />
              </div>
            </div>

            {/* Clouds background (Parallax sliding down during ascent) */}
            {clouds.map((cloud) => (
              <div
                key={cloud.id}
                className="absolute bg-slate-200/5 filter blur-md rounded-full pointer-events-none transition-transform duration-300"
                style={{
                  left: `${cloud.x}%`,
                  bottom: `${cloud.y - (isLaunching ? ascentProgress * 200 : 0)}%`,
                  width: `${cloud.scale * 120}px`,
                  height: `${cloud.scale * 60}px`,
                  transform: `translateX(${(Math.sin(cloud.id + 1) * 20)}px)`,
                }}
              />
            ))}

            {/* Launch Towers / Service Gantry (Slides down and disappears during launch) */}
            <div 
              className="absolute bottom-[24px] inset-x-0 h-[220px] pointer-events-none flex justify-between px-20 md:px-32 z-0 transition-all duration-300"
              style={{
                transform: isLaunching ? `translateY(${ascentProgress * 300}px)` : "translateY(0px)",
                opacity: isLaunching ? 1 - ascentProgress * 2.5 : 1
              }}
            >
              {/* Left Tower */}
              <div className="w-[18px] h-full bg-slate-850 border-r border-l border-cyan-900/30 relative flex flex-col justify-around items-center">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(148,163,184,0.1)_25%,rgba(148,163,184,0.1)_50%,transparent_50%,transparent_75%,rgba(148,163,184,0.1)_75%)] bg-[size:10px_10px]" />
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse border border-cyan-400" />
                
                {/* Gantry arm holding rocket (retracted when countdown finishes) */}
                <motion.div 
                  className="absolute right-[-24px] top-[100px] w-6 h-3 bg-slate-800 border-t border-b border-slate-705 shadow-inner"
                  animate={{
                    rotate: isCountdown && countdown <= 3 ? -65 : 0,
                    x: isCountdown && countdown <= 3 ? -5 : 0
                  }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>

              {/* Right Tower */}
              <div className="w-[18px] h-full bg-slate-850 border-r border-l border-cyan-900/30 relative flex flex-col justify-around items-center">
                <div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_25%,rgba(148,163,184,0.1)_25%,rgba(148,163,184,0.1)_50%,transparent_50%,transparent_75%,rgba(148,163,184,0.1)_75%)] bg-[size:10px_10px]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse border border-cyan-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse block" />

                {/* Gantry arm holding rocket top */}
                <motion.div 
                  className="absolute left-[-24px] top-[60px] w-6 h-3 bg-slate-800 border-t border-b border-slate-705"
                  animate={{
                    rotate: isCountdown && countdown <= 2 ? 65 : 0,
                    x: isCountdown && countdown <= 2 ? 5 : 0
                  }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* THE ROCKET */}
            <motion.div 
              className="absolute z-10 w-[45px] h-[160px] flex flex-col items-center"
              style={{
                bottom: isLaunching 
                  ? `${24 + ascentProgress * 230}px` 
                  : "24px"
              }}
              animate={{
                // Slight floating idle shake on launch pad or during countdown
                x: isCountdown ? [0, -1, 1, -1.5, 1.5, 0] : [0, -0.5, 0.5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: isCountdown ? 0.08 : 0.4,
              }}
            >
              {/* Rocket body SVG container */}
              <svg viewBox="0 0 100 350" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                {/* Nose Cone */}
                <path d="M50 15 C35 70, 35 100, 50 110 C65 100, 65 70, 50 15 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                <path d="M50 15 C42 60, 43 90, 50 110 Z" fill="#f8fafc" />
                
                {/* Nose Ring */}
                <rect x="42" y="105" width="16" height="4" fill="#06b6d4" rx="1" />

                {/* Upper Stage Body */}
                <rect x="35" y="110" width="30" height="90" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                
                {/* American Stripe / Decal */}
                <line x1="50" y1="125" x2="50" y2="185" stroke="#ef4444" strokeWidth="3" strokeDasharray="6 3" />
                {/* Window */}
                <circle cx="50" cy="140" r="6" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
                <circle cx="48" cy="138" r="2" fill="#38bdf8" />

                {/* Stage Separator Ring */}
                <rect x="34" y="200" width="32" height="6" fill="#64748b" rx="1" />

                {/* First Stage Booster Body */}
                <rect x="35" y="206" width="30" height="90" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                <text x="50" y="255" textAnchor="middle" fontSize="11" fill="#475569" fontWeight="bold" fontFamily="monospace">USA</text>

                {/* Left Fin */}
                <path d="M35 260 L12 300 Q20 300, 35 290 Z" fill="#64748b" stroke="#475569" strokeWidth="2" />
                {/* Right Fin */}
                <path d="M65 260 L88 300 Q80 300, 65 290 Z" fill="#64748b" stroke="#475569" strokeWidth="2" />
                {/* Center Fin (Stabilizer) */}
                <rect x="48" y="280" width="4" height="20" fill="#334155" />

                {/* Main Engine Nozzle */}
                <polygon points="40,296 60,296 64,310 36,310" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
              </svg>

              {/* ENGINE FIRING EXCESS PLUME */}
              {(isLaunching || (isCountdown && countdown <= 2)) && (
                <div className="absolute top-[125px] w-full flex flex-col items-center">
                  {/* Fire Flame Outer */}
                  <motion.div 
                    className="w-8 h-20 bg-gradient-to-t from-transparent via-cyan-500/80 to-amber-500 rounded-b-full filter blur-[1px] relative flex justify-center"
                    animate={{
                      scaleY: [1, 1.35, 1.1, 1.4, 0.95, 1.25],
                      scaleX: [1, 0.9, 1.1, 0.95, 1.05, 1]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.12,
                    }}
                  >
                    {/* Inner Intense Glow */}
                    <motion.div 
                      className="w-4 h-14 bg-gradient-to-t from-transparent via-white to-cyan-300 rounded-b-full filter blur-[0.5px]"
                      animate={{
                        opacity: [0.85, 1, 0.9, 0.95, 1],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.08,
                      }}
                    />
                  </motion.div>

                  {/* Smoke/Steam billows at the bottom nozzle */}
                  {ascentProgress < 0.35 && (
                    <div className="absolute top-10 flex gap-1 pointer-events-none">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <motion.div
                          key={idx}
                          className="w-14 h-14 rounded-full bg-slate-300/20 filter blur-md"
                          animate={{
                            y: [10, 45 + Math.random() * 20],
                            x: [0, (idx - 2.5) * 20 + (Math.random() - 0.5) * 15],
                            scale: [0.5, 2.5],
                            opacity: [0.5, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.75 + Math.random() * 0.5,
                            delay: idx * 0.08
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* ORBIT AND SATELLITE MODE SCENE */}
        {isOrbit && (
          <div className="w-full h-full relative flex items-center justify-center">
            
            {/* Dynamic target planet horizon segment */}
            <motion.div 
              className={`absolute bottom-[-160px] w-[500px] h-[300px] rounded-full bg-gradient-to-t ${selectedPlanet.color} flex justify-center overflow-hidden z-0 shadow-inner`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5 }}
              style={{
                boxShadow: `0 -15px 40px ${selectedPlanet.glowColor}`,
              }}
            >
              {/* Atmospheric glowing rings */}
              <div className="absolute top-0 inset-x-8 h-[20px] rounded-full bg-white/10 blur-xl" />
              <div className="absolute top-2 inset-x-12 h-[10px] rounded-full bg-white/5 blur-lg" />
              
              {/* Continents and topography outlines */}
              <svg viewBox="0 0 400 200" className="w-full opacity-15 filter blur-[1px] transform translate-y-12">
                <path d="M50 100 Q100 80, 150 120 T280 130 T390 100" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="15" strokeLinecap="round" />
                <path d="M100 130 Q140 150, 200 120 T300 150" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="10" strokeLinecap="round" />
              </svg>
            </motion.div>

            {/* ORBIT PATH LINE */}
            <div className="absolute inset-x-10 h-[2px] bg-slate-800/40 border-dashed border-t border-slate-700/30 z-0 top-[40%]" />

            {/* BRANCH 1: SATELLITE DEPLOYMENT DATA */}
            {selectedMissionType === "DEPLOY" && (
              <>
                {/* SPACECRAFT CARRIER (Starts in center, satellite detaches and moves right) */}
                <motion.div 
              className="absolute z-10 flex flex-col items-center"
              animate={{
                y: [0, -4, 0, 4, 0],
                x: isDeploying ? -50 - deployProgress * 50 : 0, 
                opacity: isSatelliteActive ? 0.35 : 1
              }}
              transition={{
                y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                x: { duration: 5, ease: "easeOut" },
                opacity: { duration: 1 }
              }}
              style={{
                top: "35%",
                left: "40%",
                width: "90px"
              }}
            >
              {/* Main spaceship vector */}
              <svg viewBox="0 0 120 80" className="w-full drop-shadow-[0_0_15px_rgba(100,116,139,0.3)]">
                {/* Secondary Stage Cargo Carrier */}
                <polygon points="20,40 40,25 90,25 110,40 90,55 40,55" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
                {/* Windows or ports */}
                <circle cx="55" cy="40" r="3" fill="#1e293b" />
                <circle cx="70" cy="40" r="3" fill="#1e293b" />
                <circle cx="85" cy="40" r="3" fill="#1e293b" />
                
                {/* Thruster exhaust glow - tiny adjustment sparks */}
                <motion.polygon 
                  points="15,35 20,38 20,42 15,45" 
                  fill="#06b6d4" 
                  animate={{ opacity: [0.8, 0.2, 0.9, 0.4, 0.8] }}
                  transition={{ repeat: Infinity, duration: 0.1 }}
                />

                {/* Back thruster plates */}
                <rect x="20" y="32" width="4" height="16" fill="#475569" rx="1" />
                <line x1="15" y1="20" x2="35" y2="35" stroke="#94a3b8" strokeWidth="2" />
                <line x1="15" y1="60" x2="35" y2="45" stroke="#94a3b8" strokeWidth="2" />
              </svg>
              <div className="text-[8px] font-mono text-slate-500 mt-1 uppercase tracking-widest text-center">CARRIER-STG</div>
            </motion.div>

            {/* DEPLOYED SATELLITE (Separates and unfolds wings, with real-time hover vector sway) */}
            <AnimatePresence>
              {(isDeploying || isSatelliteActive) && (
                <motion.div
                  className="absolute z-20 flex flex-col items-center"
                  initial={{ 
                    x: -20, 
                    y: 0,
                    scale: 0.7, 
                    opacity: 0,
                    rotate: -15 
                  }}
                  animate={{ 
                    x: 60 + (isSatelliteActive ? 40 : deployProgress * 80) + hoverXOffset,
                    y: (isSatelliteActive ? -10 : -deployProgress * 15) + hoverYOffset,
                    scale: 1, 
                    opacity: 1,
                    rotate: (isSatelliteActive ? 0 : -deployProgress * 5) + hoverRotate,
                  }}
                  transition={{ 
                    type: "spring",
                    stiffness: 90,
                    damping: 22,
                    mass: 0.45
                  }}
                  style={{
                    top: "32%",
                    left: "50%",
                    width: "160px"
                  }}
                >
                  <svg viewBox="0 0 240 120" className="w-full drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    {/* Left Wing (Solar Panels) - Folds out */}
                    <motion.g
                      transform-origin="90px 60px"
                      initial={{ scaleX: 0, opacity: 0.2 }}
                      animate={{ 
                        scaleX: deployProgress >= 0.5 ? 1 : (deployProgress * 2), // fully unfolds at T+3s (halfway)
                        opacity: 1 
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    >
                      {/* Solar panel connecting spar */}
                      <line x1="30" y1="60" x2="90" y2="60" stroke="#94a3b8" strokeWidth="3" />
                      
                      {/* Panel Grid */}
                      <rect x="25" y="40" width="16" height="40" fill="#1e1b4b" stroke="#06b6d4" strokeWidth="1.5" rx="1" />
                      <rect x="44" y="40" width="16" height="40" fill="#1e1b4b" stroke="#06b6d4" strokeWidth="1.5" rx="1" />
                      <rect x="63" y="40" width="16" height="40" fill="#1e1b4b" stroke="#06b6d4" strokeWidth="1.5" rx="1" />
                      
                      {/* Solar grid pattern */}
                      <line x1="33" y1="40" x2="33" y2="80" stroke="#38bdf8/40" strokeWidth="1" />
                      <line x1="52" y1="40" x2="52" y2="80" stroke="#38bdf8/40" strokeWidth="1" />
                      <line x1="71" y1="40" x2="71" y2="80" stroke="#38bdf8/40" strokeWidth="1" />
                      <line x1="25" y1="50" x2="79" y2="50" stroke="#38bdf8/40" strokeWidth="0.8" />
                      <line x1="25" y1="60" x2="79" y2="60" stroke="#38bdf8/40" strokeWidth="0.8" />
                      <line x1="25" y1="70" x2="79" y2="70" stroke="#38bdf8/40" strokeWidth="0.8" />
                    </motion.g>

                    {/* Right Wing (Solar Panels) - Folds out */}
                    <motion.g
                      transform-origin="150px 60px"
                      initial={{ scaleX: 0, opacity: 0.2 }}
                      animate={{ 
                        scaleX: deployProgress >= 0.5 ? 1 : (deployProgress * 2),
                        opacity: 1 
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    >
                      {/* Solar panel connecting spar */}
                      <line x1="150" y1="60" x2="210" y2="60" stroke="#94a3b8" strokeWidth="3" />
                      
                      {/* Panel Grid */}
                      <rect x="161" y="40" width="16" height="40" fill="#1e1b4b" stroke="#06b6d4" strokeWidth="1.5" rx="1" />
                      <rect x="180" y="40" width="16" height="40" fill="#1e1b4b" stroke="#06b6d4" strokeWidth="1.5" rx="1" />
                      <rect x="199" y="40" width="16" height="40" fill="#1e1b4b" stroke="#06b6d4" strokeWidth="1.5" rx="1" />
                      
                      {/* Solar grid pattern */}
                      <line x1="169" y1="40" x2="169" y2="80" stroke="#38bdf8/40" strokeWidth="1" />
                      <line x1="188" y1="40" x2="188" y2="80" stroke="#38bdf8/40" strokeWidth="1" />
                      <line x1="207" y1="40" x2="207" y2="80" stroke="#38bdf8/40" strokeWidth="1" />
                      <line x1="161" y1="50" x2="215" y2="50" stroke="#38bdf8/40" strokeWidth="0.8" />
                      <line x1="161" y1="60" x2="215" y2="60" stroke="#38bdf8/40" strokeWidth="0.8" />
                      <line x1="161" y1="70" x2="215" y2="70" stroke="#38bdf8/40" strokeWidth="0.8" />
                    </motion.g>

                    {/* Central Satellite Body (Gold Foliated Hexagon Core) */}
                    <polygon points="95,45 145,45 155,60 145,75 95,75 85,60" fill="url(#goldGradient)" stroke="#d97706" strokeWidth="1.5" />
                    <rect x="105" y="52" width="30" height="16" fill="#1e293b" opacity="0.6" rx="2" />
                    <text x="120" y="63" fontSize="8" fill="#f59e0b" fontWeight="bold" fontFamily="monospace" textAnchor="middle">SAT-X91</text>

                    {/* Antenna Mast and Glowing Dish */}
                    <line x1="120" y1="45" x2="120" y2="25" stroke="#94a3b8" strokeWidth="2.5" />
                    <path d="M110 25 Q120 33, 130 25" fill="none" stroke="#d97706" strokeWidth="2.5" />
                    <circle cx="120" cy="20" r="2.5" fill="#ef4444" className="animate-flicker" />

                    {/* Floating Star Sensor Antenna */}
                    <line x1="105" y1="75" x2="95" y2="92" stroke="#64748b" strokeWidth="1.5" />
                    <circle cx="95" cy="92" r="2" fill="#38bdf8" />

                    {/* Telemetry Antenna Sparkles */}
                    <line x1="135" y1="75" x2="145" y2="92" stroke="#64748b" strokeWidth="1.5" />
                    <circle cx="145" cy="92" r="2" fill="#38bdf8" />

                    {/* SVG Gradients definitions */}
                    <defs>
                      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="50%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#b45309" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Ripple Communication Rings when Satellite Active */}
                  {isSatelliteActive && (
                    <div className="absolute top-[5px] left-[55px] pointer-events-none w-14 h-14 flex items-center justify-center">
                      <motion.div 
                        className="absolute w-6 h-6 rounded-full border border-teal-400"
                        animate={{ scale: [1, 3.5], opacity: [0.8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
                      />
                      <motion.div 
                        className="absolute w-6 h-6 rounded-full border border-teal-400"
                        animate={{ scale: [1, 3.5], opacity: [0.8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut", delay: 0.8 }}
                      />
                    </div>
                  )}

                  <div className="text-[8px] font-mono text-cyan-400 mt-2 uppercase tracking-widest text-center font-bold">
                    EOS-DEPLOYED
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* BRANCH 2: PLANETARY LANDER DETAILS */}
        {selectedMissionType === "LANDING" && (
          <>
            {/* 2A: ATMOSPHERIC plasma entry friction sparks */}
            {isEnteringAtmosphere && (
              <motion.div
                className="absolute z-20 flex flex-col items-center"
                initial={{ x: 120, y: -180, scale: 0.6, rotate: 35, opacity: 0 }}
                animate={{ 
                  x: hoverXOffset + 10, 
                  y: (deployProgress * 110) - 20 + hoverYOffset, 
                  scale: 0.9, 
                  rotate: 24 + hoverRotate,
                  opacity: 1 
                }}
                transition={{ type: "spring", stiffness: 60, damping: 14 }}
                style={{ top: "15%", left: "40%", width: "100px" }}
              >
                {/* friction sparks plumes */}
                <div className="absolute top-[15px] left-[-45px] w-36 h-20 bg-gradient-to-r from-red-600 via-orange-500 to-transparent filter blur-md rounded-full rotate-[155deg] pointer-events-none opacity-90 animate-pulse" />
                
                {Array.from({ length: 6 }).map((_, idx) => (
                  <motion.div 
                    key={idx}
                    className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                    animate={{
                      x: [0, 90 + Math.random() * 80],
                      y: [0, -40 + Math.random() * 80],
                      scale: [1, 0.2],
                      opacity: [1, 0]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.35 + idx * 0.08,
                      ease: "easeOut"
                    }}
                  />
                ))}

                <svg viewBox="0 0 100 100" className="w-full drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]">
                  <path d="M15 70 Q50 90, 85 70" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" className="animate-pulse" />
                  <path d="M15 70 Q50 90, 85 70" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
                  
                  <polygon points="20,68 80,68 62,25 38,25" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
                  <circle cx="50" cy="46" r="4.5" fill="#38bdf8" />
                </svg>

                <div className="font-mono text-[7px] text-orange-400 font-bold bg-[#020617]/95 px-1.5 py-0.5 border border-orange-500/30 rounded mt-1.5 uppercase tracking-widest text-center shadow">
                  PLASMA_ENTRY
                </div>
              </motion.div>
            )}

            {/* 2B: DESCENT decelerating parachute + retro rockets */}
            {isDescent && (
              <motion.div
                className="absolute z-20 flex flex-col items-center"
                initial={{ x: 0, y: -100, scale: 0.8, opacity: 0 }}
                animate={{ 
                  x: hoverXOffset, 
                  y: (deployProgress * 125) - 30 + hoverYOffset, 
                  scale: 1, 
                  opacity: 1,
                  rotate: hoverRotate
                }}
                transition={{ type: "spring", stiffness: 80, damping: 17 }}
                style={{ top: "20%", left: "40%", width: "95px" }}
              >
                {/* parachute canopy and cords */}
                <div className="absolute top-[-75px] left-[-22px] w-[140px] h-[80px] pointer-events-none flex flex-col items-center select-none">
                  <svg viewBox="0 0 160 50" className="w-full h-[32px] drop-shadow-[0_4px_8px_rgba(239,68,68,0.4)]">
                    <path d="M10 50 C10 10, 150 10, 150 50 Z" fill="#ef4444" />
                    <path d="M30 50 C30 15, 130 15, 130 50 Z" fill="#ffffff" />
                    <path d="M50 50 C50 20, 110 20, 110 50 Z" fill="#ef4444" />
                  </svg>
                  <svg viewBox="0 0 160 60" className="w-[85px] h-[45px] opacity-40">
                    <line x1="10" y1="0" x2="80" y2="60" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="45" y1="0" x2="80" y2="60" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="80" y1="0" x2="80" y2="60" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="115" y1="0" x2="80" y2="60" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="150" y1="0" x2="80" y2="60" stroke="#cbd5e1" strokeWidth="1" />
                  </svg>
                </div>

                {/* retro-rocket pod */}
                <svg viewBox="0 0 100 100" className="w-full">
                  <polygon points="25,70 75,70 60,35 40,35" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="5" fill="#38bdf8" />
                  <rect x="23" y="70" width="54" height="6" fill="#475569" rx="1" />
                </svg>

                {/* thruster blast */}
                <motion.div 
                  className="w-8 h-16 bg-gradient-to-t from-transparent via-cyan-500 to-white rounded-b-full filter blur-[1px] relative flex justify-center mt-[-3px]"
                  animate={{
                    scaleY: [1.1, 1.4, 1.2, 1.45, 0.95],
                    scaleX: [1, 0.95, 1.05, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 0.08 }}
                >
                  <div className="w-3.5 h-10 bg-white rounded-b-full filter blur-[0.5px]" />
                </motion.div>

                <div className="font-mono text-[7px] text-[#22d3ee] font-black tracking-widest text-center mt-1 uppercase text-glow-cyan shadow">
                  RETRO_DESCENT
                </div>
              </motion.div>
            )}

            {/* 2C: SURFACE TOUCHDOWN fully landed with stabilizer legs extend */}
            {isTouchdown && (
              <motion.div
                className="absolute z-20 flex flex-col items-center"
                initial={{ scale: 0.9, y: 35, opacity: 0 }}
                animate={{ 
                  x: hoverXOffset, 
                  y: hoverYOffset - 15, 
                  scale: 1, 
                  opacity: 1,
                  rotate: hoverRotate
                }}
                transition={{ type: "spring", stiffness: 70, damping: 16 }}
                style={{ bottom: "24px", width: "115px" }}
              >
                <svg viewBox="0 0 120 100" className="w-full drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                  {/* Ground base */}
                  <rect x="10" y="80" width="100" height="4.5" fill="#334155" rx="1" />
                  
                  {/* Stabilizer legs pistons */}
                  <line x1="35" y1="55" x2="20" y2="80" stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round" />
                  <circle cx="20" cy="80" r="5" fill="#475569" />
                  <line x1="85" y1="55" x2="100" y2="80" stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round" />
                  <circle cx="100" cy="80" r="5" fill="#475569" />

                  {/* Core science chamber */}
                  <polygon points="30,25 90,25 98,58 22,58" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
                  <rect x="40" y="32" width="40" height="18" fill="#fbbf24" opacity="0.12" rx="2" stroke="#d97706" strokeWidth="1" />
                  <text x="60" y="44" fontSize="7" fill="#d97706" fontWeight="bold" fontFamily="monospace" textAnchor="middle">CORES_ON</text>

                  {/* Rotating research scanner */}
                  <motion.g
                    animate={{ rotate: [-24, 24, -24] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    transform-origin="60px 25px"
                  >
                    <line x1="60" y1="25" x2="60" y2="10" stroke="#64748b" strokeWidth="3" />
                    <path d="M45 10 Q60 18, 75 10" fill="none" stroke="#d97706" strokeWidth="3" />
                    <line x1="60" y1="13" x2="60" y2="5" stroke="#ef4444" strokeWidth="1.5" />
                    <circle cx="60" cy="5" r="1.5" fill="#ef4444" />
                  </motion.g>
                </svg>

                {/* Comms Link waves */}
                <div className="absolute top-[-10px] pointer-events-none w-16 h-16 flex items-center justify-center">
                  <motion.div 
                    className="absolute w-5 h-5 rounded-full border border-emerald-400"
                    animate={{ scale: [1, 4.5], opacity: [0.9, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  />
                  <motion.div 
                    className="absolute w-5 h-5 rounded-full border border-emerald-400"
                    animate={{ scale: [1, 4.5], opacity: [0.9, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 1 }}
                  />
                </div>

                <div className="font-mono text-[8.5px] text-emerald-400 mt-1 uppercase tracking-widest text-center font-bold animate-pulse text-glow-emerald">
                  LANDED_NOMINAL
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    )}
  </div>

      {/* RED ALERT HAZARD CRT OVERLAY FOR ABORT STATE */}
      <AnimatePresence>
        {status === "ABORTED" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-red-950/40 backdrop-blur-sm flex flex-col justify-center items-center p-6 text-center select-none border-2 border-red-500/50"
          >
            {/* Flashing strobe background */}
            <div className="absolute inset-0 bg-red-600/10 pointer-events-none animate-pulse" />
            
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-red-500 bg-red-950/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                <span className="text-red-500 font-display font-black text-xl animate-ping absolute">!</span>
                <span className="text-red-500 font-display font-black text-xl">!</span>
              </div>
              
              <div className="space-y-1">
                <span className="font-display font-bold text-xs tracking-widest text-red-400 uppercase text-glow-rose block">
                  EMERGENCY_ABORT_SEQUENCE
                </span>
                <span className="font-mono text-[10px] text-red-400 block font-semibold leading-none tracking-wider">
                  FLIGHT TERMINATION ACTIVATED // RANGE PURGE ENGAGED
                </span>
                <p className="font-mono text-[8px] text-slate-300 max-w-sm mx-auto uppercase tracking-widest leading-relaxed mt-2">
                  All booster engine fuel channels fully vacuumed. Solenoid valves returned to closed state. Downlink synchronization returned to offline inert.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER telemetry status string overlay */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex justify-between font-mono text-[9px] text-slate-500 pointer-events-none uppercase">
        <div>COORDINATES: T+ {(status === "STANDBY" || isCountdown) ? "0.00" : isLaunching ? (ascentProgress * 5).toFixed(2) : (deployProgress * 5).toFixed(2)}s</div>
        <div>STATION: PACIFIC_GATE_VI</div>
      </div>
    </div>
  );
};
