// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  sections;
  students;
  attendance;
  currentSectionId;
  currentStudentId;
  currentAttendanceId;
  constructor() {
    this.sections = /* @__PURE__ */ new Map();
    this.students = /* @__PURE__ */ new Map();
    this.attendance = /* @__PURE__ */ new Map();
    this.currentSectionId = 1;
    this.currentStudentId = 1;
    this.currentAttendanceId = 1;
  }
  // Section operations
  async getSections() {
    return Array.from(this.sections.values());
  }
  async getSection(id) {
    return this.sections.get(id);
  }
  async createSection(section) {
    const id = this.currentSectionId++;
    const newSection = { ...section, id };
    this.sections.set(id, newSection);
    return newSection;
  }
  async updateSection(id, section) {
    const updatedSection = { ...section, id };
    this.sections.set(id, updatedSection);
    return updatedSection;
  }
  async deleteSection(id) {
    this.sections.delete(id);
  }
  // Student operations
  async getStudents() {
    return Array.from(this.students.values());
  }
  async getStudent(id) {
    return this.students.get(id);
  }
  async createStudent(student) {
    const id = this.currentStudentId++;
    const newStudent = { ...student, id };
    this.students.set(id, newStudent);
    return newStudent;
  }
  async updateStudent(id, student) {
    const updatedStudent = { ...student, id };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }
  async deleteStudent(id) {
    this.students.delete(id);
  }
  // Attendance operations
  async getAttendance(date2) {
    return Array.from(this.attendance.values()).filter(
      (a) => new Date(a.date).toDateString() === date2.toDateString()
    );
  }
  async markAttendance(attendance2) {
    const date2 = new Date(attendance2.date).toISOString();
    const existingAttendance = Array.from(this.attendance.values()).find(
      (a) => a.studentId === attendance2.studentId && new Date(a.date).toDateString() === new Date(date2).toDateString()
    );
    if (existingAttendance) {
      const updatedAttendance = {
        ...existingAttendance,
        present: attendance2.present
      };
      this.attendance.set(existingAttendance.id, updatedAttendance);
      return updatedAttendance;
    } else {
      const id = this.currentAttendanceId++;
      const newAttendance = {
        ...attendance2,
        id,
        date: date2
      };
      this.attendance.set(id, newAttendance);
      return newAttendance;
    }
  }
  async getStudentAttendance(studentId) {
    return Array.from(this.attendance.values()).filter(
      (a) => a.studentId === studentId
    );
  }
  // Seeding initial data
  async seedInitialData() {
    const sections2 = [
      { name: "Class 10A", description: "Section A of 10th grade" },
      { name: "Class 10B", description: "Section B of 10th grade" }
    ];
    const createdSections = await Promise.all(
      sections2.map((section) => this.createSection(section))
    );
    const students2 = Array.from({ length: 20 }, (_, i) => ({
      name: `Student ${i + 1}`,
      rollNumber: `2024${(i + 1).toString().padStart(3, "0")}`,
      email: `student${i + 1}@example.com`,
      phone: `123456789${(i + 1).toString().padStart(2, "0")}`,
      sectionId: createdSections[i % 2].id
    }));
    await Promise.all(students2.map((student) => this.createStudent(student)));
  }
};
var storage = new MemStorage();
storage.seedInitialData().catch(console.error);

// server/auth.ts
var DEFAULT_USERNAME = "admin";
var DEFAULT_PASSWORD = "password123";
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).json({ message: "Authentication required" });
  }
  const auth = Buffer.from(authHeader.split(" ")[1], "base64").toString();
  const [username, password] = auth.split(":");
  if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
    next();
  } else {
    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).json({ message: "Invalid credentials" });
  }
}

// shared/schema.ts
import { pgTable, text, serial, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description")
});
var students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rollNumber: text("roll_number").notNull().unique(),
  idNumber: text("id_number").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  photo: text("photo").notNull(),
  sectionId: serial("section_id").references(() => sections.id)
});
var attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: serial("student_id").references(() => students.id),
  date: date("date").notNull(),
  present: boolean("present").notNull()
});
var insertSectionSchema = createInsertSchema(sections).extend({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional()
});
var insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  rollNumber: true,
  idNumber: true,
  email: true,
  phone: true,
  photo: true,
  sectionId: true
}).extend({
  name: z.string().min(2).max(100),
  rollNumber: z.string().min(2).max(20),
  idNumber: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  photo: z.string().url()
});
var insertAttendanceSchema = createInsertSchema(attendance).pick({
  studentId: true,
  date: true,
  present: true
}).extend({
  date: z.string().or(z.date()).transform(
    (val) => typeof val === "string" ? val : val.toISOString()
  )
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.use("/api", requireAuth);
  app2.get("/api/sections", async (_req, res) => {
    const sections2 = await storage.getSections();
    res.json(sections2);
  });
  app2.get("/api/sections/:id", async (req, res) => {
    const section = await storage.getSection(parseInt(req.params.id));
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.json(section);
  });
  app2.post("/api/sections", async (req, res) => {
    const result = insertSectionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid section data" });
    }
    const section = await storage.createSection(result.data);
    res.status(201).json(section);
  });
  app2.put("/api/sections/:id", async (req, res) => {
    const result = insertSectionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid section data" });
    }
    const section = await storage.updateSection(parseInt(req.params.id), result.data);
    res.json(section);
  });
  app2.delete("/api/sections/:id", async (req, res) => {
    await storage.deleteSection(parseInt(req.params.id));
    res.status(204).end();
  });
  app2.get("/api/students", async (_req, res) => {
    const students2 = await storage.getStudents();
    res.json(students2);
  });
  app2.get("/api/students/:id", async (req, res) => {
    const student = await storage.getStudent(parseInt(req.params.id));
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  });
  app2.post("/api/students", async (req, res) => {
    const result = insertStudentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid student data" });
    }
    const student = await storage.createStudent(result.data);
    res.status(201).json(student);
  });
  app2.put("/api/students/:id", async (req, res) => {
    const result = insertStudentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid student data" });
    }
    const student = await storage.updateStudent(parseInt(req.params.id), result.data);
    res.json(student);
  });
  app2.delete("/api/students/:id", async (req, res) => {
    await storage.deleteStudent(parseInt(req.params.id));
    res.status(204).end();
  });
  app2.get("/api/attendance", async (req, res) => {
    const date2 = req.query.date ? new Date(req.query.date) : /* @__PURE__ */ new Date();
    const attendance2 = await storage.getAttendance(date2);
    res.json(attendance2);
  });
  app2.post("/api/attendance", async (req, res) => {
    const result = insertAttendanceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid attendance data" });
    }
    const attendance2 = await storage.markAttendance(result.data);
    res.status(201).json(attendance2);
  });
  app2.get("/api/students/:id/attendance", async (req, res) => {
    const attendance2 = await storage.getStudentAttendance(parseInt(req.params.id));
    res.json(attendance2);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  base: "/student-attendance-tracker",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 5001;
  const hosts = process.env.HOST || "127.0.0.1";
  server.listen(port, () => {
    log(`Server running at http://${hosts}:${port}`);
  });
})();
