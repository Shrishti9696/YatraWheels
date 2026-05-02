import Vehicle from "../models/Vehicle";
import { logger } from "../lib/logger";

export async function seedDatabase(): Promise<void> {
  const deleted = await Vehicle.deleteMany({ vendorId: { $exists: false } });
  if (deleted.deletedCount > 0) {
    logger.info({ count: deleted.deletedCount }, "Removed seed vehicles — database is clean");
  } else {
    logger.info("No seed vehicles found — database is clean");
  }
}
