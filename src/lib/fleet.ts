export interface Aircraft {
  registration: string;
  type: string;
  name: string;
  seats: string;
  engines: string;
  range: string;
  inService: number;
  notes?: string;
}

export const emiratesFleet: Aircraft[] = [
  { registration: "A6-EVA", type: "A380-800", name: "Airbus A380", seats: "517 (14F/76J/427Y)", engines: "4× Engine Alliance GP7200", range: "15,200 km", inService: 116, notes: "World's largest passenger aircraft" },
  { registration: "A6-EDA", type: "B777-300ER", name: "Boeing 777-300ER", seats: "354 (8F/42J/304Y) or 427 (42J/385Y)", engines: "2× GE GE90-115BL", range: "13,650 km", inService: 123 },
  { registration: "A6-EQC", type: "B777-200LR", name: "Boeing 777-200LR", seats: "266 (8F/42J/216Y)", engines: "2× GE GE90-110BL", range: "17,370 km", inService: 10 },
  { registration: "A6-EOD", type: "B777-F", name: "Boeing 777 Freighter", seats: "N/A (Cargo)", engines: "2× GE GE90-110BL", range: "9,200 km", inService: 11, notes: "Emirates SkyCargo" },
  { registration: "A6-EFI", type: "B777-300ER", name: "Boeing 777-300ER (Game Changer)", seats: "354 (6F/54J/294Y)", engines: "2× GE GE90-115BL", range: "13,650 km", inService: 5, notes: "New premium economy cabin" },
  { registration: "A6-EVQ", type: "A380-800", name: "Airbus A380 (Premium Economy)", seats: "484 (14F/76J/56W/338Y)", engines: "4× Engine Alliance GP7200", range: "15,200 km", inService: 8, notes: "Refurbished with premium economy" },
  { registration: "A6-EPF", type: "B777-300ER", name: "Boeing 777-300ER (Two Class)", seats: "427 (42J/385Y)", engines: "2× GE GE90-115BL", range: "13,650 km", inService: 50 },
  { registration: "A6-BMA", type: "B777-9", name: "Boeing 777-9", seats: "TBD", engines: "2× GE GE9X", range: "13,500 km", inService: 0, notes: "On order — 115 aircraft" },
  { registration: "A6-XFA", type: "A350-900", name: "Airbus A350-900", seats: "TBD", engines: "2× Rolls-Royce Trent XWB", range: "15,000 km", inService: 0, notes: "On order — 50 aircraft" },
  { registration: "A6-XKA", type: "A350-1000", name: "Airbus A350-1000", seats: "TBD", engines: "2× Rolls-Royce Trent XWB", range: "16,100 km", inService: 0, notes: "On order — 15 aircraft" },
];

export interface HubAirport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export const emiratesDestinations = 130; // Approximate number of destinations served

export const emiratesHubs: HubAirport[] = [
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE" },
  { code: "DWC", name: "Al Maktoum International Airport", city: "Dubai World Central", country: "UAE" },
];