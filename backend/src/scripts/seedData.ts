import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User';
import Vehicle from '../models/Vehicle';
import Booking from '../models/Booking';
import Driver from '../models/Driver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yatrawheels';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Booking.deleteMany({}),
      Driver.deleteMany({})
    ]);

    const testPasswordHash = await bcrypt.hash('Test@123', 10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

    // 1. Create Users
    console.log('Creating users...');
    const users = await User.insertMany([
      { name: "Test User", email: "testuser@yatrawheels.com", password: testPasswordHash, role: "user", status: "active" }
    ]);

    // 2. Create Vendors
    console.log('Creating vendors...');
    const vendors = await User.insertMany([
      { name: "Test Vendor", email: "testvendor@yatrawheels.com", password: testPasswordHash, role: "vendor", status: "active" }
    ]);

    // 3. Create Drivers
    console.log('Creating drivers...');
    const driverUsers = await User.insertMany([
      { name: "Test Driver", email: "testdriver@yatrawheels.com", password: testPasswordHash, role: "driver", status: "active" }
    ]);

    // 4. Create Admin
    console.log('Creating admin...');
    const admins = await User.insertMany([
      { name: "Test Admin", email: "admin@yatrawheels.com", password: adminPasswordHash, role: "admin", status: "active" }
    ]);

    const drivers = await Driver.insertMany([
      { userId: driverUsers[0]._id, licenseNumber: "DL-1234567890", licenseImageUrl: "", status: "approved", isAvailable: true, rating: 4.8, totalTrips: 45, totalEarnings: 22500, currentLocation: { lat: 28.6139, lng: 77.2090 } }
    ]);

    // 4. Create Vehicles
    console.log('Creating vehicles...');
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
        vendorId: vendors[0]._id,
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
        vendorId: vendors[0]._id,
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
    console.log('Creating bookings...');
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
        userId: users[0]._id,
        vendorId: vendors[0]._id,
        vehicleId: vehicles[2]._id,
        driverId: drivers[0]._id,
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
        userId: users[0]._id,
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

    console.log('\n--- SEED SUMMARY ---');
    console.log(`Users created: ${users.length}`);
    console.log(`Vendors created: ${vendors.length}`);
    console.log(`Drivers created: ${drivers.length}`);
    console.log(`Vehicles created: ${vehicles.length}`);
    console.log(`Bookings created: ${bookings.length}`);
    console.log('--------------------\n');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
