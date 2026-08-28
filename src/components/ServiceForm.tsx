import { useState, useRef } from 'react';
import { PetService, ServicePricing } from '@/types/pet-services';
import { FALLBACK_IMAGE } from '@/lib/utils';
import { uploadApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, IndianRupee, Upload, ImagePlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceFormProps {
  service?: PetService;
  category?: string;
  onSubmit: (service: Omit<PetService, 'id'>) => void;
  onCancel: () => void;
}

const ServiceForm = ({ service, category, onSubmit, onCancel }: ServiceFormProps) => {
  const effectiveCategory = category || service?.category || 'pet-shop';
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Parse 12-hour time format
  const parseTime = (time12h: string) => {
    const match = time12h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return { hour: '9', minute: '00', period: 'AM' };
    return {
      hour: match[1],
      minute: match[2],
      period: match[3].toUpperCase()
    };
  };

  // Format time to 12-hour string
  const formatTime = (hour: string, minute: string, period: string): string => {
    return `${hour}:${minute} ${period}`;
  };

  const [formData, setFormData] = useState({
    name: service?.name || '',
    city: service?.city || '',
    landmark: service?.landmark || '',
    state: service?.state || '',
    pincode: service?.pincode || '',
    phone: service?.phone || '',
    email: service?.email || '',
    openTime: service?.openTime || '9:00 AM',
    closeTime: service?.closeTime || '6:00 PM',
    description: service?.description || '',
    image: service?.image || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
    rating: service?.rating || 4.5,
    reviewCount: service?.reviewCount || 0,
    services: service?.services?.join(', ') || '',
    priceRange: service?.priceRange || (
      ['grooming', 'boarding', 'training'].includes(effectiveCategory) ? '₹₹' : 
      ['clinic', 'pet-shop'].includes(effectiveCategory) ? '' : '$$'
    ),
    slotCapacity: service?.slotCapacity ?? 1,
    slotIntervalMinutes: service?.slotIntervalMinutes ?? 30,
});
  
  const [pricing, setPricing] = useState<ServicePricing[]>(service?.pricing || []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max file size is 5MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadApi.upload(file, 'pawtectors/services');
      setFormData(prev => ({ ...prev, image: url }));
      toast({ title: 'Image uploaded!', description: 'Service image uploaded successfully.' });
    } catch (err) {
      console.error('Upload failed:', err);
      toast({ title: 'Upload failed', description: err instanceof Error ? err.message : 'Could not upload image.', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800' }));
  };

  const addPricingItem = () => {
    setPricing([...pricing, { name: '', price: 0 }]);
  };

  const removePricingItem = (index: number) => {
    setPricing(pricing.filter((_, i) => i !== index));
  };

  const updatePricingItem = (index: number, field: keyof ServicePricing, value: string | number) => {
    const updated = [...pricing];
    updated[index] = { ...updated[index], [field]: field === 'price' ? Number(value) : value };
    setPricing(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // We no longer collect a separate free-text street address — it's
    // composed from Landmark + City + State + Pincode instead, so anything
    // downstream that displays `.address` still has something sensible.
    const composedAddress = [formData.landmark, formData.city, formData.state, formData.pincode]
      .filter(Boolean)
      .join(', ');

    const submitData: Omit<PetService, 'id'> = {
      ...formData,
      address: composedAddress,
      category: effectiveCategory as PetService['category'],
      services: formData.services.split(',').map(s => s.trim()).filter(Boolean),
      pricing: pricing.filter(p => p.name && p.price > 0),
    };
    
    // Only include priceRange for grooming, boarding, and training
    // Send empty string for clinic and pet-shop
    if (!['clinic', 'pet-shop'].includes(effectiveCategory)) {
      submitData.priceRange = formData.priceRange;
    } else {
      submitData.priceRange = '';
    }
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 pb-2">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
            <div><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
          </div>
          <div><Label>Email (Optional)</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="provider@example.com (optional)" /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Landmark (Optional)</Label><Input value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} placeholder="e.g., Near City Mall" /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><Label>City</Label><Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required /></div>
            <div><Label>State</Label><Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} required /></div>
            <div><Label>Pincode</Label><Input value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} required /></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Opening Time</Label>
              <div className="flex gap-2">
                <Select
                  value={parseTime(formData.openTime).hour}
                  onValueChange={(hour) => {
                    const { minute, period } = parseTime(formData.openTime);
                    setFormData({...formData, openTime: formatTime(hour, minute, period)});
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                      <SelectItem key={h} value={String(h)}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={parseTime(formData.openTime).minute}
                  onValueChange={(minute) => {
                    const { hour, period } = parseTime(formData.openTime);
                    setFormData({...formData, openTime: formatTime(hour, minute, period)});
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 60 }, (_, i) => i).map(m => (
                      <SelectItem key={m} value={String(m).padStart(2, '0')}>{String(m).padStart(2, '0')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={parseTime(formData.openTime).period}
                  onValueChange={(period) => {
                    const { hour, minute } = parseTime(formData.openTime);
                    setFormData({...formData, openTime: formatTime(hour, minute, period)});
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="AM/PM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Closing Time</Label>
              <div className="flex gap-2">
                <Select
                  value={parseTime(formData.closeTime).hour}
                  onValueChange={(hour) => {
                    const { minute, period } = parseTime(formData.closeTime);
                    setFormData({...formData, closeTime: formatTime(hour, minute, period)});
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                      <SelectItem key={h} value={String(h)}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={parseTime(formData.closeTime).minute}
                  onValueChange={(minute) => {
                    const { hour, period } = parseTime(formData.closeTime);
                    setFormData({...formData, closeTime: formatTime(hour, minute, period)});
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 60 }, (_, i) => i).map(m => (
                      <SelectItem key={m} value={String(m).padStart(2, '0')}>{String(m).padStart(2, '0')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={parseTime(formData.closeTime).period}
                  onValueChange={(period) => {
                    const { hour, minute } = parseTime(formData.closeTime);
                    setFormData({...formData, closeTime: formatTime(hour, minute, period)});
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="AM/PM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* Slot Capacity & Interval */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Customers per time slot</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={formData.slotCapacity}
                onChange={e => setFormData({...formData, slotCapacity: Math.max(1, Number(e.target.value) || 1)})}
              />
              <p className="text-xs text-muted-foreground mt-1">
                How many different customers can book the same date &amp; time before it's full.
              </p>
            </div>
            <div>
              <Label>Time slot interval</Label>
              <Select
                value={String(formData.slotIntervalMinutes)}
                onValueChange={(value) => setFormData({...formData, slotIntervalMinutes: Number(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="45">Every 45 minutes</SelectItem>
                  <SelectItem value="60">Every 1 hour</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                How far apart bookable time slots are, based on your open/close time.
              </p>
            </div>
          </div>
          {/* Hide Price Range for Clinic and Pet-Shop */}
          {!['clinic', 'pet-shop'].includes(effectiveCategory) && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Price Range</Label>
                <Select
                  value={formData.priceRange}
                  onValueChange={(value) => setFormData({...formData, priceRange: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="₹">₹ - Budget Friendly</SelectItem>
                    <SelectItem value="₹₹">₹₹ - Moderate</SelectItem>
                    <SelectItem value="₹₹₹">₹₹₹ - Premium</SelectItem>
                    <SelectItem value="₹₹₹₹">₹₹₹₹ - Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <div><Label>Services (comma-separated)</Label><Input value={formData.services} onChange={e => setFormData({...formData, services: e.target.value})} /></div>
          
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Service Image</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex items-center gap-4">
              {formData.image && !formData.image.includes('unsplash.com/photo-1583337130417') ? (
                <div className="relative group">
                  <img
                    src={formData.image}
                    alt="Service preview"
                    className="w-20 h-20 object-cover rounded-lg border border-border"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                  />
                  <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="text-white hover:text-white" title="Replace">
                      <Upload className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={handleRemoveImage} className="text-white hover:text-white" title="Remove">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-20 h-20 bg-muted rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ImagePlus className="w-5 h-5 mb-1" /><span className="text-xs">Upload</span></>}
                </button>
              )}
              <div className="flex-1 space-y-1">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4 mr-2" /> {formData.image && !formData.image.includes('unsplash.com/photo-1583337130417') ? 'Replace Image' : 'Upload Image'}</>}
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP or GIF. Max 5MB.</p>
              </div>
            </div>
          </div>
          
          {/* Pricing Section */}
          <div className="space-y-3 border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Service Pricing</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPricingItem}>
                <Plus className="w-4 h-4 mr-1" /> Add Price
              </Button>
            </div>
            {pricing.length === 0 && (
              <p className="text-sm text-muted-foreground">No pricing items added yet. Click "Add Price" to add service pricing.</p>
            )}
            {pricing.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Service name (e.g., Day Care)"
                  value={item.name}
                  onChange={e => updatePricingItem(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <div className="relative w-32">
                  <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.price || ''}
                    onChange={e => updatePricingItem(index, 'price', e.target.value)}
                    className="pl-7"
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removePricingItem(index)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-background pb-2 -mx-6 px-6 mt-6">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" disabled={uploading}>{service ? 'Update' : 'Add'}</Button>
          </div>
        </form>
  );
};

export default ServiceForm;
