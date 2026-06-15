import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Shield, RefreshCw, Layers } from "lucide-react";
import { MissionLog } from "../types";

interface MissionHistoryProps {
  logs: MissionLog[];
  onClear: () => void;
}

export const MissionHistory: React.FC<MissionHistoryProps> = ({ logs, onClear }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<"all" | "success" | "warning" | "info">("all");

  // Keep terminal scrolled to bottom when new logs arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, filter]);

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    return log.type === filter;
  });

  const getLogColorStyle = (type: string) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-emerald-950/20 text-emerald-400 border-emerald-500/25",
          dot: "bg-emerald-400",
          text: "text-emerald-300",
        };
      case "warning":
        return {
          bg: "bg-amber-950/25 text-amber-400 border-amber-500/25",
          dot: "bg-amber-400",
          text: "text-amber-200",
        };
      case "critical":
        return {
          bg: "bg-rose-950/20 text-rose-400 border-rose-500/25",
          dot: "bg-rose-500",
          text: "text-rose-300",
        };
      default:
        return {
          bg: "bg-cyan-950/15 text-cyan-400 border-cyan-500/20",
          dot: "bg-cyan-400",
          text: "text-slate-200/90",
        };
    }
  };

  return (
    <div className="w-full bg-[#090d16]/90 backdrop-blur-md rounded-xl border border-cyan-500/15 p-5 flex flex-col h-[320px] relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.02)]">
      
      {/* HEADER BANNER */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-cyan-500/10 mb-3 gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-display font-medium text-xs tracking-widest text-[#22d3ee] uppercase text-glow-cyan">Live Mission telemetry Logs</span>
        </div>

        {/* FEED FILTERS */}
        <div className="flex items-center gap-1.5 font-mono text-[9px]">
          <button
            onClick={() => setFilter("all")}
            className={`px-2 py-1 rounded cursor-pointer border tracking-wider transition-all duration-200 ${
              filter === "all"
                ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/40 font-bold"
                : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilter("success")}
            className={`px-2 py-1 rounded cursor-pointer border tracking-wider transition-all duration-200 ${
              filter === "success"
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/40 font-bold"
                : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            SUCCESS
          </button>
          <button
            onClick={() => setFilter("warning")}
            className={`px-2 py-1 rounded cursor-pointer border tracking-wider transition-all duration-200 ${
              filter === "warning"
                ? "bg-amber-950/40 text-amber-400 border-amber-500/40 font-bold"
                : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            WARN
          </button>
          <button
            onClick={() => setFilter("info")}
            className={`px-2 py-1 rounded cursor-pointer border tracking-wider transition-all duration-200 ${
              filter === "info"
                ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/40 font-bold"
                : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
            }`}
          >
            INFO
          </button>

          <span className="h-4 w-[1px] bg-cyan-500/10 mx-1" />

          {/* CLEAR OPTION */}
          <button 
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-1 rounded-sm border border-cyan-500/20 text-[#22d3ee] hover:text-rose-455 hover:border-rose-500/40 cursor-pointer bg-[#020617]/50 transition-all duration-200"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            CLEAR
          </button>
        </div>
      </div>

      {/* FEED LIST */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1.5 pr-2 focus:outline-none"
      >
        <AnimatePresence initial={false}>
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <Layers className="w-5 h-5 text-slate-600 animate-bounce" />
              <span>TERMINAL FEED STBY. NO PACKETS DETECTED.</span>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const styles = getLogColorStyle(log.type);
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex items-start gap-2 border-b border-slate-900/40 pb-1"
                >
                  {/* Timestamp in Deep Blue-Slate */}
                  <span className="text-slate-500 shrink-0 font-light select-none">
                    [{log.timestamp}]
                  </span>

                  {/* Level Tag */}
                  <span className={`px-1.5 py-0.2 px-1 text-[8px] tracking-wider rounded font-bold uppercase shrink-0 border select-none ${styles.bg}`}>
                    {log.type}
                  </span>

                  {/* Log description */}
                  <span className={`${styles.text} flex-1 leading-relaxed`}>
                    {log.message}
                  </span>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* TERMINAL BACK FOOTER */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 pointer-events-none select-none opacity-40">
        <Shield className="w-3 h-3 text-cyan-500" />
        <span className="font-mono text-[8px] text-slate-500">DECRYPTED AES-256 COM</span>
      </div>
    </div>
  );
};
