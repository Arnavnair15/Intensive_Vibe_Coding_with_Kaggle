import React, { useState, useEffect } from "react";
import { Wind, ShieldAlert, Sun, Activity, CheckCircle2, Circle } from "lucide-react";
import { MissionStatus } from "../types";

interface EnvironmentalSensorsProps {
  status: MissionStatus;
}

export const EnvironmentalSensors: React.FC<EnvironmentalSensorsProps> = ({ status }) => {
  const [windSpeed, setWindSpeed] = useState(8.4);
  const [windDir, setWindDir] = useState(42);
  const [seismicActivity, setSeismicActivity] = useState(0.015);
  const [lightningThreat, setLightningThreat] = useState(0.0);

  // Small background ticker for wind direction and speed fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      setWindSpeed((prev) => {
        const delta = (Math.random() - 0.5) * 0.4;
        const next = prev + delta;
        return next < 3 ? 3 : next > 18 ? 18 : next;
      });
      setWindDir((prev) => {
        const delta = Math.round((Math.random() - 0.5) * 8);
        return (prev + delta + 360) % 360;
      });
      setSeismicActivity((prev) => {
        const delta = (Math.random() - 0.5) * 0.004;
        const next = Math.max(0.005, prev + delta);
        return next > 0.04 ? 0.04 : next;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Compute checklist flags based on mission status
  const checklist = [
    {
      id: "weather",
      label: "LIMITS_ENV_WEATHER_CHECK",
      status: windSpeed < 15 ? "GO" : "ALERT",
      details: `${windSpeed.toFixed(1)} KTS // CLEAR`,
    },
    {
      id: "pressure",
      label: "LOX_FUEL_PRESSURIZATION",
      status: status !== "STANDBY" && status !== "ABORTED" ? "GO" : "PENDING",
      details: status !== "STANDBY" && status !== "ABORTED" ? "SYS_OK // PRESSURIZED" : "STANDBY INERT",
    },
    {
      id: "comms",
      label: "DOWNLINK_S_BAND_PAIRING",
      status: "GO",
      details: "S-BAND TRNS_CEIVER CALIBRATED",
    },
    {
      id: "range",
      label: "VFC_RANGE_CLEARANCE",
      status: status === "LAUNCHING" || status === "DEPLOYING" || status === "SATELLITE_ACTIVE" || status === "MISSION_COMPLETE" ? "GO" : "STANDBY",
      details: status === "STANDBY" ? "AIRSPACE CO-COORDINATES CLEAR" : "DECONGESTED ACTIVE",
    },
  ];

  return (
    <div className="bg-[#090d16]/90 backdrop-blur-md rounded-xl p-5 border border-cyan-500/15 flex flex-col h-full justify-between relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.02)]">
      {/* Side status line */}
      <div className="absolute top-0 right-0 w-[4px] h-full bg-[#06b6d4]" />
      
      <div>
        {/* Header segment */}
        <div className="flex items-center gap-2 border-b border-cyan-500/10 pb-3 mb-4">
          <Activity className="w-4 h-4 text-[#22d3ee] animate-pulse" />
          <span className="font-display font-medium text-xs tracking-widest text-[#22d3ee] uppercase">
            Platform Diagnostics
          </span>
        </div>

        {/* SECURE RADAR RADIAN & SENSORS COMPID */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Active Sensor 1: Winds */}
          <div className="bg-[#020617]/60 p-3 rounded-lg border border-cyan-500/5 relative overflow-hidden">
            <span className="font-mono text-[8px] text-cyan-500/50 block tracking-wider uppercase mb-1">
              LAUNCHPAD_WINDS
            </span>
            <div className="flex items-center gap-2">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-xs font-semibold text-white">
                {windSpeed.toFixed(1)} <span className="text-[10px] text-cyan-500/60 font-medium">KTS</span>
              </span>
            </div>
            {/* Visual Vector indicator */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[8px] font-mono text-cyan-500/40">VECTOR:</span>
              <span
                style={{ transform: `rotate(${windDir}deg)` }}
                className="inline-block transition-transform duration-1000 text-cyan-400 font-bold font-mono text-[9px]"
              >
                ↑
              </span>
              <span className="text-[8px] font-mono text-cyan-500/70">{windDir}° NE</span>
            </div>
          </div>

          {/* Active Sensor 2: Seismic stability */}
          <div className="bg-[#020617]/60 p-3 rounded-lg border border-cyan-500/5 relative overflow-hidden">
            <span className="font-mono text-[8px] text-cyan-500/50 block tracking-wider uppercase mb-1">
              SEISMIC_VIBRATION
            </span>
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
              <span className="font-mono text-xs font-semibold text-white">
                {seismicActivity.toFixed(4)} <span className="text-[10px] text-rose-400/70 font-medium">G</span>
              </span>
            </div>
            <div className="h-1 w-full bg-cyan-950/40 rounded-full overflow-hidden mt-1 text-[8px] font-mono text-cyan-500/40 flex items-center justify-between">
              <span>STATUS: NOMINAL</span>
            </div>
          </div>
        </div>

        {/* PRE-FLIGHT READINESS CHECKLIST */}
        <div className="space-y-3">
          <div className="font-mono text-[9px] text-[#22d3ee]/80 font-semibold tracking-widest uppercase flex items-center justify-between">
            <span>Pre-Flight Milestones</span>
            <span className="text-cyan-500/40">// TELEMETRY_GO_CRITERIA</span>
          </div>

          <div className="space-y-2.5">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-2.5 rounded border border-cyan-500/5 bg-[#020617]/30 transition-all hover:bg-cyan-950/5"
              >
                <div className="flex items-center gap-2.5">
                  {item.status === "GO" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 shadow-inner" />
                  ) : item.status === "ALERT" ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-cyan-500/40 shrink-0 animate-pulse" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] leading-tight text-white font-medium">
                      {item.label}
                    </span>
                    <span className="font-mono text-[8px] text-cyan-500/50">
                      {item.details}
                    </span>
                  </div>
                </div>

                <div className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                  item.status === "GO" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-500/20" :
                  item.status === "ALERT" ? "bg-rose-950/50 text-rose-400 border border-rose-500/20" :
                  "bg-cyan-950/40 text-cyan-500/50 border border-cyan-500/10"
                }`}>
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RADAR SWEEP VISUALIZER AND ANCHOR */}
      <div className="mt-5 pt-3 border-t border-cyan-500/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* CSS sweep circle radar */}
          <div className="relative w-8 h-8 rounded-full border border-cyan-500/20 bg-[#020617] flex items-center justify-center overflow-hidden">
            {/* sweeping line */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-400/60 origin-center animate-spin" />
            <div className="absolute inset-2 border border-dashed border-cyan-500/10 rounded-full" />
            <div className="w-1 h-1 bg-[#22d3ee] rounded-full shadow-[0_0_4px_#22d3ee]" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[8px] text-cyan-500/40 leading-none">RADAR FEED</span>
            <span className="font-mono text-[9px] text-[#22d3ee]/80 font-bold leading-tight">ACTIVE SCAN</span>
          </div>
        </div>

        <div className="text-right font-mono text-[8px] text-cyan-500/40 leading-tight block">
          <div>LAT: 34.63° N</div>
          <div>LON: 120.61°W</div>
        </div>
      </div>
    </div>
  );
};
