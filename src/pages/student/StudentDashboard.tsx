import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import TimetableGridView from "@/components/ui/TimetableGridView";
import StatCard from "@/components/ui/StatCard";
import { MOCK_TIMETABLE_CS3, DEPARTMENTS, SEMESTERS } from "@/lib/mockData";
import { CalendarDays, Download, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dept, setDept] = useState(user?.department || "Computer Science");
  const [sem, setSem] = useState(String(user?.semester || 3));

  const handleDownload = () => {
    toast({ title: "Downloading PDF...", description: "Your timetable is being prepared." });
  };

  return (
    <AppLayout requiredRole="student" title="Student Dashboard">
      {/* Header */}
      <div className="gradient-hero rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Hi, {user?.name?.split(" ")[0]} 👋</h1>
            <p className="text-white/70 text-sm mt-1">{user?.department} · Semester {user?.semester} · Spring 2025</p>
          </div>
          <Button onClick={handleDownload} className="bg-teal hover:bg-teal-light text-white border-0">
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Enrolled Courses" value={5} icon={<BookOpen className="h-5 w-5 text-primary-foreground" />} iconBg="gradient-card" />
        <StatCard title="Classes Today" value={3} subtitle="2 lectures · 1 lab" icon={<CalendarDays className="h-5 w-5 text-white" />} iconBg="gradient-teal" />
        <StatCard title="Free Periods" value={5} subtitle="This week" icon={<Clock className="h-5 w-5 text-white" />} iconBg="bg-warning" />
        <StatCard title="Total Credits" value={18} icon={<BookOpen className="h-5 w-5 text-white" />} iconBg="bg-success" />
      </div>

      {/* Filter */}
      <div className="bg-card rounded-xl border shadow-card p-4 mb-6 flex flex-wrap items-center gap-4">
        <h3 className="font-semibold text-foreground">View Timetable</h3>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Dept:</label>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Semester:</label>
          <Select value={sem} onValueChange={setSem}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>{SEMESTERS.map((s) => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="ml-auto" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
      </div>

      {/* Timetable */}
      <div className="bg-card rounded-xl border shadow-card p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Class Schedule</h3>
            <p className="text-xs text-muted-foreground">{dept} · Semester {sem}</p>
          </div>
        </div>
        <TimetableGridView data={MOCK_TIMETABLE_CS3} />
      </div>
    </AppLayout>
  );
}
