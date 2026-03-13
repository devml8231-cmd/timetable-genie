import AppLayout from "@/components/layout/AppLayout";
import TimetableGridView from "@/components/ui/TimetableGridView";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchFacultyTimetable } from "@/lib/api";
import { TimetableGrid } from "@/types";

export default function FacultyTimetable() {
  const { user } = useAuth();

  const timetableQuery = useQuery({
    queryKey: ["faculty-timetable", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const raw = await fetchFacultyTimetable(user!.id, user?.semester);
      const grid: TimetableGrid = {};
      raw.forEach((row: any) => {
        const day = row.time_slot_details?.day || row.day;
        const start = row.time_slot_details?.start_time;
        const end = row.time_slot_details?.end_time;
        if (!day || !start || !end) return;
        const slotLabel = `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
        if (!grid[day]) grid[day] = {};
        grid[day][slotLabel] = {
          courseCode: row.course?.course_name || String(row.course_id),
          courseName: row.course?.course_name || "",
          facultyName: user?.name || "",
          room: row.room?.room_name,
          type: "lecture",
        };
      });
      return grid;
    },
  });

  return (
    <AppLayout requiredRole="faculty" title="My Timetable">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Timetable</h1>
          <p className="text-muted-foreground text-sm">Spring Semester 2025 · Computer Science</p>
        </div>
        <Button variant="outline" onClick={() => toast({ title: "Downloading..." })}>
          <Download className="h-4 w-4 mr-2" /> Download PDF
        </Button>
      </div>
      <div className="bg-card rounded-xl border shadow-card p-5">
        {timetableQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading timetable...</p>
        ) : timetableQuery.isError ? (
          <p className="text-sm text-destructive">Failed to load timetable.</p>
        ) : (
          <TimetableGridView data={timetableQuery.data || {}} />
        )}
      </div>
    </AppLayout>
  );
}
