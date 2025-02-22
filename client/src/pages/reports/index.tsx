import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, startOfWeek, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardCard from "@/components/dashboard-card";
import type { Student, Attendance } from "@shared/schema";

export default function Reports() {
  const { data: students } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: allAttendance } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance"],
  });

  if (!students || !allAttendance) return <div>Loading...</div>;

  // Get the start of the current week (Sunday)
  const startDate = startOfWeek(new Date());

  // Generate data for each day of the week (Sunday to Saturday)
  const weeklyData = Array.from({ length: 7 }, (_, index) => {
    const currentDate = addDays(startDate, index);
    const dateStr = format(currentDate, "yyyy-MM-dd");

    // Filter attendance for current date
    const dayAttendance = allAttendance.filter(
      (a) => format(new Date(a.date), "yyyy-MM-dd") === dateStr
    );

    const presentCount = dayAttendance.filter((a) => a.present).length;

    return {
      day: format(currentDate, "EEE"),
      date: format(currentDate, "MMM d"),
      present: dayAttendance.length > 0 ? presentCount : 0,
      total: dayAttendance.length > 0 ? dayAttendance.length : 0,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance Dashboard</h1>

      <DashboardCard />

      <Card>
        <CardHeader>
          <CardTitle>Weekly Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day"
                  tickFormatter={(value, index) => `${value} (${weeklyData[index].date})`}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} students`,
                    name === "present" ? "Present" : "Total"
                  ]}
                />
                <Bar dataKey="total" fill="hsl(var(--muted))" />
                <Bar dataKey="present" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}