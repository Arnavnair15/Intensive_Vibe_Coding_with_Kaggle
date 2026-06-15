import React, { useState, useEffect, useRef } from "react";
import { SpaceCanvas } from "./components/SpaceCanvas";
import { MissionControls } from "./components/MissionControls";
import { TelemetryDisplay } from "./components/TelemetryDisplay";
import { MissionHistory } from "./components/MissionHistory";
import { EnvironmentalSensors } from "./components/EnvironmentalSensors";
import { MissionStatus, MissionLog, Telemetry, PlanetDestination, MissionType } from "./types";
import { Globe, Clock, Server, Eye, ShieldAlert, Cpu, Orbit, Compass, MapPin } from "lucide-react";

export const TARGET_PLANETS: PlanetDestination[] = [
  {
    id: "earth",
    name: "Earth Orbit",
    type: "DEPLOY",
    color: "from-sky-700 to-cyan-400",
    glowColor: "rgba(6, 182, 212, 0.45)",
    gravity: 9.81,
    atmosphereDensity: 1.0,
    desc: "Deploy dynamic telemetry communication network relays around Low Earth Orbit.",
    targetMetric: "420KM LEO",
  },
  {
    id: "mars",
    name: "Mars Meridian",
    type: "LANDING",
    color: "from-amber-600 to-red-500",
    glowColor: "rgba(224, 76, 54, 0.5)",
    gravity: 3.71,
    atmosphereDensity: 0.15,
    desc: "Decelerate spacecraft through fine silicate sands to settle core coordinates.",
    targetMetric: "MERIDIAN AMB",
  },
  {
    id: "venus",
    name: "Venus Aphrodite",
    type: "LANDING",
    color: "from-amber-600 to-yellow-500",
    glowColor: "rgba(245, 158, 11, 0.45)",
    gravity: 8.87,
    atmosphereDensity: 9.3,
    desc: "Plunge shockproof titanium capsule into high pressure sulfuric clouds.",
    targetMetric: "APHRODITE REG",
  },
  {
    id: "titan",
    name: "Titan Ligeia",
    type: "LANDING",
    color: "from-orange-600 to-amber-500",
    glowColor: "rgba(249, 115, 22, 0.45)",
    gravity: 1.35,
    atmosphereDensity: 1.45,
    desc: "Deploy extreme cold research buoy into dense liquid hydrocarbon liquid lakes.",
    targetMetric: "LIGEIA MARE",
  },
];

const INITIAL_TELEMETRY: Telemetry = {
  altitude: 0,
  velocity: 0,
  fuel: 100,
  power: 0,
  battery: 100,
  signalStrength: 98,
  internalPressure: 101.3,
};

export default function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetDestination>(TARGET_PLANETS[0]);
  const [selectedMissionType, setSelectedMissionType] = useState<MissionType>("DEPLOY");

  const [status, setStatus] = useState<MissionStatus>("STANDBY");
  const [countdown, setCountdown] = useState<number>(5);
  const [ascentProgress, setAscentProgress] = useState<number>(0);
  const [deployProgress, setDeployProgress] = useState<number>(0);
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [telemetry, setTelemetry] = useState<Telemetry>(INITIAL_TELEMETRY);
  const [timeUTC, setTimeUTC] = useState<string>("");

  // Keep track of active intervals for cleanups
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Time formatter for live clock (UTC ticker)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUTC(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // System initialization logs on startup
  useEffect(() => {
    initializeBaselineLogs();
  }, []);

  const addLog = (message: string, type: "info" | "success" | "warning" | "critical" = "info") => {
    const now = new Date();
    const timestamp = 
      String(now.getHours()).padStart(2, "0") + ":" + 
      String(now.getMinutes()).padStart(2, "0") + ":" + 
      String(now.getSeconds()).padStart(2, "0") + "." + 
      String(now.getMilliseconds()).padStart(3, "0");

    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        timestamp,
        message,
        type,
      },
    ]);
  };

  const initializeBaselineLogs = () => {
    const now = new Date();
    const getPastTimeStr = (offsetSec: number) => {
      const pastTime = new Date(now.getTime() - offsetSec * 1000);
      return (
        String(pastTime.getHours()).padStart(2, "0") + ":" + 
        String(pastTime.getMinutes()).padStart(2, "0") + ":" + 
        String(pastTime.getSeconds()).padStart(2, "0") + "." + 
        String(pastTime.getMilliseconds()).padStart(3, "0")
      );
    };

    setLogs([
      {
        id: "init-1",
        timestamp: getPastTimeStr(12),
        message: "AEROS KERNEL CORE INITIALIZED. VER 14.8.2-PATCH_B.",
        type: "info",
      },
      {
        id: "init-2",
        timestamp: getPastTimeStr(10),
        message: "SECURE ENCRYPTED TERMINAL CONNECTED FROM PORT 3000.",
        type: "success",
      },
      {
        id: "init-3",
        timestamp: getPastTimeStr(8),
        message: "PACIFIC GATE VI DOWNLINK: CALIBRATION COUPLING S-BAND LOCKED.",
        type: "info",
      },
      {
        id: "init-4",
        timestamp: getPastTimeStr(5),
        message: "PROPULSION CRYOGENIC VALVES PRESSURE: 101.3 KPA (NOMINAL).",
        type: "success",
      },
      {
        id: "init-5",
        timestamp: getPastTimeStr(2),
        message: "MISSION COMMAND STANDBY. ALL SYSTEMS CONFIGURED GO.",
        type: "success",
      },
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("TELEMETRY TERMINAL FEED RE-CONNECTED AND FLUSHED.", "info");
  };

  const isBusy = 
    status === "COUNTDOWN" || 
    status === "LAUNCHING" || 
    status === "DEPLOYING" || 
    status === "ENTERING_ATMOSPHERE" || 
    status === "DESCENT" || 
    status === "TOUCHDOWN";

  // Abort Mission Signal
  const abortMission = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);

    setStatus("ABORTED");
    addLog("■ ■ ■ EMERGENCY ABORT SIGNAL ENGAGED! ■ ■ ■", "critical");
    addLog("FLIGHT TERMINATION SEQUENCE CONFIRMED BY SPACE COMMAND.", "critical");
    addLog("DUMPING AND VENTING LIQUID LOX CORE PROPELLANT AT MAXIMUM FLOWRATE.", "warning");
    addLog("GUIDANCE ROTATION VECTORS SET TO NULL INERTIAS.", "info");
    addLog("STATION RESET RE-CALIBRATION PERMITTED IN ONE MOMENT.", "success");

    setTelemetry((prev) => ({
      ...prev,
      velocity: 0,
      fuel: 0,
      power: 0,
      signalStrength: 100,
      internalPressure: 101.3,
    }));
  };

  const resetLaunchpad = () => {
    setStatus("STANDBY");
    setTelemetry(INITIAL_TELEMETRY);
    setAscentProgress(0);
    setDeployProgress(0);
    addLog("CRITICAL SYSTEMS RESTORED. RESETTING LAUNCHPAD STANDBY BASELINE GO STAGE.", "success");
  };

  // Trigger Rocket Launch
  const startLaunch = () => {
    if (isBusy) return;

    // Reset parameters
    setAscentProgress(0);
    setDeployProgress(0);
    setTelemetry({
      ...INITIAL_TELEMETRY,
      battery: 80, // let's say payload starts with 80% battery
    });

    // Enter Countdown
    setStatus("COUNTDOWN");
    setCountdown(5);
    addLog(`ROCKET LAUNCH SEQUENCE TRIGGERED FOR ${selectedPlanet.name.toUpperCase()}.`, "warning");
    addLog("LAUNCH AUTHORIZATION (ALPHA KEYPLATE) SIGNATURE VERIFIED.", "success");
    addLog("T-MINUS 5 SECONDS. APU ENTIRELY ON TERMINAL INTERNAL SOURCE.", "info");

    let currentCount = 5;
    countdownIntervalRef.current = setInterval(() => {
      currentCount--;
      setCountdown(currentCount);

      if (currentCount === 4) {
        addLog("T-MINUS 4 SECONDS. PROPELLANT TANK PRESSURIZATION COMPLETE.", "info");
      } else if (currentCount === 3) {
        addLog("T-MINUS 3 SECONDS. SERVICE GANTRY STRUCTURE ARMS RETRACTING.", "warning");
      } else if (currentCount === 2) {
        addLog("T-MINUS 2 SECONDS. MAIN ENGINE COMPRESSORS CO2 PURGE COMPLETE.", "info");
        addLog("MAIN ENGINE IGNITION INITIATED. THRUST TO NOMINAL WEIGHT COEFF.", "critical");
        setTelemetry(prev => ({ ...prev, internalPressure: 285.4 }));
      } else if (currentCount === 1) {
        addLog("T-MINUS 1 SECONDS. THRUST VECTOR POSITION LOCK NOMINAL.", "info");
      } else if (currentCount === 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        initiateAscent();
      }
    }, 1000);
  };

  const initiateAscent = () => {
    setStatus("LAUNCHING");
    addLog("T-0: LIFTOFF INITIATED!", "success");
    addLog("PRIMARY SOLID ROCKET BOOSTER DETONATORS ACTIVE. IGNITION CONFIRMED.", "success");

    let progress = 0;
    const duration = 5000; // 5 seconds
    const intervalTime = 50; // update every 50ms (100 ticks)
    const increment = intervalTime / duration;

    animationIntervalRef.current = setInterval(() => {
      progress += increment;
      if (progress >= 1) {
        progress = 1;
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        
        if (selectedMissionType === "DEPLOY") {
          // Locked orbit reached for satellites!
          setStatus("ORBIT_REACHED");
          setTelemetry((prev) => ({
            ...prev,
            altitude: 280.0,
            velocity: 27600,
            fuel: 45.4,
            signalStrength: 95,
          }));
          
          addLog(`LOW ESTABLISHED ORBIT SURROUNDING ${selectedPlanet.name.toUpperCase()} NOMINAL.`, "success");
          addLog("PROPELLANT CONSERVED. READY FOR PAYLOAD DEPLOYMENT STAGE.", "info");
        } else {
          // Planetary Landing: Transition to Entering Atmosphere
          addLog(`ASCENT COMPLETED. MATCHING HYPERBOLIC VECTOR ONTO ${selectedPlanet.name.toUpperCase()}...`, "info");
          setTimeout(() => {
            initiateAtmosphericEntry();
          }, 1000);
        }
      } else {
        setAscentProgress(progress);
        
        // Synthesizing real-time telemetry based on ascent timeline
        const currentAltitude = progress * 280.0;
        const currentVelocity = progress * 27600;
        const remainingFuel = 100 - progress * 54.6;
        const fluctuatingSignal = 80 + Math.sin(progress * Math.PI * 4) * 15; // fluctuates due to smoke ionisation
        
        setTelemetry((prev) => ({
          ...prev,
          altitude: currentAltitude,
          velocity: currentVelocity,
          fuel: remainingFuel,
          signalStrength: Math.round(fluctuatingSignal),
          internalPressure: 285.4 - progress * 184.1, // drops as we vacuumize
        }));

        // Dynamic midway milestones
        if (progress > 0.28 && progress < 0.32) {
          addLog("MAXIMUM DYNAMIC PRESSURE (MAX-Q) REACHED. STRUCTURAL LOADS NOMINAL.", "info");
        } else if (progress > 0.68 && progress < 0.72) {
          addLog("STAGE-01 SEPARATION CONFIRMED. OUTBOARD RE-IGNITING SECOND STAGE.", "warning");
        }
      }
    }, intervalTime);
  };

  // Atmospheric entry routine (Planetary Landing sequence)
  const initiateAtmosphericEntry = () => {
    setStatus("ENTERING_ATMOSPHERE");
    addLog(`CROSSING SHOCK-ENTRY BARRIER ON ${selectedPlanet.name.toUpperCase().replace(" ", "_")}!`, "warning");
    addLog("RETRACTING OUTBOARD SENSORS. DEPLOYING DEFLECTIVE HEAT SHIELD PANELS.", "critical");

    let progress = 0;
    const duration = 4000; // 4 seconds
    const intervalTime = 50;
    const increment = intervalTime / duration;

    animationIntervalRef.current = setInterval(() => {
      progress += increment;
      if (progress >= 1) {
        progress = 1;
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        
        addLog("ATMOSPHERIC BRAKING ZONE EXIT Nominally. SPEED DROPPED TO PARACHUTE RANGE.", "success");
        setTimeout(() => {
          initiateDescentPhase();
        }, 1000);
      } else {
        setDeployProgress(progress); // reuse deployProgress for descent translation/curves
        
        // entry physics simulation
        const currentAltitude = 280.0 - progress * 200.0; // drops from 280 to 80km
        const currentVelocity = 27600 - progress * 19000; // decelerated by friction
        const heatMultiplier = selectedPlanet.atmosphereDensity;
        const telemetrySignal = Math.max(4, Math.round(95 - (progress * 90))); // comms blackout!
        
        setTelemetry((prev) => ({
          ...prev,
          altitude: currentAltitude,
          velocity: currentVelocity,
          internalPressure: 0.1 + progress * (101.3 * heatMultiplier),
          signalStrength: telemetrySignal,
          power: 0, // solar panel closed during entry
        }));

        if (progress > 0.3 && progress < 0.34) {
          addLog(`THERMAL GRID ALERT: HEAT SHIELD EXPOSED TO PEAK PLASMATIC FRICTION.`, "critical");
        } else if (progress > 0.65 && progress < 0.7) {
          addLog("CRITICAL IONIZATION COMM-BLACKOUT ACTIVE. TELEMETRY DOWNSTREAM BLOCKED.", "warning");
        }
      }
    }, intervalTime);
  };

  // Descent phase with active thruster brakes (Planetary Landing sequence)
  const initiateDescentPhase = () => {
    setStatus("DESCENT");
    addLog("S-BAND SIGNAL CARRIER ACQUIRED. COMMS DE-SHIELDED.", "success");
    addLog(`GRAV_ACCELERATION: ${selectedPlanet.gravity} M/S². CALIBRATING THRUSTER GIMBALS.`, "info");
    addLog("MAIN BRAKING PARACHUTE DEPLOYED AND DEFLATED AS RETRO-ROCKETS IGNITE.", "warning");

    let progress = 0;
    const duration = 5000; // 5 seconds
    const intervalTime = 50;
    const increment = intervalTime / duration;

    animationIntervalRef.current = setInterval(() => {
      progress += increment;
      if (progress >= 1) {
        progress = 1;
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        
        // Touchdown reached!
        setStatus("TOUCHDOWN");
        setTelemetry((prev) => ({
          ...prev,
          altitude: 0.0,
          velocity: 0,
          fuel: Math.max(1.5, 45.4 - 38), // consumed thruster fuel
          signalStrength: 100,
          power: 100 * selectedPlanet.gravity, // ground power
          internalPressure: 101.3 * selectedPlanet.atmosphereDensity,
        }));
        
        addLog(`TOUCHDOWN CONFIRMED AT ${selectedPlanet.targetMetric.toUpperCase()}!`, "success");
        addLog("DEPLOYING TRIAXIAL LEVEL ANCHORS. LOCKING CORE HYDRAULICS.", "success");

        setTimeout(() => {
          setStatus("MISSION_COMPLETE");
          addLog(`CELESTIAL LANDING ON ${selectedPlanet.name.toUpperCase()} SUCCESSFULLY TERMINATED.`, "success");
        }, 1200);

      } else {
        setDeployProgress(progress);
        
        const currentAltitude = 80.0 - progress * 80.0;
        const currentVelocity = 8600 - progress * 8590; // slow down to hover velocity
        const fuelUsed = progress * 25.0;
        const remainingFuel = 45.4 - fuelUsed;
        const groundPower = progress * 400; // ground sensor cells charging

        setTelemetry((prev) => ({
          ...prev,
          altitude: currentAltitude,
          velocity: currentVelocity,
          fuel: Math.max(1, remainingFuel),
          signalStrength: Math.round(50 + progress * 50),
          power: Math.round(groundPower),
          battery: Math.max(25, 80 - progress * 20),
        }));

        if (progress > 0.4 && progress < 0.45) {
          addLog("RETRACTION DECK PISTONS DISENGAGED FOR SHOCK ENTRANCE.", "info");
        } else if (progress > 0.8 && progress < 0.84) {
          addLog("GROUND REACH PROXIMITY LASER TRIGGERED. HOVERING VELOCITY DECREASING.", "success");
        }
      }
    }, intervalTime);
  };

  // Trigger Satellite Deployment (Orbital Deployment sequence)
  const startDeploy = () => {
    if (isBusy) return;

    // Reset deploy values
    setDeployProgress(0);
    setAscentProgress(0);
    
    // Ensure telemetry baseline is set in orbit
    setTelemetry({
      altitude: 280.0,
      velocity: 27600,
      fuel: 45.4,
      power: 0,
      battery: 65, // Let's start with drained battery needing solar deploy
      signalStrength: 90,
      internalPressure: 0.1, // Vacuum orbital pressure
    });

    setStatus("DEPLOYING");
    addLog(`COSMIC SATELLITE DEPLOYMENT PROTOCOL GRANTED FOR ${selectedPlanet.name.toUpperCase()}.`, "info");
    addLog("STABILIZING DEPLOYMENT RECEPTACLE ORIENTATION MATRIX.", "info");

    let progress = 0;
    const duration = 5000; // 5 seconds
    const intervalTime = 50; 
    const increment = intervalTime / duration;

    animationIntervalRef.current = setInterval(() => {
      progress += increment;
      if (progress >= 1) {
        progress = 1;
        if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);

        setStatus("SATELLITE_ACTIVE");
        setTelemetry((prev) => ({
          ...prev,
          altitude: 420.0,
          velocity: 27800,
          power: 1200,
          battery: 100,
          signalStrength: 100,
        }));

        addLog("SOLAR CELLS FULL ENERGY CAPTURE ACTIVE. DRAW: 1200 W DIRECT.", "success");
        addLog("DOWNSTREAM PACKET DECRYPTION: ACTIVE ENCRYPTED DIRECT BEAM LOCK.", "success");

        // Complete the mission
        setTimeout(() => {
          setStatus("MISSION_COMPLETE");
          addLog("ORBITAL SATELLITE DEPLOYMENT SEAMLESSLY CONCLUDED.", "success");
        }, 1200);

      } else {
        setDeployProgress(progress);

        // Telemetry calibration drift values
        const currentAltitude = 280.0 + progress * 140.0;
        const currentVelocity = 27600 + progress * 200;
        const currentPower = progress >= 0.5 ? (progress - 0.5) * 2 * 1200 : 0; // starts generating at T+2.5 once panels unfold
        const currentBattery = 65 + progress * 35;
        const currentSignal = 90 + progress * 10;

        setTelemetry((prev) => ({
          ...prev,
          altitude: currentAltitude,
          velocity: currentVelocity,
          power: Math.round(currentPower),
          battery: currentBattery,
          signalStrength: Math.round(currentSignal),
        }));

        // Deployment milestones
        if (progress > 0.18 && progress < 0.22) {
          addLog("SATELLITE CARGO COVER CLAMSHELL DISENGAGED.", "warning");
        } else if (progress > 0.38 && progress < 0.42) {
          addLog("SATELLITE MECHANICAL CLAMP RELEASED. DRIFT APERTURE VISUALLY SECURED.", "success");
        } else if (progress > 0.58 && progress < 0.62) {
          addLog("SOLAR PACKET MATRIX COMMENCED UNCOILING PROCEDURE.", "info");
        } else if (progress > 0.78 && progress < 0.82) {
          addLog("S-BAND TRANSMIT DIPOLE STATED TO RESONANCE CALIBRATION.", "info");
        }
      }
    }, intervalTime);
  };

  // Cleanup timers on destroyed
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans relative antialiased selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* Background grid details */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-20 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-[#0f172a]/40 via-[#020617] to-black z-0 pointer-events-none" />

      {/* TOP HEADER STATUS BAR */}
      <header className="relative z-10 w-full bg-[#020617]/90 backdrop-blur-md border-b border-cyan-500/10 px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* AEROSPACE AGENCY BRAND LOGO */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-lg border border-cyan-500/20 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Globe className="w-6 h-6 text-cyan-400 rotate-12" />
            <div className="absolute inset-x-1.5 h-[1.5px] bg-cyan-500 rotate-[35deg]" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-950 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">AEROS</span>
              <span className="font-mono text-[9px] bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded">SYS_6</span>
            </div>
            <p className="font-mono text-[9px] text-cyan-500/60 tracking-widest uppercase">Space Mission Command Center</p>
          </div>
        </div>

        {/* RECENT ADVISORY TAPE */}
        <div className="hidden lg:flex items-center gap-2.5 bg-slate-900/30 border border-cyan-500/10 rounded-full px-4 py-1.5 font-mono text-[10px] text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-500">SYS_CHECK:</span>
          <span>MEM 48.2GB free</span>
          <span className="text-slate-800">•</span>
          <span>LAT_PENT: 0.05ms</span>
          <span className="text-slate-800">•</span>
          <span className="text-cyan-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
            SECURE LINK COMPLIANT
          </span>
        </div>

        {/* TIME STAMP PANEL (LOCAL TIME / UTC TIME CLOCK) */}
        <div className="flex items-center gap-4 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2 bg-slate-900/30 px-3 py-1.5 rounded border border-cyan-500/10 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-400/90">{timeUTC || "SYNCING MASTER CLOCK..."}</span>
          </div>
          <div className="hidden sm:flex flex-col items-end text-[9px] leading-tight text-slate-500 uppercase">
            <span>STATION ID: MC-OS39A</span>
            <span>GRID RANGE: SE-602</span>
          </div>
        </div>
      </header>

      {/* CORE CONTROL DECK CONTENT */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">

        {/* MAIN VISUAL & DATA TRACKING AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* STAGE SCREEN EYE CANVAS */}
          <div className="flex flex-col h-full bg-slate-950/10 lg:col-span-2">
            <SpaceCanvas 
              status={status} 
              countdown={countdown} 
              ascentProgress={ascentProgress}
              deployProgress={deployProgress}
              selectedPlanet={selectedPlanet}
              selectedMissionType={selectedMissionType}
            />
          </div>

          {/* DYNAMIC DIAGNOSTICS & METEOROLOGICAL READINGS */}
          <div className="flex flex-col h-full lg:col-span-1">
            <EnvironmentalSensors status={status} />
          </div>

        </div>

        {/* LIVE TELEMETRY DISPLAY */}
        <TelemetryDisplay telemetry={telemetry} status={status} />

        {/* BOTTOM COG SECTION: ACTIONS + LOG FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* ACTUATOR COMMONS */}
          <MissionControls 
            onLaunch={startLaunch} 
            onDeploy={startDeploy} 
            onAbort={abortMission}
            onReset={resetLaunchpad}
            status={status} 
            countdown={countdown} 
            isBusy={isBusy}
            selectedPlanet={selectedPlanet}
            setSelectedPlanet={setSelectedPlanet}
            selectedMissionType={selectedMissionType}
            setSelectedMissionType={setSelectedMissionType}
            onAddLog={addLog}
          />

          {/* TELEMETRY FEED CONSOLE LOGS */}
          <MissionHistory logs={logs} onClear={clearLogs} />

        </div>

      </main>

      {/* COMPLIARY FOOTER OVERLAY */}
      <footer className="relative z-10 w-full py-4 px-6 border-t border-cyan-500/10 bg-[#020617] text-slate-500 font-mono text-[9px] flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>© 2026 AEROS AEROSPACE INDUSTRIES. ALL SPACEWAYS RESERVED.</div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            FLIGHT RECORDER (ACTIVE)
          </span>
          <span>STAGE SECURITY LEVEL: MIL-SPEC 4</span>
        </div>
      </footer>
    </div>
  );
}
