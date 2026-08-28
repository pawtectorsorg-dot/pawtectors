import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, Mail, Phone, MapPin, Save, ArrowLeft, Plus, 
  Trash2, Edit, CheckCircle2, XCircle, Clock, Calendar, 
  IndianRupee, Activity, AlertTriangle, Sparkles 
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChangePasswordCard from '@/components/ChangePasswordCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { petsApi, bookingsApi, medicalRecordsApi, billsApi, type PetRow, type BookingRow } from '@/lib/api';
import { format } from 'date-fns';

const UserProfile = () => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Profile Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email_address: '',
    mobile_number: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    preferred_location: '',
  });
  const [loading, setLoading] = useState(false);

  // Pets Manager State
  const [pets, setPets] = useState<PetRow[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetRow | null>(null);
  const [petFormData, setPetFormData] = useState({
    name: '',
    type: 'dog',
    breed: '',
    age_months: '',
    weight: '',
    gender: 'unknown',
    vaccination_status: '',
    medical_conditions: '',
    allergies: '',
    special_instructions: '',
  });

  // Bookings View State
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Medical Records View State
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Bills & Invoices View State
  const [bills, setBills] = useState<any[]>([]);
  const [isLoadingBills, setIsLoadingBills] = useState(false);

  // Load profile data when component mounts
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email_address: profile.email_address || '',
        mobile_number: profile.mobile_number || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        landmark: profile.landmark || '',
        preferred_location: profile.preferred_location || '',
      });
      fetchPets();
      fetchBookings();
      fetchMedicalRecords();
      fetchBills();
    }
  }, [profile]);

  const fetchMedicalRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const data = await medicalRecordsApi.getAll();
      setMedicalRecords(data);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const fetchBills = async () => {
    setIsLoadingBills(true);
    try {
      const data = await billsApi.getAll({ profile_id: profile?.id });
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setIsLoadingBills(false);
    }
  };

  // CRUD handlers for Pets
  const fetchPets = async () => {
    setIsLoadingPets(true);
    try {
      const data = await petsApi.getMyPets();
      setPets(data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setIsLoadingPets(false);
    }
  };

  const handleOpenAddPet = () => {
    setEditingPet(null);
    setPetFormData({
      name: '',
      type: 'dog',
      breed: '',
      age_months: '',
      weight: '',
      gender: 'unknown',
      vaccination_status: '',
      medical_conditions: '',
      allergies: '',
      special_instructions: '',
    });
    setIsPetDialogOpen(true);
  };

  const handleOpenEditPet = (pet: PetRow) => {
    setEditingPet(pet);
    setPetFormData({
      name: pet.name || '',
      type: pet.type || 'dog',
      breed: pet.breed || '',
      age_months: pet.age_months ? String(pet.age_months) : '',
      weight: pet.weight ? String(pet.weight) : '',
      gender: pet.gender || 'unknown',
      vaccination_status: pet.vaccination_status || '',
      medical_conditions: pet.medical_conditions || '',
      allergies: pet.allergies || '',
      special_instructions: pet.special_instructions || '',
    });
    setIsPetDialogOpen(true);
  };

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petFormData.name || !petFormData.type) {
      toast({
        title: "Validation Error",
        description: "Pet Name and Type are required.",
        variant: "destructive"
      });
      return;
    }

    const payload = {
      name: petFormData.name,
      type: petFormData.type as any,
      breed: petFormData.breed || null,
      age_months: petFormData.age_months ? Number(petFormData.age_months) : null,
      weight: petFormData.weight ? Number(petFormData.weight) : null,
      gender: petFormData.gender as any,
      vaccination_status: petFormData.vaccination_status || null,
      medical_conditions: petFormData.medical_conditions || null,
      allergies: petFormData.allergies || null,
      special_instructions: petFormData.special_instructions || null,
    };

    try {
      if (editingPet) {
        await petsApi.update(editingPet.id, payload);
        toast({
          title: "Pet Updated",
          description: `${petFormData.name}'s profile was updated successfully!`
        });
      } else {
        await petsApi.create(payload);
        toast({
          title: "Pet Added",
          description: `${petFormData.name} has been added successfully!`
        });
      }
      setIsPetDialogOpen(false);
      fetchPets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pet profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePet = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}'s profile?`)) return;
    try {
      await petsApi.delete(id);
      toast({
        title: "Pet Deleted",
        description: `${name}'s profile was removed.`
      });
      fetchPets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete pet profile.",
        variant: "destructive"
      });
    }
  };

  // Bookings Handlers
  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const data = await bookingsApi.getAll({ profile_id: profile?.id });
      // Only keep clinic bookings since other service types are removed
      const clinicOnly = data.filter(b => b.service_category === 'clinic' || !b.service_category);
      setBookings(clinicOnly);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this clinic booking?")) return;
    try {
      await bookingsApi.cancel(id);
      toast({
        title: "Booking Cancelled",
        description: "Your booking was successfully cancelled."
      });
      fetchBookings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel the booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Profile Form Input Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePincodeLookup = async (pincode: string) => {
    const clean = pincode.replace(/\D/g, '').slice(0, 6);
    if (clean.length !== 6) return;

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
      if (!response.ok) return;

      const data = await response.json();
      const office = Array.isArray(data) && data[0]?.PostOffice?.[0];
      if (!office) return;

      setFormData((prev) => ({
        ...prev,
        pincode: clean,
        city: office.District || office.Name || prev.city || '',
        state: office.State || prev.state || '',
      }));
    } catch (error) {
      console.error('Pincode lookup failed:', error);
    }
  };

  const handlePincodeChange = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: clean }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email_address || !formData.mobile_number) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Email, Mobile Number)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const composedAddress = [formData.landmark, formData.city, formData.state, formData.pincode]
        .filter(Boolean)
        .join(', ');

      const result = await updateProfile({ ...formData, address: composedAddress });
      
      if (result.error) {
        toast({
          title: "Update Failed",
          description: result.error.message || "Failed to update profile",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }

  // Get status details for bookings table
  const getStatusDetails = (status: string) => {
    const styles: Record<string, { badge: string; icon: any }> = {
      pending: { badge: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
      confirmed: { badge: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 },
      completed: { badge: 'bg-sky-100 text-sky-800 border-sky-200', icon: CheckCircle2 },
      cancelled: { badge: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
    };
    return styles[status] || { badge: 'bg-muted text-muted-foreground', icon: Clock };
  };

  const getPetBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      dog: 'bg-blue-100 text-blue-800 border-blue-200',
      cat: 'bg-purple-100 text-purple-800 border-purple-200',
      bird: 'bg-blue-100 text-blue-800 border-blue-200',
      rabbit: 'bg-sky-100 text-sky-800 border-sky-200',
      hamster: 'bg-pink-100 text-pink-800 border-pink-200',
    };
    return colors[type.toLowerCase()] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <>
      <Helmet>
        <title>My Dashboard - Pawtectors</title>
        <meta name="description" content="Manage your profile, pets, and clinic bookings" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Manage your profile, pets, and clinic appointments</p>
              </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8 bg-muted/60 p-1 rounded-xl">
                <TabsTrigger value="profile" className="rounded-lg py-2.5 text-xs sm:text-sm">Profile Details</TabsTrigger>
                <TabsTrigger value="pets" className="rounded-lg py-2.5 text-xs sm:text-sm">My Pets</TabsTrigger>
                <TabsTrigger value="bookings" className="rounded-lg py-2.5 text-xs sm:text-sm">My Bookings</TabsTrigger>
                <TabsTrigger value="records" className="rounded-lg py-2.5 text-xs sm:text-sm">Medical Records</TabsTrigger>
                <TabsTrigger value="billing" className="rounded-lg py-2.5 text-xs sm:text-sm">Billing Invoices</TabsTrigger>
              </TabsList>

              {/* PROFILE TAB */}
              <TabsContent value="profile" className="space-y-6">
                <Card className="shadow-md border border-border/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-display font-bold">
                      <User className="h-5 w-5 text-primary" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Keep your profile details up to date.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="full_name" className="flex items-center gap-2">
                            Full Name *
                          </Label>
                          <Input
                            id="full_name"
                            name="full_name"
                            type="text"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email_address" className="flex items-center gap-2">
                            Email Address *
                          </Label>
                          <Input
                            id="email_address"
                            name="email_address"
                            type="email"
                            value={formData.email_address}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            required
                            disabled
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="mobile_number" className="flex items-center gap-2">
                            Mobile Number *
                          </Label>
                          <Input
                            id="mobile_number"
                            name="mobile_number"
                            type="tel"
                            value={formData.mobile_number}
                            onChange={handleInputChange}
                            placeholder="Enter mobile number"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            type="text"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Enter city"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          type="text"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="Enter state"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pincode" className="flex items-center gap-2">
                            Pincode
                          </Label>
                          <Input
                            id="pincode"
                            name="pincode"
                            value={formData.pincode}
                            onChange={(e) => handlePincodeChange(e.target.value)}
                            onBlur={(e) => handlePincodeLookup(e.target.value)}
                            placeholder="6-digit pincode"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="landmark">Landmark (Optional)</Label>
                          <Input
                            id="landmark"
                            name="landmark"
                            value={formData.landmark}
                            onChange={handleInputChange}
                            placeholder="e.g. Near Veterinary Hospital"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferred_location">Preferred Location / Area</Label>
                        <Input
                          id="preferred_location"
                          name="preferred_location"
                          type="text"
                          value={formData.preferred_location}
                          onChange={handleInputChange}
                          placeholder="Enter preferred area for clinic visits"
                        />
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-border/60">
                        <Button 
                          type="submit" 
                          disabled={loading}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {loading ? 'Updating...' : 'Update Profile'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                <ChangePasswordCard />
              </TabsContent>

              {/* PETS TAB */}
              <TabsContent value="pets" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold font-display text-foreground">My Pet Profiles</h2>
                    <p className="text-muted-foreground text-sm">Add and manage details of your pets</p>
                  </div>
                  <Button onClick={handleOpenAddPet} className="flex items-center gap-2 rounded-xl">
                    <Plus className="h-4 w-4" /> Add Pet
                  </Button>
                </div>

                {isLoadingPets ? (
                  <div className="py-12 text-center text-muted-foreground animate-pulse">Loading pet profiles...</div>
                ) : pets.length === 0 ? (
                  <Card className="p-12 text-center border-dashed border-2">
                    <CardHeader className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">No Pets Registered</CardTitle>
                      <CardDescription className="max-w-md mt-2">
                        You haven't added any pets to your profile yet. Register your pets here to make clinic booking quick and simple.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4">
                      <Button onClick={handleOpenAddPet} variant="outline" className="rounded-xl">
                        Add Your First Pet
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {pets.map((pet) => (
                      <Card key={pet.id} className="relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow border border-border/80">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                                {pet.name}
                                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getPetBadgeColor(pet.type)}`}>
                                  {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
                                </span>
                              </CardTitle>
                              <CardDescription className="text-sm font-medium mt-1">
                                {pet.breed || 'Unknown Breed'}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => handleOpenEditPet(pet)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeletePet(pet.id, pet.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm pt-0">
                          <div className="grid grid-cols-2 gap-y-2 pt-2 border-t border-border/60">
                            <div>
                              <span className="text-muted-foreground block text-xs">Age</span>
                              <span className="font-semibold">
                                {pet.age_months ? `${Math.floor(pet.age_months / 12)} years, ${pet.age_months % 12} months` : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Gender</span>
                              <span className="font-semibold capitalize">{pet.gender || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Weight</span>
                              <span className="font-semibold">{pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Vaccination Status</span>
                              <span className="font-semibold truncate block">{pet.vaccination_status || 'N/A'}</span>
                            </div>
                          </div>

                          {(pet.medical_conditions || pet.special_instructions) && (
                            <div className="mt-4 pt-3 border-t border-border/60 bg-muted/20 p-3 rounded-lg">
                              {pet.medical_conditions && (
                                <p className="text-xs text-muted-foreground">
                                  <strong className="text-foreground">Conditions:</strong> {pet.medical_conditions}
                                </p>
                              )}
                              {pet.special_instructions && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  <strong className="text-foreground">Special Care:</strong> {pet.special_instructions}
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* BOOKINGS TAB */}
              <TabsContent value="bookings" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold font-display text-foreground">Clinic Appointments</h2>
                  <p className="text-muted-foreground text-sm">Review your veterinary clinic bookings and status</p>
                </div>

                {isLoadingBookings ? (
                  <div className="py-12 text-center text-muted-foreground animate-pulse">Loading clinic bookings...</div>
                ) : bookings.length === 0 ? (
                  <Card className="p-12 text-center border-dashed border-2">
                    <CardHeader className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">No Appointments Found</CardTitle>
                      <CardDescription className="max-w-md mt-2">
                        You have not scheduled any clinic appointments yet. Book a checkup or session at one of our veterinary clinics!
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4">
                      <Button onClick={() => navigate('/clinics')} className="rounded-xl">
                        Browse Clinics & Book
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => {
                      const statusInfo = getStatusDetails(booking.status);
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <Card key={booking.id} className="shadow-sm border border-border/80 overflow-hidden">
                          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2.5">
                                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-semibold ${statusInfo.badge}`}>
                                  <StatusIcon className="h-3.5 w-3.5" />
                                  {booking.status.toUpperCase()}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">
                                  Ref: #{booking.id.slice(0, 8)}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold font-display">{booking.service_name || 'Veterinary Consultation'}</h3>
                              <p className="text-sm font-medium text-muted-foreground">
                                Clinic: <span className="text-foreground">{booking.owner_name}</span> {/* Owner name holds clinic name in query */}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  {format(new Date(booking.booking_date), 'dd MMM yyyy')}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-primary" />
                                  {booking.booking_time}
                                </span>
                                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                                  <IndianRupee className="h-4 w-4" />
                                  {booking.amount ?? 0}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-start md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-border/60">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Patient:</span>{' '}
                                <strong className="text-foreground">
                                  {booking.pet_name} ({booking.pet_type})
                                </strong>
                              </div>
                              
                              {booking.status === 'pending' && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="rounded-lg text-xs"
                                >
                                  Cancel Booking
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* MEDICAL RECORDS & PRESCRIPTIONS TAB */}
              <TabsContent value="records" className="space-y-6">
                <Card className="shadow-md border border-border/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-display font-bold">
                      <Activity className="h-5 w-5 text-primary" />
                      E-Medical Health Records
                    </CardTitle>
                    <CardDescription>
                      View your pets' diagnostic history, vaccinations, and active prescriptions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingRecords ? (
                      <div className="text-center py-8 text-muted-foreground animate-pulse">Loading medical records...</div>
                    ) : medicalRecords.length === 0 ? (
                      <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/20 text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                        <h3 className="font-semibold text-lg">No medical records found</h3>
                        <p className="text-sm mt-1">Medical entries will appear here once logged by the clinic.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {medicalRecords.map((record) => (
                          <div key={record.id} className="border border-border p-5 rounded-2xl bg-muted/10 hover:shadow transition space-y-4 text-left">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                              <div>
                                <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                                  <span>Diagnosis: {record.diagnosis || 'General Checkup'}</span>
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Date: {format(new Date(record.consultation_date), 'dd MMM yyyy')} &bull; Consultant: {record.doctor_name || 'Dr. Ramesh Sharma'}
                                </p>
                              </div>
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                                Consultation Record
                              </Badge>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <h4 className="font-semibold text-foreground mb-1">Treatment / Procedures</h4>
                                <p className="text-muted-foreground">{record.treatment || 'No specific procedures logged.'}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-1">Doctor Notes</h4>
                                <p className="text-muted-foreground">{record.doctor_notes || 'All vitals normal.'}</p>
                              </div>
                            </div>
                            {record.prescriptions && record.prescriptions.length > 0 && (
                              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <h4 className="font-bold text-primary flex items-center gap-1.5 text-sm mb-2.5">
                                  <Sparkles className="w-4 h-4" /> Active Prescriptions
                                </h4>
                                <div className="space-y-2">
                                  {record.prescriptions.map((med: any) => (
                                    <div key={med.id} className="text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-primary/15 pb-2 last:border-0 last:pb-0">
                                      <p><span className="font-semibold text-stone-700">Medicine:</span> {med.medicine_name}</p>
                                      <p><span className="font-semibold text-stone-700">Dosage:</span> {med.dosage}</p>
                                      <p><span className="font-semibold text-stone-700">Freq:</span> {med.frequency}</p>
                                      <p><span className="font-semibold text-stone-700">Duration:</span> {med.duration}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
 
              {/* BILLS & INVOICES TAB */}
              <TabsContent value="billing" className="space-y-6">
                <Card className="shadow-md border border-border/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-display font-bold">
                      <IndianRupee className="h-5 w-5 text-primary" />
                      Invoices & Billing History
                    </CardTitle>
                    <CardDescription>
                      Review consultations, pharmacy bills, and download GST compliant tax receipts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingBills ? (
                      <div className="text-center py-8 text-muted-foreground animate-pulse">Loading invoices...</div>
                    ) : bills.length === 0 ? (
                      <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/20 text-muted-foreground">
                        <IndianRupee className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                        <h3 className="font-semibold text-lg">No billing history found</h3>
                        <p className="text-sm mt-1">Invoice and receipt copies will appear here once transactions are recorded.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bills.map((bill) => (
                          <div key={bill.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-border bg-muted/5 gap-3 hover:bg-muted/10 transition text-left">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">Invoice #{bill.id.substring(0, 8).toUpperCase()}</span>
                                <Badge className={bill.status === 'paid' ? 'bg-sky-100 text-sky-800 border-sky-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                                  {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Date: {format(new Date(bill.bill_date), 'dd MMM yyyy')} &bull; Consultation Fee: ₹{bill.consultation_charges || 0}
                              </p>
                            </div>
                            <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-0 pt-2 sm:pt-0 gap-2">
                              <span className="font-extrabold text-lg text-primary block">₹{bill.total_amount}</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 rounded-lg text-xs"
                                onClick={() => {
                                  const printWindow = window.open('', '_blank');
                                  if (printWindow) {
                                    printWindow.document.write(`
                                      <html>
                                        <head>
                                          <title>Receipt - INV-${bill.id.substring(0, 8).toUpperCase()}</title>
                                          <style>
                                            body { font-family: sans-serif; padding: 40px; color: #333; }
                                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                                            th { background-color: #f5f5f5; }
                                            .invoice-header { border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
                                          </style>
                                        </head>
                                        <body>
                                          <div class="invoice-header">
                                            <h1>Pawtectors Vet Clinic</h1>
                                            <p>GST Compliant Tax Invoice &bull; Jayanagar, Bengaluru</p>
                                          </div>
                                          <h3>Invoice Details</h3>
                                          <p><strong>Receipt ID:</strong> INV-${bill.id.substring(0, 8).toUpperCase()}</p>
                                          <p><strong>Date:</strong> \${format(new Date(bill.bill_date), 'dd MMM yyyy')}</p>
                                          <p><strong>Billing Status:</strong> \${bill.status.toUpperCase()}</p>
                                          
                                          <table>
                                            <thead>
                                              <tr>
                                                <th>Description</th>
                                                <th style="text-align: right;">Amount</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              <tr>
                                                <td>Consultation Charges</td>
                                                <td style="text-align: right;">₹\${bill.consultation_charges || 0}</td>
                                              </tr>
                                              <tr>
                                                <td>Treatment Charges</td>
                                                <td style="text-align: right;">₹\${bill.treatment_charges || 0}</td>
                                              </tr>
                                              <tr>
                                                <td>Medicine / Pharmacy Charges</td>
                                                <td style="text-align: right;">₹\${bill.medicine_charges || 0}</td>
                                              </tr>
                                              <tr style="font-weight: bold;">
                                                <td>Total Billed (incl. Tax)</td>
                                                <td style="text-align: right;">₹\${bill.total_amount}</td>
                                              </tr>
                                            </tbody>
                                          </table>
                                          <button onclick="window.print()" style="margin-top: 30px; padding: 10px 20px; background-color: #000; color: #fff; border: none; cursor: pointer; border-radius: 4px;">Print Tax Invoice</button>
                                        </body>
                                      </html>
                                    `);
                                    printWindow.document.close();
                                  }
                                }}
                              >
                                View GST Receipt
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Add/Edit Pet Dialog */}
        <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                {editingPet ? 'Edit Pet Profile' : 'Add New Pet'}
              </DialogTitle>
              <DialogDescription>
                Fill in your pet details below to register or update their profile.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSavePet} className="space-y-6 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pet_name">Pet Name *</Label>
                  <Input
                    id="pet_name"
                    value={petFormData.name}
                    onChange={(e) => setPetFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Bruno"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pet_type">Pet Type *</Label>
                  <Select 
                    value={petFormData.type} 
                    onValueChange={(val) => setPetFormData(prev => ({ ...prev, type: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="rabbit">Rabbit</SelectItem>
                      <SelectItem value="hamster">Hamster</SelectItem>
                      <SelectItem value="fish">Fish</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pet_breed">Breed</Label>
                  <Input
                    id="pet_breed"
                    value={petFormData.breed}
                    onChange={(e) => setPetFormData(prev => ({ ...prev, breed: e.target.value }))}
                    placeholder="e.g. Golden Retriever"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pet_gender">Gender</Label>
                  <Select 
                    value={petFormData.gender} 
                    onValueChange={(val) => setPetFormData(prev => ({ ...prev, gender: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pet_age">Age (Months)</Label>
                  <Input
                    id="pet_age"
                    type="number"
                    min="0"
                    value={petFormData.age_months}
                    onChange={(e) => setPetFormData(prev => ({ ...prev, age_months: e.target.value }))}
                    placeholder="e.g. 24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pet_weight">Weight (kg)</Label>
                  <Input
                    id="pet_weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={petFormData.weight}
                    onChange={(e) => setPetFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="e.g. 15.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vaccination_status">Vaccination Status</Label>
                <Input
                  id="vaccination_status"
                  value={petFormData.vaccination_status}
                  onChange={(e) => setPetFormData(prev => ({ ...prev, vaccination_status: e.target.value }))}
                  placeholder="e.g. Fully Vaccinated (DHPP, Rabies)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical_conditions">Active Medical Conditions</Label>
                <Textarea
                  id="medical_conditions"
                  value={petFormData.medical_conditions}
                  onChange={(e) => setPetFormData(prev => ({ ...prev, medical_conditions: e.target.value }))}
                  placeholder="e.g. Mild allergy to poultry, none"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_instructions">Special Instructions for Clinic Vets</Label>
                <Textarea
                  id="special_instructions"
                  value={petFormData.special_instructions}
                  onChange={(e) => setPetFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                  placeholder="e.g. Extremely nervous during ear checkups"
                  rows={2}
                />
              </div>

              <DialogFooter className="gap-2 md:gap-0">
                <Button type="button" variant="outline" onClick={() => setIsPetDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPet ? 'Save Changes' : 'Add Pet Profile'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </>
  );
};

export default UserProfile;