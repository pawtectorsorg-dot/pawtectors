import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ServiceForm from '@/components/ServiceForm';
import { 
  LogOut, Calendar, IndianRupee, Bell, Clock, CheckCircle, 
  XCircle, Settings, TrendingUp, Loader2, KeyRound, User
} from 'lucide-react';
import ChangePasswordCard from '@/components/ChangePasswordCard';
import { bookingsApi, notificationsApi, providersApi, type ProviderRow } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { ServiceCategory } from '@/hooks/useProviderAuth';
import type { PetService } from '@/types/pet-services';

interface Booking {
  id: string;
  pet_name: string;
  pet_type: string;
  number_of_pets?: number;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  booking_date: string;
  booking_time: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  special_requirements?: string | null;
  additional_information?: string | null;
  created_at: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

interface ProviderDashboardProps {
  providerId: string;
  providerName: string;
  category: ServiceCategory;
  onLogout: () => void;
}

const ProviderDashboard = ({ providerId, providerName, category, onLogout }: ProviderDashboardProps) => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [providerDetails, setProviderDetails] = useState<PetService | null>(null);
  const [providerFormVersion, setProviderFormVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProvider, setIsSavingProvider] = useState(false);
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, thisMonth: 0 });

  const mapProviderRowToService = (row: ProviderRow): PetService => ({
    id: row.id,
    name: row.name,
    category,
    address: row.address || '',
    landmark: row.landmark || '',
    city: row.city || '',
    state: row.state || '',
    pincode: row.pincode || '',
    rating: row.rating || 4.5,
    reviewCount: row.review_count || 0,
    image: row.image || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
    phone: row.phone || '',
    email: row.email || '',
    openTime: row.open_time || '9:00 AM',
    closeTime: row.close_time || '6:00 PM',
    description: row.description || '',
    services: Array.isArray(row.services) ? row.services : [],
    priceRange: row.price_range || '',
    pricing: Array.isArray(row.pricing) ? row.pricing : [],
    slotCapacity: row.slot_capacity || 1,
    slotIntervalMinutes: row.slot_interval_minutes || 30,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      await Promise.all([fetchProviderDetails(), fetchBookings(), fetchNotifications()]);
      setIsLoading(false);
    };

    loadDashboard();
  }, [providerId]);

  const fetchProviderDetails = async () => {
    try {
      const data = await providersApi.getById(providerId);
      setProviderDetails(mapProviderRowToService(data as ProviderRow));
      setProviderFormVersion(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching provider details:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingsApi.getAll({ provider_id: providerId });
      setBookings(data as Booking[]);
      calculateEarnings(data as Booking[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data as Notification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleUpdateProvider = async (updates: Omit<PetService, 'id'>) => {
    try {
      setIsSavingProvider(true);
      await providersApi.update(providerId, {
        ...updates,
      });
      toast({
        title: 'Success',
        description: 'Your provider details were updated',
      });
      await fetchProviderDetails();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update provider details',
      });
    } finally {
      setIsSavingProvider(false);
    }
  };

  const calculateEarnings = (bookingData: Booking[]) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const total = bookingData
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + Number(b.amount), 0);

    const pending = bookingData
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + Number(b.amount), 0);

    const monthlyBookings = bookingData.filter(b => {
      const bookingDate = new Date(b.booking_date);
      return bookingDate.getMonth() === thisMonth && 
             bookingDate.getFullYear() === thisYear &&
             b.status === 'completed';
    });
    const thisMonthTotal = monthlyBookings.reduce((sum, b) => sum + Number(b.amount), 0);

    setEarnings({ total, pending, thisMonth: thisMonthTotal });
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await bookingsApi.update(bookingId, { status });
      toast({
        title: "Success",
        description: `Booking ${status === 'cancelled' ? 'rejected' : status}`,
      });
      fetchBookings();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking status",
      });
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  const formatDate = (dateStr: string) => format(new Date(dateStr), 'dd MMM yyyy');
  const formatDateTime = (dateStr: string) => format(new Date(dateStr), 'dd MMM yyyy, hh:mm a');

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-sky-100 text-sky-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return <Badge className={styles[status] || 'bg-muted'}>{status}</Badge>;
  };

  const getCategoryTitle = () => {
    const titles: Record<ServiceCategory, string> = {
      clinic: 'Clinic',
      grooming: 'Grooming',
      boarding: 'Boarding',
      training: 'Training'
    };
    return titles[category] || 'Provider';
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const unreadNotifications = notifications.filter(n => !n.is_read);

  // Helper to extract unique clients and their pets from bookings list
  const clientDatabase = useMemo(() => {
    const clientsMap = new Map<string, {
      name: string;
      email: string;
      phone: string;
      pets: Set<string>;
      bookingCount: number;
    }>();

    bookings.forEach(b => {
      const key = `${b.owner_name}-${b.owner_email}-${b.owner_phone}`;
      const petDetails = `${b.pet_name} (${b.pet_type || 'dog'})`;
      
      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          name: b.owner_name,
          email: b.owner_email,
          phone: b.owner_phone,
          pets: new Set([petDetails]),
          bookingCount: 1,
        });
      } else {
        const client = clientsMap.get(key)!;
        client.pets.add(petDetails);
        client.bookingCount += 1;
      }
    });

    return Array.from(clientsMap.values());
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {getCategoryTitle()} <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">Welcome back, {providerName}</p>
        </div>
        <Button variant="outline" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <IndianRupee className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatPrice(earnings.total)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Amount
            </CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatPrice(earnings.pending)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-l-4 border-l-sky-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatPrice(earnings.thisMonth)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
            <Calendar className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{bookings.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{pendingBookings.length} pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="flex flex-wrap w-full max-w-2xl gap-1">
          <TabsTrigger value="details" className="flex-1">
            <Settings className="w-4 h-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex-1">
            <User className="w-4 h-4 mr-2" />
            Clients & Pets
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 relative">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            {unreadNotifications.length > 0 && (
              <Badge className="ml-2 bg-destructive text-destructive-foreground text-xs">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1">
            <KeyRound className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Provider Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Manage Your Listing
              </CardTitle>
            </CardHeader>
            <CardContent>
              {providerDetails ? (
                <div key={`${providerDetails.id}-${providerFormVersion}`}>
                  <ServiceForm
                    service={providerDetails}
                    category={category}
                    onSubmit={handleUpdateProvider}
                    onCancel={() => setProviderFormVersion(prev => prev + 1)}
                  />
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  Loading provider details...
                </div>
              )}
              {isSavingProvider && (
                <p className="text-sm text-muted-foreground mt-3">Saving changes...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
              <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            </TabsList>

            {['pending', 'confirmed', 'completed', 'all'].map(tab => (
              <TabsContent key={tab} value={tab}>
                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <ScrollArea className="h-[500px]">
                      {(tab === 'all' ? bookings : bookings.filter(b => b.status === tab)).length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No {tab} bookings</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Pet</TableHead>
                              <TableHead>Owner</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Date & Time</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Additional Info</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(tab === 'all' ? bookings : bookings.filter(b => b.status === tab)).map((booking) => {
                              const additionalInfo = booking.notes || booking.special_requirements || booking.additional_information || 'No additional information provided';
                              return (
                                <TableRow key={booking.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{booking.pet_name}</p>
                                      <p className="text-xs text-muted-foreground">{booking.pet_type}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>{booking.owner_name}</TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <p>{booking.owner_phone}</p>
                                      <p className="text-muted-foreground">{booking.owner_email}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{formatDate(booking.booking_date)}</p>
                                      <p className="text-sm text-muted-foreground">{booking.booking_time}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-semibold">{formatPrice(Number(booking.amount))}</TableCell>
                                  <TableCell>
                                    <div className="max-w-[220px]">
                                      <p className="text-xs text-muted-foreground break-words">{additionalInfo}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      {booking.status === 'pending' && (
                                        <>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                          >
                                            Reject
                                          </Button>
                                        </>
                                      )}
                                      {booking.status === 'confirmed' && (
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                                        >
                                          Complete
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No notifications</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 rounded-xl border ${notification.is_read ? 'bg-muted/30' : 'bg-primary/5 border-primary/20'}`}
                        onClick={() => !notification.is_read && markNotificationRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDateTime(notification.created_at)}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <Badge className="bg-primary text-primary-foreground text-xs">New</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clients & Pets Tab */}
        <TabsContent value="clients" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Customer and Pet Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {clientDatabase.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No customers or pets in the database yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Contact Information</TableHead>
                        <TableHead>Registered Pets</TableHead>
                        <TableHead className="text-center">Total Appointments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientDatabase.map((client, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{client.phone}</p>
                              <p className="text-muted-foreground">{client.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Array.from(client.pets).map((pet, pIdx) => (
                                <Badge key={pIdx} variant="outline" className="text-xs">
                                  {pet}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {client.bookingCount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <ChangePasswordCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderDashboard;
