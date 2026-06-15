export type MissionStatus = 
  | "STANDBY" 
  | "COUNTDOWN" 
  | "LAUNCHING" 
  | "ORBIT_REACHED" 
  | "DEPLOYING" 
  | "SATELLITE_ACTIVE" 
  | "ENTERING_ATMOSPHERE"
  | "DESCENT"
  | "TOUCHDOWN"
  | "MISSION_COMPLETE"
  | "ABORTED";

export type PlanetId = "earth" | "mars" | "venus" | "titan";

export type MissionType = "DEPLOY" | "LANDING";

export interface PlanetDestination {
  id: PlanetId;
  name: string;
  type: MissionType;
  color: string;
  glowColor: string;
  gravity: number; // m/s^2
  atmosphereDensity: number; // multiplier
  desc: string;
  targetMetric: string; // "LEO Orbit" or "Touchdown Zone"
}

export interface MissionLog {
  id: string;
  timestamp: string; // HH:MM:ss.SSS format
  message: string;
  type: "info" | "success" | "warning" | "critical";
}

export interface Telemetry {
  altitude: number; // km
  velocity: number; // km/h
  fuel: number; // %
  power: number; // W (solar panel power)
  battery: number; // %
  signalStrength: number; // %
  internalPressure: number; // kPa
}
