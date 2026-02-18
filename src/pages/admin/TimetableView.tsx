import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { TIME_SLOTS, DEPARTMENTS, SEMESTERS } from "@/lib/mockData";
import { MOCK_TIMETABLE_CS3 } from "@/lib/mockData";
import TimetableGridView from "@/components/ui/TimetableGridView";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, RefreshCw, Zap, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function TimetableView() {
  const [dept, setDept] = useState("Computer Science");
  const [sem, setSem] = useState("3");
  const [generating, setGenerating] = useState(false);
  const [showTimetable, setShowTimetable] = useState(true);

  const handleGenerate = async () => {
    setGenerating(true);
    setShowTimetable(false);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    setShowTimetable(true);
    toast({ title: "Timetable Generated!", description: `${dept} - Semester ${sem} schedule is ready.` });
  };

  return (
    <AppLayout requiredRole="admin" title="Timetable">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timetable View</h1>
          <p className="text-muted-foreground text-sm">View and generate class schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Downloading PDF..." })}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button className="gradient-teal text-white shadow-teal" onClick={handleGenerate} disabled={generating}>
            {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Zap className="h-4 w-4 mr-2" /> Re-Generate</>}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border shadow-card p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Department:</label>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Semester:</label>
          <Select value={sem} onValueChange={setSem}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{SEMESTERS.map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          {[{ label: "Lecture", color: "bg-primary/10 text-primary border-primary/20" }, { label: "Lab", color: "bg-accent/10 text-accent border-accent/20" }, { label: "Seminar", color: "bg-warning/10 text-warning border-warning/20" }].map((l) => (
            <span key={l.label} className={`text-xs px-2 py-1 rounded border font-medium ${l.color}`}>{l.label}</span>
          ))}
        </div>
      </div>

      {/* Timetable */}
      {generating ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="w-16 h-16 rounded-full gradient-teal flex items-center justify-center mb-4 animate-pulse">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-semibold text-foreground">AI is generating your timetable...</p>
          <p className="text-sm mt-1">Optimizing for conflicts, faculty availability, and room capacity</p>
        </div>
      ) : showTimetable ? (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-primary/10 text-primary border-primary/20">{dept}</Badge>
            <Badge variant="outline">Semester {sem}</Badge>
            <span className="text-xs text-muted-foreground ml-auto">{TIME_SLOTS.length} time slots · 5 days</span>
          </div>
          <TimetableGridView data={MOCK_TIMETABLE_CS3} />
        </div>
      ) : null}
    </AppLayout>
  );
}
