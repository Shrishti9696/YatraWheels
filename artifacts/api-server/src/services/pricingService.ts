import { IVehicle } from "../models/Vehicle";

const CITY_DISTANCES: Record<string, Record<string, number>> = {
  delhi: { agra: 210, jaipur: 280, shimla: 342, manali: 540, goa: 1900, rishikesh: 240, haridwar: 220 },
  agra: { delhi: 210, jaipur: 240, shimla: 550, mathura: 58 },
  jaipur: { delhi: 280, agra: 240, udaipur: 393, jodhpur: 335, ajmer: 135, pushkar: 145 },
  mumbai: { pune: 149, goa: 594, nashik: 165, aurangabad: 335, lonavala: 83 },
  pune: { mumbai: 149, goa: 450, nashik: 214, mahabaleshwar: 120 },
  bangalore: { mysore: 150, ooty: 267, chennai: 346, hyderabad: 569, coorg: 260 },
  chennai: { bangalore: 346, pondicherry: 170, mahabalipuram: 55, ooty: 540 },
  hyderabad: { bangalore: 569, warangal: 148, tirupati: 556, nashik: 577 },
  kolkata: { darjeeling: 674, puri: 500, digha: 183 },
  goa: { mumbai: 594, pune: 450, hampi: 340, karwar: 60 },
};

const PLATFORM_FEE_PERCENT = 0.10;
const DRIVER_FEE_PER_DAY = 1000;
const VENDOR_SHARE_PERCENT = 0.88;

export function estimateDistance(from: string, to: string): number {
  const f = from.toLowerCase().split(",")[0].trim();
  const t = to.toLowerCase().split(",")[0].trim();
  return (
    CITY_DISTANCES[f]?.[t] ??
    CITY_DISTANCES[t]?.[f] ??
    Math.floor(Math.random() * 300) + 100
  );
}

export function buildPriceBreakdown(
  vehicle: IVehicle,
  days: number,
  distanceKm: number,
  withDriver = false
) {
  const vehicleCost = vehicle.pricePerDay * days;
  const distanceCost = Math.round(vehicle.pricePerKm * distanceKm);
  const driverFee = withDriver ? DRIVER_FEE_PER_DAY * days : 0;
  const basePlatformFee = Math.round((vehicleCost + distanceCost) * PLATFORM_FEE_PERCENT);
  const platformFee = Math.max(basePlatformFee, 499);
  const total = vehicleCost + distanceCost + driverFee + platformFee;
  const vendorAmount = Math.round((vehicleCost + distanceCost) * VENDOR_SHARE_PERCENT);
  const driverAmount = driverFee;

  return {
    vehicleCost,
    distanceCost,
    driverFee,
    platformFee,
    total,
    vendorAmount,
    driverAmount,
    days,
    distanceKm,
    withDriver,
  };
}

export function calculatePrice(
  vehicle: IVehicle,
  days: number,
  distanceKm: number,
  withDriver = false
): number {
  return buildPriceBreakdown(vehicle, days, distanceKm, withDriver).total;
}
