import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { MOCK_COURSES } from "@/lib/mockData";
import { Course } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [search, setSearch] = useState("");
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", department: "", semester: "1", credits: "3", facultyName: "", hoursPerWeek: "3" });

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.department.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditCourse(null);
    setForm({ code: "", name: "", department: "", semester: "1", credits: "3", facultyName: "", hoursPerWeek: "3" });
    setDialogOpen(true);
  };

  const openEdit = (c: Course) => {
    setEditCourse(c);
    setForm({ code: c.code, name: c.name, department: c.department, semester: String(c.semester), credits: String(c.credits), facultyName: c.facultyName, hoursPerWeek: String(c.hoursPerWeek) });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.code || !form.name || !form.department) {
      toast({ title: "Error", description: "Please fill required fields.", variant: "destructive" });
      return;
    }
    if (editCourse) {
      setCourses(courses.map((c) => c.id === editCourse.id ? { ...c, ...form, semester: +form.semester, credits: +form.credits, hoursPerWeek: +form.hoursPerWeek } : c));
      toast({ title: "Course updated!" });
    } else {
      const newCourse: Course = { id: `c${Date.now()}`, facultyId: "", ...form, semester: +form.semester, credits: +form.credits, hoursPerWeek: +form.hoursPerWeek };
      setCourses([...courses, newCourse]);
      toast({ title: "Course added!" });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
    toast({ title: "Course deleted" });
  };

  return (
    <AppLayout requiredRole="admin" title="Courses">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground text-sm">{courses.length} courses across all departments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="gradient-teal text-white shadow-teal">
              <Plus className="h-4 w-4 mr-2" /> Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Course Code *</Label><Input placeholder="CS301" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
                <div className="space-y-1"><Label>Credits</Label><Input type="number" min="1" max="6" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Course Name *</Label><Input placeholder="Data Structures & Algorithms" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Department *</Label><Input placeholder="Computer Science" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                <div className="space-y-1"><Label>Semester</Label><Input type="number" min="1" max="8" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Faculty Name</Label><Input placeholder="Dr. Name" value={form.facultyName} onChange={(e) => setForm({ ...form, facultyName: e.target.value })} /></div>
                <div className="space-y-1"><Label>Hours/Week</Label><Input type="number" min="1" max="8" value={form.hoursPerWeek} onChange={(e) => setForm({ ...form, hoursPerWeek: e.target.value })} /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button className="flex-1 gradient-teal text-white" onClick={handleSave}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-muted-foreground">Code</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">Name</th>
              <th className="text-left p-4 font-semibold text-muted-foreground hidden md:table-cell">Department</th>
              <th className="text-left p-4 font-semibold text-muted-foreground hidden sm:table-cell">Sem</th>
              <th className="text-left p-4 font-semibold text-muted-foreground hidden lg:table-cell">Faculty</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">Credits</th>
              <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-12 text-muted-foreground"><BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No courses found</p></td></tr>
            ) : filtered.map((course, i) => (
              <tr key={course.id} className={`border-b last:border-b-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                <td className="p-4"><span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded font-bold">{course.code}</span></td>
                <td className="p-4 font-medium text-foreground max-w-[200px]">{course.name}</td>
                <td className="p-4 text-muted-foreground hidden md:table-cell">
                  <Badge variant="secondary">{course.department}</Badge>
                </td>
                <td className="p-4 text-muted-foreground hidden sm:table-cell">Sem {course.semester}</td>
                <td className="p-4 text-muted-foreground hidden lg:table-cell">{course.facultyName || "—"}</td>
                <td className="p-4"><span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded font-semibold">{course.credits} cr</span></td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-primary" onClick={() => openEdit(course)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-destructive" onClick={() => handleDelete(course.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
