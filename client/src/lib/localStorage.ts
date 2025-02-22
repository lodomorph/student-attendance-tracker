import type { Student, Attendance } from "@shared/schema";

const STORAGE_KEYS = {
  STUDENTS: 'students',
  ATTENDANCE: 'attendance'
} as const;

export function getStoredStudents(): Student[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading students from localStorage:', error);
    return [];
  }
}

export function setStoredStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (error) {
    console.error('Error storing students to localStorage:', error);
  }
}

export function getStoredAttendance(): Attendance[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading attendance from localStorage:', error);
    return [];
  }
}

export function setStoredAttendance(attendance: Attendance[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  } catch (error) {
    console.error('Error storing attendance to localStorage:', error);
  }
}

export function clearStoredData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  } catch (error) {
    console.error('Error clearing stored data:', error);
  }
}

// Helper to check if localStorage is available
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}