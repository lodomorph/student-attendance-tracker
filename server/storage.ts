import { Student, InsertStudent, Attendance, InsertAttendance, Section, InsertSection } from "@shared/schema";

export interface IStorage {
  // Section operations
  getSections(): Promise<Section[]>;
  getSection(id: number): Promise<Section | undefined>;
  createSection(section: InsertSection): Promise<Section>;
  updateSection(id: number, section: InsertSection): Promise<Section>;
  deleteSection(id: number): Promise<void>;

  // Student operations
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: InsertStudent): Promise<Student>;
  deleteStudent(id: number): Promise<void>;

  // Attendance operations
  getAttendance(date: Date): Promise<Attendance[]>;
  markAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getStudentAttendance(studentId: number): Promise<Attendance[]>;

  // Seeding
  seedInitialData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private sections: Map<number, Section>;
  private students: Map<number, Student>;
  private attendance: Map<number, Attendance>;
  private currentSectionId: number;
  private currentStudentId: number;
  private currentAttendanceId: number;

  constructor() {
    this.sections = new Map();
    this.students = new Map();
    this.attendance = new Map();
    this.currentSectionId = 1;
    this.currentStudentId = 1;
    this.currentAttendanceId = 1;
  }

  // Section operations
  async getSections(): Promise<Section[]> {
    return Array.from(this.sections.values());
  }

  async getSection(id: number): Promise<Section | undefined> {
    return this.sections.get(id);
  }

  async createSection(section: InsertSection): Promise<Section> {
    const id = this.currentSectionId++;
    const newSection: Section = { ...section, id };
    this.sections.set(id, newSection);
    return newSection;
  }

  async updateSection(id: number, section: InsertSection): Promise<Section> {
    const updatedSection: Section = { ...section, id };
    this.sections.set(id, updatedSection);
    return updatedSection;
  }

  async deleteSection(id: number): Promise<void> {
    this.sections.delete(id);
  }

  // Student operations
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const newStudent: Student = { ...student, id };
    this.students.set(id, newStudent);
    return newStudent;
  }

  async updateStudent(id: number, student: InsertStudent): Promise<Student> {
    const updatedStudent: Student = { ...student, id };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: number): Promise<void> {
    this.students.delete(id);
  }

  // Attendance operations
  async getAttendance(date: Date): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      a => new Date(a.date).toDateString() === date.toDateString()
    );
  }

  async markAttendance(attendance: InsertAttendance): Promise<Attendance> {
    const date = new Date(attendance.date).toISOString();
    
    // Find existing attendance record for the same student and date
    const existingAttendance = Array.from(this.attendance.values()).find(
      a => a.studentId === attendance.studentId && 
           new Date(a.date).toDateString() === new Date(date).toDateString()
    );

    if (existingAttendance) {
      // Update existing record
      const updatedAttendance: Attendance = {
        ...existingAttendance,
        present: attendance.present
      };
      this.attendance.set(existingAttendance.id, updatedAttendance);
      return updatedAttendance;
    } else {
      // Create new record
      const id = this.currentAttendanceId++;
      const newAttendance: Attendance = { 
        ...attendance,
        id,
        date
      };
      this.attendance.set(id, newAttendance);
      return newAttendance;
    }
  }

  async getStudentAttendance(studentId: number): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      a => a.studentId === studentId
    );
  }

  // Seeding initial data
  async seedInitialData(): Promise<void> {
    // Create default sections
    const sections = [
      { name: "Class 10A", description: "Section A of 10th grade" },
      { name: "Class 10B", description: "Section B of 10th grade" },
    ];

    const createdSections = await Promise.all(
      sections.map(section => this.createSection(section))
    );

    // Create 20 students distributed across sections
    const students = Array.from({ length: 20 }, (_, i) => ({
      name: `Student ${i + 1}`,
      rollNumber: `2024${(i + 1).toString().padStart(3, '0')}`,
      email: `student${i + 1}@example.com`,
      phone: `123456789${(i + 1).toString().padStart(2, '0')}`,
      sectionId: createdSections[i % 2].id,
    }));

    await Promise.all(students.map(student => this.createStudent(student)));
  }
}

export const storage = new MemStorage();

// Seed initial data
storage.seedInitialData().catch(console.error);