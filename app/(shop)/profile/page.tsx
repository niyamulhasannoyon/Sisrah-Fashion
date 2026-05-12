'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Package, User as UserIcon, LogOut, Loader2, CheckCircle2, Clock, Truck } from 'lucide-react';

export default function AdvancedProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchMyOrders();
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

  if (!user) return null;

  const OrderTimeline = ({ status }: { status: string }) => {
    const steps = ['Processing', 'Shipped', 'Delivered'];
    const currentIndex = steps.indexOf(status);
    const isCancelled = status === 'Cancelled';

    if (isCancelled) {
      return <div className="text-red-600 font-bold text-sm bg-red-50 p-3 rounded">This order was cancelled.</div>;
    }

    return (
      <div className="flex items-center justify-between mt-6 relative before:absolute before:inset-0 before:top-1/2 before:h-0.5 before:w-full before:-translate-y-1/2 before:bg-gray-200 z-0">
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-white text-gray-400'}`}>
                {step === 'Processing' ? <Clock size={14} /> : step === 'Shipped' ? <Truck size={14} /> : <CheckCircle2 size={14} />}
              </div>
              <span className={`text-xs font-bold uppercase ${isCompleted ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>{step}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 lg:py-24 flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 flex flex-col gap-2">
        <div className="bg-[#1A1A1A] p-6 rounded-lg mb-4 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 text-xl font-bold uppercase">
            {user.name.charAt(0)}
          </div>
          <h2 className="font-bold text-lg">{user.name}</h2>
          <p className="text-xs text-gray-400 mt-1">{user.email}</p>
        </div>

        <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold uppercase transition ${activeTab === 'orders' ? 'bg-[#F9F9F9] text-[#A31F24]' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Package size={18} /> My Orders
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold uppercase transition ${activeTab === 'profile' ? 'bg-[#F9F9F9] text-[#A31F24]' : 'text-gray-600 hover:bg-gray-50'}`}>
          <UserIcon size={18} /> Account Details
        </button>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded text-sm font-bold uppercase text-gray-600 hover:bg-red-50 hover:text-red-600 transition mt-auto">
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <div className="flex-1 bg-white border border-gray-100 rounded-lg p-6 lg:p-10 shadow-sm min-h-[500px]">
        {activeTab === 'profile' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#1A1A1A] border-b pb-4 mb-6">Account Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                <p className="font-medium text-lg mt-1">{user.name}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                <p className="font-medium text-lg mt-1">{user.email}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Account Type</label>
                <p className="font-medium mt-1 uppercase bg-gray-100 w-fit px-3 py-1 rounded text-sm">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#1A1A1A] border-b pb-4 mb-6">Order History</h2>
            
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-[#F9F9F9] rounded">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {orders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                      <div>
                        <span className="text-xs font-bold uppercase text-gray-400 tracking-widest">Order Number</span>
                        <h3 className="font-bold text-[#A31F24] text-lg">#{order._id.slice(-8).toUpperCase()}</h3>
                        <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold uppercase text-gray-400 tracking-widest">Total Amount</span>
                        <h3 className="font-bold text-[#1A1A1A] text-xl">৳ {order.totalAmount.toLocaleString()}</h3>
                        <span className="text-xs text-gray-500">{order.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="bg-[#F9F9F9] rounded p-4 flex flex-col gap-3 mb-6 border border-gray-100">
                       {order.orderItems.map((item: any, idx: number) => (
                         <div key={idx} className="flex justify-between items-center text-sm">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-white border rounded overflow-hidden">
                               <img src={item.image} alt="item" className="w-full h-full object-cover"/>
                             </div>
                             <span className="font-medium text-[#1A1A1A]">{item.quantity}x {item.title}</span>
                           </div>
                           <span className="text-gray-500 text-xs uppercase">{item.selectedSize} / {item.selectedColor}</span>
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
