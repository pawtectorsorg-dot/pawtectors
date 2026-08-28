import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Store, Stethoscope, LogOut, Plus, Calendar, TrendingUp, Eye, EyeOff, User, Mail, Lock, Phone, MapPin, Tag, PawPrint,
  CheckCircle2, XCircle, Shield, Activity, AlertTriangle
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { bookingsApi, adminApi, providersApi, petTypesApi, platformAdminApi, type BookingRow, type AdminUserRow, type ProviderRow, type PetTypeRow, type PlatformStats, type AdminClinicRow } from '@/lib/api';
import { useServices } from '@/hooks/useServices';
import AdminServiceList from '@/components/AdminServiceList';
import ServiceForm from '@/components/ServiceForm';
import { PetService, ServiceCategory } from '@/types/pet-services';

interface Booking {
  id: string;
  serviceName: string;
  petName: string;
  petType: string;
  ownerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  status?: string;
  notes?: string;
  createdAt: string;
}

const SystemAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string>('');
  
  const isAdmin = sessionStorage.getItem('adminType') === 'system' && sessionStorage.getItem('adminEmail');

  // User activity states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [petTypes, setPetTypes] = useState<PetTypeRow[]>([]);
  const [newPetTypeName, setNewPetTypeName] = useState('');
  // VMP platform stats
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [allClinics, setAllClinics] = useState<AdminClinicRow[]>([]);
  const [clinicActionLoading, setClinicActionLoading] = useState<string | null>(null);
  const [isAddingPetType, setIsAddingPetType] = useState(false);
  const [isProviderFormOpen, setIsProviderFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderRow | null>(null);
  const [providerForm, setProviderForm] = useState({ name: '', category: 'clinic', email: '', password: '', phone: '', address: '' });
  const [showProviderPassword, setShowProviderPassword] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const { services, addService, updateService, deleteService, isLoading: servicesLoading } = useServices();
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<PetService | null>(null);
  const [currentServiceCategory, setCurrentServiceCategory] = useState<ServiceCategory>('clinic');

  // Check authentication and verify admin role
  useEffect(() => {
    let type = sessionStorage.getItem('adminType');
    let email = sessionStorage.getItem('adminEmail');
    let adminSession = sessionStorage.getItem('pawtectors_admin_session');
    
    if (!type || !email) {
      try {
        const savedLogin = sessionStorage.getItem('pawtectors_admin_login');
        if (savedLogin) {
          const parsed = JSON.parse(savedLogin);
          if (parsed.email && parsed.role === 'admin' && parsed.isAdmin && parsed.type === 'system') {
            type = 'system';
            email = parsed.email;
            adminSession = JSON.stringify(parsed);
            sessionStorage.setItem('adminType', type);
            sessionStorage.setItem('adminEmail', email);
            sessionStorage.setItem('pawtectors_admin_session', adminSession);
            sessionStorage.setItem('pawtectors_auth', JSON.stringify({
              id: parsed.id,
              email: parsed.email,
              role: parsed.role,
              isAdmin: true
            }));
          } else {
            navigate('/admin');
            return;
          }
        } else {
          navigate('/admin');
          return;
        }
      } catch (err) {
        navigate('/admin');
        return;
      }
    }

    if (adminSession) {
      try {
        const sessionData = JSON.parse(adminSession);
        if (sessionData.role !== 'admin' || !sessionData.isAdmin) {
          navigate('/admin');
          return;
        }
      } catch (err) {
        navigate('/admin');
        return;
      }
    }
    
    setAdminEmail(email);
  }, [navigate]);

  // Load user activities from backend API
  useEffect(() => {
    if (!adminEmail) return;
    
    const loadDataFromDatabase = async () => {
      setIsLoadingData(true);
      setDataError('');
      
      try {
        const adminUserId = adminEmail;
        
        let dbBookings;
        if (isAdmin) {
          dbBookings = await bookingsApi.getAll({});
        } else {
          dbBookings = await bookingsApi.getAll({ profile_id: adminUserId });
        }
        
        const mappedBookings: Booking[] = dbBookings.map((b) => ({
          id: b.id,
          serviceName: b.service_name || 'Unknown Service',
          petName: b.pet_name || 'Unknown Pet',
          petType: b.pet_type || 'Unknown Type',
          ownerName: b.owner_name || 'Unknown Owner',
          email: b.owner_email || '',
          phone: b.owner_phone || '',
          date: b.booking_date || new Date().toDateString(),
          status: b.status || 'pending',
          time: b.booking_time || '00:00',
          notes: b.notes || '',
          createdAt: b.created_at || new Date().toISOString(),
        }));
        
        setBookings(mappedBookings);

        const dbUsers = await adminApi.getUsers();
        setUsers(dbUsers);

        try {
          const dbProviders = await providersApi.getAll();
          setProviders(dbProviders || []);
        } catch (err) {
          setProviders([]);
        }

        try {
          const dbPetTypes = await petTypesApi.getAll();
          setPetTypes(dbPetTypes || []);
        } catch (err) {
          setPetTypes([]);
        }

        // Load VMP platform stats
        try {
          const [stats, clinics] = await Promise.allSettled([
            platformAdminApi.getStats(),
            platformAdminApi.getAllClinics(),
          ]);
          if (stats.status === 'fulfilled') setPlatformStats(stats.value);
          if (clinics.status === 'fulfilled') setAllClinics(clinics.value);
        } catch (err) {
          console.warn('Platform stats not available:', err);
        }
        
      } catch (error) {
        console.error('Failed to load data from database:', error);
        setDataError(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setBookings([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    loadDataFromDatabase();
  }, [adminEmail, isAdmin]);

  const handleClinicAction = async (clinicId: string, action: 'activate' | 'deactivate' | 'approve') => {
    setClinicActionLoading(clinicId);
    try {
      if (action === 'activate') await platformAdminApi.activateClinic(clinicId);
      else if (action === 'deactivate') await platformAdminApi.deactivateClinic(clinicId);
      else if (action === 'approve') await platformAdminApi.approveClinic(clinicId);
      setAllClinics(prev => prev.map(c => c.id === clinicId ? {
        ...c,
        is_active: action !== 'deactivate',
        approval_status: action === 'deactivate' ? 'suspended' : 'approved',
      } : c));
      showSuccess(`Clinic ${action}d successfully.`);
    } catch (e: any) {
      showActionError(e.message || 'Action failed');
    } finally {
      setClinicActionLoading(null);
    }
  };

  const clinics = useMemo(() => services.filter(s => s.category === 'clinic'), [services]);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleLogout = () => {
    sessionStorage.removeItem('adminType');
    sessionStorage.removeItem('adminEmail');
    sessionStorage.removeItem('pawtectors_admin_session');
    sessionStorage.removeItem('pawtectors_admin_login');
    sessionStorage.removeItem('pawtectors_auth');
    sessionStorage.removeItem('pawtectors_login_details');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('profile');
    sessionStorage.removeItem('role');
    window.location.href = '/admin';
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showActionError = (message: string) => {
    setActionError(message);
    setTimeout(() => setActionError(''), 4000);
  };

  // Service handlers
  const handleAddService = (category: ServiceCategory) => {
    setCurrentServiceCategory(category);
    setEditingService(null);
    setIsServiceFormOpen(true);
  };

  const handleEditService = (service: PetService) => {
    setCurrentServiceCategory(service.category);
    setEditingService(service);
    setIsServiceFormOpen(true);
  };

  const handleSubmitService = async (serviceData: Omit<PetService, 'id'> & { id?: string }) => {
    try {
      if (editingService) {
        await updateService(editingService.id, serviceData);
        showSuccess('Service updated successfully!');
      } else {
        await addService(serviceData);
        showSuccess('Service added successfully!');
      }
      setIsServiceFormOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await deleteService(id);
      showSuccess('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete this user account? This cannot be undone.')) {
      return;
    }

    try {
      setDeletingUserId(id);
      await adminApi.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      showSuccess('User account deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeletingUserId(null);
    }
  };

  // Providers management handlers
  const handleOpenCreateProvider = () => {
    setEditingProvider(null);
    setProviderForm({ name: '', category: 'clinic', email: '', password: '', phone: '', address: '' });
    setIsProviderFormOpen(true);
  };

  const handleEditProvider = (provider: ProviderRow) => {
    setEditingProvider(provider);
    setProviderForm({
      name: provider.name || '',
      category: provider.category || 'clinic',
      email: provider.email || '',
      password: '',
      phone: provider.phone || '',
      address: provider.address || ''
    });
    setIsProviderFormOpen(true);
  };

  const handleSubmitProvider = async () => {
    try {
      if (editingProvider) {
        await providersApi.update(editingProvider.id, {
          name: providerForm.name,
          category: providerForm.category,
          email: providerForm.email,
          phone: providerForm.phone,
          address: providerForm.address,
          ...(providerForm.password ? { password: providerForm.password } : {})
        });
        showSuccess('Provider updated successfully!');
      } else {
        if (!providerForm.email || !providerForm.password || !providerForm.name) {
          showActionError('Name, email, and password are required for new providers.');
          return;
        }
        await providersApi.create({
          name: providerForm.name,
          category: providerForm.category,
          email: providerForm.email,
          password: providerForm.password,
          phone: providerForm.phone,
          address: providerForm.address
        });
        showSuccess('Provider created successfully!');
      }
      setIsProviderFormOpen(false);
      setEditingProvider(null);
      
      const dbProviders = await providersApi.getAll();
      setProviders(dbProviders || []);
    } catch (error) {
      console.error('Error saving provider:', error);
      showActionError(error instanceof Error ? error.message : 'Failed to save provider.');
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!window.confirm('Delete this provider? This will remove all their service listings and bookings.')) {
      return;
    }
    try {
      await providersApi.delete(id);
      setProviders(prev => prev.filter(p => p.id !== id));
      showSuccess('Provider deleted successfully!');
    } catch (error) {
      console.error('Error deleting provider:', error);
      showActionError(error instanceof Error ? error.message : 'Failed to delete provider.');
    }
  };

  // Pet Types management handlers
  const handleAddPetType = async () => {
    const name = newPetTypeName.trim();
    if (!name) return;

    setIsAddingPetType(true);
    try {
      await petTypesApi.create({ name });
      setNewPetTypeName('');
      showSuccess('Pet type added successfully!');
      const dbPetTypes = await petTypesApi.getAll();
      setPetTypes(dbPetTypes || []);
    } catch (error) {
      console.error('Error adding pet type:', error);
      showActionError(error instanceof Error ? error.message : 'Failed to add pet type.');
    } finally {
      setIsAddingPetType(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Logged in as {adminEmail}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="rounded-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="bg-sky-50 text-sky-800 border border-sky-200 p-4 rounded-xl text-sm">
            {successMessage}
          </div>
        )}
        {actionError && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl text-sm">
            {actionError}
          </div>
        )}
        {dataError && (
          <div className="bg-amber-50 text-amber-800 border border-amber-200 p-4 rounded-xl text-sm">
            {dataError}
          </div>
        )}

        {/* Main Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={activeTab === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('dashboard')}
            size="sm"
            className="gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Dashboard
          </Button>
          <Button 
            variant={activeTab === 'bookings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('bookings')}
            size="sm"
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            Bookings ({bookings.length})
          </Button>
          <Button 
            variant={activeTab === 'manage-clinics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('manage-clinics')}
            size="sm"
            className="gap-2"
          >
            <Stethoscope className="w-4 h-4" />
            Manage Clinics ({clinics.length})
          </Button>
          <Button 
            variant={activeTab === 'clinic-approval' ? 'default' : 'outline'}
            onClick={() => setActiveTab('clinic-approval')}
            size="sm"
            className="gap-2"
          >
            <Shield className="w-4 h-4" />
            Clinic Approval
            {allClinics.filter(c => c.approval_status === 'pending').length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                {allClinics.filter(c => c.approval_status === 'pending').length}
              </span>
            )}
          </Button>
          <Button 
            variant={activeTab === 'providers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('providers')}
            size="sm"
            className="gap-2"
          >
            <Store className="w-4 h-4" />
            Clinic Providers ({providers.filter(p => p.category === 'clinic').length})
          </Button>
          <Button 
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
            size="sm"
            className="gap-2"
          >
            <User className="w-4 h-4" />
            Users ({users.length})
          </Button>
          <Button 
            variant={activeTab === 'pet-types' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pet-types')}
            size="sm"
            className="gap-2"
          >
            <PawPrint className="w-4 h-4" />
            Pet Types ({petTypes.length})
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('bookings')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Bookings</p>
                  <p className="text-lg font-bold">{bookings.length}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('providers')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Clinic Providers</p>
                  <p className="text-lg font-bold">{providers.filter(p => p.category === 'clinic').length}</p>
                </div>
                <Store className="w-4 h-4 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('users')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Users</p>
                  <p className="text-lg font-bold">{users.length}</p>
                </div>
                <User className="w-4 h-4 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('pet-types')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pet Types</p>
                  <p className="text-lg font-bold">{petTypes.length}</p>
                </div>
                <PawPrint className="w-4 h-4 text-secondary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Platform stats from VMP API */}
            {platformStats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold">{platformStats.clinics.total}</p>
                    <p className="text-xs text-muted-foreground">Total Clinics</p>
                    <p className="text-xs text-sky-600 mt-0.5">{platformStats.clinics.active} active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold">{platformStats.petParents.total}</p>
                    <p className="text-xs text-muted-foreground">Pet Parents</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold">{platformStats.pets.total}</p>
                    <p className="text-xs text-muted-foreground">Registered Pets</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold">{platformStats.appointments.total}</p>
                    <p className="text-xs text-muted-foreground">Total Appointments</p>
                    <p className="text-xs text-blue-600 mt-0.5">{platformStats.appointments.completed} completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-2xl font-bold">₹{platformStats.revenue.total.toLocaleString('en-IN', { notation: 'compact' })}</p>
                    <p className="text-xs text-muted-foreground">Platform Revenue</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{platformStats.revenue.transactions} transactions</p>
                  </CardContent>
                </Card>
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>Recent activity — {adminEmail}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Recent Bookings</h3>
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{booking.serviceName}</p>
                        <p className="text-xs text-muted-foreground">{booking.petName} - {booking.date}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{booking.time}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Clinic Approval Tab ── */}
        {activeTab === 'clinic-approval' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" /> Clinic Approval Management
              </CardTitle>
              <CardDescription>Approve, activate, or deactivate clinic accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clinic</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approval</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allClinics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                          No clinics registered yet
                        </TableCell>
                      </TableRow>
                    ) : allClinics.map(clinic => {
                      const isLoading = clinicActionLoading === clinic.id;
                      return (
                        <TableRow key={clinic.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{clinic.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{clinic.category}</p>
                              {clinic.email && <p className="text-xs text-muted-foreground">{clinic.email}</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{clinic.city}, {clinic.state}</p>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{clinic.total_bookings}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={clinic.is_active ? 'default' : 'secondary'}>
                              {clinic.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize border ${
                              clinic.approval_status === 'approved' ? 'bg-sky-100 text-sky-700 border-sky-200' :
                              clinic.approval_status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                              clinic.approval_status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                              {clinic.approval_status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {clinic.approval_status === 'pending' && (
                                <Button size="sm" variant="outline"
                                  className="h-7 text-xs text-sky-700 border-sky-200 hover:bg-sky-50"
                                  disabled={isLoading}
                                  onClick={() => handleClinicAction(clinic.id, 'approve')}>
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                                </Button>
                              )}
                              {!clinic.is_active && (
                                <Button size="sm" variant="outline"
                                  className="h-7 text-xs text-primary border-primary/30"
                                  disabled={isLoading}
                                  onClick={() => handleClinicAction(clinic.id, 'activate')}>
                                  Activate
                                </Button>
                              )}
                              {clinic.is_active && (
                                <Button size="sm" variant="outline"
                                  className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                  disabled={isLoading}
                                  onClick={() => handleClinicAction(clinic.id, 'deactivate')}>
                                  <XCircle className="w-3 h-3 mr-1" /> Suspend
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {activeTab === 'bookings' && (
          <Card>
            <CardHeader>
              <CardTitle>Bookings Management ({bookings.length})</CardTitle>
              <CardDescription>View all appointments in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {isLoadingData ? (
                  <p className="text-center py-8 text-muted-foreground">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No bookings found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Pet Details</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{booking.ownerName}</p>
                              <p className="text-xs text-muted-foreground">{booking.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{booking.petName}</p>
                              <p className="text-xs text-muted-foreground capitalize">{booking.petType}</p>
                            </div>
                          </TableCell>
                          <TableCell>{booking.serviceName}</TableCell>
                          <TableCell>
                            <div>
                              <p>{booking.date}</p>
                              <p className="text-xs text-muted-foreground">{booking.time}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="capitalize">{booking.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {activeTab === 'manage-clinics' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Clinics Management</CardTitle>
                <CardDescription>Manage veterinary clinic listings</CardDescription>
              </div>
              <Button onClick={() => handleAddService('clinic')} size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Clinic
              </Button>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading clinics...</p>
              ) : (
                <AdminServiceList
                  services={clinics}
                  onEdit={handleEditService}
                  onDelete={handleDeleteService}
                />
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'providers' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Clinic Providers ({providers.filter(p => p.category === 'clinic').length})
              </CardTitle>
              <CardDescription>Create and manage veterinary clinic providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={handleOpenCreateProvider} className="gap-2">
                  <Plus className="w-4 h-4" /> Add Clinic Provider
                </Button>
              </div>
              <ScrollArea className="h-[420px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.filter(p => p.category === 'clinic').map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell className="capitalize">{p.category}</TableCell>
                        <TableCell>{p.email || '-'}</TableCell>
                        <TableCell>{p.phone || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEditProvider(p)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteProvider(p.id)}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Users</CardTitle>
              <CardDescription>Manage logins, roles, and account deletions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name || 'Unnamed User'}</TableCell>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.is_active === false ? 'Inactive' : 'Active'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.created_at ? formatDate(user.created_at) : '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deletingUserId === user.id || user.role === 'admin'}
                          >
                            {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {activeTab === 'pet-types' && (
          <Card>
            <CardHeader>
              <CardTitle>Pet Types</CardTitle>
              <CardDescription>Controls the "Pet Type" options customers see on the booking form.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="e.g., Rabbit"
                  value={newPetTypeName}
                  onChange={(e) => setNewPetTypeName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPetType();
                    }
                  }}
                  className="max-w-xs"
                />
                <Button
                  onClick={handleAddPetType}
                  disabled={isAddingPetType || !newPetTypeName.trim()}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {isAddingPetType ? 'Adding...' : 'Add Pet Type'}
                </Button>
              </div>

              {petTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pet types yet — add one above.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {petTypes.map((type) => (
                    <Badge key={type.id} variant="secondary" className="text-sm py-1.5 px-3">
                      <PawPrint className="w-3.5 h-3.5 mr-1.5" />
                      {type.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>

      {/* Service Form Dialog */}
      <Dialog open={isServiceFormOpen} onOpenChange={(open) => {
        if (!open) {
          setIsServiceFormOpen(false);
          setEditingService(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle className="font-display text-xl">
              {editingService ? 'Edit Clinic Listing' : 'Add New Clinic'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto px-6 pb-4 flex-1">
            <ServiceForm
              service={editingService || undefined}
              category={currentServiceCategory}
              onSubmit={handleSubmitService}
              onCancel={() => {
                setIsServiceFormOpen(false);
                setEditingService(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Provider Form Dialog */}
      <Dialog open={isProviderFormOpen} onOpenChange={(open) => {
        if (!open) {
          setIsProviderFormOpen(false);
          setEditingProvider(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
            <DialogTitle className="font-display text-xl">
              {editingProvider ? 'Edit Provider' : 'Add New Provider'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto px-6 py-5 flex-1">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="provider-name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="provider-name"
                    value={providerForm.name}
                    onChange={(e) => setProviderForm(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10 rounded-xl"
                    placeholder="e.g. Happy Paws Clinic"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <div className="bg-muted px-4 py-2.5 rounded-xl text-sm font-semibold capitalize border">
                  {providerForm.category}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="provider-email"
                    type="email"
                    value={providerForm.email}
                    onChange={(e) => setProviderForm(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 rounded-xl"
                    placeholder="provider@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider-password">
                  Password
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">(set only when creating or changing)</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="provider-password"
                    type={showProviderPassword ? 'text' : 'password'}
                    value={providerForm.password}
                    onChange={(e) => setProviderForm(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10 rounded-xl"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProviderPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showProviderPassword ? 'Hide password' : 'Show password'}
                  >
                    {showProviderPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider-phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="provider-phone"
                    type="tel"
                    value={providerForm.phone}
                    onChange={(e) => setProviderForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10 rounded-xl"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider-address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="provider-address"
                    value={providerForm.address}
                    onChange={(e) => setProviderForm(prev => ({ ...prev, address: e.target.value }))}
                    className="pl-10 rounded-xl min-h-[88px]"
                    placeholder="Street, city, state, PIN code"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0">
            <Button variant="outline" className="rounded-full" onClick={() => { setIsProviderFormOpen(false); setEditingProvider(null); }}>Cancel</Button>
            <Button variant="hero" className="rounded-full" onClick={handleSubmitProvider}>{editingProvider ? 'Save Changes' : 'Create Provider'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemAdminDashboard;
