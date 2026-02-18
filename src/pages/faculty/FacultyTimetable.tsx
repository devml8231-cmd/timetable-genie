import AppLayout from "@/components/layout/AppLayout";
import TimetableGridView from "@/components/ui/TimetableGridView";
import { MOCK_TIMETABLE_CS3 } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function FacultyTimetable() {
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
        <TimetableGridView data={MOCK_TIMETABLE_CS3} />
      </div>
    </AppLayout>
  );
}
