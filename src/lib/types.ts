export interface EmiratesFlight {
  callsign: string;
  flightNumber: string;
  longitude: number;
  latitude: number;
  altitude: number;
  speed: number;
  heading: number;
  verticalRate: number;
  onGround: boolean;
  originCountry: string;
  lastContact: number;
}
