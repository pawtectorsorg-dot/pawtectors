import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Package, Plus, Store, Stethoscope, Scissors, Home, ShoppingCart, XCircle, Calendar, Star, Eye, TrendingUp } from 'lucide-react';
import { legalPagesApi, type LegalPageRow } from '@/lib/api';
import { legalPagePresets, legalPageDrafts, type LegalPageDraft } from '@/config/legalPages';
import { useProducts } from '@/hooks/useProducts';
import { useServices } from '@/hooks/useServices';
import ProductForm from '@/components/ProductForm';
import AdminProductList from '@/components/AdminProductList';
import AdminServiceList from '@/components/AdminServiceList';
import ServiceForm from '@/components/ServiceForm';
import { Product } from '@/types/products';
import { PetService, ServiceCategory } from '@/types/pet-services';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ordersApi, bookingsApi, reviewsApi, type OrderRow, type BookingRow, type ReviewRow } from '@/lib/api';

interface OrderItem {
  product_name?: string;
  quantity: number;
  price: number;
}

interface OrderRowWithItems extends OrderRow {
  order_items?: OrderItem[];
  profiles?: { full_name?: string | null; email?: string | null; mobile_number?: string | null } | null;
}

interface Order {
  id: string;
  displayId?: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  address?: {
    name: string;
    phone: string;
    address: string;
    pincode: string;
  };
}

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
  notes?: string;
  status?: string;
  amount?: number;
  providerName?: string;
  providerCategory?: string;
  createdAt: string;
}

interface BookingRowWithProvider extends BookingRow {
  provider_name?: string | null;
  provider_category?: string | null;
  service_providers?: { name?: string | null; category?: string | null } | null;
}

interface Review {
  orderId?: string;
  rating: number;
  feedback: string[];
  additionalFeedback?: string;
  submittedAt: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

type LegalPageState = Record<string, LegalPageDraft>;

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { services, addService, updateService, deleteService } = useServices();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<PetService | null>(null);
  const [activeServiceCategory, setActiveServiceCategory] = useState<ServiceCategory>('pet-shop');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // User activity states
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [legalPages, setLegalPages] = useState<LegalPageState>(() => legalPageDrafts());
  const [originalLegalPages, setOriginalLegalPages] = useState<LegalPageState>(() => legalPageDrafts());
  const [savingLegalSlug, setSavingLegalSlug] = useState<string | null>(null);
  const [legalPageStatus, setLegalPageStatus] = useState<string | null>(null);
  const [blogDraft, setBlogDraft] = useState({ slug: 'blog-', title: '', content: '' });
  const [savingBlogSlug, setSavingBlogSlug] = useState<string | null>(null);
  const [blogStatus, setBlogStatus] = useState<string | null>(null);

 // Load user activities from backend API first, fallback to localStorage
  useEffect(() => {
    const loadData = async () => {
      // Debug: Check authentication data
      const authData = localStorage.getItem('pawtectors_auth');
      const adminSession = localStorage.getItem('pawtectors_admin_session');
      console.log('[AdminDashboard] Auth data:', authData);
      console.log('[AdminDashboard] Admin session:', adminSession);
      
      if (!authData) {
        console.error('[AdminDashboard] No auth data found in localStorage!');
      }
      
      // Orders - AdminDashboard should show ALL orders (no filter)
      try {
        const dbOrders = await ordersApi.getAll(); // No filter = returns all orders for admin
        if (dbOrders && dbOrders.length > 0) {
          const mapped: Order[] = (dbOrders as unknown as OrderRowWithItems[]).map((o) => ({
            id: o.id,
            displayId: o.display_id || undefined,
            items: (o.order_items ?? []).map((i) => ({ name: i.product_name ?? 'Item', quantity: i.quantity, price: Number(i.price) })),
            total: Number(o.total_amount),
            status: (o.status as Order['status']) || 'processing',
            paymentStatus: o.payment_status || undefined,
            paymentMethod: o.payment_method || undefined,
            createdAt: o.created_at ?? '',
            customer: o.profiles ? {
              name: o.profiles.full_name || '',
              email: o.profiles.email || '',
              phone: o.profiles.mobile_number || '',
            } : undefined,
            address: o.shipping_address as Order['address'],
          }));
          setOrders(mapped);
          console.log(`✅ Loaded ${mapped.length} orders from backend API`);
        } else {
          setOrders(JSON.parse(localStorage.getItem('pawtectors_orders') || '[]'));
        }
      } catch { setOrders(JSON.parse(localStorage.getItem('pawtectors_orders') || '[]')); }

      // Bookings
      try {
        const dbBookings = await bookingsApi.getAll();
        if (dbBookings && dbBookings.length > 0) {
          const mapped: Booking[] = (dbBookings as BookingRowWithProvider[]).map((b) => ({
            id: b.id,
            serviceName: b.service_name || '',
            petName: b.pet_name || '',
            petType: b.pet_type || '',
            ownerName: b.owner_name || '',
            email: b.owner_email || '',
            phone: b.owner_phone || '',
            date: b.booking_date || '',
            time: b.booking_time || '',
            notes: b.notes || '',
            status: b.status || 'pending',
            amount: b.amount ?? undefined,
            providerName: b.provider_name || b.service_providers?.name,
            providerCategory: b.provider_category || b.service_providers?.category,
            createdAt: b.created_at ?? '',
          }));
          setBookings(mapped);
          console.log(`✅ Loaded ${mapped.length} bookings from backend API`);
        } else {
          setBookings(JSON.parse(localStorage.getItem('pawtectors_bookings') || '[]'));
        }
      } catch { setBookings(JSON.parse(localStorage.getItem('pawtectors_bookings') || '[]')); }

      // Reviews
      try {
        const dbReviews = await reviewsApi.getAll();
        if (dbReviews && dbReviews.length > 0) {
          const mapped: Review[] = dbReviews.map((r) => ({
            orderId: r.order_id || r.product_id || '',
            rating: r.rating,
            feedback: [],
            additionalFeedback: r.comment || '',
            submittedAt: r.created_at ?? '',
          }));
          setReviews(mapped);
          console.log(`✅ Loaded ${mapped.length} reviews from backend API`);
        } else {
          setReviews(JSON.parse(localStorage.getItem('pawtectors_reviews') || '[]'));
        }
      } catch { setReviews(JSON.parse(localStorage.getItem('pawtectors_reviews') || '[]')); }

      try {
        const dbLegalPages = await legalPagesApi.getAll();
        if (dbLegalPages && dbLegalPages.length > 0) {
          const nextLegalPages = { ...legalPageDrafts() };
          dbLegalPages.forEach((page: LegalPageRow) => {
            nextLegalPages[page.slug] = {
              title: page.title || nextLegalPages[page.slug]?.title || page.slug,
              content: page.content || nextLegalPages[page.slug]?.content || '',
            };
          });
          setLegalPages(nextLegalPages);
          setOriginalLegalPages(nextLegalPages);
        }
      } catch {
        const fallback = legalPageDrafts();
        setLegalPages(fallback);
        setOriginalLegalPages(fallback);
      }
    };
    loadData();
  }, []);

  const updateLegalPageField = (slug: string, field: keyof LegalPageDraft, value: string) => {
    setLegalPages((current) => ({
      ...current,
      [slug]: {
        ...current[slug],
        [field]: value,
      },
    }));
  };

  const handleSaveLegalPage = async (slug: string) => {
    const draft = legalPages[slug];
    if (!draft) return;

    const title = draft.title.trim();
    const content = draft.content.trim();

    if (!title || !content) {
      setLegalPageStatus('Title and content are required for legal pages.');
      return;
    }

    setSavingLegalSlug(slug);
    setLegalPageStatus(null);

    try {
      const updated = await legalPagesApi.update(slug, { title, content });
      const updatedPage = { title: updated.title, content: updated.content };
      setLegalPages((current) => ({
        ...current,
        [slug]: updatedPage,
      }));
      setOriginalLegalPages((current) => ({
        ...current,
        [slug]: updatedPage,
      }));
      setLegalPageStatus(`Saved ${updated.title}.`);
    } catch (error) {
      setLegalPageStatus(error instanceof Error ? error.message : 'Failed to save legal page.');
    } finally {
      setSavingLegalSlug(null);
    }
  };

  const updateBlogDraft = (field: 'slug' | 'title' | 'content', value: string) => {
    setBlogDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSaveBlogPost = async () => {
    const slug = blogDraft.slug.trim();
    const title = blogDraft.title.trim();
    const content = blogDraft.content.trim();

    if (!slug.startsWith('blog-')) {
      setBlogStatus('Blog slugs should start with blog-.');
      return;
    }

    if (!title || !content) {
      setBlogStatus('Blog title and content are required.');
      return;
    }

    setSavingBlogSlug(slug);
    setBlogStatus(null);

    try {
      const updated = await legalPagesApi.update(slug, { title, content });
      setLegalPages((current) => ({
        ...current,
        [slug]: {
          title: updated.title,
          content: updated.content,
        },
      }));
      setBlogStatus(`Saved ${updated.title}.`);
      setBlogDraft({ slug: 'blog-', title: '', content: '' });
    } catch (error) {
      setBlogStatus(error instanceof Error ? error.message : 'Failed to save blog post.');
    } finally {
      setSavingBlogSlug(null);
    }
  };

  const editBlogPost = (slug: string) => {
    const draft = legalPages[slug];
    if (!draft) return;
    setBlogDraft({ slug, title: draft.title, content: draft.content });
    setBlogStatus(`Editing ${draft.title}.`);
  };

  const getOriginalLegalPage = (slug: string) => {
    if (originalLegalPages[slug]) return originalLegalPages[slug];
    const preset = legalPagePresets.find((page) => page.slug === slug);
    return preset ? { title: preset.title, content: preset.fallbackContent } : { title: '', content: '' };
  };

  const hasLegalPageChanges = (slug: string) => {
    const draft = legalPages[slug];
    if (!draft) return true;
    const original = getOriginalLegalPage(slug);
    return draft.title.trim() !== original.title.trim() || draft.content.trim() !== original.content.trim();
  };

  const hasBlogDraftChanges = () => {
    const slug = blogDraft.slug.trim();
    const title = blogDraft.title.trim();
    const content = blogDraft.content.trim();
    if (!slug.startsWith('blog-')) return false;
    if (!title && !content) return false;
    const existing = legalPages[slug];
    if (!existing) {
      return title.length > 0 || content.length > 0;
    }
    return existing.title.trim() !== title || existing.content.trim() !== content;
  };

  const cancelledOrders = orders.filter(o => o.status === 'cancelled');
  const activeOrders = orders.filter(o => o.status !== 'cancelled');

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      processing: 'bg-amber-100 text-amber-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return <Badge className={styles[status] || 'bg-muted'}>{status}</Badge>;
  };

  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    addProduct(product);
    setIsAddingProduct(false);
  };

  const handleUpdateProduct = (product: Omit<Product, 'id'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, product);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
  };

  const handleAddService = (service: Omit<PetService, 'id'>) => {
    addService({ ...service, category: activeServiceCategory });
    setIsAddingService(false);
  };

  const handleUpdateService = (service: Omit<PetService, 'id'>) => {
    if (editingService) {
      updateService(editingService.id, service);
      setEditingService(null);
    }
  };

  const handleDeleteService = (id: string) => {
    deleteService(id);
  };

  const getFilteredServices = (category: ServiceCategory) => {
    return services.filter(s => s.category === category);
  };

  const serviceTabs = [
    { id: 'pet-shop' as ServiceCategory, label: 'Pet Shops', icon: Store },
    { id: 'clinic' as ServiceCategory, label: 'Clinics', icon: Stethoscope },
    { id: 'grooming' as ServiceCategory, label: 'Grooming', icon: Scissors },
    { id: 'boarding' as ServiceCategory, label: 'Boarding', icon: Home },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Admin <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage your products, services and inventory</p>
        </div>
        <Button variant="outline" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Main Navigation */}
      <div className="flex flex-wrap gap-3">
        <Button 
          variant={activeTab === 'dashboard' ? 'default' : 'outline'}
          onClick={() => setActiveTab('dashboard')}
          className="gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Dashboard
        </Button>
        <Button 
          variant={activeTab === 'orders' ? 'default' : 'outline'}
          onClick={() => setActiveTab('orders')}
          className="gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Orders ({orders.length})
        </Button>
        <Button 
          variant={activeTab === 'bookings' ? 'default' : 'outline'}
          onClick={() => setActiveTab('bookings')}
          className="gap-2"
        >
          <Calendar className="w-4 h-4" />
          Bookings ({bookings.length})
        </Button>
        <Button 
          variant={activeTab === 'reviews' ? 'default' : 'outline'}
          onClick={() => setActiveTab('reviews')}
          className="gap-2"
        >
          <Star className="w-4 h-4" />
          Reviews ({reviews.length})
        </Button>
        <Button 
          variant={activeTab === 'manage' ? 'default' : 'outline'}
          onClick={() => setActiveTab('manage')}
          className="gap-2"
        >
          <Package className="w-4 h-4" />
          Manage Products
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pet Shops
            </CardTitle>
            <Store className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{getFilteredServices('pet-shop').length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clinics
            </CardTitle>
            <Stethoscope className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{getFilteredServices('clinic').length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Grooming & Boarding
            </CardTitle>
            <Scissors className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {getFilteredServices('grooming').length + getFilteredServices('boarding').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card border-l-4 border-l-primary cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('orders')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <Eye className="w-3 h-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{orders.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{activeOrders.length} active</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cancellations
            </CardTitle>
            <XCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{cancelledOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-l-4 border-l-secondary cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('bookings')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bookings
            </CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary" />
              <Eye className="w-3 h-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{bookings.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reviews
            </CardTitle>
            <Star className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{reviews.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 0} ⭐
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'dashboard' && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">Quick Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Recent activity and key metrics</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Recent Orders</h3>
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">{order.displayId || order.id.slice(0, 8) + '...'}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(order.total)}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                ))}
                {orders.length === 0 && <p className="text-muted-foreground text-sm">No orders yet</p>}
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Upcoming Bookings</h3>
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">{booking.serviceName}</p>
                      <p className="text-sm text-muted-foreground">{booking.petName} - {booking.date}</p>
                    </div>
                    <Badge variant="outline">{booking.time}</Badge>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-muted-foreground text-sm">No bookings yet</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'orders' && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Orders Management ({orders.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">View and manage all customer orders</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <ScrollArea className="h-[500px]">
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No orders yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Shipping Address</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.displayId || order.id.slice(0, 8) + '...'}</TableCell>
                            <TableCell>
                              <div className="max-w-[180px]">
                                {order.items.slice(0, 2).map((item, i) => (
                                  <div key={i} className="text-sm truncate">
                                    {item.quantity}x {item.name}
                                  </div>
                                ))}
                                {order.items.length > 2 && <div className="text-xs text-muted-foreground">+{order.items.length - 2} more</div>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium">{order.customer?.name || order.address?.name || 'N/A'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                {order.customer?.email && <p>{order.customer.email}</p>}
                                {order.customer?.phone && <p className="text-muted-foreground">{order.customer.phone}</p>}
                                {!order.customer?.email && !order.customer?.phone && <p>N/A</p>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs max-w-[200px]">
                                {order.address ? (
                                  <>
                                    <p className="truncate">{order.address.address}</p>
                                    <p className="text-muted-foreground">PIN: {order.address.pincode}</p>
                                  </>
                                ) : (
                                  <p>N/A</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <p className="font-medium">{order.paymentMethod || 'N/A'}</p>
                                <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'} className="text-xs mt-1">
                                  {order.paymentStatus || 'pending'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="active">
                <ScrollArea className="h-[500px]">
                  {activeOrders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No active orders</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Shipping Address</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.displayId || order.id.slice(0, 8) + '...'}</TableCell>
                            <TableCell>
                              <div className="max-w-[180px]">
                                {order.items.slice(0, 2).map((item, i) => (
                                  <div key={i} className="text-sm truncate">
                                    {item.quantity}x {item.name}
                                  </div>
                                ))}
                                {order.items.length > 2 && <div className="text-xs text-muted-foreground">+{order.items.length - 2} more</div>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium">{order.customer?.name || order.address?.name || 'N/A'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                {order.customer?.email && <p>{order.customer.email}</p>}
                                {order.customer?.phone && <p className="text-muted-foreground">{order.customer.phone}</p>}
                                {!order.customer?.email && !order.customer?.phone && <p>N/A</p>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs max-w-[200px]">
                                {order.address ? (
                                  <>
                                    <p className="truncate">{order.address.address}</p>
                                    <p className="text-muted-foreground">PIN: {order.address.pincode}</p>
                                  </>
                                ) : (
                                  <p>N/A</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <p className="font-medium">{order.paymentMethod || 'N/A'}</p>
                                <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'} className="text-xs mt-1">
                                  {order.paymentStatus || 'pending'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="cancelled">
                <ScrollArea className="h-[500px]">
                  {cancelledOrders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No cancelled orders</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Shipping Address</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cancelledOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.displayId || order.id.slice(0, 8) + '...'}</TableCell>
                            <TableCell>
                              <div className="max-w-[180px]">
                                {order.items.slice(0, 2).map((item, i) => (
                                  <div key={i} className="text-sm truncate">
                                    {item.quantity}x {item.name}
                                  </div>
                                ))}
                                {order.items.length > 2 && <div className="text-xs text-muted-foreground">+{order.items.length - 2} more</div>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium">{order.customer?.name || order.address?.name || 'N/A'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                {order.customer?.email && <p>{order.customer.email}</p>}
                                {order.customer?.phone && <p className="text-muted-foreground">{order.customer.phone}</p>}
                                {!order.customer?.email && !order.customer?.phone && <p>N/A</p>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs max-w-[200px]">
                                {order.address ? (
                                  <>
                                    <p className="truncate">{order.address.address}</p>
                                    <p className="text-muted-foreground">PIN: {order.address.pincode}</p>
                                  </>
                                ) : (
                                  <p>N/A</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <p className="font-medium">{order.paymentMethod || 'N/A'}</p>
                                <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'} className="text-xs mt-1">
                                  {order.paymentStatus || 'pending'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {activeTab === 'bookings' && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Bookings Management ({bookings.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">View and manage all service appointments</p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {bookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No bookings yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Pet Details</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-xs">{booking.id.slice(0, 8) + '...'}</TableCell>
                        <TableCell className="font-medium">{booking.serviceName}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {booking.providerName ? (
                              <>
                                <p className="font-medium">{booking.providerName}</p>
                                <p className="text-xs text-muted-foreground">{booking.providerCategory}</p>
                              </>
                            ) : (
                              <p className="text-muted-foreground">N/A</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{booking.petName}</p>
                            <p className="text-muted-foreground">{booking.petType}</p>
                          </div>
                        </TableCell>
                        <TableCell>{booking.ownerName}</TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p>{booking.email}</p>
                            <p className="text-muted-foreground">{booking.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{booking.date}</p>
                            <p className="text-muted-foreground">{booking.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.amount ? (
                            <span className="font-semibold">{formatPrice(booking.amount)}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            booking.status === 'confirmed' ? 'default' :
                            booking.status === 'completed' ? 'secondary' :
                            booking.status === 'cancelled' ? 'destructive' :
                            'outline'
                          }>
                            {booking.status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate text-sm">
                          {booking.notes || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(booking.createdAt)}
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

      {activeTab === 'reviews' && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Reviews Management ({reviews.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">Customer feedback and ratings</p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">{review.rating}/5</span>
                          </div>
                          {review.additionalFeedback && (
                            <p className="text-sm text-muted-foreground">
                              "{review.additionalFeedback}"
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{formatDate(review.submittedAt)}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {activeTab === 'manage' && (
        <Tabs defaultValue="products" className="space-y-6">

        <Card className="shadow-card border-l-4 border-l-secondary">
          <CardHeader>
            <CardTitle className="font-display text-xl">Manage Products & Services</CardTitle>
            <p className="text-sm text-muted-foreground">Add, edit and delete products and service listings</p>
          </CardHeader>
        </Card>

          <Tabs defaultValue="products" className="space-y-4">
            <TabsList className="flex flex-wrap gap-1">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="pet-shops">Pet Shops</TabsTrigger>
              <TabsTrigger value="clinics">Clinics</TabsTrigger>
              <TabsTrigger value="grooming">Grooming</TabsTrigger>
              <TabsTrigger value="boarding">Boarding</TabsTrigger>
              <TabsTrigger value="blogs">Blogs</TabsTrigger>
              <TabsTrigger value="legal-pages">Legal Pages</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card className="shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display">Product Inventory</CardTitle>
                    <Button onClick={() => setIsAddingProduct(true)} className="gradient-hero text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <AdminProductList
                    products={products}
                    onEdit={setEditingProduct}
                    onDelete={handleDeleteProduct}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Service Tabs */}
            {serviceTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id === 'pet-shop' ? 'pet-shops' : tab.id === 'clinic' ? 'clinics' : tab.id}>
                <Card className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-display flex items-center gap-2">
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                      </CardTitle>
                      <Button 
                        onClick={() => {
                          setActiveServiceCategory(tab.id);
                          setIsAddingService(true);
                        }} 
                        className="gradient-hero text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add {tab.label.slice(0, -1)}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AdminServiceList
                      services={getFilteredServices(tab.id)}
                      onEdit={setEditingService}
                      onDelete={handleDeleteService}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}

            <TabsContent value="blogs">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display">Blog Post Editor</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Create posts by saving entries with a <span className="font-medium">blog-</span> slug. They will appear on the public blogs page automatically.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {blogStatus && (
                    <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      {blogStatus}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Blog slug</label>
                      <input
                        value={blogDraft.slug}
                        onChange={(event) => updateBlogDraft('slug', event.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                        placeholder="blog-my-first-post"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Blog title</label>
                      <input
                        value={blogDraft.title}
                        onChange={(event) => updateBlogDraft('title', event.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                        placeholder="A better way to care for senior pets"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Blog content</label>
                    <textarea
                      value={blogDraft.content}
                      onChange={(event) => updateBlogDraft('content', event.target.value)}
                      rows={10}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                      placeholder="Write the full blog post here..."
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Use this form to create a new post or load an existing one from the list below.
                    </p>
                    <Button
                      onClick={handleSaveBlogPost}
                      className="gradient-hero text-white"
                      disabled={savingBlogSlug === blogDraft.slug.trim() || !hasBlogDraftChanges()}
                    >
                      {savingBlogSlug === blogDraft.slug.trim()
                        ? 'Saving...'
                        : hasBlogDraftChanges()
                        ? 'Save Blog'
                        : 'No changes'}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase tracking-[0.18em] text-muted-foreground">Existing blog posts</h3>
                    {Object.entries(legalPages)
                      .filter(([slug]) => slug.startsWith('blog-'))
                      .map(([slug, page]) => (
                        <div key={slug} className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-medium text-foreground">{page.title}</p>
                            <p className="text-xs text-muted-foreground">/{slug}</p>
                          </div>
                          <Button variant="outline" onClick={() => editBlogPost(slug)}>
                            Edit
                          </Button>
                        </div>
                      ))}
                    {Object.keys(legalPages).filter((slug) => slug.startsWith('blog-')).length === 0 && (
                      <p className="text-sm text-muted-foreground">No blog posts yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="legal-pages">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display">Legal Content Editor</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Update the policy content shown on the public site. Saving will create the page if it does not exist yet.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {legalPageStatus && (
                    <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                      {legalPageStatus}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    {legalPagePresets.map((page) => {
                      const draft = legalPages[page.slug] || { title: page.title, content: page.fallbackContent };

                      return (
                        <Card key={page.slug} className="border border-border/70 shadow-none">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">{page.title}</CardTitle>
                            <p className="text-xs text-muted-foreground">Slug: {page.slug}</p>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Page title</label>
                              <input
                                value={draft.title}
                                onChange={(event) => updateLegalPageField(page.slug, 'title', event.target.value)}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Page content</label>
                              <textarea
                                value={draft.content}
                                onChange={(event) => updateLegalPageField(page.slug, 'content', event.target.value)}
                                rows={10}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
                              />
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs text-muted-foreground">
                                Public route: /{page.slug}
                              </p>
                              <Button
                                onClick={() => handleSaveLegalPage(page.slug)}
                                className="gradient-hero text-white"
                                disabled={savingLegalSlug === page.slug || !hasLegalPageChanges(page.slug)}
                              >
                                {savingLegalSlug === page.slug
                                  ? 'Saving...'
                                  : hasLegalPageChanges(page.slug)
                                  ? 'Save Page'
                                  : 'No changes'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Tabs>
      )}

      {/* Add/Edit Product Modal */}
      {(isAddingProduct || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="font-display">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              <ProductForm
                product={editingProduct || undefined}
                onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                onCancel={() => {
                  setIsAddingProduct(false);
                  setEditingProduct(null);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Service Modal */}
      {(isAddingService || editingService) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="font-display">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              <ServiceForm
                service={editingService || undefined}
                onSubmit={editingService ? handleUpdateService : handleAddService}
                onCancel={() => {
                  setIsAddingService(false);
                  setEditingService(null);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
