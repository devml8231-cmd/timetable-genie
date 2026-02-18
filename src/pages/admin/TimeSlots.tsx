import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { TIME_SLOTS } from "@/lib/mockData";
import { TimeSlot } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";

export default function TimeSlots() {
  const [slots, setSlots] = useState<TimeSlot[]>(TIME_SLOTS);
  const [editItem, setEditItem] = useState<TimeSlot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ label: "", startTime: "", endTime: "" });

  const openAdd = () => { setEditItem(null); setForm({ label: "", startTime: "08:00", endTime: "09:00" }); setDialogOpen(true); };
  const openEdit = (s: TimeSlot) => { setEditItem(s); setForm({ label: s.label, startTime: s.startTime, endTime: s.endTime }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.startTime || !form.endTime) { toast({ title: "Error", description: "Fill times.", variant: "destructive" }); return; }
    const label = form.label || `${form.startTime} - ${form.endTime}`;
    if (editItem) {
      setSlots(slots.map((s) => s.id === editItem.id ? { ...s, ...form, label } : s));
      toast({ title: "Slot updated!" });
    } else {
      setSlots([...slots, { id: `ts${Date.now()}`, ...form, label }]);
      toast({ title: "Time slot added!" });
    }
    setDialogOpen(false);
  };

  return (
    <AppLayout requiredRole="admin" title="Time Slots">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Time Slots</h1>
          <p className="text-muted-foreground text-sm">{slots.length} time slots configured</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="gradient-teal text-white shadow-teal"><Plus className="h-4 w-4 mr-2" /> Add Slot</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? "Edit Time Slot" : "Add Time Slot"}</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="space-y-1"><Label>Label (optional)</Label><Input placeholder="e.g. Morning 1" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Start Time *</Label><Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
                <div className="space-y-1"><Label>End Time *</Label><Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button className="flex-1 gradient-teal text-white" onClick={handleSave}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {slots.map((slot, i) => (
          <div key={slot.id} className="bg-card rounded-xl border shadow-card p-5 hover:shadow-elevated transition-all animate-fade-in">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center text-white font-bold text-sm">{i + 1}</div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(slot)}><Pencil className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive" onClick={() => { setSlots(slots.filter((s) => s.id !== slot.id)); toast({ title: "Slot removed" }); }}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">{slot.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{slot.startTime} → {slot.endTime}</p>
            <p className="text-xs text-muted-foreground mt-1">Duration: 60 min</p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
