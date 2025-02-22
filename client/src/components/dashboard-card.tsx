import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Student, Attendance, Section } from "@shared/schema";

export default function DashboardCard() {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const { toast } = useToast();
  const { data: students } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: sections } = useQuery<Section[]>({
    queryKey: ["/api/sections"],
  });

  const { data: attendance } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance", format(new Date(), "yyyy-MM-dd")],
  });

  if (!students || !sections || !attendance) {
    return <div>Loading...</div>;
  }

  const totalStudents = students.length;
  const totalClasses = sections.length;

  const presentStudents = attendance.filter(a => a.present).length;
  const absentStudents = attendance.filter(a => !a.present).length;
  const lateStudents = attendance.filter(a => a.late).length; // Added late students
  const attendanceRate = attendance.length > 0 
    ? Math.round((presentStudents / attendance.length) * 100) 
    : 0;

  const pieData = [
    { name: 'Present', value: presentStudents, color: 'hsl(var(--primary))' },
    { name: 'Absent', value: absentStudents, color: 'hsl(var(--destructive))' },
    { name: 'Late', value: lateStudents, color: 'hsl(var(--warning))' } // Added late students to pie chart
  ];

  const absentStudentsList = students.filter((student) => {
    const studentAttendance = attendance.find((a) => a.studentId === student.id);
    return studentAttendance && !studentAttendance.present;
  });

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Today's Overview</CardTitle>
          <CardDescription>
            {format(new Date(), "MMMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Students</span>
              <span className="text-2xl font-bold">{totalStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Classes</span>
              <span className="text-2xl font-bold">{totalClasses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Attendance Rate</span>
              <span className="text-2xl font-bold">{attendanceRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Present</span>
              <span className="text-2xl font-bold">{presentStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Absent</span>
              <span className="text-2xl font-bold">{absentStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Late</span>
              <span className="text-2xl font-bold">{lateStudents}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Distribution</CardTitle>
          <CardDescription>Present vs Absent Students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Absent Students</CardTitle>
          <CardDescription>Students missing today</CardDescription>
          <div className="flex items-center gap-4 mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedStudents(absentStudentsList.map(s => s.id))}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedStudents([])}
            >
              Deselect All
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (selectedStudents.length === 0) {
                  toast({
                    title: "No students selected",
                    description: "Please select at least one student"
                  });
                  return;
                }
                toast({
                  title: "Parents/Guardian Notified",
                });
                setSelectedStudents([]);
              }}
            >
              Notify Parent/Guardian
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {absentStudentsList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No absent students today</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Section</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absentStudentsList.map((student) => {
                  const section = sections.find(s => s.id === student.sectionId);
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => handleStudentSelect(student.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{section?.name}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}