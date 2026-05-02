import { IVehicle } from "../models/Vehicle";

const CITY_DISTANCES: Record<string, Record<string, number>> = {
  delhi: { agra: 210, jaipur: 280, shimla: 342, manali: 540, goa: 1900 },
  agra: { delhi: 210, jaipur: 240, shimla: 550 },
  jaipur: { delhi: 280, agra: 240, udaipur: 393, jodhpur: 335 },
  mumbai: { pune: 149, goa: 594, nashik: 165, aurangabad: 335 },
  pune: { mumbai: 149, goa: 450, nashik: 214 },
  bangalore: { mysore: 150, ooty: 267, chennai: 346, hyderabad: 569 },
  chennai: { bangalore: 346, pondicherry: 170, mahabalipuram: 55 },
};

export function estimateDistance(from: string, to: string): number {
  const f = from.toLowerCase().trim();
  const t = to.toLowerCase().trim();
  return (
    CITY_DISTANCES[f]?.[t] ??
    CITY_DISTANCES[t]?.[f] ??
    Math.floor(Math.random() * 400) + 100
  );
}

export function calculatePrice(
  vehicle: IVehicle,
  days: number,
  distanceKm: number
): number {
  const dayRate = vehicle.pricePerDay * days;
  const kmRate = vehicle.pricePerKm * distanceKm;
  const base = Math.max(dayRate, kmRate);
  const gst = Math.round(base * 0.18);
  const serviceFee = 499;
  return base + gst + serviceFee;
}

export function buildPriceBreakdown(
  vehicle: IVehicle,
  days: number,
  distanceKm: number
) {
  const base = vehicle.pricePerDay * days;
  const gst = Math.round(base * 0.18);
  const serviceFee = 499;
  const total = base + gst + serviceFee;
  return {
    basePrice: base,
    days,
    distanceKm,
    gst,
    serviceFee,
    total,
  };
}
