// Mirrors the response of GET /api/commute/{person} in ecosystem-api

export type Direction = "to_work" | "to_home";
export type TravelMode = "car" | "train" | "bus" | "bike" | "walk";

export interface Disruption {
  title: string;
  description: string | null;
  type: string | null;
}

export interface CommuteLeg {
  mode: TravelMode;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  service: string | null;
  disruptions: Disruption[];
}

export interface CommuteOption {
  id: string;
  name: string;
  departure: string | null;
  arrival: string | null;
  total_minutes: number | null;
  legs: CommuteLeg[];
  error: string | null;
}

export interface CommuteResponse {
  person: string;
  direction: Direction;
  options: CommuteOption[];
}
