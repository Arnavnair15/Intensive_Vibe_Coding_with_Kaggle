import React from "react";
import { motion } from "motion/react";
import { Gauge, Zap, Wifi } from "lucide-react";
import { Telemetry, MissionStatus } from "../types";

interface TelemetryDisplayProps {
  telemetry: Telemetry;
  status: MissionStatus;
}

export const TelemetryDisplay: React.FC<TelemetryDisplayProps> = ({ telemetry, status }) => {
  const isLaunching = status === "LAUNCHING";
  const isCountdown = status === "COUNTDOWN";
  const isOrbit = status === "ORBIT_REACHED" || status === "DEPLOYING" || status === "SATELLITE_ACTIVE" || status === "MISSION_COMPLETE";

  // Dynamic atmospheric layers based on altitude
  const getAtmosphericLayer = (alt: number) => {
    if (alt === 0) return "SURFACE (PAD 39-A)";
    if (alt < 12) return "TROPOSPHERE";
    if (alt < 50) return "STRATOSPHERE";
    if (alt < 85) return "MESOSPHERE";
    if (alt < 500) return "THERMOSPHERE (LEO ORBIT)";
    return "EXOSPHERE / DEEP SPACE";
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
      
      {/* COLUMN 1: PROPULSION VECTORS */}
      <div className="bg-[#090d16]/90 backdrop-blur-md rounded-xl p-5 border border-cyan-500/15 flex flex-col justify-between relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.02)]">
        <div className="absolute top-0 left-0 w-[4px] h-full bg-rose-500" />
        
        <div className="flex items-center gap-2 border-b border-cyan-500/10 pb-3 mb-4">
          <Gauge className="w-4 h-4 text-rose-500" />
          <span className="font-display font-medium text-xs tracking-widest text-[#22d3ee] uppercase">Trajectory Vectors</span>
        </div>

        <div className="space-y-4">
          {/* ALTITUDE CARD */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest">Current Altitude</span>
              <span className="font-mono text-[9px] text-rose-400 font-bold uppercase tracking-wider">{getAtmosphericLayer(telemetry.altitude)}</span>
            </div>
            
            <div className="flex items-baseline gap-1.5 h-10">
              <motion.span 
                key={telemetry.altitude}
                className="font-mono font-extrabold text-3xl text-white text-glow-rose"
              >
                {telemetry.altitude.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </motion.span>
              <span className="font-mono text-xs text-rose-400 font-medium">KM</span>
            </div>

            {/* Altitude visual range gauge */}
            <div className="w-full h-2 bg-[#020617] border border-cyan-500/10 rounded-full overflow-hidden mt-1 flex">
              <motion.div 
                className="h-full bg-gradient-to-r from-rose-500 to-cyan-400"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(100, (telemetry.altitude / 450) * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* VELOCITY CARD */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest">Orbital Velocity</span>
              <span className="font-mono text-[9px] text-[#22d3ee]/60 uppercase tracking-wider">MACH {(telemetry.velocity / 1225).toFixed(1)}</span>
            </div>
            
            <div className="flex items-baseline gap-1.5 h-10">
              <motion.span 
                key={telemetry.velocity}
                className="font-mono font-extrabold text-3xl text-white text-glow-rose"
              >
                {telemetry.velocity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </motion.span>
              <span className="font-mono text-xs text-rose-400 font-medium">KM/H</span>
            </div>

            {/* Velocity range gauge */}
            <div className="w-full h-2 bg-[#020617] border border-cyan-500/10 rounded-full overflow-hidden mt-1">
              <motion.div 
                className="h-full bg-rose-500"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(100, (telemetry.velocity / 28000) * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-cyan-500/10 flex justify-between font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest">
          <span>ACCELERATION: {isLaunching ? "3.2 G" : isCountdown ? "0.0 G" : isOrbit ? "0.01 G" : "STATIC"}</span>
          <span>ANGL: {isLaunching ? "84.2°" : "0.0°"}</span>
        </div>
      </div>

      {/* COLUMN 2: POWER & RESOURCES */}
      <div className="bg-[#090d16]/90 backdrop-blur-md rounded-xl p-5 border border-cyan-500/15 flex flex-col justify-between relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.02)]">
        <div className="absolute top-0 left-0 w-[4px] h-full bg-amber-500" />
        
        <div className="flex items-center gap-2 border-b border-cyan-500/10 pb-3 mb-4">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="font-display font-medium text-xs tracking-widest text-[#22d3ee] uppercase">Power & Consumables</span>
        </div>

        <div className="space-y-4">
          {/* FUEL RESERVES */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest">LOX Propellant Core</span>
              {telemetry.fuel < 15 && telemetry.fuel > 0 && (
                <span className="font-mono text-[9px] text-rose-500 animate-pulse font-bold leading-none uppercase">!! FUEL LOW !!</span>
              )}
            </div>
            
            <div className="flex items-baseline gap-1.5 h-10">
              <motion.span 
                key={telemetry.fuel}
                className="font-mono font-extrabold text-3xl text-white text-glow-amber"
              >
                {telemetry.fuel.toFixed(1)}
              </motion.span>
              <span className="font-mono text-xs text-amber-500 font-medium">%</span>
            </div>

            {/* Fuel range Progress Bar */}
            <div className="w-full h-2 bg-[#020617] border border-cyan-500/10 rounded-full overflow-hidden mt-1">
              <motion.div 
                className={`h-full ${telemetry.fuel < 15 ? "bg-rose-500 animate-pulse" : "bg-amber-500"}`}
                initial={{ width: "100%" }}
                animate={{ width: `${telemetry.fuel}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* LI-ION BATTERY DEPOT */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest">Payload Battery Reserve</span>
              <span className="font-mono text-[9px] text-emerald-400 font-bold uppercase tracking-wider">STABLE</span>
            </div>
            
            <div className="flex items-baseline gap-1.5 h-10">
              <motion.span 
                key={telemetry.battery}
                className="font-mono font-extrabold text-3xl text-white text-glow-emerald"
              >
                {telemetry.battery.toFixed(1)}
              </motion.span>
              <span className="font-mono text-xs text-emerald-400 font-medium">%</span>
            </div>

            {/* Battery standard gauge */}
            <div className="w-full h-2 bg-[#020617] border border-cyan-500/10 rounded-full overflow-hidden mt-1">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: "0%" }}
                animate={{ width: `${telemetry.battery}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-cyan-500/10 flex justify-between font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest">
          <span>APU FUEL VOLT: 28.4 V</span>
          <span>CELL STATUS: STB</span>
        </div>
      </div>

      {/* COLUMN 3: COMMUNICATIONS & TELEMETRY */}
      <div className="bg-[#090d16]/90 backdrop-blur-md rounded-xl p-5 border border-cyan-500/15 flex flex-col justify-between relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.02)]">
        <div className="absolute top-0 left-0 w-[4px] h-full bg-[#22d3ee]" />
        
        <div className="flex items-center gap-2 border-b border-cyan-500/10 pb-3 mb-4">
          <Wifi className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-display font-medium text-xs tracking-widest text-[#22d3ee] uppercase">External Payload Telemetry</span>
        </div>

        <div className="space-y-4">
          {/* SOLAR PANEL GENERATION */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest">Solar Power Array Output</span>
              <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase tracking-wider">
                {telemetry.power > 0 ? "ABSORBING CORE" : "DECOUPLED / INERT"}
              </span>
            </div>
            
            <div className="flex items-baseline gap-1.5 h-10">
              <motion.span 
                key={telemetry.power}
                className="font-mono font-extrabold text-3xl text-white text-glow-cyan"
              >
                {telemetry.power.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </motion.span>
              <span className="font-mono text-xs text-cyan-400 font-medium">W</span>
            </div>

            {/* Power range bar (max 1200w target) */}
            <div className="w-full h-2 bg-[#020617] border border-cyan-500/10 rounded-full overflow-hidden mt-1">
              <motion.div 
                className="h-full bg-cyan-400"
                initial={{ width: "0%" }}
                animate={{ width: `${(telemetry.power / 1200) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* S-BAND COMMUNICATIONS SIGNAL */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest">S-Band Encryption Stream</span>
              <span className="font-mono text-[9px] text-cyan-500/50 uppercase tracking-wider">FREQ 2.2 GHz</span>
            </div>
            
            <div className="flex items-baseline gap-1.5 h-10">
              <motion.span 
                key={telemetry.signalStrength}
                className="font-mono font-extrabold text-3xl text-white text-glow-cyan"
              >
                {telemetry.signalStrength}%
              </motion.span>
              <span className="font-mono text-xs text-cyan-400 font-medium">DBM</span>
            </div>

            {/* Signal level bar */}
            <div className="w-full h-2 bg-[#020617] border border-cyan-500/10 rounded-full overflow-hidden mt-1">
              <motion.div 
                className="h-full bg-cyan-400"
                initial={{ width: "0%" }}
                animate={{ width: `${telemetry.signalStrength}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-cyan-500/10 flex justify-between font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest">
          <span>LATENCY: 42.4 ms</span>
          <span>UP-STREAM: 4.8 GB/S</span>
        </div>
      </div>

    </div>
  );
};
