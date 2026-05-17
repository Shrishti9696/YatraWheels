const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User').default;
const Vehicle = require('../src/models/Vehicle').default;
const Booking = require('../src/models/Booking').default;
const Driver = require('../src/models/Driver').default;

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({ role: { $ne: 'admin' } }),
      Vehicle.deleteMany({}),
      Booking.deleteMany({}),
      Driver.deleteMany({})
    ]);

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Users
    const users = await User.insertMany([
      { name: "Arjun Sharma", email: "arjun@example.com", password: hashedPassword, role: "user", status: "active" },
      { name: "Priya Patel", email: "priya@example.com", password: hashedPassword, role: "user", status: "active" },
      { name: "Rohit Verdi", email: "rohit@example.com", password: hashedPassword, role: "user", status: "active" }
    ]);

    // 2. Create Vendors
    const vendors = await User.insertMany([
      { name: "Rajesh Motors (Delhi)", email: "rajesh@motors.com", password: hashedPassword, role: "vendor", status: "active" },
      { name: "SunCity Rentals (Mumbai)", email: "suncity@rentals.com", password: hashedPassword, role: "vendor", status: "active" }
    ]);

    // 3. Create Drivers
    const driverUsers = await User.insertMany([
      { name: "Vikram Singh", email: "vikram@driver.com", password: hashedPassword, role: "driver", status: "active" },
      { name: "Mohammed Raza", email: "mohammed@driver.com", password: hashedPassword, role: "driver", status: "active" }
    ]);

    const drivers = await Driver.insertMany([
      { userId: driverUsers[0]._id, licenseNumber: "DL-1234567890", status: "approved", isAvailable: true, rating: 4.8, totalTrips: 45, totalEarnings: 22500 },
      { userId: driverUsers[1]._id, licenseNumber: "MH-0987654321", status: "approved", isAvailable: true, rating: 4.9, totalTrips: 62, totalEarnings: 31000 }
    ]);

    // 4. Create Vehicles
    const vehicles = await Vehicle.insertMany([
      {
        vendorId: vendors[0]._id,
        name: "Toyota Innova Crysta",
        type: "car",
        capacity: 7,
        pricePerDay: 4500,
        pricePerKm: 15,
        location: "Delhi",
        features: ["AC", "GPS", "Music System", "Leather Seats"],
        imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800",
        approvalStatus: "approved",
        isApproved: true,
        isAvailable: true
      },
      {
        vendorId: vendors[0]._id,
        name: "Maruti Swift",
        type: "car",
        capacity: 5,
        pricePerDay: 2200,
        pricePerKm: 10,
        location: "Delhi",
        features: ["AC", "Bluetooth", "Power Steering"],
        imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800",
        approvalStatus: "approved",
        isApproved: true,
        isAvailable: true
      },
      {
        vendorId: vendors[1]._id,
        name: "Mahindra Thar",
        type: "luxury",
        capacity: 4,
        pricePerDay: 5500,
        pricePerKm: 18,
        location: "Mumbai",
        features: ["4x4", "AC", "Convertible", "Alloy Wheels"],
        imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
        approvalStatus: "approved",
        isApproved: true,
        isAvailable: true
      },
      {
        vendorId: vendors[1]._id,
        name: "Force Traveller",
        type: "van",
        capacity: 12,
        pricePerDay: 6500,
        pricePerKm: 20,
        location: "Mumbai",
        features: ["AC", "Push-back Seats", "TV", "Carrier"],
        imageUrl: "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?auto=format&fit=crop&q=80&w=800",
        approvalStatus: "approved",
        isApproved: true,
        isAvailable: true
      }
    ]);

    // 5. Create Bookings
    const bookings = await Booking.insertMany([
      {
        userId: users[0]._id,
        vendorId: vendors[0]._id,
        vehicleId: vehicles[0]._id,
        driverId: drivers[0]._id,
        pickupLocation: "Delhi Airport",
        dropLocation: "Agra",
        date: new Date(Date.now() - 5 * 86400000),
        returnDate: new Date(Date.now() - 3 * 86400000),
        passengers: 4,
        totalPrice: 12500,
        platformFee: 1250,
        vendorAmount: 9000,
        driverAmount: 2250,
        status: "completed",
        paymentStatus: "paid"
      },
      {
        userId: users[1]._id,
        vendorId: vendors[1]._id,
        vehicleId: vehicles[2]._id,
        driverId: drivers[1]._id,
        pickupLocation: "Mumbai Hotel",
        dropLocation: "Lonavala",
        date: new Date(Date.now() - 1 * 86400000),
        returnDate: new Date(Date.now() + 1 * 86400000),
        passengers: 2,
        totalPrice: 8500,
        platformFee: 850,
        vendorAmount: 6000,
        driverAmount: 1650,
        status: "ongoing",
        paymentStatus: "paid"
      },
      {
        userId: users[2]._id,
        vendorId: vendors[0]._id,
        vehicleId: vehicles[1]._id,
        pickupLocation: "CP, Delhi",
        dropLocation: "Noida",
        date: new Date(Date.now() + 2 * 86400000),
        returnDate: new Date(Date.now() + 3 * 86400000),
        passengers: 3,
        totalPrice: 3200,
        platformFee: 320,
        vendorAmount: 2880,
        status: "confirmed",
        paymentStatus: "paid"
      }
    ]);

    console.log('--- SEED SUMMARY ---');
    console.log(`Users created: ${users.length}`);
    console.log(`Vendors created: ${vendors.length}`);
    console.log(`Drivers created: ${drivers.length}`);
    console.log(`Vehicles created: ${vehicles.length}`);
    console.log(`Bookings created: ${bookings.length}`);
    console.log('--------------------');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
