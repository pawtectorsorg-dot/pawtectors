import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  PawPrint, Calendar, Syringe, Pill, FileText, IndianRupee,
  Bell, Plus, ChevronRight, AlertTriangle, CheckCircle2,
  Clock, User, Phone, MapPin, Edit, Stethoscope, ArrowRight,
  Dog, Cat, Bird, Heart, Activity, Sparkles, TrendingUp
} from 'lucide-react';
import {
  petsApi, bookingsApi, medicalRecordsApi, vaccinationsApi,
  billsApi, notificationsApi, type PetRow, type BookingRow
} from '@/lib/api';
import { format, differenceInDays, parseISO, isAfter, isBefore, addDays } from 'date-fns';

// ─── Pet type icon helper ────────────────────────────────────────────────────
const PetIcon = ({ type, className = '' }: { type: string; className?: string }) => {
  switch (type?.toLowerCase()) {
    case 'cat': return <Cat className={className} />;
    case 'bird': return <Bird className={className} />;
    default: return <Dog className={className} />;
  }
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    confirmed: 'bg-sky-100 text-sky-700 border-sky-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    rescheduled: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
};

// ─── Add Pet Modal ─────────────────────────────────────────────────────────────
const AddPetModal = ({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'dog', breed: '', age_months: '',
    weight: '', gender: 'unknown', medical_conditions: '', allergies: '',
  });

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: 'Pet name required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      await petsApi.create({
        name: form.name,
        type: form.type,
        breed: form.breed || undefined,
        age_months: form.age_months ? parseInt(form.age_months) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        gender: form.gender as any,
        medical_conditions: form.medical_conditions || undefined,
        allergies: form.allergies || undefined,
      });
      toast({ title: `${form.name} added!`, description: 'Your pet profile has been created.' });
      onSaved();
      onClose();
      setForm({ name: '', type: 'dog', breed: '', age_months: '', weight: '', gender: 'unknown', medical_conditions: '', allergies: '' });
    } catch {
      toast({ title: 'Failed to add pet', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-primary" /> Add New Pet
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Pet Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Buddy" />
            </div>
            <div>
              <Label>Species</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['dog','cat','bird','rabbit','hamster','fish','other'].map(t => (
                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Breed</Label>
              <Input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} placeholder="Labrador" />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Age (months)</Label>
              <Input type="number" value={form.age_months} onChange={e => setForm(f => ({ ...f, age_months: e.target.value }))} placeholder="24" />
            </div>
            <div>
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="12.5" />
            </div>
          </div>
          <div>
            <Label>Allergies</Label>
            <Input value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} placeholder="e.g. Chicken, dust" />
          </div>
          <div>
            <Label>Medical Conditions</Label>
            <Textarea value={form.medical_conditions} onChange={e => setForm(f => ({ ...f, medical_conditions: e.target.value }))} placeholder="Any known conditions..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gradient-hero text-white border-0">
            {saving ? 'Saving...' : 'Add Pet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

const PetParentDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pets, setPets] = useState<PetRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addPetOpen, setAddPetOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, b, m, v, bi, n] = await Promise.allSettled([
        petsApi.getAll(),
        bookingsApi.getAll(),
        medicalRecordsApi.getAll(),
        vaccinationsApi ? (vaccinationsApi as any).getAll?.() : Promise.resolve([]),
        billsApi.getAll(),
        notificationsApi ? (notificationsApi as any).getAll?.() : Promise.resolve([]),
      ]);
      if (p.status === 'fulfilled') setPets(p.value || []);
      if (b.status === 'fulfilled') setBookings(b.value || []);
      if (m.status === 'fulfilled') setMedicalRecords(m.value || []);
      if (v.status === 'fulfilled') setVaccinations(v.value || []);
      if (bi.status === 'fulfilled') setBills(bi.value || []);
      if (n.status === 'fulfilled') setNotifications(n.value || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  // Compute upcoming appointment
  const today = new Date();
  const upcoming = bookings
    .filter(b => b.status !== 'cancelled' && b.status !== 'completed')
    .filter(b => {
      try { return isAfter(parseISO(b.booking_date), addDays(today, -1)); } catch { return false; }
    })
    .sort((a, b) => a.booking_date.localeCompare(b.booking_date))[0];

  // Vaccination reminders (next due in ≤30 days)
  const upcomingVaccinations = vaccinations.filter((v: any) => {
    if (!v.next_due_date) return false;
    try {
      const due = parseISO(v.next_due_date);
      const daysLeft = differenceInDays(due, today);
      return daysLeft >= 0 && daysLeft <= 30;
    } catch { return false; }
  });

  // Outstanding bills
  const unpaidBills = bills.filter((b: any) => b.status === 'unpaid');

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Dashboard — Pawtectors</title>
        <meta name="description" content="Manage your pets, appointments, medical records, and bills from your Pawtectors dashboard." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        {/* ── Hero greeting ── */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-hero opacity-90" />
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='white' fill-opacity='0.06'%3E%3Ccircle cx='40' cy='40' r='30'/%3E%3Ccircle cx='40' cy='40' r='15'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="relative container mx-auto px-4 py-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-white/80 text-sm font-medium">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}</p>
                <h1 className="text-3xl font-bold text-white">
                  {profile?.full_name?.split(' ')[0] || 'Pet Parent'} 👋
                </h1>
                <p className="text-white/70 mt-1">
                  {pets.length} {pets.length === 1 ? 'pet' : 'pets'} registered
                  {upcoming ? ` • Next appointment: ${format(parseISO(upcoming.booking_date), 'MMM d')}` : ''}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/book')}
                  className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                >
                  <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                </Button>
                <Button
                  onClick={() => setAddPetOpen(true)}
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Pet
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 space-y-8">

          {/* ── Alert strip ── */}
          {(upcomingVaccinations.length > 0 || unpaidBills.length > 0) && (
            <div className="grid gap-3 md:grid-cols-2">
              {upcomingVaccinations.length > 0 && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Syringe className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-amber-800 text-sm">Vaccination Due Soon</p>
                    <p className="text-amber-700 text-xs truncate">
                      {upcomingVaccinations.length} vaccine{upcomingVaccinations.length > 1 ? 's' : ''} due in the next 30 days
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-500 ml-auto flex-shrink-0" />
                </div>
              )}
              {unpaidBills.length > 0 && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <IndianRupee className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-red-800 text-sm">Outstanding Bills</p>
                    <p className="text-red-700 text-xs">
                      {unpaidBills.length} unpaid bill{unpaidBills.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-500 ml-auto flex-shrink-0" />
                </div>
              )}
            </div>
          )}

          {/* ── Quick stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'My Pets', value: pets.length, icon: PawPrint, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Appointments', value: bookings.length, icon: Calendar, color: 'text-secondary', bg: 'bg-secondary/10' },
              { label: 'Medical Records', value: medicalRecords.length, icon: FileText, color: 'text-accent', bg: 'bg-accent/10' },
              { label: 'Vaccinations', value: vaccinations.length, icon: Syringe, color: 'text-sky-600', bg: 'bg-sky-50' },
            ].map(stat => (
              <Card key={stat.label} className="shadow-card hover:shadow-soft transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Upcoming appointment card ── */}
          {upcoming && (
            <Card className="shadow-card border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Upcoming Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{upcoming.service_name || 'Consultation'}</p>
                    <p className="text-sm text-muted-foreground">
                      for <span className="font-medium text-foreground">{upcoming.pet_name}</span>
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(parseISO(upcoming.booking_date), 'EEEE, MMMM d')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {upcoming.booking_time}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={upcoming.status} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Main tabs ── */}
          <Tabs defaultValue="pets">
            <TabsList className="w-full overflow-x-auto flex-nowrap justify-start gap-1 h-auto p-1 bg-muted rounded-xl">
              {[
                { value: 'pets', label: 'My Pets', icon: PawPrint },
                { value: 'appointments', label: 'Appointments', icon: Calendar },
                { value: 'medical', label: 'Medical Records', icon: FileText },
                { value: 'vaccinations', label: 'Vaccinations', icon: Syringe },
                { value: 'bills', label: 'Bills', icon: IndianRupee },
              ].map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5 text-xs sm:text-sm flex-shrink-0">
                  <tab.icon className="w-3.5 h-3.5" />{tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── PETS TAB ── */}
            <TabsContent value="pets" className="mt-6">
              {pets.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <PawPrint className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">No pets yet</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">Add your first pet to start managing their health records and appointments.</p>
                  <Button onClick={() => setAddPetOpen(true)} className="gradient-hero text-white border-0">
                    <Plus className="w-4 h-4 mr-2" /> Add My First Pet
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pets.map(pet => (
                    <Card key={pet.id} className="shadow-card hover:shadow-soft transition-all hover:-translate-y-0.5 cursor-pointer group"
                      onClick={() => navigate(`/profile?tab=pets`)}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          {pet.image_url ? (
                            <img src={pet.image_url} alt={pet.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                              <PetIcon type={pet.type} className="w-8 h-8 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-foreground">{pet.name}</h3>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">{pet.type}{pet.breed ? ` • ${pet.breed}` : ''}</p>
                            {pet.age_months && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {pet.age_months >= 12
                                  ? `${Math.floor(pet.age_months / 12)} yr${Math.floor(pet.age_months / 12) > 1 ? 's' : ''}`
                                  : `${pet.age_months} mo`} old
                              </p>
                            )}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {pet.medical_conditions && (
                                <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-2 py-0.5">
                                  Medical note
                                </span>
                              )}
                              {pet.allergies && (
                                <span className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5">
                                  Allergies
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Card className="shadow-card border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setAddPetOpen(true)}>
                    <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[120px] text-muted-foreground gap-2 hover:text-primary transition-colors">
                      <Plus className="w-8 h-8" />
                      <span className="text-sm font-medium">Add another pet</span>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* ── APPOINTMENTS TAB ── */}
            <TabsContent value="appointments" className="mt-6">
              {bookings.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-10 h-10 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-lg">No appointments yet</h3>
                  <p className="text-muted-foreground text-sm">Book your first appointment for your pet.</p>
                  <Button onClick={() => navigate('/book')} className="gradient-hero text-white border-0">
                    <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <Card key={b.id} className="shadow-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{b.service_name || 'Consultation'}</p>
                              <StatusBadge status={b.status} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {b.pet_name} • {format(parseISO(b.booking_date), 'MMM d, yyyy')} at {b.booking_time}
                            </p>
                            {b.notes && <p className="text-xs text-muted-foreground mt-1 italic">{b.notes}</p>}
                          </div>
                          {b.amount && (
                            <span className="text-sm font-semibold text-primary">₹{b.amount}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── MEDICAL RECORDS TAB ── */}
            <TabsContent value="medical" className="mt-6">
              {medicalRecords.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg">No medical records yet</h3>
                  <p className="text-muted-foreground text-sm">Records will appear here after clinic visits.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pet filter */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button
                      size="sm"
                      variant={!selectedPet ? 'default' : 'outline'}
                      onClick={() => setSelectedPet(null)}
                      className="flex-shrink-0 text-xs"
                    >All Pets</Button>
                    {pets.map(p => (
                      <Button
                        key={p.id}
                        size="sm"
                        variant={selectedPet === p.id ? 'default' : 'outline'}
                        onClick={() => setSelectedPet(p.id)}
                        className="flex-shrink-0 text-xs"
                      >
                        <PetIcon type={p.type} className="w-3 h-3 mr-1" />{p.name}
                      </Button>
                    ))}
                  </div>

                  {medicalRecords
                    .filter((r: any) => !selectedPet || r.pet_id === selectedPet)
                    .map((record: any) => {
                      const petName = pets.find(p => p.id === record.pet_id)?.name || 'Unknown pet';
                      return (
                        <Card key={record.id} className="shadow-card">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-foreground">
                                    {record.diagnosis || 'General Consultation'}
                                  </span>
                                  <Badge variant="outline" className="text-xs">{petName}</Badge>
                                </div>
                                {record.consultation_date && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(parseISO(record.consultation_date), 'MMM d, yyyy')}
                                    {record.doctor_name && ` • Dr. ${record.doctor_name}`}
                                  </p>
                                )}
                                {record.treatment && (
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Treatment:</span> {record.treatment}
                                  </p>
                                )}
                                {record.prescriptions?.length > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Pill className="w-3 h-3 text-primary" />
                                    <span className="text-xs text-primary font-medium">
                                      {record.prescriptions.length} prescription{record.prescriptions.length > 1 ? 's' : ''}
                                    </span>
                                  </div>
                                )}
                                {record.follow_up_date && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3 text-amber-500" />
                                    <span className="text-xs text-amber-600 font-medium">
                                      Follow-up: {format(parseISO(record.follow_up_date), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <Stethoscope className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </TabsContent>

            {/* ── VACCINATIONS TAB ── */}
            <TabsContent value="vaccinations" className="mt-6">
              {vaccinations.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto">
                    <Syringe className="w-10 h-10 text-sky-500" />
                  </div>
                  <h3 className="font-semibold text-lg">No vaccination records</h3>
                  <p className="text-muted-foreground text-sm">Vaccination records added by the clinic will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vaccinations.map((v: any) => {
                    const petName = pets.find(p => p.id === v.pet_id)?.name || 'Unknown';
                    const daysUntilDue = v.next_due_date
                      ? differenceInDays(parseISO(v.next_due_date), today)
                      : null;
                    const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 30;
                    const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

                    return (
                      <Card key={v.id} className={`shadow-card ${isDueSoon ? 'border-amber-200' : isOverdue ? 'border-red-200' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{v.vaccine_name}</p>
                                <Badge variant="outline" className="text-xs">{petName}</Badge>
                                {isDueSoon && <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium">Due in {daysUntilDue}d</span>}
                                {isOverdue && <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5 font-medium">Overdue</span>}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Given: {v.date_given ? format(parseISO(v.date_given), 'MMM d, yyyy') : '—'}
                                {v.next_due_date ? ` • Next: ${format(parseISO(v.next_due_date), 'MMM d, yyyy')}` : ''}
                              </p>
                              {v.notes && <p className="text-xs text-muted-foreground italic">{v.notes}</p>}
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-red-100' : isDueSoon ? 'bg-amber-100' : 'bg-sky-100'}`}>
                              {isOverdue || isDueSoon
                                ? <AlertTriangle className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-amber-500'}`} />
                                : <CheckCircle2 className="w-4 h-4 text-sky-500" />
                              }
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── BILLS TAB ── */}
            <TabsContent value="bills" className="mt-6">
              {bills.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <IndianRupee className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">No bills yet</h3>
                  <p className="text-muted-foreground text-sm">Bills from your clinic visits will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bills.map((bill: any) => {
                    const petName = pets.find(p => p.id === bill.pet_id)?.name;
                    return (
                      <Card key={bill.id} className={`shadow-card ${bill.status === 'unpaid' ? 'border-red-200' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold">₹{parseFloat(bill.total_amount).toLocaleString('en-IN')}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${
                                  bill.status === 'paid' ? 'bg-sky-100 text-sky-700 border-sky-200' :
                                  bill.status === 'unpaid' ? 'bg-red-100 text-red-700 border-red-200' :
                                  'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>{bill.status}</span>
                                {petName && <Badge variant="outline" className="text-xs">{petName}</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {bill.bill_date ? format(parseISO(bill.bill_date), 'MMM d, yyyy') : ''}
                              </p>
                            </div>
                            {bill.status === 'unpaid' && (
                              <Button size="sm" className="gradient-hero text-white border-0 flex-shrink-0">
                                Pay Now
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>

      <AddPetModal open={addPetOpen} onClose={() => setAddPetOpen(false)} onSaved={loadData} />
    </>
  );
};

export default PetParentDashboard;
