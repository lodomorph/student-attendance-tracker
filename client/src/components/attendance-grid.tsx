import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Student, Attendance, Section } from "@shared/schema";

type PendingAttendance = {
  studentId: number;
  present: boolean;
};

export default function AttendanceGrid() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
  const [pendingChanges, setPendingChanges] = useState<Map<number, PendingAttendance>>(new Map());
  const { toast } = useToast();

  const { data: sections } = useQuery<Section[]>({
    queryKey: ["/api/sections"],
  });

  const { data: students, isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: attendance, isLoading: loadingAttendance } = useQuery<
    Attendance[]
  >({
    queryKey: ["/api/attendance", format(date, "yyyy-MM-dd")],
  });

  const markAttendance = useMutation({
    mutationFn: async (changes: PendingAttendance[]) => {
      const promises = changes.map(({ studentId, present }) =>
        apiRequest("POST", "/api/attendance", {
          studentId,
          date,
          present,
        })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/attendance", format(date, "yyyy-MM-dd")],
      });
      setPendingChanges(new Map());
      toast({
        title: "Attendance saved successfully",
      });
    },
  });

  if (loadingStudents || loadingAttendance || !sections) {
    return <div>Loading...</div>;
  }

  const filteredStudents = students?.filter(
    student => selectedSectionId === "all" || student.sectionId.toString() === selectedSectionId
  );

  const getAttendanceStatus = (studentId: number) => {
    // Check pending changes first
    if (pendingChanges.has(studentId)) {
      return pendingChanges.get(studentId)?.present ?? true;
    }
    // Fall back to saved attendance or default to present
    return attendance?.find((a) => a.studentId === studentId)?.present ?? true;
  };

  const handleAttendanceChange = (studentId: number, present: boolean) => {
    setPendingChanges(new Map(pendingChanges.set(studentId, { studentId, present })));
  };

  const handleSubmit = () => {
    if (pendingChanges.size === 0) {
      toast({
        title: "No changes to save",
      });
      return;
    }
    markAttendance.mutate(Array.from(pendingChanges.values()));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                if (date) {
                  setDate(date);
                  setPendingChanges(new Map());
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select
          value={selectedSectionId}
          onValueChange={setSelectedSectionId}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {sections.map((section) => (
              <SelectItem key={section.id} value={section.id.toString()}>
                {section.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button
            onClick={handleSubmit}
            disabled={pendingChanges.size === 0 || markAttendance.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {markAttendance.isPending ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Roll Number</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Attendance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents?.map((student) => {
            const section = sections.find(s => s.id === student.sectionId);
            const isPresent = getAttendanceStatus(student.id);

            return (
              <TableRow key={student.id}>
                <TableCell>{student.rollNumber}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{section?.name}</TableCell>
                <TableCell>
                  <Switch
                    checked={isPresent}
                    onCheckedChange={(checked) => handleAttendanceChange(student.id, checked)}
                    className={`${
                      isPresent ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}