import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { MOCK_CLASSROOMS } from "@/lib/mockData";
import { Classroom } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TYPE_BADGE = {
  lecture: "bg-primary/10 text-primary",
  lab: "bg-accent/10 text-accent",
  seminar: "bg-warning/10 text-warning",
};

export default function Classrooms() {
  const [rooms, setRooms] = useState<Classroom[]>(MOCK_CLASSROOMS);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<Classroom | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", building: "", capacity: "60", type: "lecture" as Classroom["type"] });

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.building.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditItem(null); setForm({ name: "", building: "", capacity: "60", type: "lecture" }); setDialogOpen(true); };
  const openEdit = (r: Classroom) => { setEditItem(r); setForm({ name: r.name, building: r.building, capacity: String(r.capacity), type: r.type }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.building) { toast({ title: "Error", description: "Fill required fields.", variant: "destructive" }); return; }
    if (editItem) {
      setRooms(rooms.map((r) => r.id === editItem.id ? { ...r, ...form, capacity: +form.capacity } : r));
      toast({ title: "Classroom updated!" });
    } else {
      setRooms([...rooms, { id: `r${Date.now()}`, facilities: [], ...form, capacity: +form.capacity }]);
      toast({ title: "Classroom added!" });
    }
    setDialogOpen(false);
  };

  return (
    <AppLayout requiredRole="admin" title="Classrooms">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Classrooms</h1>
          <p className="text-muted-foreground text-sm">{rooms.length} rooms available</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="gradient-teal text-white shadow-teal"><Plus className="h-4 w-4 mr-2" /> Add Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? "Edit Classroom" : "Add Classroom"}</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Room Name *</Label><Input placeholder="CS-101" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-1"><Label>Building *</Label><Input placeholder="CS Block" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></div>
                <div className="space-y-1"><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Classroom["type"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">Lecture Hall</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                      <SelectItem value="seminar">Seminar Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button className="flex-1 gradient-teal text-white" onClick={handleSave}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((room) => (
          <div key={room.id} className="bg-card rounded-xl border shadow-card p-5 hover:shadow-elevated transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 bg-muted rounded-xl"><Building2 className="h-5 w-5 text-muted-foreground" /></div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(room)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-destructive" onClick={() => { setRooms(rooms.filter((r) => r.id !== room.id)); toast({ title: "Room removed" }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground">{room.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{room.building}</p>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" /> {room.capacity} seats
              </div>
              <span className={cn("text-xs px-2 py-1 rounded-full font-medium capitalize", TYPE_BADGE[room.type])}>{room.type}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {room.facilities.map((f) => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
