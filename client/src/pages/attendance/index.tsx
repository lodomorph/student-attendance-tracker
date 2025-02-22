import React from "react";
import AttendanceGrid from "@/components/attendance-grid";

export default function Attendance() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Daily Attendance</h1>
      <AttendanceGrid />
    </div>
  );
}