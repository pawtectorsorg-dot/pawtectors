import { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import pawtectorsLogo from '@/assets/pawtectors-logo.png';
import { useProviderAuth } from '@/hooks/useProviderAuth';
import { bookingsApi, medicalRecordsApi, billsApi, clinicPetParentsApi } from '@/lib/api';
import { 
  Stethoscope, Calendar, FileText, IndianRupee, 
  Users, TrendingUp, Bell, Plus, Search, Filter, CheckCircle2, 
  XCircle, Clock, AlertTriangle, Send, ShieldAlert, Sparkles, 
  Printer, Share2, ClipboardList, Trash2, ArrowLeft, RefreshCw,
  PlusCircle, User, Mail, Award, ArrowRight, Lock, EyeOff, Eye, 
  AlertCircle, Receipt, Check, PhoneCall, MessageSquare, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// --- MOCK INITIAL DATA ---
const initialAppointments = [
  { id: '1', petName: 'Bruno', breed: 'Labrador', age: '3 years', ownerName: 'Rajesh Kumar', phone: '9876543210', doctor: 'Dr. Ramesh Sharma', time: '09:00 AM', date: '2026-08-18', status: 'Completed', service: 'Vaccination', whatsappStatus: 'Sent' },
  { id: '2', petName: 'Whiskers', breed: 'Persian Cat', age: '1.5 years', ownerName: 'Priya Patel', phone: '8765432109', doctor: 'Dr. Meera Nair', time: '10:30 AM', date: '2026-08-18', status: 'Confirmed', service: 'Consultation', whatsappStatus: 'Delivered' },
  { id: '3', petName: 'Max', breed: 'Golden Retriever', age: '2 years', ownerName: 'Amit Sharma', phone: '7654321098', doctor: 'Dr. Ramesh Sharma', time: '11:00 AM', date: '2026-08-18', status: 'Confirmed', service: 'Deworming', whatsappStatus: 'Delivered' },
  { id: '4', petName: 'Coco', breed: 'Shih Tzu', age: '4 years', ownerName: 'Neha Gupta', phone: '9543210987', doctor: 'Dr. Meera Nair', time: '03:00 PM', date: '2026-08-18', status: 'Pending', service: 'Grooming', whatsappStatus: 'Pending' },
  { id: '5', petName: 'Sheru', breed: 'Indie Dog', age: '5 years', ownerName: 'Vikram Singh', phone: '8123456789', doctor: 'Dr. Ramesh Sharma', time: '04:30 PM', date: '2026-08-19', status: 'Confirmed', service: 'Surgery Follow-up', whatsappStatus: 'Sent' }
];

const initialClients = [
  { 
    id: 'c1', 
    name: 'Rajesh Kumar', 
    email: 'rajesh@gmail.com', 
    phone: '9876543210', 
    address: 'Indiranagar, Bengaluru', 
    pets: [{ name: 'Bruno', type: 'Dog', breed: 'Labrador', age: '3 years' }],
    records: [
      { id: 'rec-1', date: '2026-08-10', doctor: 'Dr. Ramesh Sharma', symptoms: 'Mild fever, lethargy', diagnosis: 'Canine Parvovirus (Initial Stage) - treated & vaccinated', prescription: 'Megavac DHPPi Booster, Amoxycillin 250mg OD for 5 days', nextFollowUp: '2026-08-25' }
    ]
  },
  { 
    id: 'c2', 
    name: 'Priya Patel', 
    email: 'priya@gmail.com', 
    phone: '8765432109', 
    address: 'Jayanagar, Bengaluru', 
    pets: [{ name: 'Whiskers', type: 'Cat', breed: 'Persian Cat', age: '1.5 years' }],
    records: [
      { id: 'rec-2', date: '2026-08-14', doctor: 'Dr. Meera Nair', symptoms: 'Ear scratching, mild discharge', diagnosis: 'Otitis externa (Ear mite infestation)', prescription: 'Otomax Ear Drops 3 drops BD, Cleaning with Epi-Otic', nextFollowUp: '2026-08-28' }
    ]
  },
  { 
    id: 'c3', 
    name: 'Amit Sharma', 
    email: 'amit@gmail.com', 
    phone: '7654321098', 
    address: 'Koramangala, Bengaluru', 
    pets: [{ name: 'Max', type: 'Dog', breed: 'Golden Retriever', age: '2 years' }],
    records: [
      { id: 'rec-3', date: '2026-08-16', doctor: 'Dr. Ramesh Sharma', symptoms: 'Routine health check & deworming', diagnosis: 'Healthy adult canine. Normal vitals.', prescription: 'Bravecto chewable 1 tab, Drontal Plus 2 tabs', nextFollowUp: '2026-11-16' }
    ]
  },
  { 
    id: 'c4', 
    name: 'Neha Gupta', 
    email: 'neha@gmail.com', 
    phone: '9543210987', 
    address: 'HSR Layout, Bengaluru', 
    pets: [{ name: 'Coco', type: 'Dog', breed: 'Shih Tzu', age: '4 years' }],
    records: [
      { id: 'rec-4', date: '2026-08-01', doctor: 'Dr. Meera Nair', symptoms: 'Skin itchiness, redness', diagnosis: 'Atopic dermatitis', prescription: 'Apoquel 5.4mg OD for 14 days, Medicated bath twice weekly', nextFollowUp: '2026-08-20' }
    ]
  },
  { 
    id: 'c5', 
    name: 'Vikram Singh', 
    email: 'vikram@gmail.com', 
    phone: '8123456789', 
    address: 'Whitefield, Bengaluru', 
    pets: [{ name: 'Sheru', type: 'Dog', breed: 'Indie Dog', age: '5 years' }],
    records: [
      { id: 'rec-5', date: '2026-07-28', doctor: 'Dr. Ramesh Sharma', symptoms: 'Post-neutering stitch removal', diagnosis: 'Wound healed completely, normal gait', prescription: 'Multivitamin syrup 5ml OD', nextFollowUp: '2026-10-28' }
    ]
  }
];

const initialReminders = [
  {
    id: 'rem-1',
    type: 'appointment',
    petName: 'Whiskers',
    ownerName: 'Priya Patel',
    phone: '8765432109',
    dueDate: '2026-08-18 (Today, 10:30 AM)',
    title: 'Consultation Appointment Slot',
    notes: 'Reminder for ear check-up follow-up with Dr. Meera Nair.',
    status: 'Sent',
    channel: 'WhatsApp'
  },
  {
    id: 'rem-2',
    type: 'vaccination',
    petName: 'Bruno',
    ownerName: 'Rajesh Kumar',
    phone: '9876543210',
    dueDate: '2026-08-25 (In 7 Days)',
    title: 'Annual Rabies & DHPPi Booster',
    notes: 'Annual core vaccination booster due. Please bring vaccination card.',
    status: 'Pending',
    channel: 'WhatsApp & SMS'
  },
  {
    id: 'rem-3',
    type: 'followup',
    petName: 'Coco',
    ownerName: 'Neha Gupta',
    phone: '9543210987',
    dueDate: '2026-08-20 (In 2 Days)',
    title: 'Dermatitis Post-Medication Review',
    notes: 'Evaluate skin redness improvement after 14-day Apoquel course.',
    status: 'Pending',
    channel: 'WhatsApp'
  },
  {
    id: 'rem-4',
    type: 'vaccination',
    petName: 'Max',
    ownerName: 'Amit Sharma',
    phone: '7654321098',
    dueDate: '2026-08-12 (Overdue by 6 Days)',
    title: 'Deworming & Kennel Cough Dose',
    notes: 'Overdue schedule for Nobivac KC and quarterly deworming.',
    status: 'Overdue',
    channel: 'SMS'
  },
  {
    id: 'rem-5',
    type: 'appointment',
    petName: 'Sheru',
    ownerName: 'Vikram Singh',
    phone: '8123456789',
    dueDate: '2026-08-19 (Tomorrow, 04:30 PM)',
    title: 'Surgery Follow-up Consultation',
    notes: 'Check wound site and general mobility post-surgery.',
    status: 'Sent',
    channel: 'WhatsApp'
  }
];

const initialInvoices = [
  { 
    id: 'INV-2026-001', 
    clientName: 'Rajesh Kumar', 
    date: '2026-08-18', 
    subtotal: 1250, 
    cgst: 112.5, 
    sgst: 112.5, 
    total: 1475, 
    items: [
      { name: 'DHPPi Vaccine Booster', price: 450, qty: 1 }, 
      { name: 'General Consultation Fee', price: 500, qty: 1 }, 
      { name: 'Ear Cleaning & Antiseptic Wash', price: 300, qty: 1 }
    ], 
    status: 'Paid', 
    mode: 'UPI' 
  },
  { 
    id: 'INV-2026-002', 
    clientName: 'Priya Patel', 
    date: '2026-08-18', 
    subtotal: 500, 
    cgst: 45, 
    sgst: 45, 
    total: 590, 
    items: [
      { name: 'Specialist Consultation Fee', price: 500, qty: 1 }
    ], 
    status: 'Paid', 
    mode: 'Cash' 
  },
  { 
    id: 'INV-2026-003', 
    clientName: 'Amit Sharma', 
    date: '2026-08-16', 
    subtotal: 2100, 
    cgst: 189, 
    sgst: 189, 
    total: 2478, 
    items: [
      { name: 'Comprehensive Health Checkup', price: 600, qty: 1 },
      { name: 'Bravecto Chewable (Dogs 10-20kg)', price: 1500, qty: 1 }
    ], 
    status: 'Paid', 
    mode: 'Card' 
  }
];

const chartData = [
  { name: 'Mar', revenue: 95000, expenses: 42000 },
  { name: 'Apr', revenue: 112000, expenses: 45000 },
  { name: 'May', revenue: 125000, expenses: 48000 },
  { name: 'Jun', revenue: 148000, expenses: 54000 },
  { name: 'Jul', revenue: 165000, expenses: 56000 },
  { name: 'Aug', revenue: 180000, expenses: 62000 }
];

const certificateTemplates = [
  { type: 'anti_rabies', name: 'Anti-Rabies Vaccination Certificate', desc: 'Validates rabies vaccination details, required for apartment and city licensing.' },
  { type: 'fit_to_fly', name: 'Fit to Fly (Travel Health Certificate)', desc: 'Required by airlines for domestic and international pet air travel.' },
  { type: 'general_fitness', name: 'General Health & Fitness Certificate', desc: 'Certifies current wellness, deworming, and immunization record.' },
  { type: 'spay_neuter', name: 'Spaying / Neutering Certificate', desc: 'Verifies successful sterilization surgery, useful for shelter records or NGO compliance.' }
];

const ClinicAdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, provider, isLoading: authLoading, signInWithEmail, signOut } = useProviderAuth();

  // --- LOGIN FORM STATE ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [loginLoading, setLoginLoading] = useState(false);

  // --- ACTIVE TAB (6 MODULES) ---
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'reminders' | 'scheduler' | 'billing' | 'gst-billing'>('overview');

  // --- CORE DATA STATES ---
  const [appointments, setAppointments] = useState<any[]>(initialAppointments);
  const [clients, setClients] = useState<any[]>(initialClients);
  const [reminders, setReminders] = useState<any[]>(initialReminders);
  const [invoices, setInvoices] = useState<any[]>(initialInvoices);

  // --- SEARCH & FILTER STATES ---
  const [appSearch, setAppSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [billingSearch, setBillingSearch] = useState('');
  const [reminderFilter, setReminderFilter] = useState('all');

  // --- MODAL STATES ---
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [newApp, setNewApp] = useState({ 
    petName: '', 
    breed: '', 
    age: '', 
    ownerName: '', 
    phone: '', 
    doctor: 'Dr. Ramesh Sharma', 
    time: '10:00 AM', 
    date: new Date().toISOString().split('T')[0], 
    service: 'Consultation' 
  });

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    petName: '', 
    petType: 'Dog', 
    petBreed: '', 
    petAge: '' 
  });

  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [consultation, setConsultation] = useState({ 
    clientIndex: '0', 
    symptoms: '', 
    diagnosis: '', 
    prescription: '', 
    nextFollowUp: '' 
  });

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: 'appointment',
    petName: '',
    ownerName: '',
    phone: '',
    dueDate: '',
    title: '',
    notes: '',
    channel: 'WhatsApp'
  });

  const [certType, setCertType] = useState('anti_rabies');
  const [certForm, setCertForm] = useState({ 
    petParent: 'Rajesh Kumar', 
    petName: 'Bruno', 
    breed: 'Labrador', 
    age: '3 years', 
    dateOfVaccination: new Date().toISOString().split('T')[0], 
    vaccineBrand: 'Megavac Rabies', 
    lotNo: 'R-7721A', 
    signDr: 'Dr. Ramesh Sharma' 
  });
  const [certPreviewHtml, setCertPreviewHtml] = useState<string | null>(null);

  // --- GST INVOICE BUILDER STATE ---
  const [billClient, setBillClient] = useState('Rajesh Kumar');
  const [billItems, setBillItems] = useState<{ name: string; price: number; qty: number }[]>([
    { name: 'Consultation Fee', price: 500, qty: 1 },
    { name: 'Vaccination Charge', price: 450, qty: 1 }
  ]);
  const [previewInvoiceData, setPreviewInvoiceData] = useState<any>(null);
  const [isBillPreviewOpen, setIsBillPreviewOpen] = useState(false);

  // --- DATA SYNC ---
  const fetchData = async () => {
    if (!provider?.id) return;
    try {
      const bookingsData = await bookingsApi.getAll({ provider_id: provider.id });
      if (bookingsData && bookingsData.length > 0) {
        const mapped = bookingsData.map((b: any) => ({
          id: b.id,
          petName: b.pet_name,
          breed: b.pet_type === 'dog' ? 'Dog' : 'Cat',
          age: '3 years',
          ownerName: b.owner_name,
          phone: b.owner_phone,
          doctor: 'Dr. Ramesh Sharma',
          time: b.booking_time,
          date: b.booking_date,
          status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
          service: b.service_name || 'Consultation',
          whatsappStatus: 'Delivered'
        }));
        setAppointments(mapped);
      }

      const realClients = await clinicPetParentsApi.getAll(provider.id);
      if (realClients && realClients.length > 0) {
        const mappedClients = realClients.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email || 'N/A',
          phone: c.phone,
          address: c.address || 'Local Clinic Resident',
          pets: c.pets && c.pets.length > 0 ? c.pets : [{ name: 'Pet', type: 'Dog', breed: 'Indie', age: '2 years' }],
          records: [
            { id: 'rec-sync', date: new Date().toISOString().split('T')[0], doctor: 'Dr. Ramesh Sharma', symptoms: 'Routine checkup', diagnosis: 'Normal vitals', prescription: 'General wellness check', nextFollowUp: 'N/A' }
          ]
        }));
        setClients(mappedClients);
      }

      const realBills = await billsApi.getAll({ provider_id: provider.id });
      if (realBills && realBills.length > 0) {
        const mappedBills = realBills.map((b: any) => ({
          id: `INV-${b.id.slice(0, 8).toUpperCase()}`,
          clientName: b.pet_parent_name || 'Registered Parent',
          date: b.bill_date ? b.bill_date.split('T')[0] : '2026-08-18',
          subtotal: (b.consultation_charges || 0) + (b.treatment_charges || 0) + (b.medicine_charges || 0),
          cgst: (b.tax_amount || 0) / 2,
          sgst: (b.tax_amount || 0) / 2,
          total: b.total_amount || 0,
          items: [
            { name: 'Consultation Fee', price: b.consultation_charges || 0, qty: 1 },
            { name: 'Treatment & Care', price: b.treatment_charges || 0, qty: 1 },
            { name: 'Prescribed Medicines', price: b.medicine_charges || 0, qty: 1 }
          ].filter(i => i.price > 0),
          status: b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : 'Paid',
          mode: 'UPI'
        }));
        setInvoices(mappedBills);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    if (provider?.id) {
      fetchData();
    }
  }, [provider]);

  // --- ACTIONS ---
  const handleDashboardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginErrors({});
    const res = await signInWithEmail(loginEmail, loginPassword);
    if (!res.success) {
      setLoginErrors({ submit: res.error || 'Login failed. Please check your credentials.' });
    }
    setLoginLoading(false);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApp.petName || !newApp.ownerName || !newApp.phone) {
      toast({ title: 'Validation Error', description: 'Please fill all required appointment fields.', variant: 'destructive' });
      return;
    }

    const created = {
      id: String(Date.now()),
      ...newApp,
      status: 'Confirmed',
      whatsappStatus: 'Delivered'
    };

    setAppointments([created, ...appointments]);
    setIsAppModalOpen(false);
    toast({ title: 'Slot Booked Successfully', description: `Appointment scheduled for ${newApp.petName} with ${newApp.doctor}. Confirmation sent via WhatsApp.` });
  };

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.phone || !newClient.petName) {
      toast({ title: 'Validation Error', description: 'Please enter client name, phone number, and pet name.', variant: 'destructive' });
      return;
    }

    const clientObj = {
      id: `c-${Date.now()}`,
      name: newClient.name,
      email: newClient.email || 'N/A',
      phone: newClient.phone,
      address: newClient.address || 'Bengaluru',
      pets: [{ name: newClient.petName, type: newClient.petType, breed: newClient.petBreed || 'Mixed', age: newClient.petAge || '1 year' }],
      records: []
    };

    setClients([clientObj, ...clients]);
    setIsClientModalOpen(false);
    toast({ title: 'Patient Registered', description: `${newClient.petName} and parent ${newClient.name} added to records.` });
  };

  const handleLogConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    const cIdx = parseInt(consultation.clientIndex, 10);
    const targetClient = clients[cIdx];
    if (!targetClient) return;

    const newRecord = {
      id: `rec-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      doctor: 'Dr. Ramesh Sharma',
      symptoms: consultation.symptoms,
      diagnosis: consultation.diagnosis,
      prescription: consultation.prescription,
      nextFollowUp: consultation.nextFollowUp || 'None'
    };

    const updated = [...clients];
    updated[cIdx].records = [newRecord, ...(updated[cIdx].records || [])];
    setClients(updated);

    if (consultation.nextFollowUp) {
      setReminders([
        {
          id: `rem-${Date.now()}`,
          type: 'followup',
          petName: targetClient.pets[0].name,
          ownerName: targetClient.name,
          phone: targetClient.phone,
          dueDate: consultation.nextFollowUp,
          title: `Follow-up: ${consultation.diagnosis}`,
          notes: consultation.prescription,
          status: 'Pending',
          channel: 'WhatsApp'
        },
        ...reminders
      ]);
    }

    setIsConsultationModalOpen(false);
    toast({ title: 'Medical Record Saved', description: `Consultation logged for ${targetClient.pets[0].name}. Follow-up reminder queued.` });
  };

  const handleSendReminder = (remId: string) => {
    setReminders(prev => prev.map(r => r.id === remId ? { ...r, status: 'Sent' } : r));
    toast({
      title: 'Reminder Dispatched',
      description: 'Instant notification dispatched to pet parent via WhatsApp/SMS gateway.'
    });
  };

  const handleSendAllPending = () => {
    setReminders(prev => prev.map(r => ({ ...r, status: 'Sent' })));
    toast({
      title: 'All Reminders Sent',
      description: 'Dispatched automated reminders for all queued patients successfully.'
    });
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.petName || !newReminder.dueDate || !newReminder.title) {
      toast({ title: 'Required Fields', description: 'Please provide pet name, due date, and reminder title.', variant: 'destructive' });
      return;
    }

    const created = {
      id: `rem-${Date.now()}`,
      ...newReminder,
      status: 'Pending'
    };

    setReminders([created, ...reminders]);
    setIsReminderModalOpen(false);
    toast({ title: 'Reminder Queued', description: `Notification scheduled for ${newReminder.dueDate}.` });
  };

  const handleAddBillItem = () => {
    setBillItems([...billItems, { name: '', price: 0, qty: 1 }]);
  };

  const handleUpdateBillItem = (index: number, field: string, value: any) => {
    const updated = [...billItems];
    (updated[index] as any)[field] = value;
    setBillItems(updated);
  };

  const handleRemoveBillItem = (index: number) => {
    if (billItems.length === 1) return;
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  const handleCompileGSTInvoice = () => {
    const subtotal = billItems.reduce((acc, item) => acc + ((item.price || 0) * (item.qty || 1)), 0);
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    const total = subtotal + cgst + sgst;

    const newInv = {
      id: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      clientName: billClient,
      date: new Date().toISOString().split('T')[0],
      items: billItems,
      subtotal,
      cgst,
      sgst,
      total,
      status: 'Paid',
      mode: 'UPI'
    };

    setPreviewInvoiceData(newInv);
    setIsBillPreviewOpen(true);
  };

  const handleSaveInvoice = async () => {
    if (!previewInvoiceData) return;
    setInvoices([previewInvoiceData, ...invoices]);
    toast({ title: 'GST Invoice Generated', description: `Invoice ${previewInvoiceData.id} recorded with 18% GST (CGST 9% + SGST 9%).` });
    setIsBillPreviewOpen(false);
    setBillItems([{ name: 'Consultation Fee', price: 500, qty: 1 }]);
  };

  const handlePrintInvoice = (inv: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const itemsHtml = inv.items.map((item: any, i: number) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e0;">${i+1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e0;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e0; text-align: right;">₹${item.price}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e0; text-align: center;">${item.qty}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e0; text-align: right; font-weight: bold;">₹${item.price * item.qty}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>Tax Invoice - ${inv.id}</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
              table { width: 100%; border-collapse: collapse; margin-top: 25px; }
              th { background-color: #0f172a; color: white; padding: 12px; text-align: left; font-size: 13px; }
              td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
              .header { border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
              .totals { margin-top: 25px; float: right; width: 300px; }
              .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
              .grand-total { border-top: 2px solid #0f172a; font-weight: bold; font-size: 16px; margin-top: 8px; padding-top: 8px; color: #0284c7; }
              .no-print { text-align: center; margin-bottom: 25px; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="no-print">
              <button onclick="window.print()" style="padding: 10px 24px; font-size: 14px; font-weight: bold; background: #0284c7; color: white; border: none; border-radius: 8px; cursor: pointer;">Print Tax Invoice</button>
            </div>
            <div class="header">
              <div>
                <h1 style="color: #0f172a; margin: 0 0 6px 0; font-size: 24px;">Pawtectors Veterinary Hospital</h1>
                <p style="margin: 0; font-size: 12px; color: #64748b;">Specialist Pet Healthcare & Surgery Center</p>
                <p style="margin: 0; font-size: 12px; color: #64748b;">GSTIN: 29AAVCP4829K1Z0 | care@pawtectors.com | +91 98765 43210</p>
              </div>
              <div style="text-align: right;">
                <h2 style="color: #0284c7; margin: 0 0 6px 0; font-size: 20px;">TAX INVOICE</h2>
                <p style="margin: 0; font-weight: bold; font-size: 13px;">Invoice: ${inv.id}</p>
                <p style="margin: 0; font-size: 12px; color: #64748b;">Date: ${inv.date}</p>
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; color: #0f172a;">Billed To:</h3>
              <p style="margin: 0; font-weight: 600; font-size: 14px;">${inv.clientName}</p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Registered Pet Parent</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 5%;">#</th>
                  <th style="width: 50%;">Item / Procedure Description</th>
                  <th style="width: 15%; text-align: right;">Unit Price</th>
                  <th style="width: 10%; text-align: center;">Qty</th>
                  <th style="width: 20%; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row"><span>Taxable Value:</span><span>₹${inv.subtotal.toFixed(2)}</span></div>
              <div class="total-row"><span>CGST (9.0%):</span><span>₹${inv.cgst.toFixed(2)}</span></div>
              <div class="total-row"><span>SGST (9.0%):</span><span>₹${inv.sgst.toFixed(2)}</span></div>
              <div class="total-row grand-total"><span>Grand Total:</span><span>₹${inv.total.toFixed(2)}</span></div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleGenerateCertificate = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Health Certificate - ${certForm.petName}</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #0f172a; }
              .cert-box { border: 8px double #0284c7; padding: 40px; border-radius: 12px; }
              .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; }
              h1 { color: #0f172a; margin: 0; font-size: 28px; }
              h2 { color: #0284c7; margin: 10px 0 0 0; font-size: 18px; text-transform: uppercase; }
              .content { font-size: 15px; line-height: 2; margin: 30px 0; }
              .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
              .no-print { text-align: center; margin-bottom: 20px; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="no-print">
              <button onclick="window.print()" style="padding: 10px 24px; font-size: 14px; font-weight: bold; background: #0284c7; color: white; border: none; border-radius: 8px; cursor: pointer;">Print Certificate</button>
            </div>
            <div class="cert-box">
              <div class="header">
                <h1>Pawtectors Veterinary Hospital</h1>
                <h2>Official Pet Health & Vaccination Certificate</h2>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Registration No: VET-KA-2026-89104 | Jayanagar, Bengaluru</p>
              </div>
              <div class="content">
                <p>This is to certify that the pet animal named <strong>${certForm.petName}</strong>, a <strong>${certForm.breed}</strong> aged <strong>${certForm.age}</strong>, belonging to <strong>${certForm.petParent}</strong>, has been clinically examined and administered the following care:</p>
                <p><strong>Vaccine / Procedure:</strong> ${certForm.vaccineBrand} (Lot No: ${certForm.lotNo})<br/>
                <strong>Date of Administration:</strong> ${certForm.dateOfVaccination}<br/>
                <strong>Clinical Status:</strong> Declared fit, healthy and active with no signs of contagious infectious disease.</p>
              </div>
              <div class="signatures">
                <div>
                  <p><strong>Hospital Seal</strong></p>
                  <div style="width: 100px; height: 100px; border: 2px dashed #94a3b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #64748b;">Official Seal</div>
                </div>
                <div style="text-align: right;">
                  <p><strong>Authorized Veterinarian</strong></p>
                  <p style="margin-top: 50px; border-top: 1px solid #0f172a; padding-top: 5px;">${certForm.signDr}<br/><span style="font-size: 12px; color: #64748b;">BVSc & AH, MVSc</span></p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // --- DERIVED METRICS ---
  const todayAppCount = appointments.filter(a => a.date === '2026-08-18').length;
  const pendingAppCount = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending').length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const pendingRemindersCount = reminders.filter(r => r.status === 'Pending' || r.status === 'Overdue').length;

  const filteredReminders = reminders.filter(r => {
    if (reminderFilter === 'all') return true;
    return r.type === reminderFilter;
  });

  const filteredAppointments = appointments.filter(a => 
    a.petName.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.ownerName.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.doctor.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.service.toLowerCase().includes(appSearch.toLowerCase())
  );

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.phone.includes(clientSearch) ||
    c.pets.some((p: any) => p.name.toLowerCase().includes(clientSearch.toLowerCase()))
  );

  const filteredInvoices = invoices.filter(inv =>
    inv.id.toLowerCase().includes(billingSearch.toLowerCase()) ||
    inv.clientName.toLowerCase().includes(billingSearch.toLowerCase())
  );

  // --- AUTH CHECK ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b1329] flex items-center justify-center text-stone-300">
        <div className="flex items-center gap-3 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
          <span>Loading Hospital OS Session...</span>
        </div>
      </div>
    );
  }

  // --- UN-AUTHENTICATED: HOSPITAL LOGIN FORM ---
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b1329] flex items-center justify-center p-4 md:p-8 font-sans text-stone-100">
        <div className="absolute top-10 left-10 w-96 h-96 bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl rounded-[2.5rem] border border-white/15 bg-[#111a36]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[640px] md:h-[680px]">
          
          <div className="w-full md:w-[50%] p-6 md:p-10 flex flex-col justify-between bg-gradient-to-tr from-sky-500/10 via-[#111a36] to-transparent h-full md:max-h-[680px]">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 shadow-sm backdrop-blur-sm">
                <img src={pawtectorsLogo} alt="Pawtectors" className="w-5 h-5 object-contain" />
                <span className="font-bold text-xs tracking-wide text-white">Pawtectors Hospital OS</span>
              </div>
              <button 
                onClick={() => navigate('/admin')} 
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 text-stone-300 hover:text-white hover:bg-white/10 transition-colors text-[10px] font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            <div className="my-auto py-6 space-y-6 flex-grow flex flex-col justify-center min-h-0">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                  <Stethoscope className="w-3 h-3" /> Hospital Portal
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Hospital Login</h2>
                <p className="text-stone-400 text-xs font-medium">Access Medical Records, Reminders, Slot Booking & GST Invoicing</p>
              </div>

              {loginErrors.submit && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-300 rounded-2xl shrink-0">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-xs font-semibold">{loginErrors.submit}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleDashboardLogin} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label htmlFor="login-email" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Doctor / Staff Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="doctor@vetclinic.com" 
                      value={loginEmail} 
                      onChange={e => setLoginEmail(e.target.value)} 
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-stone-500 focus:border-sky-400 focus:ring-sky-400/20 rounded-2xl text-xs" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between px-1">
                    <label htmlFor="login-password" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Password</label>
                    <Link to="/forgot-password" className="text-[10px] font-semibold text-sky-400 hover:text-sky-300 hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input 
                      id="login-password" 
                      type={showLoginPassword ? 'text' : 'password'} 
                      placeholder="Enter password" 
                      value={loginPassword} 
                      onChange={e => setLoginPassword(e.target.value)} 
                      className="pl-11 pr-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-stone-500 focus:border-sky-400 focus:ring-sky-400/20 rounded-2xl text-xs" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowLoginPassword(prev => !prev)} 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-white" 
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loginLoading} 
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-500/20 transition-all"
                >
                  {loginLoading ? 'Authenticating...' : 'Sign In to Hospital Portal'}
                </Button>
              </form>
            </div>

            <div className="flex items-center justify-between text-[10px] text-stone-500 border-t border-white/10 pt-4 mt-2 shrink-0">
              <span>Protected Hospital Gateway</span>
              <span>256-Bit SSL Encryption</span>
            </div>
          </div>

          <div className="hidden md:flex w-[50%] p-8 bg-gradient-to-br from-[#162248] to-[#0d1630] flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
                Hospital OS Modules
              </span>
              <h3 className="text-2xl font-extrabold text-white">Dedicated Clinical Operations</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Everything veterinary practitioners need to manage consultation queues, electronic prescriptions, patient reminder campaigns, and compliant GST billing.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'Medical Records', desc: 'Prescriptions & Certificates', icon: FileText },
                { title: 'Patient Reminders', desc: 'WhatsApp & SMS alerts', icon: Bell },
                { title: 'Slot Booking', desc: 'OPD Schedule & Doctors', icon: Calendar },
                { title: 'GST Billing Engine', desc: 'Tax Invoices (CGST+SGST)', icon: Activity }
              ].map((mod, i) => {
                const Icon = mod.icon;
                return (
                  <div key={i} className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                    <Icon className="w-5 h-5 text-sky-400" />
                    <h4 className="text-xs font-bold text-white">{mod.title}</h4>
                    <p className="text-[10px] text-stone-400">{mod.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-stone-400 flex items-center justify-between border-t border-white/10 pt-4">
              <span>Need help? Contact hospital IT support</span>
              <span className="text-sky-400 font-semibold">care@pawtectors.com</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED: HOSPITAL MANAGEMENT DASHBOARD ---
  const navItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'records', label: 'Medical Records', icon: FileText, badge: `${clients.length}+` },
    { id: 'reminders', label: 'Patient Reminders', icon: Bell, badge: `${pendingRemindersCount} Due`, alert: pendingRemindersCount > 0 },
    { id: 'scheduler', label: 'Slot Booking', icon: Calendar },
    { id: 'billing', label: 'Billing Ledger', icon: Receipt },
    { id: 'gst-billing', label: 'GST Billing', icon: IndianRupee }
  ] as const;

  return (
    <>
      <Helmet>
        <title>Hospital Dashboard | Pawtectors</title>
        <meta name="description" content="Veterinary Hospital OS - Medical Records, Reminders, Slot Booking, Overview, Billing, and GST Invoicing." />
      </Helmet>

      <div className="min-h-screen bg-[#0b1329] text-stone-100 flex flex-col font-sans">
        
        {/* Top Header */}
        <header className="bg-[#111a36] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white/10 rounded-xl transition text-stone-400 hover:text-white"
              title="Return to Portal Selection"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Pawtectors <span className="text-sky-400 text-xs bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 font-medium">Hospital OS</span>
                </h1>
                <p className="text-[10px] text-stone-400">Jayanagar Center &bull; Clinical Management</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-stone-300">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>OPD Active: <strong>{appointments.length} Consults</strong></span>
            </div>

            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center font-bold text-white shadow-inner">
                {provider?.name ? provider.name[0].toUpperCase() : 'H'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-white">{provider?.name || 'Veterinary Staff'}</p>
                <button onClick={signOut} className="text-[10px] text-sky-400 hover:text-sky-300 hover:underline">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Shell */}
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* SIDEBAR NAVIGATION: 6 MODULES */}
          <aside className="w-full md:w-64 bg-[#0d1630] border-r border-white/10 flex flex-col justify-between py-6 shrink-0">
            <div className="px-4 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 px-3">Hospital Modules</p>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive 
                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                            : 'text-stone-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-sky-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : item.alert 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : 'bg-white/10 text-stone-400'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Summary Box */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 px-3">Live Telemetry</p>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Waiting Queue:</span>
                    <span className="font-bold text-amber-400">{pendingAppCount} patients</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Reminders Due:</span>
                    <span className="font-bold text-sky-400">{pendingRemindersCount} pending</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Gross Invoicing:</span>
                    <span className="font-bold text-emerald-400">₹{totalRevenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Support Badge */}
            <div className="px-4 pt-6 border-t border-white/10 mt-6">
              <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-2xl text-center flex flex-col items-center gap-1">
                <img
                  src={pawtectorsLogo}
                  alt="Pawtectors"
                  className="w-6 h-6 object-contain mb-1"
                />
                <h4 className="text-xs font-bold text-white">Pawtectors Enterprise</h4>
                <p className="text-[10px] text-stone-400">Clinical Telemetry Online</p>
              </div>
            </div>
          </aside>

          {/* MAIN WORKSPACE CONTENT */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full bg-[#0b1329]">

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Hospital Overview</h2>
                    <p className="text-stone-400 text-xs sm:text-sm">Real-time clinical metrics, queue status, and operational charts.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl shadow-md shadow-sky-500/20 text-xs font-bold"
                      onClick={() => setIsAppModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Book Slot
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold"
                      onClick={() => setActiveTab('gst-billing')}
                    >
                      <IndianRupee className="w-4 h-4 mr-1.5 text-sky-400" /> GST Billing
                    </Button>
                  </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {[
                    { title: "Today's OPD Visits", val: todayAppCount, desc: `${pendingAppCount} awaiting consult`, icon: Calendar, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
                    { title: 'Total Collections (Gross)', val: `₹${totalRevenue.toLocaleString('en-IN')}`, desc: 'GST bills generated', icon: IndianRupee, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                    { title: 'Registered Patients', val: `${clients.length}+`, desc: 'Medical records stored', icon: Users, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
                    { title: 'Patient Reminders Due', val: pendingRemindersCount, desc: 'Vaccine & follow-up alerts', icon: Bell, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' }
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <Card key={i} className="bg-[#111a36] border border-white/10 rounded-2xl shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                            {stat.title}
                          </CardTitle>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${stat.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{stat.val}</p>
                          <p className="text-[11px] text-stone-400 mt-1">{stat.desc}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Revenue Graph & OPD Queue */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="bg-[#111a36] border border-white/10 rounded-2xl lg:col-span-2 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base font-bold text-white">Revenue & Expenditure Telemetry</CardTitle>
                      <CardDescription className="text-stone-400 text-xs">Monthly performance analysis covering consultations, surgeries, and pharmacy.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                            formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']} 
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Hospital Revenue" />
                          <Area type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Operating Costs" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* OPD Waiting Queue */}
                  <Card className="bg-[#111a36] border border-white/10 rounded-2xl shadow-sm">
                    <CardHeader className="pb-3 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold text-white flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-sky-400" /> OPD Live Queue
                        </CardTitle>
                        <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">Active</Badge>
                      </div>
                      <CardDescription className="text-stone-400 text-xs">Patients awaiting doctor consultation today.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 px-0">
                      <ScrollArea className="h-[250px] px-6">
                        <div className="space-y-3">
                          {appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending').map((app, i) => (
                            <div key={i} className="p-3 rounded-xl border border-white/10 bg-white/[0.03] space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white">{app.petName} ({app.breed})</span>
                                <span className="text-[11px] font-semibold text-sky-400">{app.time}</span>
                              </div>
                              <p className="text-stone-400 text-[11px]">Parent: {app.ownerName} &bull; Dr: {app.doctor}</p>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-stone-500">Service: {app.service}</span>
                                <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px]">{app.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 2: MEDICAL RECORDS (2+ RECORDS & CERTIFICATES) */}
            {activeTab === 'records' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Medical Records & Prescriptions</h2>
                    <p className="text-stone-400 text-xs sm:text-sm">Patient electronic health records, diagnostic history, and official health certificates.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl shadow-md shadow-sky-500/20 text-xs font-bold"
                      onClick={() => setIsClientModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Register Patient
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold"
                      onClick={() => setIsConsultationModalOpen(true)}
                    >
                      <ClipboardList className="w-4 h-4 mr-1.5 text-sky-400" /> Log Consultation
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Patient Records Table */}
                  <Card className="bg-[#111a36] border border-white/10 rounded-2xl lg:col-span-2 shadow-sm">
                    <CardHeader className="pb-3 border-b border-white/10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-sky-400" /> Patient Directory ({filteredClients.length} Profiles)
                        </CardTitle>
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                          <Input 
                            placeholder="Search client or pet..." 
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            className="pl-9 h-9 text-xs rounded-xl border-white/10 bg-white/5 text-white placeholder:text-stone-500"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-white/10 hover:bg-transparent">
                            <TableHead className="font-bold text-stone-300 text-xs">Pet & Parent</TableHead>
                            <TableHead className="font-bold text-stone-300 text-xs">Contact</TableHead>
                            <TableHead className="font-bold text-stone-300 text-xs">Latest Medical Diagnosis</TableHead>
                            <TableHead className="text-right font-bold text-stone-300 text-xs">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredClients.map((client) => {
                            const latestRecord = client.records && client.records.length > 0 ? client.records[0] : null;
                            return (
                              <TableRow key={client.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white text-xs">{client.pets[0]?.name}</span>
                                      <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px]">
                                        {client.pets[0]?.breed}
                                      </Badge>
                                    </div>
                                    <p className="text-[11px] text-stone-400">Parent: {client.name}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-0.5 text-xs text-stone-400">
                                    <p>{client.phone}</p>
                                    <p className="text-[10px] text-stone-500">{client.address}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                  {latestRecord ? (
                                    <div className="space-y-0.5 text-xs">
                                      <p className="font-semibold text-emerald-400 text-[11px] truncate">{latestRecord.diagnosis}</p>
                                      <p className="text-[10px] text-stone-400 truncate">{latestRecord.prescription}</p>
                                      <p className="text-[9px] text-stone-500">{latestRecord.date} &bull; {latestRecord.doctor}</p>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-stone-500 italic">No record logged yet</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-sky-400 text-xs font-semibold hover:bg-sky-500/10 rounded-xl"
                                    onClick={() => {
                                      setCertForm({
                                        petParent: client.name,
                                        petName: client.pets[0].name,
                                        breed: client.pets[0].breed,
                                        age: client.pets[0].age,
                                        dateOfVaccination: new Date().toISOString().split('T')[0],
                                        vaccineBrand: 'Megavac Rabies Booster',
                                        lotNo: 'R-7721A',
                                        signDr: 'Dr. Ramesh Sharma'
                                      });
                                      toast({ title: 'Pet Loaded', description: `${client.pets[0].name} loaded into certificate generator.` });
                                    }}
                                  >
                                    Create Certificate
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Health Certificate Generator */}
                  <Card className="bg-[#111a36] border border-white/10 rounded-2xl shadow-sm">
                    <CardHeader className="pb-3 border-b border-white/10">
                      <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-sky-400" /> Certificate Generator
                      </CardTitle>
                      <CardDescription className="text-stone-400 text-xs">Issue verified health, travel, and vaccination certificates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Template Type</Label>
                        <Select value={certType} onValueChange={(val) => setCertType(val)}>
                          <SelectTrigger className="rounded-xl border-white/10 bg-white/5 text-white text-xs">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111a36] border-white/10 text-white">
                            {certificateTemplates.map(t => (
                              <SelectItem key={t.type} value={t.type}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="border border-white/10 bg-white/[0.03] p-3 rounded-xl space-y-2.5 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-stone-400">Pet Parent</Label>
                            <Input value={certForm.petParent} onChange={e => setCertForm({...certForm, petParent: e.target.value})} className="h-8 text-xs rounded-lg border-white/10 bg-white/5 text-white" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-stone-400">Pet Name</Label>
                            <Input value={certForm.petName} onChange={e => setCertForm({...certForm, petName: e.target.value})} className="h-8 text-xs rounded-lg border-white/10 bg-white/5 text-white" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] text-stone-400">Breed</Label>
                            <Input value={certForm.breed} onChange={e => setCertForm({...certForm, breed: e.target.value})} className="h-8 text-xs rounded-lg border-white/10 bg-white/5 text-white" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-stone-400">Age</Label>
                            <Input value={certForm.age} onChange={e => setCertForm({...certForm, age: e.target.value})} className="h-8 text-xs rounded-lg border-white/10 bg-white/5 text-white" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-stone-400">Vaccine / Lot</Label>
                          <Input value={certForm.vaccineBrand} onChange={e => setCertForm({...certForm, vaccineBrand: e.target.value})} className="h-8 text-xs rounded-lg border-white/10 bg-white/5 text-white" />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-stone-400">Signing Veterinarian</Label>
                          <Input value={certForm.signDr} onChange={e => setCertForm({...certForm, signDr: e.target.value})} className="h-8 text-xs rounded-lg border-white/10 bg-white/5 text-white" />
                        </div>
                      </div>

                      <Button 
                        onClick={handleGenerateCertificate}
                        className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-xl shadow-md shadow-sky-500/20 text-xs font-bold"
                      >
                        <Printer className="w-4 h-4 mr-2" /> Print Official Certificate
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 3: PATIENT REMINDERS (NEW DEDICATED MODULE) */}
            {activeTab === 'reminders' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Patient Reminders & Alerts</h2>
                    <p className="text-stone-400 text-xs sm:text-sm">Automated and on-demand WhatsApp/SMS notifications for appointments, vaccinations, and post-op follow-ups.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl shadow-md shadow-sky-500/20 text-xs font-bold"
                      onClick={handleSendAllPending}
                    >
                      <Send className="w-4 h-4 mr-1.5" /> Send All Pending
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold"
                      onClick={() => setIsReminderModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-1.5 text-sky-400" /> Custom Reminder
                    </Button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: `All Reminders (${reminders.length})` },
                    { id: 'appointment', label: 'Appointments' },
                    { id: 'vaccination', label: 'Vaccinations Due' },
                    { id: 'followup', label: 'Follow-ups' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setReminderFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        reminderFilter === tab.id
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'bg-white/5 text-stone-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Reminders List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReminders.map((rem) => {
                    const isOverdue = rem.status === 'Overdue';
                    const isPending = rem.status === 'Pending';
                    const isSent = rem.status === 'Sent';

                    return (
                      <Card key={rem.id} className="bg-[#111a36] border border-white/10 rounded-2xl shadow-sm flex flex-col justify-between p-5 space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge className={
                              rem.type === 'vaccination' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              rem.type === 'followup' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }>
                              {rem.type.toUpperCase()}
                            </Badge>

                            <Badge className={
                              isSent ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              isOverdue ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                              'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }>
                              {rem.status}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-bold text-white text-sm">{rem.title}</h3>
                            <p className="text-xs text-stone-300 font-medium">Pet: <span className="text-sky-400">{rem.petName}</span> &bull; Parent: {rem.ownerName}</p>
                            <p className="text-[11px] text-stone-400">{rem.notes}</p>
                          </div>

                          <div className="pt-2 border-t border-white/10 space-y-1 text-[11px] text-stone-400">
                            <div className="flex items-center justify-between">
                              <span>Due / Scheduled:</span>
                              <span className="font-semibold text-white">{rem.dueDate}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Phone Channel:</span>
                              <span>{rem.phone} ({rem.channel})</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button
                            size="sm"
                            disabled={isSent}
                            onClick={() => handleSendReminder(rem.id)}
                            className={`w-full rounded-xl text-xs font-bold ${
                              isSent 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : 'bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20'
                            }`}
                          >
                            {isSent ? (
                              <><Check className="w-3.5 h-3.5 mr-1" /> Reminder Delivered</>
                            ) : (
                              <><MessageSquare className="w-3.5 h-3.5 mr-1" /> Send WhatsApp / SMS Alert</>
                            )}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: SLOT BOOKING (OPD SCHEDULER) */}
            {activeTab === 'scheduler' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">OPD Slot Booking & Calendar</h2>
                    <p className="text-stone-400 text-xs sm:text-sm">Manage doctor schedules, OPD consultation slots, and patient booking statuses.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl shadow-md shadow-sky-500/20 text-xs font-bold"
                      onClick={() => setIsAppModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Book New Slot
                    </Button>
                  </div>
                </div>

                <Card className="bg-[#111a36] border border-white/10 rounded-2xl shadow-sm">
                  <CardHeader className="pb-3 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-sky-400" /> Booked Slots ({filteredAppointments.length})
                      </CardTitle>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                        <Input 
                          placeholder="Search bookings..." 
                          value={appSearch}
                          onChange={(e) => setAppSearch(e.target.value)}
                          className="pl-9 h-9 text-xs rounded-xl border-white/10 bg-white/5 text-white placeholder:text-stone-500"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-white/10 hover:bg-transparent">
                          <TableHead className="font-bold text-stone-300 text-xs">Pet & Parent</TableHead>
                          <TableHead className="font-bold text-stone-300 text-xs">Slot Time & Date</TableHead>
                          <TableHead className="font-bold text-stone-300 text-xs">Attending Veterinarian</TableHead>
                          <TableHead className="font-bold text-stone-300 text-xs">Service</TableHead>
                          <TableHead className="font-bold text-stone-300 text-xs">Status</TableHead>
                          <TableHead className="text-right font-bold text-stone-300 text-xs">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.map((app) => (
                          <TableRow key={app.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <TableCell>
                              <div className="space-y-0.5">
                                <span className="font-bold text-white text-xs">{app.petName} ({app.breed})</span>
                                <p className="text-[11px] text-stone-400">Parent: {app.ownerName} &bull; {app.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5 text-xs">
                                <p className="font-semibold text-sky-400">{app.time}</p>
                                <p className="text-[10px] text-stone-400">{app.date}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-stone-300">{app.doctor}</TableCell>
                            <TableCell className="text-xs text-stone-300">{app.service}</TableCell>
                            <TableCell>
                              <Badge className={
                                app.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                app.status === 'Confirmed' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                                'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }>
                                {app.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-sky-400 text-xs font-semibold hover:bg-sky-500/10 rounded-xl"
                                onClick={() => {
                                  setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: 'Completed' } : a));
                                  toast({ title: 'Status Updated', description: `Appointment marked as Completed.` });
                                }}
                              >
                                Mark Done
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 5: BILLING (INVOICES LEDGER) */}
            {activeTab === 'billing' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Billing & Invoices Ledger</h2>
                    <p className="text-stone-400 text-xs sm:text-sm">Processed hospital invoices, payment modes (UPI, Card, Cash) and printable receipts.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl shadow-md shadow-sky-500/20 text-xs font-bold"
                      onClick={() => setActiveTab('gst-billing')}
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Create GST Invoice
                    </Button>
                  </div>
                </div>

                <Card className="bg-[#111a36] border border-white/10 rounded-2xl shadow-sm">
                  <CardHeader className="pb-3 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-sky-400" /> Invoice Register ({filteredInvoices.length} Bills)
                      </CardTitle>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                        <Input 
                          placeholder="Search invoices..." 
                          value={billingSearch}
                          onChange={(e) => setBillingSearch(e.target.value)}
                          className="pl-9 h-9 text-xs rounded-xl border-white/10 bg-white/5 text-white placeholder:text-stone-500"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-white/10 hover:bg-transparent">
                          <TableHead className="font-bold text-stone-300 text-xs">Invoice No & Date</TableHead>
                          <TableHead className="font-bold text-stone-300 text-xs">Billed Client</TableHead>
                          <TableHead className="font-bold text-stone-300 text-xs">Subtotal</TableHead>
                          <TableHead className="font-bold text-stone-300 text-xs">GST (18%)</TableHead>
                          <TableHead className="font-bold text-stone-300 text-xs">Grand Total</TableHead>
                          <TableHead className="font-bold text-stone-300 text-xs">Payment</TableHead>
                          <TableHead className="text-right font-bold text-stone-300 text-xs">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((inv) => (
                          <TableRow key={inv.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <TableCell>
                              <div className="space-y-0.5">
                                <span className="font-bold text-white text-xs">{inv.id}</span>
                                <p className="text-[10px] text-stone-500">{inv.date}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-stone-300 font-medium">{inv.clientName}</TableCell>
                            <TableCell className="text-xs text-stone-400">₹{inv.subtotal.toFixed(2)}</TableCell>
                            <TableCell className="text-xs text-stone-400">₹{(inv.cgst + inv.sgst).toFixed(2)}</TableCell>
                            <TableCell className="text-xs font-bold text-emerald-400">₹{inv.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px]">
                                {inv.mode} &bull; {inv.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-sky-400 text-xs font-semibold hover:bg-sky-500/10 rounded-xl"
                                onClick={() => handlePrintInvoice(inv)}
                              >
                                <Printer className="w-3.5 h-3.5 mr-1" /> Print Bill
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 6: GST BILLING (INTERACTIVE INVOICE BUILDER) */}
            {activeTab === 'gst-billing' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">GST Tax Invoice Builder</h2>
                    <p className="text-stone-400 text-xs sm:text-sm">Compile compliant GST tax invoices (CGST 9% + SGST 9%) with real-time tax calculation.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="bg-[#111a36] border border-white/10 rounded-2xl lg:col-span-2 shadow-sm">
                    <CardHeader className="pb-3 border-b border-white/10">
                      <CardTitle className="text-base font-bold text-white">Create GST Invoice</CardTitle>
                      <CardDescription className="text-stone-400 text-xs">Select patient and configure service/medicine line items.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Select Pet Parent</Label>
                          <Select value={billClient} onValueChange={(val) => setBillClient(val)}>
                            <SelectTrigger className="rounded-xl border-white/10 bg-white/5 text-white text-xs">
                              <SelectValue placeholder="Select parent" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111a36] border-white/10 text-white">
                              {clients.map(c => (
                                <SelectItem key={c.id} value={c.name}>{c.name} ({c.pets[0]?.name})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Invoice Date</Label>
                          <Input 
                            type="date" 
                            defaultValue={new Date().toISOString().split('T')[0]} 
                            className="rounded-xl border-white/10 bg-white/5 text-white text-xs" 
                            disabled 
                          />
                        </div>
                      </div>

                      {/* Dynamic Line Items */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Procedures, Medications & Services</Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleAddBillItem} 
                            className="text-sky-400 text-xs font-bold hover:bg-sky-500/10 rounded-xl"
                          >
                            <PlusCircle className="w-4 h-4 mr-1" /> Add Line Item
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {billItems.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-end border-b border-white/10 pb-3 last:border-0 last:pb-0">
                              <div className="flex-1 space-y-1">
                                <Label className="text-[10px] text-stone-400">Procedure / Medicine Description</Label>
                                <Input 
                                  value={item.name} 
                                  placeholder="e.g. Consultation, Rabies Vaccine, Grooming" 
                                  onChange={e => handleUpdateBillItem(idx, 'name', e.target.value)} 
                                  className="h-9 text-xs rounded-xl border-white/10 bg-white/5 text-white" 
                                />
                              </div>
                              <div className="w-28 space-y-1">
                                <Label className="text-[10px] text-stone-400">Price (₹)</Label>
                                <Input 
                                  type="number" 
                                  value={item.price || ''} 
                                  placeholder="₹"
                                  onChange={e => handleUpdateBillItem(idx, 'price', parseFloat(e.target.value) || 0)} 
                                  className="h-9 text-xs rounded-xl border-white/10 bg-white/5 text-white" 
                                />
                              </div>
                              <div className="w-16 space-y-1">
                                <Label className="text-[10px] text-stone-400">Qty</Label>
                                <Input 
                                  type="number" 
                                  value={item.qty || ''} 
                                  onChange={e => handleUpdateBillItem(idx, 'qty', parseInt(e.target.value) || 0)} 
                                  className="h-9 text-xs rounded-xl border-white/10 bg-white/5 text-white text-center" 
                                />
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleRemoveBillItem(idx)}
                                className="h-9 w-9 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tax Breakdown Box */}
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-end gap-2 text-xs">
                        <div className="flex justify-between w-64 text-stone-400">
                          <span>Taxable Value (Subtotal):</span>
                          <span className="font-semibold text-white">₹{billItems.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-64 text-stone-400">
                          <span>CGST (9.0%):</span>
                          <span className="text-sky-300">₹{(billItems.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0) * 0.09).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-64 text-stone-400">
                          <span>SGST (9.0%):</span>
                          <span className="text-sky-300">₹{(billItems.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0) * 0.09).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-64 font-bold text-sm border-t border-white/10 pt-2 text-emerald-400">
                          <span>Total Amount (Inc. GST):</span>
                          <span>₹{(billItems.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 1)), 0) * 1.18).toFixed(2)}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={handleCompileGSTInvoice}
                        className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-xl shadow-lg shadow-sky-500/20 py-4 font-bold text-xs"
                      >
                        <IndianRupee className="w-4 h-4 mr-2" /> Compile & Finalize GST Invoice
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Summary / Tax Compliant Note */}
                  <Card className="bg-[#111a36] border border-white/10 rounded-2xl shadow-sm space-y-4 p-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                        <Activity className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white text-base">GST Compliance Engine</h3>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        Invoices generated follow standard Indian GST formatting for veterinary healthcare providers and clinical pharmacies with separate 9% Central GST and 9% State GST line items.
                      </p>
                    </div>

                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1.5 text-xs text-stone-300">
                      <p className="font-bold text-white">Hospital GSTIN</p>
                      <p className="font-mono text-sky-400 text-[11px]">29AAVCP4829K1Z0</p>
                      <p className="text-[10px] text-stone-500 pt-1">State: 29 - Karnataka (Bengaluru Center)</p>
                    </div>
                  </Card>
                </div>
              </div>
            )}

          </main>
        </div>

        {/* --- MODALS --- */}

        {/* 1. Book Appointment Modal */}
        <Dialog open={isAppModalOpen} onOpenChange={setIsAppModalOpen}>
          <DialogContent className="bg-[#111a36] border-white/10 text-white max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-white">Book OPD Appointment Slot</DialogTitle>
              <DialogDescription className="text-xs text-stone-400">Schedule consultation slot for registered or walk-in patient.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAppointment} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Pet Name</Label>
                  <Input value={newApp.petName} onChange={e => setNewApp({...newApp, petName: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" placeholder="e.g. Bruno" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Breed</Label>
                  <Input value={newApp.breed} onChange={e => setNewApp({...newApp, breed: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" placeholder="e.g. Labrador" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Pet Parent Name</Label>
                  <Input value={newApp.ownerName} onChange={e => setNewApp({...newApp, ownerName: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" placeholder="Parent Name" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Contact Number</Label>
                  <Input value={newApp.phone} onChange={e => setNewApp({...newApp, phone: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" placeholder="10-digit Phone" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Time Slot</Label>
                  <Input value={newApp.time} onChange={e => setNewApp({...newApp, time: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" placeholder="10:00 AM" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Date</Label>
                  <Input type="date" value={newApp.date} onChange={e => setNewApp({...newApp, date: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-stone-400">Service Required</Label>
                <Input value={newApp.service} onChange={e => setNewApp({...newApp, service: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" placeholder="Consultation / Vaccination / Grooming" required />
              </div>
              <DialogFooter className="pt-3">
                <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold">
                  Confirm Booking Slot
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 2. Register Patient Modal */}
        <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
          <DialogContent className="bg-[#111a36] border-white/10 text-white max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-white">Register Patient & Pet Parent</DialogTitle>
              <DialogDescription className="text-xs text-stone-400">Create permanent electronic health profile.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegisterClient} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Parent Name</Label>
                  <Input value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Phone</Label>
                  <Input value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Pet Name</Label>
                  <Input value={newClient.petName} onChange={e => setNewClient({...newClient, petName: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Breed</Label>
                  <Input value={newClient.petBreed} onChange={e => setNewClient({...newClient, petBreed: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-stone-400">Address</Label>
                <Input value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" placeholder="Bengaluru address" />
              </div>
              <DialogFooter className="pt-3">
                <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold">
                  Save Patient Record
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 3. Log Consultation Modal */}
        <Dialog open={isConsultationModalOpen} onOpenChange={setIsConsultationModalOpen}>
          <DialogContent className="bg-[#111a36] border-white/10 text-white max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-white">Log Consultation & Prescription</DialogTitle>
              <DialogDescription className="text-xs text-stone-400">Record symptoms, clinical diagnosis, and medication orders.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogConsultation} className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-stone-400">Select Patient Profile</Label>
                <Select value={consultation.clientIndex} onValueChange={(val) => setConsultation({...consultation, clientIndex: val})}>
                  <SelectTrigger className="rounded-xl border-white/10 bg-white/5 text-white text-xs">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111a36] border-white/10 text-white">
                    {clients.map((c, idx) => (
                      <SelectItem key={c.id} value={String(idx)}>{c.pets[0]?.name} (Parent: {c.name})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-stone-400">Clinical Symptoms</Label>
                <Input value={consultation.symptoms} onChange={e => setConsultation({...consultation, symptoms: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" placeholder="e.g. Coughing, loss of appetite" required />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-stone-400">Diagnosis</Label>
                <Input value={consultation.diagnosis} onChange={e => setConsultation({...consultation, diagnosis: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" placeholder="e.g. Upper Respiratory Tract Infection" required />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-stone-400">Rx / Medication Prescription</Label>
                <Textarea value={consultation.prescription} onChange={e => setConsultation({...consultation, prescription: e.target.value})} className="h-20 text-xs bg-white/5 border-white/10 text-white rounded-xl" placeholder="e.g. Amoxycillin 250mg OD for 5 days, Multivitamin syrup 5ml BD" required />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-stone-400">Follow-up Due Date (Optional)</Label>
                <Input type="date" value={consultation.nextFollowUp} onChange={e => setConsultation({...consultation, nextFollowUp: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" />
              </div>
              <DialogFooter className="pt-3">
                <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold">
                  Save Medical Consultation Record
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 4. Custom Reminder Modal */}
        <Dialog open={isReminderModalOpen} onOpenChange={setIsReminderModalOpen}>
          <DialogContent className="bg-[#111a36] border-white/10 text-white max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-white">Create Patient Reminder</DialogTitle>
              <DialogDescription className="text-xs text-stone-400">Schedule automatic WhatsApp/SMS alert for vaccine, deworming or visit.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateReminder} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Pet Name</Label>
                  <Input value={newReminder.petName} onChange={e => setNewReminder({...newReminder, petName: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Parent Name</Label>
                  <Input value={newReminder.ownerName} onChange={e => setNewReminder({...newReminder, ownerName: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Phone</Label>
                  <Input value={newReminder.phone} onChange={e => setNewReminder({...newReminder, phone: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-stone-400">Due Date</Label>
                  <Input type="date" value={newReminder.dueDate} onChange={e => setNewReminder({...newReminder, dueDate: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-stone-400">Reminder Title</Label>
                <Input value={newReminder.title} onChange={e => setNewReminder({...newReminder, title: e.target.value})} className="h-8 text-xs bg-white/5 border-white/10 text-white rounded-xl" placeholder="e.g. Annual Rabies Booster Due" required />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-stone-400">Message Notes</Label>
                <Textarea value={newReminder.notes} onChange={e => setNewReminder({...newReminder, notes: e.target.value})} className="h-16 text-xs bg-white/5 border-white/10 text-white rounded-xl" placeholder="Custom message notes..." />
              </div>
              <DialogFooter className="pt-3">
                <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold">
                  Queue Reminder Alert
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 5. Bill Preview Dialog */}
        <Dialog open={isBillPreviewOpen} onOpenChange={setIsBillPreviewOpen}>
          <DialogContent className="bg-[#111a36] border-white/10 text-white max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-white">Finalize GST Tax Invoice</DialogTitle>
              <DialogDescription className="text-xs text-stone-400">Review invoice breakdown and save to permanent hospital ledger.</DialogDescription>
            </DialogHeader>
            {previewInvoiceData && (
              <div className="space-y-4 pt-2 text-xs">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>Invoice: {previewInvoiceData.id}</span>
                    <span>Date: {previewInvoiceData.date}</span>
                  </div>
                  <p className="text-stone-300">Billed To: <strong>{previewInvoiceData.clientName}</strong></p>
                  
                  <div className="border-t border-white/10 pt-2 space-y-1.5">
                    {previewInvoiceData.items.map((it: any, i: number) => (
                      <div key={i} className="flex justify-between text-stone-300">
                        <span>{it.name} (x{it.qty})</span>
                        <span>₹{(it.price * it.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-2 space-y-1 text-stone-400">
                    <div className="flex justify-between"><span>Subtotal:</span><span>₹{previewInvoiceData.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>CGST (9%):</span><span>₹{previewInvoiceData.cgst.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>SGST (9%):</span><span>₹{previewInvoiceData.sgst.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-sm text-emerald-400 pt-1 border-t border-white/10">
                      <span>Grand Total:</span>
                      <span>₹{previewInvoiceData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handlePrintInvoice(previewInvoiceData)}
                    variant="outline" 
                    className="flex-1 bg-white/5 border-white/10 text-white rounded-xl text-xs font-bold"
                  >
                    <Printer className="w-4 h-4 mr-1" /> Print Bill
                  </Button>
                  <Button 
                    onClick={handleSaveInvoice}
                    className="flex-1 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold"
                  >
                    <Check className="w-4 h-4 mr-1" /> Save & Record
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
};

export default ClinicAdminDashboard;
