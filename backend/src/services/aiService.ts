import Vehicle from "../models/Vehicle";

const DESTINATION_HIGHLIGHTS: Record<string, string[]> = {
  default: [
    "Curated local experiences",
    "Premium, sanitized transport",
    "24/7 concierge support during trip",
    "Flexible itinerary pacing",
  ],
  goa: [
    "Beach hopping across North & South Goa",
    "Water sports at Calangute & Baga",
    "Spice plantation tour",
    "Portuguese heritage walk in Old Goa",
  ],
  jaipur: [
    "Amber Fort sunrise visit",
    "Pink City bazaar shopping",
    "Hawa Mahal photoshoot",
    "Royal Rajasthani dinner experience",
  ],
  manali: [
    "Solang Valley snow activities",
    "Rohtang Pass day trip",
    "River rafting on Beas",
    "Hadimba Temple cultural visit",
  ],
};

type DayActivity = { time: string; activity: string; duration: string };
type ItineraryDay = {
  day: number;
  title: string;
  activities: DayActivity[];
  accommodation: string;
  meals: string;
};

const DAY_TEMPLATES: DayActivity[][] = [
  [
    { time: "09:00 AM", activity: "Morning city exploration", duration: "2h" },
    { time: "12:30 PM", activity: "Local cuisine lunch", duration: "1.5h" },
    { time: "03:00 PM", activity: "Heritage site visit", duration: "2.5h" },
    { time: "07:00 PM", activity: "Cultural dinner experience", duration: "2h" },
  ],
  [
    { time: "08:00 AM", activity: "Sunrise viewpoint trek", duration: "3h" },
    { time: "01:00 PM", activity: "Authentic regional lunch", duration: "1h" },
    { time: "03:30 PM", activity: "Local market shopping", duration: "2h" },
    { time: "07:30 PM", activity: "Rooftop dinner with views", duration: "2h" },
  ],
  [
    { time: "09:30 AM", activity: "Adventure activity", duration: "3h" },
    { time: "01:30 PM", activity: "Street food tour", duration: "2h" },
    { time: "04:00 PM", activity: "Sunset photography walk", duration: "2h" },
    { time: "08:00 PM", activity: "Campfire evening", duration: "2h" },
  ],
];

export async function generateTripPlan(params: {
  destination: string;
  days: number;
  passengers: number;
  budget: string;
}) {
  const { destination, days, passengers } = params;

  const vehicle = await Vehicle.findOne({
    capacity: { $gte: passengers },
    isAvailable: true,
  })
    .sort({ pricePerDay: 1 })
    .lean();

  const dest = destination.toLowerCase();
  const highlights =
    Object.keys(DESTINATION_HIGHLIGHTS).find((k) => dest.includes(k))
      ? DESTINATION_HIGHLIGHTS[Object.keys(DESTINATION_HIGHLIGHTS).find((k) => dest.includes(k))!]
      : DESTINATION_HIGHLIGHTS.default;

  const itinerary: ItineraryDay[] = Array.from({ length: days }).map((_, i) => {
    const isFirst = i === 0;
    const isLast = i === days - 1;
    const template = DAY_TEMPLATES[i % DAY_TEMPLATES.length];

    return {
      day: i + 1,
      title: isFirst
        ? `Arrival & First Impressions of ${destination}`
        : isLast
        ? `Farewell to ${destination}`
        : `Discovering ${destination} — Day ${i + 1}`,
      activities: template,
      accommodation: i % 2 === 0 ? "Premium Boutique Resort" : "Heritage Haveli Hotel",
      meals: "Breakfast included. Curated lunch & dinner at authentic local restaurants.",
    };
  });

  const estimatedCost = vehicle
    ? vehicle.pricePerDay * days + passengers * 5000
    : days * 8000 + passengers * 5000;

  return {
    destination,
    days,
    passengers,
    vehicleRecommendation: vehicle,
    estimatedCost,
    itinerary,
    highlights,
  };
}
