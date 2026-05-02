import Vehicle from "../models/Vehicle";
import { logger } from "../lib/logger";

const seedVehicles = [
  {
    name: "Toyota Innova Crysta",
    type: "van",
    capacity: 7,
    pricePerDay: 4500,
    pricePerKm: 14,
    location: "Delhi",
    features: ["AC", "GPS Navigation", "USB Charging", "First Aid Kit"],
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    rating: 4.8,
    reviewCount: 312,
    isAvailable: true,
  },
  {
    name: "Mercedes-Benz E-Class",
    type: "luxury",
    capacity: 4,
    pricePerDay: 12000,
    pricePerKm: 28,
    location: "Mumbai",
    features: ["Leather Seats", "Climate Control", "WiFi", "Chauffeur", "Minibar"],
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    rating: 4.9,
    reviewCount: 186,
    isAvailable: true,
  },
  {
    name: "Force Traveller 17-Seater",
    type: "bus",
    capacity: 17,
    pricePerDay: 8500,
    pricePerKm: 22,
    location: "Bangalore",
    features: ["AC", "Reclining Seats", "Luggage Space", "Music System"],
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
    rating: 4.6,
    reviewCount: 247,
    isAvailable: true,
  },
  {
    name: "Maruti Suzuki Ertiga",
    type: "van",
    capacity: 7,
    pricePerDay: 2800,
    pricePerKm: 10,
    location: "Jaipur",
    features: ["AC", "GPS", "USB Charging"],
    imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
    rating: 4.5,
    reviewCount: 198,
    isAvailable: true,
  },
  {
    name: "Toyota Fortuner",
    type: "car",
    capacity: 7,
    pricePerDay: 7000,
    pricePerKm: 18,
    location: "Delhi",
    features: ["AC", "4WD", "GPS", "Sunroof", "Leather Seats"],
    imageUrl: "https://images.unsplash.com/photo-1568844293986-ca047c5da9d4?w=800&q=80",
    rating: 4.7,
    reviewCount: 143,
    isAvailable: true,
  },
  {
    name: "Honda City",
    type: "car",
    capacity: 4,
    pricePerDay: 2200,
    pricePerKm: 10,
    location: "Chennai",
    features: ["AC", "GPS", "Bluetooth", "USB Charging"],
    imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80",
    rating: 4.4,
    reviewCount: 89,
    isAvailable: true,
  },
  {
    name: "Volvo 9400 Bus",
    type: "bus",
    capacity: 45,
    pricePerDay: 22000,
    pricePerKm: 40,
    location: "Mumbai",
    features: ["AC", "Reclining Seats", "WiFi", "Entertainment System", "Luggage Space"],
    imageUrl: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80",
    rating: 4.8,
    reviewCount: 421,
    isAvailable: true,
  },
  {
    name: "BMW 5 Series",
    type: "luxury",
    capacity: 4,
    pricePerDay: 15000,
    pricePerKm: 32,
    location: "Delhi",
    features: ["Leather Seats", "Panoramic Roof", "WiFi", "Chauffeur", "Premium Sound"],
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    rating: 4.9,
    reviewCount: 94,
    isAvailable: true,
  },
];

export async function seedDatabase(): Promise<void> {
  const count = await Vehicle.countDocuments();
  if (count > 0) {
    logger.info({ count }, "Database already seeded — skipping vehicle seed");
    return;
  }

  await Vehicle.insertMany(seedVehicles);
  logger.info({ count: seedVehicles.length }, "Database seeded with vehicles");
}
