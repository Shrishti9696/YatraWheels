import Driver from "../models/Driver";
import Booking from "../models/Booking";
import { io } from "../index";
import { logger } from "../lib/logger";

/**
 * Assigns a driver to a booking based on availability and proximity.
 */
export async function assignDriverToBooking(bookingId: string) {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return;

    // 1. Find all available and approved drivers
    const drivers = await Driver.find({ 
      isAvailable: true, 
      status: "approved" 
    }).populate("userId", "name");

    if (drivers.length === 0) {
      logger.warn({ bookingId }, "No available drivers found for booking");
      return;
    }

    // 2. Selection Logic: Proximity OR First Available
    // For now, we pick the first available. 
    // In a production app, we'd use currentLocation 2D sphere index.
    const assignedDriver = drivers[0];

    // 3. Update Booking
    booking.driverId = assignedDriver._id as any;
    (booking as any).driverStatus = "assigned";
    await booking.save();

    // 4. Emit Socket Events
    // To Driver:
    io.to(assignedDriver.userId._id.toString()).emit("trip:assigned", {
      bookingId: booking._id,
      pickup: booking.pickupLocation,
      drop: booking.dropLocation,
      fare: booking.totalPrice,
      user: "Traveler" // We could populate user name if needed
    });

    // To User:
    io.to(booking.userId.toString()).emit("driver:assigned", {
      bookingId: booking._id,
      driverName: (assignedDriver.userId as any).name,
      rating: assignedDriver.rating
    });

    logger.info({ bookingId, driverId: assignedDriver._id }, "Driver assigned to booking");
  } catch (err: any) {
    logger.error({ err: err.message, bookingId }, "Error in driver assignment");
  }
}
