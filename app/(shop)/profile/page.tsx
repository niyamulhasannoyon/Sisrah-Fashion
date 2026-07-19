'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Package, User as UserIcon, LogOut, Loader2, CheckCircle2, Clock, Truck, ShoppingBag } from 'lucide-react';

export default function AdvancedProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile fields state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formDivision, setFormDivision] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchMyOrders();
    
    // Set form fields
    setFormName(user.name || '');
    setFormPhone(user.phone || '');
    setFormStreet(user.address?.street || '');
    setFormCity(user.address?.city || '');
    setFormDivision(user.address?.division || '');
  }, [user, router]);

  const fetchMyOrders = async () => {
    try {
      const res = await fetch('/api/user/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/login');
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'loomra_preset'); 
    const CLOUD_NAME = 'dj3uym3gv'; 
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
    return await res.json();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !user) return;
    setUploading(true);
    try {
      const data = await uploadToCloudinary(e.target.files[0]);
      if (data.secure_url) {
        const res = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName || user.name,
            phone: formPhone || user.phone,
            image: data.secure_url,
            address: {
              street: formStreet || user.address?.street,
              city: formCity || user.address?.city,
              division: formDivision || user.address?.division,
            }
          })
        });
        const result = await res.json();
        if (result.success) {
          updateUser({ image: data.secure_url });
        } else {
          alert(result.error || "Failed to update profile picture.");
        }
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to remove your profile picture?")) return;
    setUploading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName || user.name,
          phone: formPhone || user.phone,
          image: '',
          address: {
            street: formStreet || user.address?.street,
            city: formCity || user.address?.city,
            division: formDivision || user.address?.division,
          }
        })
      });
      const result = await res.json();
      if (result.success) {
        updateUser({ image: '' });
      } else {
        alert(result.error || "Failed to remove profile picture.");
      }
    } catch (error) {
      console.error("Remove image error:", error);
      alert("Error removing image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          image: user.image,
          address: {
            street: formStreet,
            city: formCity,
            division: formDivision,
          }
        })
      });
      const result = await res.json();
      if (result.success) {
        updateUser(result.user);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(result.error || "Failed to save profile.");
      }
    } catch (error) {
      console.error("Profile save error:", error);
      alert("Error saving profile details.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const OrderTimeline = ({ status }: { status: string }) => {
    const steps = ['Confirmed', 'Processing', 'Send to Courier', 'Shipped', 'Delivered'];
    const currentIndex = steps.indexOf(status);
    const isCancelled = status === 'Cancelled';

    if (isCancelled) {
      return <div className="text-red-600 font-bold text-sm bg-red-50 p-3 rounded text-center">This order was cancelled.</div>;
    }

    return (
      <>
        {/* Mobile vertical stepper */}
        <div className="sm:hidden flex flex-col gap-4 relative pl-5 mt-6 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 z-0">
          <div 
            className="absolute left-[17px] top-2 w-0.5 bg-emerald-500 transition-all duration-1000 z-0"
            style={{ 
              height: `${currentIndex >= 0 ? (currentIndex / (steps.length - 1)) * 100 : 0}%`,
              maxHeight: 'calc(100% - 16px)'
            }}
          />
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            return (
              <div key={step} className="flex items-center gap-3 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {step === 'Confirmed' ? <ShoppingBag size={14} /> :
                   step === 'Processing' ? <Clock size={14} /> :
                   step === 'Send to Courier' ? <Package size={14} /> :
                   step === 'Shipped' ? <Truck size={14} /> :
                   <CheckCircle2 size={14} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>{step}</span>
              </div>
            );
          })}
        </div>

        {/* Desktop horizontal stepper */}
        <div className="hidden sm:flex items-center justify-between mt-6 relative before:absolute before:inset-0 before:top-1/2 before:h-0.5 before:w-full before:-translate-y-1/2 before:bg-gray-200 z-0">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            return (
              <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {step === 'Confirmed' ? <ShoppingBag size={14} /> :
                   step === 'Processing' ? <Clock size={14} /> :
                   step === 'Send to Courier' ? <Package size={14} /> :
                   step === 'Shipped' ? <Truck size={14} /> :
                   <CheckCircle2 size={14} />}
                </div>
                <span className={`text-xs font-bold uppercase ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 pb-28 md:pb-0 pt-6 lg:pt-24 flex flex-col md:flex-row gap-6 lg:gap-8">
      {/* ── Mobile: Slim Profile Bar ── */}
      <div className="w-full md:w-64 flex flex-col gap-3">
        {/* Profile Card — compact on mobile */}
        <div className="bg-gray-900 p-5 md:p-6 rounded-xl md:rounded-lg text-white flex md:flex-col items-center md:text-center gap-4 md:gap-3">
          <div className="relative w-12 h-12 md:w-16 md:h-16 shrink-0">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-white/20 shadow-sm" />
            ) : (
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center text-lg md:text-2xl font-bold uppercase select-none">
                {user.name.charAt(0)}
              </div>
            )}
            <label className="absolute -bottom-0.5 -right-0.5 bg-[#A31F24] hover:bg-red-800 text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors border-2 border-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploading} />
            </label>
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm md:text-lg truncate">{user.name}</h2>
            <p className="text-[11px] md:text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          {uploading && (
            <div className="flex items-center gap-1.5 text-[10px] text-gray-300 animate-pulse md:mt-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
            </div>
          )}
        </div>

        {/* ── Tab pills — horizontal on mobile, vertical on desktop ── */}
        <div className="flex md:flex-col gap-2">
          <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-2.5 px-4 py-2.5 md:py-3 rounded-xl md:rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
            activeTab === 'orders'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
          }`}>
            <Package size={16} /> Orders
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2.5 px-4 py-2.5 md:py-3 rounded-xl md:rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
            activeTab === 'profile'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
          }`}>
            <UserIcon size={16} /> Profile
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 md:py-3 rounded-xl md:rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 md:mt-auto">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 bg-white border border-gray-100 rounded-xl p-5 md:p-10 shadow-sm min-h-[50vh]">
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="animate-in fade-in duration-500 space-y-6">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-xl font-bold uppercase tracking-widest text-[#1A1A1A]">Account Details</h2>
              {saveSuccess && (
                <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                  ✓ Profile Saved!
                </span>
              )}
            </div>

            {/* Profile Photo Section in Form */}
            {/* ── Profile Photo ── */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-gray-100">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border shadow-sm" />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase text-gray-400 select-none">
                    {user.name.charAt(0)}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-[#A31F24]" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 text-center sm:text-left">
                <h3 className="text-xs sm:text-sm font-bold uppercase text-gray-900">Profile Photo</h3>
                <p className="text-[10px] sm:text-xs text-gray-400">PNG or JPG, up to 5MB.</p>
                <div className="flex gap-2 justify-center sm:justify-start mt-1">
                  <label className="bg-gray-900 hover:bg-[#A31F24] text-white px-3.5 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all duration-200 shadow-sm">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploading} />
                  </label>
                  {user.image && (
                    <button 
                      type="button"
                      onClick={handleRemoveImage}
                      className="border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 px-3.5 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Form Fields ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-5">
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-black uppercase text-gray-500 tracking-[0.1em]">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg outline-none transition-all text-sm font-medium focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-black uppercase text-gray-500 tracking-[0.1em]">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-gray-400 rounded-lg outline-none cursor-not-allowed text-sm font-medium"
                />
                <p className="text-[9px] text-gray-400">Cannot be changed</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-black uppercase text-gray-500 tracking-[0.1em]">Phone</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg outline-none transition-all text-sm font-medium focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-black uppercase text-gray-500 tracking-[0.1em]">Account Type</label>
                <div className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-gray-400 rounded-lg text-sm font-medium capitalize">
                  {user.role}
                </div>
              </div>
            </div>

            {/* ── Shipping Address ── */}
            <div className="border-t border-gray-100 pt-5 sm:pt-6 space-y-4">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-900">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[10px] sm:text-xs font-black uppercase text-gray-500 tracking-[0.1em]">Street Address</label>
                  <input
                    type="text"
                    value={formStreet}
                    onChange={(e) => setFormStreet(e.target.value)}
                    placeholder="House 12, Road 5"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg outline-none transition-all text-sm font-medium placeholder:text-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-black uppercase text-gray-500 tracking-[0.1em]">City</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Dhaka"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg outline-none transition-all text-sm font-medium placeholder:text-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-black uppercase text-gray-500 tracking-[0.1em]">Division</label>
                  <input
                    type="text"
                    value={formDivision}
                    onChange={(e) => setFormDivision(e.target.value)}
                    placeholder="Dhaka"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg outline-none transition-all text-sm font-medium placeholder:text-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10"
                  />
                </div>
              </div>
            </div>

            {/* ── Save Button ── */}
            <div className="flex justify-end pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-gray-900 hover:bg-[#A31F24] text-white px-6 sm:px-8 py-3 sm:py-3.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] rounded-lg transition-all duration-200 shadow-sm disabled:bg-gray-300 flex items-center justify-center gap-2 active:scale-[0.97]"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'orders' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#1A1A1A] border-b pb-4 mb-6">Order History</h2>
            
            {loading ? (
              <div className="flex flex-col gap-8 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-6">
                    {/* Header skeleton */}
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                        <div className="h-5 w-32 bg-slate-100 rounded" />
                        <div className="h-4 w-24 bg-slate-100 rounded" />
                      </div>
                      <div className="text-right space-y-2 flex flex-col items-end">
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                        <div className="h-6 w-28 bg-slate-100 rounded" />
                        <div className="h-4 w-24 bg-slate-100 rounded" />
                      </div>
                    </div>

                    {/* Order items block skeleton */}
                    <div className="bg-[#F9F9F9] rounded p-4 flex flex-col gap-3 mb-6 border border-gray-100">
                      {[1, 2].map((j) => (
                        <div key={j} className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded" />
                            <div className="h-4 w-36 bg-slate-100 rounded" />
                          </div>
                          <div className="h-3 w-16 bg-slate-100 rounded" />
                        </div>
                      ))}
                    </div>

                    {/* Timeline stepper skeleton (desktop) */}
                    <div className="hidden sm:flex items-center justify-between mt-6 relative before:absolute before:left-0 before:right-0 before:top-1/2 before:h-0.5 before:w-full before:-translate-y-1/2 before:bg-slate-100 z-0">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-200" />
                          <div className="h-3 w-16 bg-slate-100 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center text-gray-500 bg-[#F9F9F9] rounded-lg p-12 text-center gap-3">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                  <Package size={28} className="text-gray-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">No Orders Yet</h3>
                <p className="text-sm text-gray-400 max-w-xs">You haven&apos;t placed any orders yet. Start shopping to see them here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:gap-6">
                {orders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-all duration-300">
                    {/* ── Order Header ── */}
                    <div className="flex justify-between items-start gap-3 mb-4 sm:mb-5">
                      <div className="min-w-0">
                        <span className="text-[9px] sm:text-xs font-black uppercase text-gray-400 tracking-[0.1em]">Order #</span>
                        <h3 className="font-bold text-[#A31F24] text-sm sm:text-lg truncate">#{order._id.slice(-8).toUpperCase()}</h3>
                        <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] sm:text-xs font-black uppercase text-gray-400 tracking-[0.1em]">Total</span>
                        <h3 className="font-bold text-gray-900 text-base sm:text-xl">৳{order.totalAmount.toLocaleString()}</h3>
                        <span className="text-[10px] sm:text-xs text-gray-500">{order.paymentMethod}</span>
                      </div>
                    </div>

                    {/* ── Items ── */}
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 flex flex-col gap-2 mb-4 sm:mb-5 border border-gray-100/80">
                      {order.orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-100 rounded-lg overflow-hidden shrink-0">
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.quantity}x {item.title}</span>
                          </div>
                          <span className="text-[9px] sm:text-xs text-gray-400 uppercase font-bold tracking-wider shrink-0">{item.selectedSize} / {item.selectedColor}</span>
                        </div>
                      ))}
                    </div>

                    <OrderTimeline status={order.orderStatus} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
