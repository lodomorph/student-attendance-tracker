
import { Request, Response, NextFunction } from "express";

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "password123";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).json({ message: "Authentication required" });
  }

  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
  const [username, password] = auth.split(':');

  if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).json({ message: "Invalid credentials" });
  }
}
