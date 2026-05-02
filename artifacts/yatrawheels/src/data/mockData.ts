export type VehicleType = "sedan" | "suv" | "van" | "minibus" | "luxury";

export type Vehicle = {
  id: string;
  name: string;
  type: VehicleType;
  capacity: number;
  pricePerDay: number;
  pricePerKm?: number;
  features: string[];
  rating: number;
  reviewCount: number;
  imageUrl: string;
  available: boolean;
  location?: string;
};

export type Destination = {
  id: string;
  name: string;
  state: string;
  description: string;
  imageUrl: string;
  popularFor: string[];
};

export type Route = {
  id: string;
  from: string;
  to: string;
  distance: string;
  estimatedTime: string;
  basePrice: number;
  popular: boolean;
  imageUrl: string;
};

export type BookingStatus = "confirmed" | "upcoming" | "completed";

export type Booking = {
  id: string;
  vehicleId: string;
  from: string;
  to: string;
  date: string;
  passengers: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
};

export type TripPlan = {
  destination: string;
  days: number;
  vehicleRecommendation: Vehicle;
  estimatedCost: number;
  itinerary: {
    day: number;
    title: string;
    activities: { time: string; activity: string; duration: string }[];
    accommodation: string;
    meals: string;
  }[];
  highlights: string[];
};

export const mockVehicles: Vehicle[] = [
  {
    id: "v1",
    name: "Toyota Camry",
    type: "sedan",
    capacity: 4,
    pricePerDay: 2500,
    features: ["AC", "Bluetooth", "Leather Seats", "Fast FASTag"],
    rating: 4.8,
    reviewCount: 124,
    imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=800",
    available: true,
  },
  {
    id: "v2",
    name: "Mahindra Innova Crysta",
    type: "suv",
    capacity: 7,
    pricePerDay: 4000,
    features: ["AC", "Rear AC Vents", "Extra Luggage Space", "Premium Audio"],
    rating: 4.9,
    reviewCount: 312,
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800",
    available: true,
  },
  {
    id: "v3",
    name: "Mercedes-Benz E-Class",
    type: "luxury",
    capacity: 4,
    pricePerDay: 12000,
    features: ["Climate Control", "Massage Seats", "Sunroof", "Chauffeur"],
    rating: 5.0,
    reviewCount: 89,
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800",
    available: true,
  },
  {
    id: "v4",
    name: "Force Urbania",
    type: "van",
    capacity: 12,
    pricePerDay: 6500,
    features: ["Reclining Seats", "LED TV", "High Roof", "Pannier"],
    rating: 4.7,
    reviewCount: 156,
    imageUrl: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=800",
    available: true,
  },
  {
    id: "v5",
    name: "Volvo Marco Polo",
    type: "minibus",
    capacity: 22,
    pricePerDay: 15000,
    features: ["Air Suspension", "Washroom", "Pantry", "Wi-Fi"],
    rating: 4.9,
    reviewCount: 45,
    imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800",
    available: true,
  },
  {
    id: "v6",
    name: "Hyundai Creta",
    type: "suv",
    capacity: 5,
    pricePerDay: 3200,
    features: ["AC", "Panoramic Sunroof", "Ventilated Seats"],
    rating: 4.6,
    reviewCount: 210,
    imageUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800",
    available: true,
  },
  {
    id: "v7",
    name: "Honda City",
    type: "sedan",
    capacity: 4,
    pricePerDay: 2800,
    features: ["AC", "Premium Sound", "Spacious Trunk"],
    rating: 4.8,
    reviewCount: 178,
    imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800",
    available: false,
  },
  {
    id: "v8",
    name: "Kia Carnival",
    type: "van",
    capacity: 8,
    pricePerDay: 5000,
    features: ["VIP Lounge Seats", "Dual Sunroof", "Smart Air Purifier"],
    rating: 4.9,
    reviewCount: 92,
    imageUrl: "https://images.unsplash.com/photo-1623880479155-25e24c28cde8?auto=format&fit=crop&q=80&w=800",
    available: true,
  }
];

export const mockDestinations: Destination[] = [
  {
    id: "d1",
    name: "Udaipur",
    state: "Rajasthan",
    description: "City of Lakes with majestic palaces and heritage.",
    imageUrl: "https://images.unsplash.com/photo-1615836245337-f839d40a5a67?auto=format&fit=crop&q=80&w=800",
    popularFor: ["Heritage", "Romance", "Photography"]
  },
  {
    id: "d2",
    name: "Manali",
    state: "Himachal Pradesh",
    description: "High-altitude Himalayan resort town.",
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800",
    popularFor: ["Mountains", "Adventure", "Nature"]
  },
  {
    id: "d3",
    name: "Goa",
    state: "Goa",
    description: "Coastal paradise with pristine beaches and vibrant nightlife.",
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=800",
    popularFor: ["Beaches", "Nightlife", "Relaxation"]
  },
  {
    id: "d4",
    name: "Munnar",
    state: "Kerala",
    description: "Rolling hills with endless tea plantations.",
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=800",
    popularFor: ["Nature", "Tea Estates", "Tranquility"]
  },
  {
    id: "d5",
    name: "Rishikesh",
    state: "Uttarakhand",
    description: "Yoga capital and gateway to the Himalayas.",
    imageUrl: "https://images.unsplash.com/photo-1605640840469-808269cd2fba?auto=format&fit=crop&q=80&w=800",
    popularFor: ["Yoga", "Rafting", "Spirituality"]
  },
  {
    id: "d6",
    name: "Coorg",
    state: "Kerala",
    description: "Scotland of India with lush greenery.",
    imageUrl: "https://images.unsplash.com/photo-1593693397690-362cb9666c6b?auto=format&fit=crop&q=80&w=800",
    popularFor: ["Coffee", "Hills", "Trekking"]
  },
  {
    id: "d7",
    name: "Agra",
    state: "Uttar Pradesh",
    description: "Home of the iconic Taj Mahal.",
    imageUrl: "https://images.unsplash.com/photo-1564507592228-01e403d15582?auto=format&fit=crop&q=80&w=800",
    popularFor: ["History", "Architecture", "Culture"]
  },
  {
    id: "d8",
    name: "Ooty",
    state: "Karnataka",
    description: "Picturesque hill station surrounded by forests.",
    imageUrl: "https://images.unsplash.com/photo-1589181140026-6df790755ec5?auto=format&fit=crop&q=80&w=800",
    popularFor: ["Nature", "Waterfalls", "Spices"]
  },
  {
    id: "d9",
    name: "Darjeeling",
    state: "West Bengal",
    description: "Queen of the Hills with stunning Kanchenjunga views.",
    imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800",
    popularFor: ["Tea", "Toy Train", "Views"]
  },
  {
    id: "d10",
    name: "Jaipur",
    state: "Rajasthan",
    description: "The Pink City renowned for its historic forts.",
    imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800",
    popularFor: ["Forts", "Shopping", "Culture"]
  }
];

export const mockRoutes: Route[] = [
  {
    id: "r1",
    from: "Delhi",
    to: "Agra",
    distance: "233 km",
    estimatedTime: "3h 30m",
    basePrice: 3500,
    popular: true,
    imageUrl: "https://images.unsplash.com/photo-1564507592228-01e403d15582?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "r2",
    from: "Mumbai",
    to: "Pune",
    distance: "148 km",
    estimatedTime: "2h 45m",
    basePrice: 2800,
    popular: true,
    imageUrl: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "r3",
    from: "Bangalore",
    to: "Mysore",
    distance: "278 km",
    estimatedTime: "4h 15m",
    basePrice: 4200,
    popular: true,
    imageUrl: "https://images.unsplash.com/photo-1583091016830-4e38c7f9d8a5?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "r4",
    from: "Delhi",
    to: "Manali",
    distance: "530 km",
    estimatedTime: "11h 30m",
    basePrice: 8500,
    popular: false,
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "r5",
    from: "Chandigarh",
    to: "Shimla",
    distance: "305 km",
    estimatedTime: "8h 00m",
    basePrice: 5500,
    popular: true,
    imageUrl: "https://images.unsplash.com/photo-1565538166014-984e84b8e5c1?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "r6",
    from: "Chennai",
    to: "Coorg",
    distance: "265 km",
    estimatedTime: "5h 30m",
    basePrice: 4800,
    popular: false,
    imageUrl: "https://images.unsplash.com/photo-1593693397690-362cb9666c6b?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "r7",
    from: "Delhi Airport",
    to: "Gurgaon",
    distance: "20 km",
    estimatedTime: "0h 40m",
    basePrice: 800,
    popular: true,
    imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "r8",
    from: "Mumbai Airport",
    to: "South Mumbai",
    distance: "25 km",
    estimatedTime: "1h 10m",
    basePrice: 1200,
    popular: true,
    imageUrl: "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "r9",
    from: "Kochi",
    to: "Munnar",
    distance: "126 km",
    estimatedTime: "3h 45m",
    basePrice: 3200,
    popular: false,
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "r10",
    from: "Guwahati",
    to: "Alleppey",
    distance: "140 km",
    estimatedTime: "4h 00m",
    basePrice: 3600,
    popular: false,
    imageUrl: "https://images.unsplash.com/photo-1593693397690-362cb9666c6b?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "r11",
    from: "Dehradun",
    to: "Mussoorie",
    distance: "34 km",
    estimatedTime: "1h 30m",
    basePrice: 1500,
    popular: true,
    imageUrl: "https://images.unsplash.com/photo-1605640840469-808269cd2fba?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "r12",
    from: "Hyderabad",
    to: "Ooty",
    distance: "270 km",
    estimatedTime: "6h 00m",
    basePrice: 5000,
    popular: false,
    imageUrl: "https://images.unsplash.com/photo-1589181140026-6df790755ec5?auto=format&fit=crop&q=80&w=400"
  }
];

export const mockBookings: Booking[] = [
  {
    id: "b1",
    vehicleId: "v2",
    from: "Delhi",
    to: "Agra",
    date: "2023-11-15T09:00:00Z",
    passengers: 5,
    totalPrice: 4500,
    status: "upcoming",
    createdAt: "2023-10-25T14:30:00Z"
  },
  {
    id: "b2",
    vehicleId: "v1",
    from: "Mumbai",
    to: "Pune",
    date: "2023-11-20T08:00:00Z",
    passengers: 2,
    totalPrice: 3200,
    status: "confirmed",
    createdAt: "2023-10-28T10:15:00Z"
  },
  {
    id: "b3",
    vehicleId: "v4",
    from: "Bangalore",
    to: "Coorg",
    date: "2023-10-05T06:30:00Z",
    passengers: 10,
    totalPrice: 18000,
    status: "completed",
    createdAt: "2023-09-15T11:45:00Z"
  },
  {
    id: "b4",
    vehicleId: "v3",
    from: "Delhi Airport",
    to: "Gurgaon",
    date: "2023-12-01T20:00:00Z",
    passengers: 1,
    totalPrice: 2500,
    status: "upcoming",
    createdAt: "2023-10-30T16:20:00Z"
  },
  {
    id: "b5",
    vehicleId: "v6",
    from: "Chandigarh",
    to: "Shimla",
    date: "2023-09-20T07:00:00Z",
    passengers: 4,
    totalPrice: 6500,
    status: "completed",
    createdAt: "2023-09-01T09:10:00Z"
  }
];
