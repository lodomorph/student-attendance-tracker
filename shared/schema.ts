import { pgTable, text, serial, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rollNumber: text("roll_number").notNull().unique(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  sectionId: serial("section_id").references(() => sections.id),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: serial("student_id").references(() => students.id),
  date: date("date").notNull(),
  present: boolean("present").notNull(),
});

export const insertSectionSchema = createInsertSchema(sections).extend({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  rollNumber: true,
  email: true,
  phone: true,
  sectionId: true,
}).extend({
  name: z.string().min(2).max(100),
  rollNumber: z.string().min(2).max(20),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
});

export const insertAttendanceSchema = createInsertSchema(attendance).pick({
  studentId: true,
  date: true,
  present: true,
}).extend({
  date: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? val : val.toISOString()
  ),
});

export type Section = typeof sections.$inferSelect;
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;