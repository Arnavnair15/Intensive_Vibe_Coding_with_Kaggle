import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, ShieldAlert, Radio, Rocket, Cpu, CheckCircle, FlameKindling, Skull, Compass, Orbit, MapPin } from "lucide-react";
import { MissionStatus, PlanetDestination, MissionType } from "../types";
import { TARGET_PLANETS } from "../App";

interface MissionControlsProps {
  onLaunch: () => void;
  onDeploy: () => void;
  onAbort?: () => void;
  onReset?: () => void;
  status: MissionStatus;
  countdown: number;
  isBusy: boolean;
  selectedPlanet: PlanetDestination;
  setSelectedPlanet: (planet: PlanetDestination) => void;
  selectedMissionType: MissionType;
  setSelectedMissionType: (type: MissionType) => void;
  onAddLog: (message: string, type: "info" | "success" | "warning" | "critical") => void;
}

export const MissionControls: React.FC<MissionControlsProps> = ({
  onLaunch,
  onDeploy,
  onAbort,
  onReset,
  status,
  countdown,
  isBusy,
  selectedPlanet,
  setSelectedPlanet,
  selectedMissionType,
  setSelectedMissionType,
  onAddLog,
}) => {
  // Determine color theme based on active status
  const getStatusColor = () => {
    switch (status) {
      case "STANDBY":
        return "text-teal-400 border-teal-500/20 bg-teal-950/10";
      case "COUNTDOWN":
        return "text-amber-500 border-amber-500/30 bg-amber-950/10";
      case "LAUNCHING":
        return "text-rose-500 border-rose-500/30 bg-rose-950/10";
      case "ORBIT_REACHED":
        return "text-purple-400 border-purple-500/20 bg-purple-950/10";
      case "DEPLOYING":
        return "text-cyan-400 border-cyan-500/20 bg-cyan-950/10";
      case "SATELLITE_ACTIVE":
        return "text-emerald-400 border-emerald-500/20 bg-emerald-950/10";
      case "MISSION_COMPLETE":
        return "text-green-400 border-green-500/30 bg-green-950/15";
      case "ABORTED":
        return "text-rose-500 border-rose-500/40 bg-rose-950/20 animate-pulse";
      default:
        return "text-slate-400 border-slate-700/20 bg-slate-900/10";
    }
  };

  return (
    <div className="w-full bg-[#090d16]/90 backdrop-blur-md rounded-xl p-6 border border-cyan-500/15 flex flex-col gap-6 relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.02)]">
      {/* Visual cyber mesh pattern backing */}
      <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[linear-gradient(rgba(34,211,238,0.01)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

      {/* HEADER STATUS BLOCK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/10 pb-5">
        <div>
          <h2 className="font-display font-medium text-lg text-white tracking-widest uppercase text-glow-cyan">Command Console</h2>
          <p className="font-mono text-xs text-cyan-500/60 uppercase tracking-widest">INITIATE MISSION ORBITAL DELIVERY SEQUENCERS</p>
        </div>

        {/* GLOWING STATUS PLATE */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border font-mono text-xs tracking-widest font-semibold transition-all duration-300 ${getStatusColor()}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${isBusy ? "animate-ping" : "animate-pulse"} ${
            status === "STANDBY" ? "bg-teal-400 shadow-[0_0_8px_#2dd4bf]" :
            status === "COUNTDOWN" ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" :
            status === "LAUNCHING" ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" :
            status === "DEPLOYING" ? "bg-cyan-500 shadow-[0_0_8px_#06b6d4]" :
            "bg-green-500 shadow-[0_0_8px_#10b981]"
          }`} />
          <span>STATUS: {status}</span>
        </div>
      </div>

      {/* TRAJECTORY CALIBRATION MATRIX SECTION */}
      <div className="border border-cyan-500/10 bg-[#020617]/50 rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden backdrop-blur-md">
        {/* subtle scan grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-cyan-500/15">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#22d3ee] animate-spin" style={{ animationDuration: "12s" }} />
              <h2 className="font-display font-medium text-xs tracking-widest text-[#22d3ee] uppercase">TRAJECTORY_CALIBRATION_MATRIX</h2>
            </div>
            <p className="font-mono text-[9px] text-slate-400 mt-0.5 uppercase">Configure mission parameters, celestial targets, and phase objective targets prior to terminal liftoff.</p>
          </div>
          
          {/* Real-time stats indicators */}
          <div className="flex items-center gap-3 font-mono text-[9px] bg-cyan-950/30 border border-cyan-500/20 rounded px-2.5 py-1 text-cyan-400">
            <span className="font-semibold text-[8px] text-slate-500 uppercase">SYS FACTORS:</span>
            <span>GRAVITY: {selectedPlanet.gravity.toFixed(2)} m/s²</span>
            <span className="text-slate-700">|</span>
            <span>ATMOSPHERE: {(selectedPlanet.atmosphereDensity * 101.3).toFixed(1)} kPa</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          
          {/* CELL 1: PLANETARY TARGET selectors */}
          <div className="md:col-span-2 space-y-2">
            <span className="font-mono text-[8px] text-[#22d3ee]/80 font-black tracking-widest uppercase block mb-1">
              [01] SELECT CELESTIAL TARGET
            </span>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {TARGET_PLANETS.map((planet) => {
                const isSelected = selectedPlanet.id === planet.id;
                return (
                  <button
                    key={planet.id}
                    onClick={() => {
                      if (isBusy) return;
                      setSelectedPlanet(planet);
                      onAddLog(`TARGET CO-COORDINATES VECTOR CALIBRATED TO: ${planet.name.toUpperCase()}.`, "info");
                    }}
                    disabled={isBusy}
                    className={`text-left p-2.5 rounded-lg border font-sans transition-all duration-200 cursor-pointer flex flex-col justify-between h-[95px] relative group overflow-hidden ${
                      isSelected 
                        ? "border-[#22d3ee] bg-cyan-950/25 shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
                        : "border-slate-800/80 bg-[#070b13] hover:border-slate-700 hover:bg-slate-900/40"
                    } ${isBusy ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {/* Colored planetary visual indicator */}
                    <div className={`absolute -right-6 -bottom-6 w-16 h-16 rounded-full blur-2xl opacity-30 bg-gradient-to-br ${planet.color}`} />
                    
                    <div className="relative z-10 flex justify-between items-start w-full">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-[#22d3ee] animate-pulse" : "bg-slate-700"}`} />
                      <span className="font-mono text-[8px] text-slate-500 font-bold">0{TARGET_PLANETS.indexOf(planet) + 1}</span>
                    </div>
                    
                    <div className="relative z-10 space-y-0.5 pointer-events-none">
                      <span className="font-display font-bold text-[10px] text-white uppercase tracking-wider block leading-tight">{planet.name}</span>
                      <span className="font-mono text-[8px] text-slate-400 block tracking-wide truncate">{planet.targetMetric}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CELL 2: MISSION SEQUENCE CHANGER */}
          <div className="space-y-2">
            <span className="font-mono text-[8px] text-[#22d3ee]/80 font-black tracking-widest uppercase block mb-1">
              [02] SEQUENCE FLIGHT OPTION
            </span>
            
            <div className="flex flex-col gap-2">
              {/* Deployment */}
              <button
                type="button"
                onClick={() => {
                  if (isBusy) return;
                  setSelectedMissionType("DEPLOY");
                  onAddLog("FLIGHT OPERATOR SET PRIMARY OBJECTIVE: ORBITAL SATELLITE DEPLOYMENT.", "info");
                }}
                disabled={isBusy}
                className={`flex items-center gap-2.5 p-1.5 rounded-lg border text-left cursor-pointer transition-all duration-200 w-full ${
                  selectedMissionType === "DEPLOY"
                    ? "border-[#22d3ee] bg-cyan-950/20 text-[#22d3ee] shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                    : "border-slate-800 bg-[#070b13] text-slate-400 hover:border-slate-700 hover:bg-slate-900/30"
                } ${isBusy ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className={`p-1.5 rounded-md ${selectedMissionType === "DEPLOY" ? "bg-cyan-500/10 text-cyan-400" : "bg-slate-900 text-slate-400"}`}>
                  <Orbit className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-display font-extrabold text-[8px] tracking-wider uppercase leading-none text-white">ORBITAL DEPLOYMENT</span>
                  <span className="font-mono text-[7px] text-slate-400 mt-1 uppercase truncate">Deploy responsive satellites</span>
                </div>
              </button>

              {/* Landing */}
              <button
                type="button"
                onClick={() => {
                  if (isBusy) return;
                  setSelectedMissionType("LANDING");
                  onAddLog("FLIGHT OPERATOR SET PRIMARY OBJECTIVE: PLANETARY DESCENT LANDING.", "info");
                }}
                disabled={isBusy}
                className={`flex items-center gap-2.5 p-1.5 rounded-lg border text-left cursor-pointer transition-all duration-200 w-full ${
                  selectedMissionType === "LANDING"
                    ? "border-[#22d3ee] bg-cyan-950/20 text-[#22d3ee] shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                    : "border-slate-800 bg-[#070b13] text-slate-400 hover:border-slate-700 hover:bg-slate-900/30"
                } ${isBusy ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className={`p-1.5 rounded-md ${selectedMissionType === "LANDING" ? "bg-cyan-500/10 text-cyan-400" : "bg-slate-900 text-slate-400"}`}>
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-display font-extrabold text-[8px] tracking-wider uppercase leading-none text-white">PLANETARY LANDING</span>
                  <span className="font-mono text-[7px] text-slate-400 mt-1 uppercase truncate">Descent landing through surface</span>
                </div>
              </button>
            </div>
          </div>

        </div>
        
        {/* Mission summary briefing text */}
        <div className="bg-[#070b13]/80 rounded p-2 border border-slate-800/60 flex items-center gap-2">
          <div className="font-mono text-[8px] text-slate-500 uppercase tracking-wider font-extrabold shrink-0">MISSION COG:</div>
          <p className="font-mono text-[8.5px] text-slate-300 uppercase leading-relaxed tracking-wide flex-1">
            🚀 {selectedPlanet.desc} TARGET ZONE: <span className="text-[#22d3ee] font-semibold">{selectedPlanet.targetMetric}</span> USING A {selectedMissionType === "DEPLOY" ? "SATELLITE ORBIT DIAGRAM" : "DESCENT RETRO-LANDER"} ENGINE.
          </p>
        </div>
      </div>

      {/* INTERACTIVE CONTROLS CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* LAUNCH ROCKET BUTTON MODULE */}
        <div className="flex flex-col gap-2 p-4 rounded-lg bg-[#020617]/80 border border-cyan-500/10 relative">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-4 h-4 text-rose-500" />
            <span className="font-display font-medium text-xs text-cyan-400 uppercase tracking-widest">Heavy Lifter Rocket</span>
          </div>

          <button
            onClick={onLaunch}
            disabled={isBusy}
            id="launch-rocket-btn"
            className={`w-full h-14 rounded-lg font-display text-xs tracking-widest font-bold uppercase cursor-pointer flex items-center justify-between px-6 transition-all duration-300 border ${
              isBusy 
                ? "bg-slate-900/40 border-slate-800/80 text-slate-500 cursor-not-allowed" 
                : "border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-[#22d3ee] hover:border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] text-glow-cyan"
            }`}
          >
            <span>LAUNCH SEQUENCE</span>
            <Play className="w-3.5 h-3.5 fill-current shrink-0 ml-2" />
          </button>
          
          <div className="font-mono text-[9px] text-cyan-500/55 flex justify-between px-1 tracking-wider uppercase">
            <span>BOOSTER: FALCON_X2</span>
            <span>PROPELLANT: LOX / RP1</span>
          </div>
        </div>

        {/* DEPLOY SATELLITE BUTTON MODULE */}
        <div className="flex flex-col gap-2 p-4 rounded-lg bg-[#020617]/80 border border-cyan-500/10 relative">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span className="font-display font-medium text-xs text-cyan-400 uppercase tracking-widest">Orbital Deployer</span>
          </div>

          <button
            onClick={onDeploy}
            disabled={isBusy}
            id="deploy-satellite-btn"
            className={`w-full h-14 rounded-lg font-display text-xs tracking-widest font-bold uppercase cursor-pointer flex items-center justify-between px-6 transition-all duration-300 border ${
              isBusy 
                ? "bg-slate-900/40 border-slate-800/80 text-slate-500 cursor-not-allowed" 
                : "border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-[#22d3ee] hover:border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] text-glow-cyan"
            }`}
          >
            <span>DEPLOY SEQUENCE</span>
            <Play className="w-3.5 h-3.5 fill-current shrink-0 ml-2" />
          </button>
          
          <div className="font-mono text-[9px] text-cyan-500/55 flex justify-between px-1 tracking-wider uppercase">
            <span>PAYLOAD: SAT_X91</span>
            <span>TARGET: LEO 420KM</span>
          </div>
        </div>

      </div>

      {/* ABORT / ACTIVE SEQUENCE ALERTS BLOCK */}
      <AnimatePresence mode="popLayout">
        {isBusy && onAbort && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-red-950/20 border border-red-500/30 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
              </span>
              <div className="flex flex-col text-left">
                <span className="font-mono text-[10px] text-red-400 font-bold tracking-widest uppercase">
                  HAZARD STAGE ACTIVE // TELEMETRY LOCKED
                </span>
                <span className="font-mono text-[9px] text-slate-400 tracking-wider">
                  FLIGHT VECTOR INSTRUCTIONS RUNNING LIVE. SECURE ABORT PATH AVAILABLE.
                </span>
              </div>
            </div>

            <button
              onClick={onAbort}
              id="critical-abort-btn"
              className="px-5 py-2.5 bg-red-950 hover:bg-red-900 active:bg-red-950 border border-red-500 text-red-200 text-glow-rose rounded font-display text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all duration-200 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse"
            >
              Abort Mission
            </button>
          </motion.div>
        )}

        {status === "ABORTED" && onReset && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-red-950/45 border-2 border-red-500/50 rounded-lg p-5 flex flex-col items-center justify-center text-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
          >
            <div className="p-3 bg-red-500/10 rounded-full border border-red-500/30">
              <Skull className="w-8 h-8 text-red-550 animate-bounce" />
            </div>
            
            <div className="space-y-1">
              <span className="font-display font-medium text-sm tracking-widest text-red-400 uppercase block">
                ! MISSION TERMINATED !
              </span>
              <p className="font-mono text-[10px] text-slate-300 max-w-md uppercase tracking-wider">
                Emergency purge complete. Launch vehicle and telemetry modules placed in inert standby configuration. Secure clear protocol signature needed.
              </p>
            </div>

            <button
              onClick={onReset}
              id="reset-launchpad-btn"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400 font-display text-[10px] font-black tracking-widest uppercase rounded cursor-pointer transition-all duration-200 shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:scale-105"
            >
              Reset Terminal
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GIANT LED COUNTDOWN DISPLAY BLOCK */}
      <AnimatePresence mode="wait">
        {status === "COUNTDOWN" && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-[#020617] border border-amber-500/20 rounded-lg p-4 flex flex-col items-center justify-center gap-1 overflow-hidden"
          >
            <div className="flex items-center gap-2 text-amber-500 font-mono text-[10px] tracking-widest uppercase">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              <span>Security Clearance Lock: ACTIVE countdown sequence</span>
            </div>
            
            <div className="flex items-baseline gap-2 relative">
              <span className="text-[10px] font-mono text-amber-500/40">T-MINUS</span>
              
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={countdown}
                  initial={{ y: -20, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1.1 }}
                  exit={{ y: 20, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="font-mono font-bold text-6xl text-amber-500 text-glow-amber leading-none select-none"
                >
                  0{countdown}
                </motion.span>
              </AnimatePresence>

              <span className="text-[12px] font-mono text-amber-500/40">SEC</span>
            </div>

            <span className="text-[9px] font-mono text-amber-500/60 tracking-wider">RETRACTING SUPPORT GANTRY GAN-011</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SYSTEM DIAGNOSTICS DECK */}
      <div className="border-t border-cyan-500/10 pt-4 flex flex-wrap gap-x-8 gap-y-3 justify-between font-mono text-[9px] text-cyan-500/50 uppercase tracking-widest">
        
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>STAGE-01 COMPILER:</span>
          <span className="text-emerald-500 font-bold">ONLINE</span>
        </div>

        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>ANTENNA COUPLING:</span>
          <span className="text-emerald-500 font-bold">SECURE (100%)</span>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>GUIDANCE COMPUTER:</span>
          <span className="text-emerald-500 font-semibold">T-DCS NOMINAL</span>
        </div>

      </div>

    </div>
  );
};
