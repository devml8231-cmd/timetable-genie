import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/ui/StatCard";
import TimetableGridView from "@/components/ui/TimetableGridView";
import { MOCK_TIMETABLE_CS3, WORKLOAD_DATA } from "@/lib/mockData";
import { BookOpen, Clock, CalendarDays, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MY_COURSES = [
  { code: "CS301", name: "Data Structures & Algorithms", dept: "Computer Science", sem: 3, hrs: 4 },
  { code: "CS401", name: "Machine Learning", dept: "Computer Science", sem: 5, hrs: 4 },
];

export default function FacultyDashboard() {
  const { user } = useAuth();
  const myData = [WORKLOAD_DATA[0]];

  return (
    <AppLayout requiredRole="faculty" title="Faculty Dashboard">
      {/* Header */}
      <div className="gradient-hero rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.name} 👋</h1>
        <p className="text-white/70 text-sm mt-1">{user?.department} · Spring Semester 2025</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Assigned Courses" value={2} icon={<BookOpen className="h-5 w-5 text-primary-foreground" />} iconBg="gradient-card" />
        <StatCard title="Weekly Hours" value="8h" subtitle="Teaching load" icon={<Clock className="h-5 w-5 text-white" />} iconBg="gradient-teal" />
        <StatCard title="Lectures This Week" value={12} icon={<CalendarDays className="h-5 w-5 text-white" />} iconBg="bg-warning" />
        <StatCard title="Students Taught" value="180" icon={<BarChart3 className="h-5 w-5 text-white" />} iconBg="bg-success" />
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* My Courses */}
        <div className="bg-card rounded-xl border shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4">My Courses</h3>
          <div className="space-y-3">
            {MY_COURSES.map((c) => (
              <div key={c.code} className="p-3 rounded-lg bg-muted/50 border hover:bg-muted transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">{c.code}</span>
                  <span className="text-xs text-muted-foreground">{c.hrs}h/week</span>
                </div>
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Sem {c.sem} · {c.dept}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Workload Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-1">Workload Summary</h3>
          <p className="text-xs text-muted-foreground mb-4">Your weekly teaching hours breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={[{ day: "Mon", hours: 2 }, { day: "Tue", hours: 1 }, { day: "Wed", hours: 2 }, { day: "Thu", hours: 1 }, { day: "Fri", hours: 2 }]} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,28%,92%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 4]} />
              <Tooltip contentStyle={{ fontSize: "12px", borderRadius: "8px" }} formatter={(v) => [`${v} hours`, "Lectures"]} />
              <Bar dataKey="hours" fill="hsl(178,68%,38%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timetable */}
      <div className="bg-card rounded-xl border shadow-card p-5">
        <h3 className="font-semibold text-foreground mb-4">My Timetable (This Week)</h3>
        <TimetableGridView data={MOCK_TIMETABLE_CS3} />
      </div>
    </AppLayout>
  );
}
