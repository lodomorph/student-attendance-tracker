import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { requireAuth } from "./auth";
import { insertStudentSchema, insertAttendanceSchema, insertSectionSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // Apply authentication to all routes
  app.get("/api/auth/status", requireAuth, (req, res) => {
  res.json({ username: req.headers["x-replit-user-name"] });
});

app.post("/api/auth/login", (_req, res) => {
  res.status(200).json({ message: "Login successful" });
});

app.post("/api/auth/logout", (_req, res) => {
  res.status(200).json({ message: "Logout successful" });
});

app.use("/api", requireAuth);
  // Section routes
  app.get("/api/sections", async (_req, res) => {
    const sections = await storage.getSections();
    res.json(sections);
  });

  app.get("/api/sections/:id", async (req, res) => {
    const section = await storage.getSection(parseInt(req.params.id));
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.json(section);
  });

  app.post("/api/sections", async (req, res) => {
    const result = insertSectionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid section data" });
    }
    const section = await storage.createSection(result.data);
    res.status(201).json(section);
  });

  app.put("/api/sections/:id", async (req, res) => {
    const result = insertSectionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid section data" });
    }
    const section = await storage.updateSection(parseInt(req.params.id), result.data);
    res.json(section);
  });

  app.delete("/api/sections/:id", async (req, res) => {
    await storage.deleteSection(parseInt(req.params.id));
    res.status(204).end();
  });

  // Student routes
  app.get("/api/students", async (_req, res) => {
    const students = await storage.getStudents();
    res.json(students);
  });

  app.get("/api/students/:id", async (req, res) => {
    const student = await storage.getStudent(parseInt(req.params.id));
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  });

  app.post("/api/students", async (req, res) => {
    const result = insertStudentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid student data" });
    }
    const student = await storage.createStudent(result.data);
    res.status(201).json(student);
  });

  app.put("/api/students/:id", async (req, res) => {
    const result = insertStudentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid student data" });
    }
    const student = await storage.updateStudent(parseInt(req.params.id), result.data);
    res.json(student);
  });

  app.delete("/api/students/:id", async (req, res) => {
    await storage.deleteStudent(parseInt(req.params.id));
    res.status(204).end();
  });

  // Attendance routes
  app.get("/api/attendance", async (req, res) => {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const attendance = await storage.getAttendance(date);
    res.json(attendance);
  });

  app.post("/api/attendance", async (req, res) => {
    const result = insertAttendanceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid attendance data" });
    }
    const attendance = await storage.markAttendance(result.data);
    res.status(201).json(attendance);
  });

  app.get("/api/students/:id/attendance", async (req, res) => {
    const attendance = await storage.getStudentAttendance(parseInt(req.params.id));
    res.json(attendance);
  });

  const httpServer = createServer(app);
  return httpServer;
}