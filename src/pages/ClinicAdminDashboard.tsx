import { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, Link } from 'react-router-dom';
import pawtectorsLogo from '@/assets/pawtectors-logo.png';
import dashboardMockup from '@/assets/login_dashboard_mockup.jpg';
import { useProviderAuth } from '@/hooks/useProviderAuth';
import ProviderLogin from '@/components/ProviderLogin';
import { bookingsApi, medicalRecordsApi, billsApi, clinicPetParentsApi } from '@/lib/api';
import { 
  Stethoscope, Calendar, FileText, IndianRupee, 
  Users, TrendingUp, Bell, Plus, Search, Filter, CheckCircle2, 
  XCircle, Clock, AlertTriangle, Send, ShieldAlert, Sparkles, 
  Printer, Share2, ClipboardList, Trash2, ArrowLeft, RefreshCw,
  PlusCircle, User, FileSpreadsheet, Package, Phone, Mail, Award,
  ArrowRight, Lock, EyeOff, Eye, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
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
  { id: 'c1', name: 'Rajesh Kumar', email: 'rajesh@gmail.com', phone: '9876543210', address: 'Indiranagar, Bengaluru', pets: [{ name: 'Bruno', type: 'Dog', breed: 'Labrador', age: '3 years' }] },
  { id: 'c2', name: 'Priya Patel', email: 'priya@gmail.com', phone: '8765432109', address: 'Jayanagar, Bengaluru', pets: [{ name: 'Whiskers', type: 'Cat', breed: 'Persian Cat', age: '1.5 years' }] },
  { id: 'c3', name: 'Amit Sharma', email: 'amit@gmail.com', phone: '7654321098', address: 'Koramangala, Bengaluru', pets: [{ name: 'Max', type: 'Dog', breed: 'Golden Retriever', age: '2 years' }] },
  { id: 'c4', name: 'Neha Gupta', email: 'neha@gmail.com', phone: '9543210987', address: 'HSR Layout, Bengaluru', pets: [{ name: 'Coco', type: 'Dog', breed: 'Shih Tzu', age: '4 years' }] },
  { id: 'c5', name: 'Vikram Singh', email: 'vikram@gmail.com', phone: '8123456789', address: 'Whitefield, Bengaluru', pets: [{ name: 'Sheru', type: 'Dog', breed: 'Indie Dog', age: '5 years' }] }
];

const initialQRTags = [
  { id: 'qr1', serial: 'PM-9824-A', petName: 'Bruno', ownerName: 'Rajesh Kumar', status: 'Active', lostMode: false, scans: 14, lastScan: 'Today, 11:20 AM' },
  { id: 'qr2', serial: 'PM-3104-B', petName: 'Max', ownerName: 'Amit Sharma', status: 'Lost', lostMode: true, scans: 3, lastScan: 'Yesterday, 05:45 PM' },
  { id: 'qr3', serial: 'PM-4521-C', petName: 'Whiskers', ownerName: 'Priya Patel', status: 'Active', lostMode: false, scans: 8, lastScan: '14 Aug 2026, 02:10 PM' }
];

const qrScanLogs = [
  { tagSerial: 'PM-3104-B', petName: 'Max', time: 'Yesterday, 05:45 PM', location: 'Whitefield, Bengaluru (Accuracy 12m)', ip: '103.45.89.14', alertSent: true },
  { tagSerial: 'PM-9824-A', petName: 'Bruno', time: 'Today, 11:20 AM', location: 'Indiranagar, Bengaluru (Accuracy 8m)', ip: '115.240.55.101', alertSent: false }
];

const initialInventory = [
  { id: 'inv1', itemName: 'Megavac DHPPi Vaccine', category: 'Vaccines', stock: 42, unit: 'Vials', price: 450, vendor: 'VetMed Supplies', status: 'In Stock', expiryDate: '2027-04-12' },
  { id: 'inv2', itemName: 'Rabisin Anti-Rabies', category: 'Vaccines', stock: 8, unit: 'Vials', price: 210, vendor: 'VetMed Supplies', status: 'Low Stock', expiryDate: '2027-01-08' },
  { id: 'inv3', itemName: 'Bravecto Chewable (Dogs 10-20kg)', category: 'Parasiticides', stock: 15, unit: 'Packs', price: 1800, vendor: 'PetCare Distributors', status: 'In Stock', expiryDate: '2028-02-15' },
  { id: 'inv4', itemName: 'Amoxycillin Syrup 100ml', category: 'Antibiotics', stock: 3, unit: 'Bottles', price: 120, vendor: 'Aurobindo Vet', status: 'Low Stock', expiryDate: '2026-10-30' },
  { id: 'inv5', itemName: 'Canine Grooming Shampoo 5L', category: 'Grooming', stock: 0, unit: 'Cans', price: 1200, vendor: 'Himalaya Animal Health', status: 'Out of Stock', expiryDate: '2028-08-20' }
];

const initialExpenses = [
  { id: 'exp1', title: 'Clinic Assistant Salary', category: 'Salaries', amount: 22000, date: '2026-08-05', mode: 'Bank Transfer', notes: 'August salary for Rahul' },
  { id: 'exp2', title: 'Clinic Space Rent', category: 'Rent', amount: 45000, date: '2026-08-01', mode: 'NEFT', notes: 'Rent for Indiranagar building' },
  { id: 'exp3', title: 'Vaccine Consignment Purchase', category: 'Medical Supplies', amount: 18400, date: '2026-08-10', mode: 'UPI', notes: 'Paid to VetMed Supplies (GST Invoice)' },
  { id: 'exp4', title: 'Internet & Telephone Bills', category: 'Utilities', amount: 2450, date: '2026-08-12', mode: 'Credit Card', notes: 'Act Fibernet and Jio router' }
];

const initialInvoices = [
  { id: 'INV-2026-001', clientName: 'Rajesh Kumar', date: '2026-08-18', subtotal: 1250, cgst: 112.5, sgst: 112.5, total: 1475, items: [{ name: 'DHPPi Vaccine booster', price: 450, qty: 1 }, { name: 'Consultation Fee', price: 500, qty: 1 }, { name: 'Ear cleaning add-on', price: 300, qty: 1 }], status: 'Paid', mode: 'UPI' },
  { id: 'INV-2026-002', clientName: 'Priya Patel', date: '2026-08-18', subtotal: 500, cgst: 45, sgst: 45, total: 590, items: [{ name: 'Consultation Fee', price: 500, qty: 1 }], status: 'Paid', mode: 'Cash' }
];

const chartData = [
  { name: 'Mar', revenue: 95000, expenses: 62000 },
  { name: 'Apr', revenue: 112000, expenses: 65000 },
  { name: 'May', revenue: 125000, expenses: 68000 },
  { name: 'Jun', revenue: 148000, expenses: 74000 },
  { name: 'Jul', revenue: 165000, expenses: 76000 },
  { name: 'Aug', revenue: 180000, expenses: 87850 }
];

const certificateTemplates = [
  { type: 'anti_rabies', name: 'Anti-Rabies Vaccination Certificate', desc: 'Validates rabies vaccination details, required for apartment and city licensing.' },
  { type: 'fit_to_fly', name: 'Fit to Fly (Travel Health Certificate)', desc: 'Required by airlines for domestic and international pet air travel.' },
  { type: 'general_fitness', name: 'General Health & Fitness Certificate', desc: 'Certifies current wellness, deworming, and immunization record.' },
  { type: 'spay_neuter', name: 'Spaying / Neutering Certificate', desc: 'Verifies successful sterilization surgery, useful for shelter records or NGO compliance.' }
];

const ClinicAdminDashboard = () => {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [loginLoading, setLoginLoading] = useState(false);

  const handleDashboardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginErrors({});
    const res = await signInWithEmail(loginEmail, loginPassword);
    if (!res.success) {
      setLoginErrors({ submit: res.error || 'Login failed' });
    }
    setLoginLoading(false);
  };
  const { toast } = useToast();
  const { user, provider, isLoading: authLoading, signInWithEmail, signOut } = useProviderAuth();

  // --- STATE LISTS ---
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [qrTags, setQRTags] = useState(initialQRTags);
  const [inventory, setInventory] = useState(initialInventory);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [logs, setLogs] = useState(qrScanLogs);

  // --- SEARCH STATES ---
  const [appSearch, setAppSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [invSearch, setInvSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // --- APPOINTMENT MODAL FORM ---
  const [newApp, setNewApp] = useState({ petName: '', breed: '', age: '', ownerName: '', phone: '', doctor: 'Dr. Ramesh Sharma', time: '10:00 AM', date: new Date().toISOString().split('T')[0], service: 'Consultation' });
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  // --- CLIENT MODAL FORM ---
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '', petName: '', petType: 'Dog', petBreed: '', petAge: '' });
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // --- CONSULTATION RECORD FORM ---
  const [consultation, setConsultation] = useState({ clientIndex: '0', petIndex: '0', symptoms: '', diagnosis: '', prescription: '', nextFollowUp: '' });
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // --- HEALTH CERTIFICATE BUILDER ---
  const [certType, setCertType] = useState('anti_rabies');
  const [certForm, setCertForm] = useState({ petParent: 'Rajesh Kumar', petName: 'Bruno', breed: 'Labrador', age: '3 years', dateOfVaccination: '2026-08-10', vaccineBrand: 'Megavac Rabies', lotNo: 'R-7721A', signDr: 'Dr. Ramesh Sharma' });
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certPreviewHtml, setCertPreviewHtml] = useState<string | null>(null);

  // --- GST BILLING INVOICE BUILDER ---
  const [billClient, setBillClient] = useState('Rajesh Kumar');
  const [billItems, setBillItems] = useState<{ name: string; price: number; qty: number }[]>([{ name: 'Consultation Fee', price: 500, qty: 1 }]);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [previewInvoiceData, setPreviewInvoiceData] = useState<any>(null);

  // --- INVENTORY DIALOG ---
  const [newStock, setNewStock] = useState({ itemName: '', category: 'Vaccines', stock: 10, unit: 'Vials', price: 300, vendor: 'VetMed Supplies', expiryDate: '' });
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  // --- EXPENSE DIALOG ---
  const [newExpense, setNewExpense] = useState({ title: '', category: 'Medical Supplies', amount: 0, date: new Date().toISOString().split('T')[0], mode: 'UPI', notes: '' });
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // --- WHATSAPP BROADCAST ---
  const [broadcastTemplate, setBroadcastTemplate] = useState('monsoon_grooming');
  const [customBroadcastText, setCustomBroadcastText] = useState('🎉 Monsoon offer at Pawtectors - 20% off deworming and grooming packages this week. Reply to book a slot!');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // --- QR TAG MODAL ---
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [newQRTag, setNewQRTag] = useState({ serial: 'PM-', petName: 'Bruno', ownerName: 'Rajesh Kumar' });

  // --- REAL DATA LOADING ───
  const fetchData = async () => {
    if (!provider?.id) return;
    try {
      // 1. Fetch bookings
      const bookingsData = await bookingsApi.getAll({ provider_id: provider.id });
      const mappedAppointments = bookingsData.map((b: any) => ({
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

      const finalAppointments = mappedAppointments.length > 0 
        ? mappedAppointments 
        : initialAppointments;
      setAppointments(finalAppointments);

      // 2. Fetch real pet parents / clients from clinic-pet-parents API
      try {
        const realClients = await clinicPetParentsApi.list(provider.id);
        if (realClients && realClients.length > 0) {
          const mappedClients = realClients.map((c: any) => ({
            id: c.id,
            name: c.full_name || 'Unknown',
            email: c.email || '',
            phone: c.mobile_number || '',
            address: [c.city, c.state].filter(Boolean).join(', ') || 'Registered Pet Parent',
            pets: (c.pets || []).map((p: any) => ({
              name: p.name,
              type: p.type?.charAt(0).toUpperCase() + p.type?.slice(1) || 'Pet',
              breed: p.breed || p.type || 'Mixed',
              age: p.age_months ? `${Math.floor(p.age_months / 12) > 0 ? Math.floor(p.age_months / 12) + ' yr' : p.age_months + ' mo'}` : 'Unknown',
            })),
          }));
          setClients(mappedClients);
        } else {
          // Fallback: derive clients from appointments if no explicit relationships exist
          const clientMap = new Map<string, any>();
          initialClients.forEach(c => clientMap.set(c.phone, c));
          finalAppointments.forEach(a => {
            if (a.phone && !clientMap.has(a.phone)) {
              clientMap.set(a.phone, {
                id: `c_${a.id}`,
                name: a.ownerName,
                email: `${a.ownerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
                phone: a.phone,
                address: 'Registered Pet Parent',
                pets: [{ name: a.petName, type: a.breed.includes('Cat') ? 'Cat' : 'Dog', breed: a.breed, age: a.age }]
              });
            }
          });
          setClients(Array.from(clientMap.values()));
        }
      } catch (clientErr) {
        console.error('Failed to load clinic clients:', clientErr);
        // Fallback to appointment-derived clients
        const clientMap = new Map<string, any>();
        initialClients.forEach(c => clientMap.set(c.phone, c));
        setClients(Array.from(clientMap.values()));
      }

      // 3. Fetch bills
      const billsData = await billsApi.getAll({ provider_id: provider.id });
      const mappedInvoices = billsData.map((b: any) => ({
        id: `INV-${b.id.substring(0, 8).toUpperCase()}`,
        clientName: b.profile_id,
        date: b.bill_date,
        subtotal: b.total_amount - (b.tax_amount || 0),
        cgst: (b.tax_amount || 0) / 2,
        sgst: (b.tax_amount || 0) / 2,
        total: b.total_amount,
        items: [
          { name: 'Consultation Charges', price: Number(b.consultation_charges || 0), qty: 1 },
          { name: 'Treatment Charges', price: Number(b.treatment_charges || 0), qty: 1 },
          { name: 'Medicine Charges', price: Number(b.medicine_charges || 0), qty: 1 },
        ].filter(item => item.price > 0),
        status: b.status === 'paid' ? 'Paid' : 'Unpaid',
        mode: 'Cash'
      }));
      setInvoices(mappedInvoices.length > 0 ? mappedInvoices : initialInvoices);

    } catch (error) {
      console.error('Failed to load clinic database:', error);
    }
  };

  useEffect(() => {
    if (provider?.id) {
      fetchData();
    }
  }, [provider?.id]);

  // --- STATISTICS ---
  const totalRevenue = useMemo(() => invoices.reduce((sum, item) => sum + item.total, 0), [invoices]);
  const totalExp = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);
  
  // Use today's live date for OPD visits count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppCount = useMemo(() => appointments.filter(a => a.date === todayStr || a.date === '2026-08-18').length, [appointments]);
  const pendingAppCount = useMemo(() => appointments.filter(a => a.status === 'Pending').length, [appointments]);
  const lowStockCount = useMemo(() => inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length, [inventory]);

  // --- HANDLERS ---
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApp.petName || !newApp.ownerName || !newApp.phone) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    try {
      const payload = {
        provider_id: provider.id,
        pet_name: newApp.petName,
        pet_type: newApp.service.toLowerCase().includes('cat') || newApp.breed.toLowerCase().includes('cat') ? 'cat' : 'dog',
        owner_name: newApp.ownerName,
        owner_email: `${newApp.ownerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        owner_phone: newApp.phone,
        booking_date: newApp.date,
        booking_time: newApp.time,
        service_category: 'clinic',
        service_name: newApp.service,
        status: 'confirmed',
        amount: 500,
        notes: `Doctor: ${newApp.doctor}`
      };
      await bookingsApi.create(payload);
      toast({ title: 'Appointment Booked', description: `Successfully booked appointment for ${newApp.petName}.` });
      fetchData();
      setIsAppModalOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to create appointment on server.', variant: 'destructive' });
    }
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.phone || !newClient.petName) {
      toast({ title: 'Validation Error', description: 'Please fill in Client Name, Phone and Pet Name.', variant: 'destructive' });
      return;
    }
    const createdClient = {
      id: `c${clients.length + 1}`,
      name: newClient.name,
      email: newClient.email || 'N/A',
      phone: newClient.phone,
      address: newClient.address || 'N/A',
      pets: [{ name: newClient.petName, type: newClient.petType, breed: newClient.petBreed || 'Mixed', age: newClient.petAge || 'Unknown' }]
    };
    setClients([createdClient, ...clients]);
    setIsClientModalOpen(false);
    toast({ title: 'Client Registered', description: `Registered client ${newClient.name} with pet ${newClient.petName}.` });
  };

  const handleCreateConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const activeClient = clients[Number(consultation.clientIndex)];
      const pet = activeClient?.pets?.[Number(consultation.petIndex)];
      if (!pet) return;

      const payload = {
        pet_id: '00000000-0000-0000-0000-000000000000',
        provider_id: provider.id,
        diagnosis: consultation.diagnosis,
        treatment: consultation.treatment,
        doctor_notes: consultation.symptoms,
        doctor_name: 'Dr. Ramesh Sharma',
        prescriptions: consultation.prescription ? [
          {
            medicine_name: consultation.prescription,
            dosage: '1 unit',
            frequency: 'As prescribed',
            duration: '5 days',
            instructions: 'Take after food'
          }
        ] : []
      };
      await medicalRecordsApi.create(payload as any);
      toast({ title: 'Medical Record Saved', description: 'Successfully recorded consultation details.' });
      setIsConsultationModalOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save medical record.', variant: 'destructive' });
    }
  };

  const handleGenerateCertificate = () => {
    const title = certificateTemplates.find(t => t.type === certType)?.name || 'Certificate';
    const htmlContent = `
      <div style="font-family: 'Urbanist', Arial, sans-serif; border: 12px double #07332a; padding: 40px; background-color: #fcfbfa; color: #1c1917; max-width: 650px; margin: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 4px; position: relative;">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; font-weight: 800; color: rgba(0, 122, 101, 0.05); pointer-events: none; white-space: nowrap; user-select: none;">PAWTECTORS VET</div>
        
        <div style="text-align: center; border-bottom: 2px solid #007a65; padding-bottom: 20px; margin-bottom: 35px;">
          <h2 style="color: #07332a; font-size: 26px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1.5px;">Pawtectors Clinic & Hospital</h2>
          <p style="margin: 0; font-size: 13px; color: #6b6a65;">Business Synergy Center, 5th Block, Jayanagar, Bengaluru - 560011</p>
          <p style="margin: 3px 0 0 0; font-size: 13px; color: #6b6a65;">GSTIN: 29AAVCP4829K1Z0 | Tel: +91-70470 37587</p>
        </div>

        <div style="text-align: center; margin-bottom: 35px;">
          <h1 style="color: #007a65; font-size: 22px; text-decoration: underline; margin: 0 0 10px 0; font-weight: 700; text-transform: capitalize;">${title}</h1>
          <p style="margin: 0; font-size: 12px; color: #787c80;">Ref ID: CERT-${Math.floor(100000 + Math.random() * 900000)}</p>
        </div>

        <div style="line-height: 1.8; font-size: 15px; margin-bottom: 40px; text-align: justify;">
          This is to certify that the pet animal described below has been examined on this date by the undersigned veterinarian and is found to be in healthy physical condition.
          <br/><br/>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 35%;">Pet Name:</td>
              <td style="padding: 6px 0; border-bottom: 1px solid #e5e5e0;">${certForm.petName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Breed / Species:</td>
              <td style="padding: 6px 0; border-bottom: 1px solid #e5e5e0;">${certForm.breed}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Age / Gender:</td>
              <td style="padding: 6px 0; border-bottom: 1px solid #e5e5e0;">${certForm.age} / Neutered Male</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Owner (Pet Parent):</td>
              <td style="padding: 6px 0; border-bottom: 1px solid #e5e5e0;">${certForm.petParent}</td>
            </tr>
            ${certType === 'anti_rabies' ? `
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Vaccine Administered:</td>
              <td style="padding: 6px 0; border-bottom: 1px solid #e5e5e0;">${certForm.vaccineBrand} (Lot: ${certForm.lotNo})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Date of Immunization:</td>
              <td style="padding: 6px 0; border-bottom: 1px solid #e5e5e0;">${certForm.dateOfVaccination}</td>
            </tr>
            ` : ''}
          </table>
          <br/>
          The animal displays no clinical signs of infectious or contagious diseases and, based on the records, is up-to-date with all local mandatory vaccine protocols.
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; padding-top: 20px;">
          <div style="text-align: center; width: 45%;">
            <div style="height: 40px; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #007a65; transform: rotate(-3deg);">PAWTECTORS</div>
            <div style="border-top: 1px solid #787c80; padding-top: 5px; font-size: 12px; color: #787c80;">Official Clinic Seal</div>
          </div>
          <div style="text-align: center; width: 45%;">
            <div style="height: 40px; font-family: 'Georgia', serif; font-style: italic; font-size: 20px; color: #07332a;">${certForm.signDr}</div>
            <div style="border-top: 1px solid #787c80; padding-top: 5px; font-size: 12px; color: #787c80;">Authorized Vet Signature</div>
          </div>
        </div>
      </div>
    `;
    setCertPreviewHtml(htmlContent);
    setIsCertModalOpen(true);
  };

  const handlePrintCertificate = () => {
    if (!certPreviewHtml) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Certificate</title>
            <style>
              body { margin: 0; padding: 20px; background-color: #fff; }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;700;800&display=swap" rel="stylesheet">
          </head>
          <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; font-family: sans-serif; font-size: 14px; background: #007a65; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Document</button>
            </div>
            ${certPreviewHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleAddBillItem = () => {
    setBillItems([...billItems, { name: '', price: 0, qty: 1 }]);
  };

  const handleRemoveBillItem = (idx: number) => {
    const updated = billItems.filter((_, i) => i !== idx);
    setBillItems(updated.length ? updated : [{ name: '', price: 0, qty: 1 }]);
  };

  const handleUpdateBillItem = (idx: number, field: string, val: any) => {
    const updated = billItems.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: val };
      }
      return item;
    });
    setBillItems(updated);
  };

  const handleGenerateInvoice = () => {
    const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cgst = parseFloat((subtotal * 0.09).toFixed(2));
    const sgst = parseFloat((subtotal * 0.09).toFixed(2));
    const total = subtotal + cgst + sgst;
    const invId = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newInv = {
      id: invId,
      clientName: billClient,
      date: new Date().toISOString().split('T')[0],
      items: [...billItems],
      subtotal,
      cgst,
      sgst,
      total,
      status: 'Paid',
      mode: 'UPI'
    };

    setPreviewInvoiceData(newInv);
    setIsBillModalOpen(true);
  };

  const handleFinalizeInvoice = async () => {
    if (!previewInvoiceData) return;
    try {
      const activeClient = clients.find(c => c.name === previewInvoiceData.clientName);
      const consultationCharges = previewInvoiceData.items.find((i: any) => i.name.toLowerCase().includes('consultation'))?.price || 0;
      const treatmentCharges = previewInvoiceData.items.find((i: any) => i.name.toLowerCase().includes('treatment'))?.price || 0;
      const medicineCharges = previewInvoiceData.items.filter((i: any) => !i.name.toLowerCase().includes('consultation') && !i.name.toLowerCase().includes('treatment')).reduce((sum: number, i: any) => sum + i.price, 0);

      const payload = {
        provider_id: provider.id,
        profile_id: activeClient?.id || '00000000-0000-0000-0000-000000000000',
        bill_date: previewInvoiceData.date,
        consultation_charges: consultationCharges,
        treatment_charges: treatmentCharges,
        medicine_charges: medicineCharges,
        tax_amount: previewInvoiceData.cgst + previewInvoiceData.sgst,
        total_amount: previewInvoiceData.total,
        status: 'paid'
      };
      await billsApi.create(payload as any);
      toast({ title: 'Invoice Finalized', description: `GST Invoice ${previewInvoiceData.id} for ${previewInvoiceData.clientName} generated & saved.` });
      fetchData();
      setIsBillModalOpen(false);
      setBillItems([{ name: 'Consultation Fee', price: 500, qty: 1 }]);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save bill on server.', variant: 'destructive' });
    }
  };

  const handlePrintInvoice = () => {
    if (!previewInvoiceData) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const itemsHtml = previewInvoiceData.items.map((item: any, i: number) => `
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
            <title>Tax Invoice - ${previewInvoiceData.id}</title>
            <style>
              body { font-family: 'Urbanist', Arial, sans-serif; padding: 30px; color: #1c1917; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #07332a; color: white; padding: 12px; text-align: left; }
              td { padding: 12px; border-bottom: 1px solid #e5e5e0; }
              .header { border-bottom: 2px solid #007a65; padding-bottom: 20px; margin-bottom: 30px; }
              .no-print { text-align: center; margin-bottom: 20px; }
              @media print { .no-print { display: none; } }
            </style>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;700;800&display=swap" rel="stylesheet">
          </head>
          <body>
            <div class="no-print">
              <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; background: #007a65; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Invoice</button>
            </div>
            <div class="header">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <h1 style="color: #07332a; margin: 0 0 5px 0; font-size: 24px;">Pawtectors Veterinary Clinic</h1>
                  <p style="margin: 0; font-size: 13px; color: #6b6a65;">Jayanagar 5th Block, Bengaluru, India</p>
                  <p style="margin: 0; font-size: 13px; color: #6b6a65;">GSTIN: 29AAVCP4829K1Z0 | care@pawtectors.com</p>
                </div>
                <div style="text-align: right;">
                  <h2 style="color: #007a65; margin: 0 0 5px 0;">TAX INVOICE</h2>
                  <p style="margin: 0; font-weight: bold;">Invoice No: ${previewInvoiceData.id}</p>
                  <p style="margin: 0; font-size: 13px; color: #6b6a65;">Date: ${previewInvoiceData.date}</p>
                </div>
              </div>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h3 style="margin-bottom: 5px; color: #07332a;">Billed To:</h3>
              <p style="margin: 0; font-weight: 600;">${previewInvoiceData.clientName}</p>
              <p style="margin: 0; font-size: 13px; color: #6b6a65;">Registered Pet Parent</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 5%;">#</th>
                  <th style="width: 50%;">Description</th>
                  <th style="width: 15%; text-align: right;">Unit Price</th>
                  <th style="width: 10%; text-align: center;">Qty</th>
                  <th style="width: 20%; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top: 30px; display: flex; justify-content: flex-end;">
              <div style="width: 350px;">
                <table style="width: 100%;">
                  <tr>
                    <td style="border: none; padding: 6px 0;">Subtotal:</td>
                    <td style="border: none; padding: 6px 0; text-align: right; font-weight: 600;">₹${previewInvoiceData.subtotal}</td>
                  </tr>
                  <tr>
                    <td style="border: none; padding: 6px 0;">CGST (9%):</td>
                    <td style="border: none; padding: 6px 0; text-align: right;">₹${previewInvoiceData.cgst}</td>
                  </tr>
                  <tr>
                    <td style="border: none; padding: 6px 0;">SGST (9%):</td>
                    <td style="border: none; padding: 6px 0; text-align: right;">₹${previewInvoiceData.sgst}</td>
                  </tr>
                  <tr style="border-top: 2px solid #007a65;">
                    <td style="border: none; padding: 10px 0; font-weight: bold; font-size: 16px; color: #07332a;">Grand Total:</td>
                    <td style="border: none; padding: 10px 0; text-align: right; font-weight: bold; font-size: 16px; color: #007a65;">₹${previewInvoiceData.total}</td>
                  </tr>
                </table>
              </div>
            </div>

            <div style="margin-top: 50px; text-align: center; border-top: 1px solid #e5e5e0; padding-top: 20px; font-size: 12px; color: #787c80;">
              Thank you for trusting Pawtectors for your pet's healthcare! This is a GST-compliant digital invoice.
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleShareWhatsApp = () => {
    toast({ title: 'WhatsApp Broadcast Shared', description: 'Simulated WhatsApp link sharing for this invoice completed. Alert sent to client.' });
  };

  const handleAddStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStock.itemName) return;
    const added = {
      id: `inv${inventory.length + 1}`,
      ...newStock,
      status: newStock.stock === 0 ? 'Out of Stock' : newStock.stock < 10 ? 'Low Stock' : 'In Stock'
    };
    setInventory([added, ...inventory]);
    setIsStockModalOpen(false);
    toast({ title: 'Inventory Logged', description: `Added ${newStock.itemName} to clinic stock.` });
  };

  const handleAddExpenseItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || newExpense.amount <= 0) return;
    const added = {
      id: `exp${expenses.length + 1}`,
      ...newExpense
    };
    setExpenses([added, ...expenses]);
    setIsExpenseModalOpen(false);
    toast({ title: 'Expense Logged', description: `Registered operational expense: ${newExpense.title}` });
  };

  const handleToggleLostMode = (tagId: string) => {
    const updated = qrTags.map(tag => {
      if (tag.id === tagId) {
        const nextState = !tag.lostMode;
        if (nextState) {
          const newLog = {
            tagSerial: tag.serial,
            petName: tag.petName,
            time: 'Just Now',
            location: 'Koramangala, Bengaluru (Accuracy 14m)',
            ip: '122.164.73.54',
            alertSent: true
          };
          setLogs([newLog, ...logs]);
          toast({ title: 'Lost Mode Activated', description: `Alert broadcasts will be sent to all scans on QR tag ${tag.serial}` });
        }
        return { ...tag, lostMode: nextState, status: nextState ? 'Lost' : 'Active' };
      }
      return tag;
    });
    setQRTags(updated);
  };

  const handleRegisterQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQRTag.serial) return;
    const added = {
      id: `qr${qrTags.length + 1}`,
      serial: newQRTag.serial,
      petName: newQRTag.petName,
      ownerName: newQRTag.ownerName,
      status: 'Active',
      lostMode: false,
      scans: 0,
      lastScan: 'N/A'
    };
    setQRTags([added, ...qrTags]);
    setIsQRModalOpen(false);
    toast({ title: 'QR Tag Bound', description: `QR Tag serial ${newQRTag.serial} successfully linked to ${newQRTag.petName}.` });
  };

  const handleSendBroadcast = () => {
    setIsSendingBroadcast(true);
    setTimeout(() => {
      setIsSendingBroadcast(false);
      toast({ title: 'Campaign Delivered', description: `WhatsApp Broadcast sent to all ${clients.length} registered pet parents.` });
    }, 2000);
  };

  // --- FILTERS ---
  const filteredAppointments = appointments.filter(a => 
    a.petName.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.ownerName.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.doctor.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.service.toLowerCase().includes(appSearch.toLowerCase())
  );

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.phone.includes(clientSearch) ||
    c.pets.some(p => p.name.toLowerCase().includes(clientSearch.toLowerCase()))
  );

  const filteredInventory = inventory.filter(i => 
    i.itemName.toLowerCase().includes(invSearch.toLowerCase()) ||
    i.category.toLowerCase().includes(invSearch.toLowerCase()) ||
    i.vendor.toLowerCase().includes(invSearch.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] flex items-center justify-center">
        <div className="animate-pulse text-stone-500 font-display">Loading Clinic OS session...</div>
      </div>
    );
  }

  if (!user || !provider || provider.category !== 'clinic') {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4 md:p-8 font-sans text-stone-850">
        <div className="absolute top-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl rounded-[2.5rem] border border-slate-200/50 bg-[#faf9f6]/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[640px] md:h-[680px]">
          
          <div className="w-full md:w-[48%] p-6 md:p-10 flex flex-col justify-between bg-gradient-to-tr from-amber-500/10 via-[#faf9f6] to-transparent h-full md:max-h-[680px]">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200/80 bg-white/60 shadow-sm backdrop-blur-sm">
                <img src={pawtectorsLogo} alt="Pawtectors" className="w-5 h-5 object-contain" />
                <span className="font-semibold text-xs tracking-wide text-stone-800">Pawtectors</span>
              </div>
              <button onClick={() => navigate('/admin')} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-200/60 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors text-[10px] font-bold">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            <div className="my-auto py-6 space-y-6 flex-grow flex flex-col justify-center min-h-0">
              <div className="space-y-1">
                <h2 className="text-3xl font-display font-extrabold text-stone-900 tracking-tight">Clinic OS Portal</h2>
                <p className="text-stone-500 text-xs font-medium">Sign in to manage OPD visits, records & GST bills</p>
              </div>

              {loginErrors.submit && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700 rounded-2xl shrink-0">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-xs font-semibold">{loginErrors.submit}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleDashboardLogin} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label htmlFor="login-email" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">Doctor / Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input id="login-email" type="email" placeholder="doctor@vetclinic.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="pl-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner" required />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between px-1">
                    <label htmlFor="login-password" className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Password</label>
                    <Link to="/forgot-password" className="text-[10px] font-semibold text-amber-600 hover:text-amber-700 hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input id="login-password" type={showLoginPassword ? 'text' : 'password'} placeholder="Enter password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="pl-11 pr-11 h-12 bg-white/60 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-400/20 rounded-full text-xs shadow-inner" required />
                    <button type="button" onClick={() => setShowLoginPassword(prev => !prev)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600" tabIndex={-1}>
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 mt-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 font-bold shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all active:scale-[0.98] border-0" disabled={loginLoading}>
                  {loginLoading ? 'Authenticating Clinic...' : 'Access Clinic OS Dashboard ➔'}
                </Button>
              </form>
            </div>

            <div className="flex items-center justify-between text-[10px] text-stone-400 border-t border-stone-100 pt-4 mt-2 shrink-0">
              <span>Veterinary SaaS Platform</span>
              <Link to="/legal-terms" className="hover:underline text-stone-500 font-medium">Terms</Link>
            </div>
          </div>

          <div className="hidden md:block w-[52%] p-3 h-full">
            <div className="relative w-full h-full rounded-[2rem] bg-cover bg-center overflow-hidden flex items-end shadow-inner" style={{ backgroundImage: `url(${dashboardMockup})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent" />
              <div className="relative z-10 m-6 p-4 bg-white/75 backdrop-blur-md border border-white/25 rounded-2xl shadow-xl w-[90%] max-w-sm transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Active Workspace Sync</span>
                </div>
                <h5 className="text-xs font-bold text-stone-850">Realtime Clinic Admin Workspace</h5>
                <p className="text-[10px] text-stone-500 leading-normal mt-0.5 font-sans">Manage consultations, vaccination schedules, medicines, invoices, and keep patient files fully updated live.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Veterinary Clinic Management Software | Pawtectors</title>
        <meta name="description" content="Manage appointments, digital pet health records, billing, inventory, and automated WhatsApp reminders." />
      </Helmet>

      <div className="font-pemilyy min-h-screen bg-pemilyy-beige text-stone-900 flex flex-col">
        <header className="bg-pemilyy-dark text-white px-6 py-4 flex items-center justify-between border-b border-pemilyy-dark/30 shadow-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white/10 rounded-full transition"
              title="Go back to role selections"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-7 h-7 text-sky-400" />
              <div>
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-1.5">
                  Pawtectors <span className="text-sky-400 text-sm bg-sky-400/10 px-2 py-0.5 rounded-full border border-sky-400/20 font-medium">Clinic OS</span>
                </h1>
                <p className="text-[11px] text-sky-200/70">Veterinary Clinic Management Platform</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 hidden md:flex items-center gap-2 text-xs text-stone-300">
              <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse" />
              <span>Location: <strong>Jayanagar Center</strong></span>
            </div>
            
            <div className="relative">
              <Bell className="w-6 h-6 text-stone-300 hover:text-white cursor-pointer" />
              {logs.filter(l => l.alertSent).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold text-white">
                  {logs.filter(l => l.alertSent).length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 border-l border-white/20 pl-5">
              <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center font-bold text-white shadow-inner cursor-pointer" onClick={signOut} title="Click to log out">
                {provider.name[0].toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold">{provider.name}</p>
                <p className="text-[10px] text-sky-200/80">Clinic Admin &bull; <span className="underline cursor-pointer" onClick={signOut}>Logout</span></p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row">
          <aside className="w-full md:w-64 bg-white border-r border-pemilyy-sand flex flex-col justify-between py-6">
            <div className="px-4 space-y-7">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 px-3">Main Menu</p>
                <nav className="space-y-1">
                  {[
                    { id: 'overview', label: 'Overview Dashboard', icon: TrendingUp },
                    { id: 'scheduler', label: 'Appointments Calendar', icon: Calendar },
                    { id: 'records', label: 'Digital E-Records', icon: FileText },
                    { id: 'billing', label: 'GST Invoicing & Bills', icon: IndianRupee },
                    
                    { id: 'inventory', label: 'Vendor & Inventory', icon: Package },
                    { id: 'expenses', label: 'Clinic Expense Book', icon: ClipboardList },
                    { id: 'broadcast', label: 'WhatsApp Broadcasts', icon: Send }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive 
                            ? 'bg-pemilyy-primary text-white shadow-md shadow-pemilyy-primary/20' 
                            : 'text-stone-600 hover:text-pemilyy-primary hover:bg-pemilyy-beige/50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-pemilyy-sand">
                <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 px-3">System Vitals</p>
                <div className="bg-pemilyy-beige/60 p-3 rounded-xl border border-pemilyy-sand space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">OPD Queue:</span>
                    <span className="font-bold text-pemilyy-dark">{appointments.filter(a => a.status === 'Confirmed').length} waiting</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Low Stock items:</span>
                    <span className={`font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-sky-600'}`}>{lowStockCount} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Total Consultations:</span>
                    <span className="font-bold text-sky-600">{appointments.filter(a => a.status === 'Completed').length} done</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 pt-6 border-t border-pemilyy-sand mt-6">
              <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl text-center space-y-1 flex flex-col items-center">
                <img
                  src={pawtectorsLogo}
                  alt="Pawtectors"
                  className="w-8 h-8 object-contain filter drop-shadow-[0_0_4px_rgba(14,165,233,0.3)] mb-1"
                />
                <h4 className="text-xs font-bold text-pemilyy-dark">Pawtectors Integration</h4>
                <p className="text-[10px] text-stone-500 leading-normal">Cloud sync with the pet parent mobile app is online.</p>
              </div>
            </div>
          </aside>

          <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-pemilyy-dark font-pemilyy">Clinic Overview</h2>
                    <p className="text-stone-500 text-sm">Real-time indicators and operational insights for Jayanagar Center.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl shadow"
                      onClick={() => setIsAppModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Book Appointment
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-white border-pemilyy-sand hover:bg-pemilyy-beige rounded-xl"
                      onClick={() => {
                        setBillItems([{ name: 'Consultation Fee', price: 500, qty: 1 }]);
                        setBillClient('Rajesh Kumar');
                        setIsBillModalOpen(true);
                      }}
                    >
                      <IndianRupee className="w-4 h-4 mr-2 text-pemilyy-primary" /> Create Invoice
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {[
                    { title: 'Today\'s OPD Visits', val: todayAppCount, desc: `${pendingAppCount} yet to consult`, icon: Calendar, color: 'border-l-pemilyy-primary text-pemilyy-primary' },
                    { title: 'Total Collections (Gross)', val: `₹${totalRevenue.toLocaleString('en-IN')}`, desc: 'GST bills processed', icon: IndianRupee, color: 'border-l-sky-600 text-sky-600' },
                    { title: 'Registered Pet Parents', val: clients.length, desc: 'Unified database profiles', icon: Users, color: 'border-l-cyan-600 text-cyan-600' },
                    { title: 'Operational Expenses', val: `₹${totalExp.toLocaleString('en-IN')}`, desc: ' salaries, rent & utilities', icon: ClipboardList, color: 'border-l-amber-600 text-amber-600' }
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <Card key={i} className={`shadow-sm bg-white border border-pemilyy-sand border-l-4 ${stat.color} rounded-2xl`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                            {stat.title}
                          </CardTitle>
                          <Icon className="w-4 h-4 opacity-70" />
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">{stat.val}</p>
                          <p className="text-[11px] text-stone-500 mt-1">{stat.desc}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-pemilyy-dark font-pemilyy">Revenue vs Operational Expenditures</CardTitle>
                      <CardDescription>Monthly data comparison including consultation, vaccinations, and retail sales.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#007a65" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#007a65" stopOpacity={0}/>
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                          <Tooltip formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']} />
                          <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Gross revenue" />
                          <Area type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Total expenses" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  
                  <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl">
                    <CardHeader className="pb-3 border-b border-pemilyy-sand">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-pemilyy-dark font-pemilyy flex items-center gap-1.5">
                          <Users className="w-5 h-5 text-pemilyy-primary" /> OPD Waiting Queue
                        </CardTitle>
                        <Badge className="bg-amber-100 text-amber-800 border border-amber-200">Live Status</Badge>
                      </div>
                      <CardDescription>Appointments waiting for consult today.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 px-0">
                      <ScrollArea className="h-[250px] px-6">
                        <div className="space-y-4">
                          {appointments.filter(a => a.status === 'Confirmed').map((app, i) => (
                            <div key={i} className="flex gap-3 text-xs border-b border-pemilyy-beige pb-3 last:border-0 last:pb-0">
                              <div className="mt-0.5">
                                <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                              </div>
                              <div className="space-y-1 flex-grow">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-stone-900">{app.petName} ({app.breed})</span>
                                  <span className="text-[10px] text-stone-400">{app.time}</span>
                                </div>
                                <p className="text-stone-600 font-medium">Owner: {app.ownerName} &bull; Dr: {app.doctor}</p>
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-stone-400">Service: {app.service}</span>
                                  <span className="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">WhatsApp Alert Sent</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-pemilyy-dark font-pemilyy">Today's Appointment Log</CardTitle>
                        <CardDescription>Schedule list for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" className="text-pemilyy-primary text-xs font-semibold hover:bg-pemilyy-beige/50" onClick={() => setActiveTab('scheduler')}>
                        View Scheduler <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent className="px-0">
                      <ScrollArea className="h-[200px] px-6">
                        <div className="space-y-3">
                          {appointments.filter(a => a.date === '2026-08-18').map((app) => (
                            <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border border-pemilyy-beige bg-pemilyy-beige/20 text-xs">
                              <div>
                                <p className="font-bold text-stone-900">{app.petName} ({app.breed})</p>
                                <p className="text-stone-500 mt-0.5">Parent: {app.ownerName} &bull; Dr: {app.doctor.split(' ').pop()}</p>
                              </div>
                              <div className="text-right space-y-1">
                                <span className="font-semibold block">{app.time}</span>
                                <Badge className={app.status === 'Completed' ? 'bg-sky-100 text-sky-800' : 'bg-blue-100 text-blue-800'}>
                                  {app.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-pemilyy-dark font-pemilyy">Drug & Vaccine Shortages</CardTitle>
                        <CardDescription>Critical stock and upcoming expirations requiring orders.</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" className="text-pemilyy-primary text-xs font-semibold hover:bg-pemilyy-beige/50" onClick={() => setActiveTab('inventory')}>
                        Manage Inventory <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent className="px-0">
                      <ScrollArea className="h-[200px] px-6">
                        <div className="space-y-3">
                          {inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border border-red-50 bg-red-50/20 text-xs">
                              <div>
                                <p className="font-bold text-stone-900">{inv.itemName}</p>
                                <p className="text-stone-500 mt-0.5">Vendor: {inv.vendor} &bull; Expiry: {inv.expiryDate}</p>
                              </div>
                              <div className="text-right space-y-1">
                                <span className="font-semibold block text-stone-700">{inv.stock} {inv.unit} left</span>
                                <Badge className={inv.status === 'Out of Stock' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}>
                                  {inv.status}
                                </Badge>
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

            {activeTab === 'scheduler' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-pemilyy-dark font-pemilyy">Appointments Scheduler</h2>
                    <p className="text-stone-500 text-sm">Organize consultations, surgeries, vaccination bookings, and grooming slots.</p>
                  </div>
                  <Button 
                    className="bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl shadow"
                    onClick={() => setIsAppModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Book New Slot
                  </Button>
                </div>

                <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl">
                  <CardHeader className="pb-3 border-b border-pemilyy-sand">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                        <Input 
                          placeholder="Search pet, owner, service..." 
                          value={appSearch}
                          onChange={(e) => setAppSearch(e.target.value)}
                          className="pl-9 rounded-xl border-pemilyy-sand bg-pemilyy-beige/30 focus:bg-white"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className="bg-pemilyy-beige hover:bg-pemilyy-beige/80 text-pemilyy-dark font-semibold px-3 py-1.5 rounded-lg border border-pemilyy-sand cursor-pointer flex items-center gap-1">
                          <Filter className="w-3.5 h-3.5 text-pemilyy-primary" /> Filter Doctors
                        </Badge>
                        <Badge className="bg-sky-50 text-sky-800 font-semibold px-3 py-1.5 rounded-lg border border-sky-100 flex items-center gap-1">
                          Today ({appointments.filter(a => a.date === '2026-08-18').length})
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-pemilyy-beige/30">
                        <TableRow>
                          <TableHead className="font-bold">Time & Date</TableHead>
                          <TableHead className="font-bold">Patient (Pet Name)</TableHead>
                          <TableHead className="font-bold">Breed / Age</TableHead>
                          <TableHead className="font-bold">Owner Contact</TableHead>
                          <TableHead className="font-bold">Assigned Practitioner</TableHead>
                          <TableHead className="font-bold">Service Type</TableHead>
                          <TableHead className="font-bold">WhatsApp Reminder</TableHead>
                          <TableHead className="font-bold">Status</TableHead>
                          <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-12 text-stone-400">
                              No matching appointments found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAppointments.map((app) => (
                            <TableRow key={app.id} className="hover:bg-pemilyy-beige/10">
                              <TableCell className="font-medium">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-stone-900">{app.time}</p>
                                  <p className="text-[10px] text-stone-400">{app.date}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-pemilyy-primary font-bold text-xs border border-emerald-100">
                                    {app.petName[0]}
                                  </div>
                                  <span className="font-bold text-stone-800">{app.petName}</span>
                                </div>
                              </TableCell>
                              <TableCell>{app.breed} &bull; {app.age}</TableCell>
                              <TableCell>
                                <div className="space-y-0.5 text-xs">
                                  <p className="font-semibold text-stone-800">{app.ownerName}</p>
                                  <p className="text-stone-400">{app.phone}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-stone-700">{app.doctor}</span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-pemilyy-sand bg-pemilyy-beige/40 text-stone-700 text-[10px]">
                                  {app.service}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${
                                    app.whatsappStatus === 'Delivered' ? 'bg-sky-500' :
                                    app.whatsappStatus === 'Sent' ? 'bg-blue-500' : 'bg-amber-400'
                                  }`} />
                                  <span>WhatsApp Status: <strong>{app.whatsappStatus}</strong></span>
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                  <button onClick={() => handleSendWhatsApp(app.phone, `Hi ${app.ownerName}, reminder for ${app.petName}'s appointment at Pawtectors Clinic on ${app.date} at ${app.time}.`)} className="p-1 hover:bg-sky-50 hover:text-sky-600 rounded text-stone-400 transition" title="Send WhatsApp">
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  app.status === 'Completed' ? 'bg-sky-100 text-sky-800 hover:bg-sky-100' :
                                  app.status === 'Confirmed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                  'bg-amber-100 text-amber-800 hover:bg-amber-100'
                                }>
                                  {app.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1.5">
                                  {app.status === 'Confirmed' && (
                                    <Button 
                                      size="sm" 
                                      className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg h-8 px-2.5"
                                      onClick={() => handleMarkCompleted(app.id)}
                                    >
                                      Mark Completed
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg h-8 px-2.5"
                                    onClick={() => {
                                      setAppointments(prev => prev.map(a => a.id === app.id ? { ...a, status: 'Cancelled' } : a));
                                      toast({ title: 'Appointment Cancelled', description: 'The schedule entry has been revoked.', variant: 'destructive' });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'records' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-pemilyy-dark font-pemilyy">E-Medical Health Records</h2>
                    <p className="text-stone-500 text-sm">Consultation entries, diagnostic logs, prescription manager, and official health certificates.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl shadow"
                      onClick={() => setIsClientModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Register Client & Pet
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-white border-pemilyy-sand hover:bg-pemilyy-beige rounded-xl"
                      onClick={() => setIsConsultationModalOpen(true)}
                    >
                      <ClipboardList className="w-4 h-4 mr-2 text-pemilyy-primary" /> Log Consultation
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl lg:col-span-2">
                    <CardHeader className="pb-3 border-b border-pemilyy-sand">
                      <CardTitle className="text-lg font-bold text-pemilyy-dark font-pemilyy">Patient Directory</CardTitle>
                      <div className="relative mt-2">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                        <Input 
                          placeholder="Search clients or pets..." 
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="pl-9 rounded-xl border-pemilyy-sand bg-pemilyy-beige/30"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-bold">Client Name</TableHead>
                            <TableHead className="font-bold">Contact Info</TableHead>
                            <TableHead className="font-bold">Registered Pets</TableHead>
                            <TableHead className="font-bold">Address</TableHead>
                            <TableHead className="text-right font-bold">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredClients.map((client) => (
                            <TableRow key={client.id}>
                              <TableCell className="font-bold text-stone-800">{client.name}</TableCell>
                              <TableCell>
                                <div className="space-y-0.5 text-xs text-stone-500">
                                  <p>{client.phone}</p>
                                  <p>{client.email}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {client.pets.map((pet, pIdx) => (
                                    <div key={pIdx} className="flex items-center gap-1.5">
                                      <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px]">
                                        {pet.name} ({pet.breed})
                                      </Badge>
                                      <span className="text-[10px] text-stone-400">{pet.age}</span>
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-stone-500 max-w-[150px] truncate">{client.address}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-pemilyy-primary text-xs font-semibold hover:bg-pemilyy-beige"
                                  onClick={() => {
                                    setCertForm({
                                      petParent: client.name,
                                      petName: client.pets[0].name,
                                      breed: client.pets[0].breed,
                                      age: client.pets[0].age,
                                      dateOfVaccination: '2026-08-10',
                                      vaccineBrand: 'Megavac Rabies',
                                      lotNo: 'R-7721A',
                                      signDr: 'Dr. Ramesh Sharma'
                                    });
                                    toast({ title: 'Client Selected', description: `Client data loaded into certificate fields.` });
                                  }}
                                >
                                  Load Pet
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-pemilyy-dark font-pemilyy flex items-center gap-2">
                        <Award className="w-5 h-5 text-pemilyy-primary" /> Health Certificates
                      </CardTitle>
                      <CardDescription>Select a category template below to generate standard printable certificates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-stone-400">Select Template Type</Label>
                        <Select value={certType} onValueChange={(val) => setCertType(val)}>
                          <SelectTrigger className="rounded-xl border-pemilyy-sand">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {certificateTemplates.map(t => (
                              <SelectItem key={t.type} value={t.type}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="border border-pemilyy-sand bg-pemilyy-beige/20 p-3 rounded-xl space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Pet Parent Name</Label>
                            <Input value={certForm.petParent} onChange={e => setCertForm({...certForm, petParent: e.target.value})} className="h-8 text-xs rounded-lg border-pemilyy-sand bg-white" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Pet Name</Label>
                            <Input value={certForm.petName} onChange={e => setCertForm({...certForm, petName: e.target.value})} className="h-8 text-xs rounded-lg border-pemilyy-sand bg-white" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Breed</Label>
                            <Input value={certForm.breed} onChange={e => setCertForm({...certForm, breed: e.target.value})} className="h-8 text-xs rounded-lg border-pemilyy-sand bg-white" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Age</Label>
                            <Input value={certForm.age} onChange={e => setCertForm({...certForm, age: e.target.value})} className="h-8 text-xs rounded-lg border-pemilyy-sand bg-white" />
                          </div>
                        </div>

                        {certType === 'anti_rabies' && (
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1 col-span-2">
                              <Label className="text-[10px]">Vaccine Brand / Lot</Label>
                              <Input value={certForm.vaccineBrand} onChange={e => setCertForm({...certForm, vaccineBrand: e.target.value})} className="h-8 text-xs rounded-lg border-pemilyy-sand bg-white" placeholder="Brand Name" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Lot No</Label>
                              <Input value={certForm.lotNo} onChange={e => setCertForm({...certForm, lotNo: e.target.value})} className="h-8 text-xs rounded-lg border-pemilyy-sand bg-white" placeholder="Lot ID" />
                            </div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <Label className="text-[10px]">Signing Veterinarian</Label>
                          <Input value={certForm.signDr} onChange={e => setCertForm({...certForm, signDr: e.target.value})} className="h-8 text-xs rounded-lg border-pemilyy-sand bg-white" />
                        </div>
                      </div>

                      <Button 
                        onClick={handleGenerateCertificate}
                        className="w-full bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl shadow mt-2"
                      >
                        <Printer className="w-4 h-4 mr-2" /> Generate Certificate
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-pemilyy-dark font-pemilyy">GST Tax Invoicing & Invoices</h2>
                    <p className="text-stone-500 text-sm">Generate GST-compliant bills (CGST 9% + SGST 9%) with WhatsApp delivery options.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl lg:col-span-2">
                    <CardHeader className="pb-3 border-b border-pemilyy-sand">
                      <CardTitle className="text-lg font-bold text-pemilyy-dark font-pemilyy">New GST Invoice Builder</CardTitle>
                      <CardDescription>Select a registered pet parent and compile line-items for billing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Billed To (Pet Parent)</Label>
                          <Select value={billClient} onValueChange={(val) => setBillClient(val)}>
                            <SelectTrigger className="rounded-xl border-pemilyy-sand">
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map(c => (
                                <SelectItem key={c.id} value={c.name}>{c.name} ({c.pets[0].name})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Billing Date</Label>
                          <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="rounded-xl border-pemilyy-sand bg-pemilyy-beige/20" disabled />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold uppercase tracking-wider text-stone-400">Line Items & Services</Label>
                          <Button variant="ghost" size="sm" onClick={handleAddBillItem} className="text-pemilyy-primary text-xs font-bold hover:bg-pemilyy-beige">
                            <PlusCircle className="w-4 h-4 mr-1" /> Add Service / Drug
                          </Button>
                        </div>

                        <div className="space-y-3.5">
                          {billItems.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-end border-b border-pemilyy-beige pb-3 last:border-0 last:pb-0">
                              <div className="flex-1 space-y-1.5">
                                <Label className="text-[10px] text-stone-400">Item / Procedure Description</Label>
                                <Input 
                                  value={item.name} 
                                  placeholder="e.g., Rabies Booster, Consultation, Grooming" 
                                  onChange={e => handleUpdateBillItem(idx, 'name', e.target.value)} 
                                  className="h-9 text-xs rounded-xl border-pemilyy-sand" 
                                />
                              </div>
                              <div className="w-24 space-y-1.5">
                                <Label className="text-[10px] text-stone-400">Unit Price</Label>
                                <Input 
                                  type="number" 
                                  value={item.price || ''} 
                                  placeholder="₹"
                                  onChange={e => handleUpdateBillItem(idx, 'price', parseFloat(e.target.value) || 0)} 
                                  className="h-9 text-xs rounded-xl border-pemilyy-sand" 
                                />
                              </div>
                              <div className="w-16 space-y-1.5">
                                <Label className="text-[10px] text-stone-400">Qty</Label>
                                <Input 
                                  type="number" 
                                  value={item.qty || ''} 
                                  onChange={e => handleUpdateBillItem(idx, 'qty', parseInt(e.target.value) || 0)} 
                                  className="h-9 text-xs rounded-xl border-pemilyy-sand text-center" 
                                />
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleRemoveBillItem(idx)}
                                className="h-9 w-9 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-pemilyy-beige/40 p-4 rounded-2xl border border-pemilyy-sand flex flex-col items-end gap-2.5 text-sm">
                        <div className="flex justify-between w-64 text-stone-500">
                          <span>Subtotal:</span>
                          <span className="font-semibold text-stone-800">₹{billItems.reduce((sum, item) => sum + (item.price * item.qty), 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between w-64 text-stone-500 text-xs">
                          <span>CGST (9.0%):</span>
                          <span>₹{(billItems.reduce((sum, item) => sum + (item.price * item.qty), 0) * 0.09).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-64 text-stone-500 text-xs">
                          <span>SGST (9.0%):</span>
                          <span>₹{(billItems.reduce((sum, item) => sum + (item.price * item.qty), 0) * 0.09).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-64 font-bold text-base border-t border-pemilyy-sand pt-2.5 mt-1 text-pemilyy-dark">
                          <span>Grand Total:</span>
                          <span>₹{(billItems.reduce((sum, item) => sum + (item.price * item.qty), 0) * 1.18).toFixed(2)}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={handleGenerateInvoice}
                        className="w-full bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl shadow py-5 font-bold"
                      >
                        <IndianRupee className="w-5 h-5 mr-2" /> Compile GST Invoice
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-pemilyy-dark font-pemilyy">Recent GST Invoices</CardTitle>
                      <CardDescription>Processed billing reports and status logs.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                      <ScrollArea className="h-[430px] px-6">
                        <div className="space-y-4">
                          {invoices.map((inv) => (
                            <div key={inv.id} className="p-4 rounded-xl border border-pemilyy-beige bg-pemilyy-beige/10 space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-stone-900">{inv.id}</span>
                                <Badge className="bg-emerald-100 text-emerald-800">{inv.status}</Badge>
                              </div>
                              <div className="space-y-0.5 text-xs">
                                <p className="font-semibold text-stone-800">{inv.clientName}</p>
                                <p className="text-stone-400">Date: {inv.date} &bull; Mode: {inv.mode}</p>
                              </div>
                              <div className="flex items-center justify-between border-t border-pemilyy-beige pt-2 text-xs">
                                <span className="text-stone-500">Gross (Inc. GST)</span>
                                <span className="font-extrabold text-pemilyy-primary">₹{inv.total.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-end gap-1.5">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => {
                                    setPreviewInvoiceData(inv);
                                    setIsBillModalOpen(true);
                                  }}
                                  className="h-8 w-8 text-stone-500 hover:text-pemilyy-primary hover:bg-pemilyy-beige rounded-lg"
                                >
                                  <Printer className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={handleShareWhatsApp}
                                  className="h-8 w-8 text-stone-500 hover:text-pemilyy-whatsapp hover:bg-emerald-50 rounded-lg"
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>
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

            {activeTab === 'inventory' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-pemilyy-dark font-pemilyy">Vendor Profiles & Inventory</h2>
                    <p className="text-stone-500 text-sm">Vaccine counts, stock limits, supplier invoices, and medication expiry trackers.</p>
                  </div>
                  <Button 
                    className="bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl shadow"
                    onClick={() => setIsStockModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Log Stock Consignment
                  </Button>
                </div>

                <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl">
                  <CardHeader className="pb-3 border-b border-pemilyy-sand">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                        <Input 
                          placeholder="Search items, category..." 
                          value={invSearch}
                          onChange={(e) => setInvSearch(e.target.value)}
                          className="pl-9 rounded-xl border-pemilyy-sand bg-pemilyy-beige/30"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                          {lowStockCount} Shortage Warnings
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold">Item Description</TableHead>
                          <TableHead className="font-bold">Category</TableHead>
                          <TableHead className="font-bold">In-Stock Count</TableHead>
                          <TableHead className="font-bold">Price / Unit</TableHead>
                          <TableHead className="font-bold">Default Vendor</TableHead>
                          <TableHead className="font-bold">Expiration Date</TableHead>
                          <TableHead className="font-bold">Status</TableHead>
                          <TableHead className="text-right font-bold">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-bold text-stone-800">{item.itemName}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell className="font-bold text-stone-700">{item.stock} {item.unit}</TableCell>
                            <TableCell>₹{item.price}</TableCell>
                            <TableCell className="text-xs text-stone-600">{item.vendor}</TableCell>
                            <TableCell className="text-xs text-stone-500">{item.expiryDate || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge className={
                                item.status === 'In Stock' ? 'bg-emerald-100 text-emerald-800' :
                                item.status === 'Low Stock' ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-pemilyy-sand hover:bg-pemilyy-beige rounded-xl h-8"
                                onClick={() => {
                                  setInventory(prev => prev.map(i => i.id === item.id ? { ...i, stock: i.stock + 10, status: 'In Stock' } : i));
                                  toast({ title: 'Stock Replenished', description: `Added 10 units to ${item.itemName}` });
                                }}
                              >
                                +10 Quick Add
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

            {activeTab === 'expenses' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-pemilyy-dark font-pemilyy">Operational Clinic Expenses</h2>
                    <p className="text-stone-500 text-sm">Log non-invoice overheads: staff salaries, utility bills, rent, and vendor purchases.</p>
                  </div>
                  <Button 
                    className="bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl shadow"
                    onClick={() => setIsExpenseModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Log Expense Entry
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl lg:col-span-2">
                    <CardHeader className="pb-3 border-b border-pemilyy-sand">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-pemilyy-dark font-pemilyy">Cashbook Ledger</CardTitle>
                        <div className="relative w-48">
                          <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-stone-400" />
                          <Input 
                            placeholder="Search..." 
                            value={expenseSearch}
                            onChange={(e) => setExpenseSearch(e.target.value)}
                            className="pl-8 h-8 text-xs rounded-xl border-pemilyy-sand bg-pemilyy-beige/30"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-bold">Expense Details</TableHead>
                            <TableHead className="font-bold">Category</TableHead>
                            <TableHead className="font-bold">Logged Date</TableHead>
                            <TableHead className="font-bold">Payment Mode</TableHead>
                            <TableHead className="text-right font-bold">Amount Paid</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expenses.filter(e => e.title.toLowerCase().includes(expenseSearch.toLowerCase()) || e.category.toLowerCase().includes(expenseSearch.toLowerCase())).map((exp) => (
                            <TableRow key={exp.id}>
                              <TableCell>
                                <div className="space-y-0.5">
                                  <p className="font-bold text-stone-900">{exp.title}</p>
                                  <p className="text-[10px] text-stone-400">{exp.notes}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-pemilyy-sand bg-pemilyy-beige/40 text-stone-600 text-[10px]">
                                  {exp.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-stone-500">{exp.date}</TableCell>
                              <TableCell className="text-xs text-stone-600">{exp.mode}</TableCell>
                              <TableCell className="text-right font-extrabold text-red-600">₹{exp.amount.toLocaleString('en-IN')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl border-l-4 border-l-red-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Month-to-date Expenditures</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl md:text-3xl font-extrabold text-stone-900">₹{totalExp.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-stone-400 mt-1">Rent and Salaries occupy {Math.round((67000 / totalExp) * 100)}% of expenses.</p>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm bg-white border border-stone-200 rounded-2xl border-l-4 border-l-sky-600">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-stone-400 uppercase">Estimated Net Profit</p>
                          <p className="text-2xl md:text-3xl font-extrabold text-sky-600">₹{(totalRevenue - totalExp).toLocaleString('en-IN')}</p>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">Margin: {Math.round(((totalRevenue - totalExp) / totalRevenue) * 100)}% positive liquidity.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'broadcast' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-pemilyy-dark font-pemilyy">WhatsApp Broadcasts Center</h2>
                    <p className="text-stone-500 text-sm">Send campaign messages, deworming alerts, and greetings to all registered pet parents at once.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-pemilyy-dark font-pemilyy">Compose WhatsApp Campaign</CardTitle>
                      <CardDescription>Select predefined templates or draft custom broadcasts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <Label>Campaign Template</Label>
                        <Select 
                          value={broadcastTemplate} 
                          onValueChange={(val) => {
                            setBroadcastTemplate(val);
                            if (val === 'monsoon_grooming') {
                              setCustomBroadcastText('🎉 Monsoon offer at Pawtectors - 20% off deworming and grooming packages this week. Reply to book a slot!');
                            } else if (val === 'deworming_booster') {
                              setCustomBroadcastText('🐾 Friendly reminder from Pawtectors: Your pet\'s annual deworming booster is due this month. Click to select a convenient slot.');
                            } else if (val === 'clinic_holiday') {
                              setCustomBroadcastText('📢 Clinic Notice: Pawtectors Clinic will remain closed on 25th August 2026 for staff training. Emergency doctors are available on call.');
                            }
                          }}
                        >
                          <SelectTrigger className="rounded-xl border-pemilyy-sand">
                            <SelectValue placeholder="Choose template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monsoon_grooming">Monsoon Grooming Discount Alert</SelectItem>
                            <SelectItem value="deworming_booster">Vaccine / Deworming Reminder campaign</SelectItem>
                            <SelectItem value="clinic_holiday">Holiday / Schedule Notice Alert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Broadcast Text (Limit 320 chars)</Label>
                        <Textarea 
                          value={customBroadcastText}
                          onChange={e => setCustomBroadcastText(e.target.value)}
                          className="rounded-xl border-pemilyy-sand bg-pemilyy-beige/10 min-h-[120px] text-sm"
                        />
                      </div>

                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-xs space-y-2 text-stone-700">
                        <p className="font-bold text-pemilyy-dark flex items-center gap-1.5"><Send className="w-4 h-4" /> Broadcast Details:</p>
                        <p>&bull; Target Audience: <strong>All {clients.length} Registered Pet Parents</strong></p>
                        <p>&bull; Delivery Mode: <strong>Official WhatsApp Business Gateway API</strong></p>
                        <p>&bull; Est. Delivery Rate: <strong>99.8% within 2 minutes</strong></p>
                      </div>

                      <Button 
                        onClick={handleSendBroadcast}
                        disabled={isSendingBroadcast}
                        className="w-full bg-pemilyy-whatsapp hover:bg-emerald-700 text-white rounded-xl shadow py-5 font-bold"
                      >
                        {isSendingBroadcast ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Transmitting broadcast...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" /> Launch WhatsApp Campaign
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold text-stone-400 uppercase tracking-widest">WhatsApp Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-[#efeae2] p-4 rounded-2xl border border-stone-300 relative shadow-inner max-w-sm mx-auto">
                          <div className="bg-white p-3 rounded-xl shadow-sm text-xs space-y-2 max-w-[85%] border border-stone-200">
                            <p className="text-stone-800 leading-normal font-medium">{customBroadcastText}</p>
                            <p className="text-[9px] text-stone-400 text-right">10:02 AM ✓✓</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm bg-white border border-pemilyy-sand rounded-2xl p-4 text-xs text-stone-500 leading-relaxed">
                      <p className="font-bold text-pemilyy-dark mb-1">💡 Pro Tip for Vets:</p>
                      Automatic reminder triggers for booster dates are auto-sent based on vaccine card entries inside E-Records. Use campaigns for clinic-wide events.
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* --- DIALOG MODALS --- */}

        <Dialog open={isAppModalOpen} onOpenChange={setIsAppModalOpen}>
          <DialogContent className="rounded-2xl max-w-md font-pemilyy border-pemilyy-sand">
            <DialogHeader>
              <DialogTitle className="font-bold text-pemilyy-dark">Book New Appointment</DialogTitle>
              <DialogDescription>Input details to reserve an OPD or service slot.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="petName">Pet Name *</Label>
                  <Input id="petName" value={newApp.petName} onChange={e => setNewApp({...newApp, petName: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g. Bruno" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="breed">Breed / Species</Label>
                  <Input id="breed" value={newApp.breed} onChange={e => setNewApp({...newApp, breed: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g. Labrador" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input id="ownerName" value={newApp.ownerName} onChange={e => setNewApp({...newApp, ownerName: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g. Rajesh Kumar" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" value={newApp.phone} onChange={e => setNewApp({...newApp, phone: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="10 digit number" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="time">Time Slot</Label>
                  <Select value={newApp.time} onValueChange={(val) => setNewApp({...newApp, time: val})}>
                    <SelectTrigger className="rounded-xl border-pemilyy-sand">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['09:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '03:00 PM', '04:30 PM'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="doctor">Practitioner</Label>
                  <Select value={newApp.doctor} onValueChange={(val) => setNewApp({...newApp, doctor: val})}>
                    <SelectTrigger className="rounded-xl border-pemilyy-sand">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Ramesh Sharma">Dr. Ramesh Sharma</SelectItem>
                      <SelectItem value="Dr. Meera Nair">Dr. Meera Nair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="service">Service Category</Label>
                <Select value={newApp.service} onValueChange={(val) => setNewApp({...newApp, service: val})}>
                  <SelectTrigger className="rounded-xl border-pemilyy-sand">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation">General Consultation</SelectItem>
                    <SelectItem value="Vaccination">Vaccination booster</SelectItem>
                    <SelectItem value="Deworming">Deworming procedure</SelectItem>
                    <SelectItem value="Grooming">Grooming packages</SelectItem>
                    <SelectItem value="Surgery Follow-up">Surgery check-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAppModalOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl">Save Appointment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
          <DialogContent className="rounded-2xl max-w-md font-pemilyy border-pemilyy-sand">
            <DialogHeader>
              <DialogTitle className="font-bold text-pemilyy-dark">Register Client & Pet</DialogTitle>
              <DialogDescription>Log a new pet parent and animal details to the DB.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cName">Client / Parent Name *</Label>
                <Input id="cName" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g. Anand Desai" required />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="cPhone">Phone Number *</Label>
                  <Input id="cPhone" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g. 9876543210" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cEmail">Email Address</Label>
                  <Input id="cEmail" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g. anand@gmail.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cAddr">Home Address</Label>
                <Input id="cAddr" value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="Apartment, Street Name, Bengaluru" />
              </div>

              <div className="border-t border-pemilyy-sand pt-3 space-y-3">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Linked Pet Info</p>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="pName">Pet Name *</Label>
                    <Input id="pName" value={newClient.petName} onChange={e => setNewClient({...newClient, petName: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g. Whiskers" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Species Type</Label>
                    <Select value={newClient.petType} onValueChange={(val) => setNewClient({...newClient, petType: val})}>
                      <SelectTrigger className="rounded-xl border-pemilyy-sand">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dog">Dog</SelectItem>
                        <SelectItem value="Cat">Cat</SelectItem>
                        <SelectItem value="Bird">Bird</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="pBreed">Breed</Label>
                    <Input id="pBreed" value={newClient.petBreed} onChange={e => setNewClient({...newClient, petBreed: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g. Persian" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pAge">Age (e.g., 2 yrs)</Label>
                    <Input id="pAge" value={newClient.petAge} onChange={e => setNewClient({...newClient, petAge: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g. 2 years" />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsClientModalOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl">Save Client File</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isConsultationModalOpen} onOpenChange={setIsConsultationModalOpen}>
          <DialogContent className="rounded-2xl max-w-md font-pemilyy border-pemilyy-sand">
            <DialogHeader>
              <DialogTitle className="font-bold text-pemilyy-dark">Log Consultation Session</DialogTitle>
              <DialogDescription>Create e-medical prescription records for the visit.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateConsultation} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Select Client & Pet Profile</Label>
                <Select value={consultation.clientIndex} onValueChange={(val) => setConsultation({...consultation, clientIndex: val})}>
                  <SelectTrigger className="rounded-xl border-pemilyy-sand">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>{c.name} &bull; Pet: {c.pets[0].name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sympt">Clinical Symptoms</Label>
                <Input id="sympt" value={consultation.symptoms} onChange={e => setConsultation({...consultation, symptoms: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g., loss of appetite, itching, fever" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="diag">Diagnosis</Label>
                <Input id="diag" value={consultation.diagnosis} onChange={e => setConsultation({...consultation, diagnosis: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g., Flea allergy dermatitis" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="presc">Prescribed Medications & Dosage (Rx)</Label>
                <Textarea id="presc" value={consultation.prescription} onChange={e => setConsultation({...consultation, prescription: e.target.value})} className="rounded-xl border-pemilyy-sand bg-pemilyy-beige/10" placeholder="e.g., Amoxycillin syrup 5ml twice daily for 5 days" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fup">Next Follow Up / Booster Due Date</Label>
                <Input id="fup" type="date" value={consultation.nextFollowUp} onChange={e => setConsultation({...consultation, nextFollowUp: e.target.value})} className="rounded-xl border-pemilyy-sand" />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsConsultationModalOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl">Save Consultation</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isCertModalOpen} onOpenChange={setIsCertModalOpen}>
          <DialogContent className="rounded-2xl max-w-2xl font-pemilyy border-pemilyy-sand bg-[#fcfbfa]">
            <DialogHeader>
              <DialogTitle className="font-bold text-pemilyy-dark">Health Certificate Preview</DialogTitle>
              <DialogDescription>Check details before final printing or WhatsApp sharing.</DialogDescription>
            </DialogHeader>
            
            <div className="border border-pemilyy-sand p-4 rounded-xl max-h-[400px] overflow-y-auto bg-white flex items-center justify-center">
              {certPreviewHtml && (
                <div dangerouslySetInnerHTML={{ __html: certPreviewHtml }} />
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsCertModalOpen(false)} className="rounded-xl">Close</Button>
              <Button onClick={handlePrintCertificate} className="bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl">
                <Printer className="w-4 h-4 mr-2" /> Print Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isBillModalOpen} onOpenChange={setIsBillModalOpen}>
          <DialogContent className="rounded-2xl max-w-2xl font-pemilyy border-pemilyy-sand bg-white">
            <DialogHeader>
              <DialogTitle className="font-bold text-pemilyy-dark">Tax Invoice Review</DialogTitle>
              <DialogDescription>Confirm subtotal and tax values before recording transaction.</DialogDescription>
            </DialogHeader>
            
            {previewInvoiceData && (
              <div className="border border-pemilyy-sand p-5 rounded-xl space-y-4 text-sm bg-white">
                <div className="flex justify-between border-b border-pemilyy-beige pb-3">
                  <div>
                    <h3 className="font-extrabold text-pemilyy-dark text-base">Pawtectors Clinic</h3>
                    <p className="text-[11px] text-stone-500">GSTIN: 29AAVCP4829K1Z0</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">INVOICE: {previewInvoiceData.id}</p>
                    <p className="text-[11px] text-stone-400">Date: {previewInvoiceData.date}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-stone-400">Billed To:</p>
                  <p className="font-bold">{previewInvoiceData.clientName}</p>
                </div>

                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-pemilyy-beige/40">
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewInvoiceData.items.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-pemilyy-beige">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 text-right">₹{item.price}</td>
                        <td className="p-2 text-center">{item.qty}</td>
                        <td className="p-2 text-right font-semibold">₹{item.price * item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex flex-col items-end gap-1.5 pt-2 text-xs">
                  <div className="flex justify-between w-48 text-stone-500">
                    <span>Taxable Subtotal:</span>
                    <span>₹{previewInvoiceData.subtotal}</span>
                  </div>
                  <div className="flex justify-between w-48 text-stone-400">
                    <span>CGST (9.0%):</span>
                    <span>₹{previewInvoiceData.cgst}</span>
                  </div>
                  <div className="flex justify-between w-48 text-stone-400">
                    <span>SGST (9.0%):</span>
                    <span>₹{previewInvoiceData.sgst}</span>
                  </div>
                  <div className="flex justify-between w-48 font-extrabold text-sm border-t border-pemilyy-sand pt-1.5 text-pemilyy-primary">
                    <span>Grand Total:</span>
                    <span>₹{previewInvoiceData.total}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsBillModalOpen(false)} className="rounded-xl">Cancel</Button>
              {previewInvoiceData && invoices.some(i => i.id === previewInvoiceData.id) ? (
                <>
                  <Button onClick={handlePrintInvoice} className="bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl">
                    <Printer className="w-4 h-4 mr-2" /> Print PDF
                  </Button>
                  <Button onClick={handleShareWhatsApp} className="bg-pemilyy-whatsapp hover:bg-emerald-700 text-white rounded-xl">
                    <Share2 className="w-4 h-4 mr-2" /> WhatsApp Share
                  </Button>
                </>
              ) : (
                <Button onClick={handleFinalizeInvoice} className="bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl font-bold">
                  Conclude & Save Bill
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
          <DialogContent className="rounded-2xl max-w-md font-pemilyy border-pemilyy-sand">
            <DialogHeader>
              <DialogTitle className="font-bold text-pemilyy-dark">Log Stock Consignment</DialogTitle>
              <DialogDescription>Input quantities for vaccines, drugs, or grooming retail supplies.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStockItem} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input id="itemName" value={newStock.itemName} onChange={e => setNewStock({...newStock, itemName: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g. Megavac DHPPi" required />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={newStock.category} onValueChange={(val) => setNewStock({...newStock, category: val})}>
                    <SelectTrigger className="rounded-xl border-pemilyy-sand">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vaccines">Vaccines</SelectItem>
                      <SelectItem value="Parasiticides">Parasiticides</SelectItem>
                      <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                      <SelectItem value="Grooming">Grooming Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="itemPrice">Price per Unit (₹)</Label>
                  <Input id="itemPrice" type="number" value={newStock.price} onChange={e => setNewStock({...newStock, price: parseFloat(e.target.value) || 0})} className="rounded-xl border-pemilyy-sand" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="itemQty">Quantity Received</Label>
                  <Input id="itemQty" type="number" value={newStock.stock} onChange={e => setNewStock({...newStock, stock: parseInt(e.target.value) || 0})} className="rounded-xl border-pemilyy-sand" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="itemUnit">Unit Type</Label>
                  <Input id="itemUnit" value={newStock.unit} onChange={e => setNewStock({...newStock, unit: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g. Vials, Packs, Bottles" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label>Default Vendor</Label>
                  <Select value={newStock.vendor} onValueChange={(val) => setNewStock({...newStock, vendor: val})}>
                    <SelectTrigger className="rounded-xl border-pemilyy-sand">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VetMed Supplies">VetMed Supplies</SelectItem>
                      <SelectItem value="PetCare Distributors">PetCare Distributors</SelectItem>
                      <SelectItem value="Himalaya Animal Health">Himalaya Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="itemExpiry">Expiry Date</Label>
                  <Input id="itemExpiry" type="date" value={newStock.expiryDate} onChange={e => setNewStock({...newStock, expiryDate: e.target.value})} className="rounded-xl border-pemilyy-sand" />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsStockModalOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl">Save Stock Entry</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
          <DialogContent className="rounded-2xl max-w-md font-pemilyy border-pemilyy-sand">
            <DialogHeader>
              <DialogTitle className="font-bold text-pemilyy-dark">Log Operational Expense</DialogTitle>
              <DialogDescription>Log salaries, rent, utility bills, or maintenance expenditures.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddExpenseItem} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="expTitle">Expense Description *</Label>
                <Input id="expTitle" value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g. Internet & Wifi Bill" required />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={newExpense.category} onValueChange={(val) => setNewExpense({...newExpense, category: val})}>
                    <SelectTrigger className="rounded-xl border-pemilyy-sand">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Salaries">Staff Salaries</SelectItem>
                      <SelectItem value="Rent">Rent & Lease</SelectItem>
                      <SelectItem value="Utilities">Utilities & Bills</SelectItem>
                      <SelectItem value="Medical Supplies">Medical Supplies Purchase</SelectItem>
                      <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expAmount">Amount Paid (₹) *</Label>
                  <Input id="expAmount" type="number" value={newExpense.amount || ''} onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})} className="rounded-xl border-pemilyy-sand" placeholder="₹" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="expDate">Payment Date</Label>
                  <Input id="expDate" type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="rounded-xl border-pemilyy-sand" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Payment Mode</Label>
                  <Select value={newExpense.mode} onValueChange={(val) => setNewExpense({...newExpense, mode: val})}>
                    <SelectTrigger className="rounded-xl border-pemilyy-sand">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI (GPay / PhonePe)</SelectItem>
                      <SelectItem value="NEFT">Bank Transfer (NEFT/IMPS)</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expNotes">Remarks / Notes</Label>
                <Input id="expNotes" value={newExpense.notes} onChange={e => setNewExpense({...newExpense, notes: e.target.value})} className="rounded-xl border-pemilyy-sand" placeholder="e.g. Paid from main SBI savings account" />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsExpenseModalOpen(false)} className="rounded-xl">Cancel</Button>
                <Button type="submit" className="bg-pemilyy-primary hover:bg-pemilyy-primary/90 text-white rounded-xl">Save Expense File</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        
      </div>
    </>
  );
};

export default ClinicAdminDashboard;
