import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export function protect(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authorized. Token missing." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env["JWT_SECRET"] ?? process.env["SESSION_SECRET"] ?? "fallback-secret";
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Not authorized. Invalid token." });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Access denied. Admins only." });
    return;
  }
  next();
}

export function vendorOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  const role = req.user?.role;
  if (role !== "vendor" && role !== "admin") {
    res.status(403).json({ message: "Access denied. Vendors only." });
    return;
  }
  next();
}

export function driverOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  const role = req.user?.role;
  if (role !== "driver" && role !== "admin") {
    res.status(403).json({ message: "Access denied. Drivers only." });
    return;
  }
  next();
}
