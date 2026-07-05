'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageSquare, Check, X, Trash2, Star, ShieldCheck, Eye } from 'lucide-react';
import { getDirectImageLink } from '@/lib/utils';
import Link from 'next/link';

export default function ReviewModeration() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
      } else {
        alert(data.error || "Failed to update review status");
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => prev.filter(r => r._id !== id));
      } else {
        alert(data.error || "Failed to delete review");
      }
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Review Moderation</h1>
          <p className="text-sm text-gray-500 mt-1">Approve, reject, or manage customer feedback and product reviews.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative border-b-2 ${
              filter === tab
                ? 'border-black text-black'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            {tab} Queue ({reviews.filter(r => tab === 'all' ? true : r.status === tab).length})
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#A31F24]" size={32} />
            <p className="text-xs font-medium text-slate-500">Fetching reviews queue...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-full">
              <MessageSquare size={36} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Queue is Empty</h3>
              <p className="text-xs text-slate-400 mt-1">No reviews found matching the "{filter}" status filter.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReviews.map((review) => (
              <div key={review._id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Review Content & Product Card */}
                <div className="flex-1 flex flex-col md:flex-row gap-6">
                  {/* Product Micro-card */}
                  {review.product ? (
                    <div className="w-full md:w-[180px] shrink-0 border border-slate-200/80 rounded-xl p-3 bg-white flex flex-row md:flex-col gap-3">
                      <div className="w-14 h-14 md:w-full md:aspect-[4/5] bg-slate-50 rounded-lg overflow-hidden shrink-0">
                        <img 
                          src={getDirectImageLink(review.product.images?.[0]?.url || '/images/placeholder.jpg')} 
                          className="w-full h-full object-cover" 
                          alt={review.product.title} 
                        />
                      </div>
                      <div className="flex-1 md:flex-none">
                        <Link 
                          href={`/product/${review.product.slug}`} 
                          target="_blank" 
                          className="text-xs font-bold text-slate-900 hover:text-[#A31F24] hover:underline line-clamp-2 md:line-clamp-none"
                        >
                          {review.product.title}
                        </Link>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Product ID: {review.product._id.slice(-6)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-[180px] shrink-0 border border-slate-100 rounded-xl p-3 bg-slate-50 flex items-center justify-center text-xs text-gray-400 italic">
                      Product Deleted
                    </div>
                  )}

                  {/* Review Text, rating and photos */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-bold text-[#1A1A1A]">{review.name}</span>
                      
                      {review.verifiedPurchase && (
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100 select-none">
                          <ShieldCheck size={11} className="text-emerald-600" /> Verified Purchase
                        </span>
                      )}
                      
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="flex text-amber-400 gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? 'text-amber-400' : 'text-slate-200'} />
                      ))}
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-200/40">
                      "{review.comment}"
                    </p>

                    {/* Photo reviews */}
                    {review.images && review.images.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Uploaded Photos</p>
                        <div className="flex flex-wrap gap-2.5">
                          {review.images.map((img: any, idx: number) => (
                            <div 
                              key={idx} 
                              onClick={() => setSelectedPhoto(img.url)}
                              className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 hover:border-slate-800 transition bg-slate-50 cursor-zoom-in group shadow-sm"
                            >
                              <img src={getDirectImageLink(img.url)} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="Review upload" />
                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200">
                                <Eye size={12} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full lg:w-fit shrink-0 flex lg:flex-col gap-2.5 items-center justify-end">
                  {review.status !== 'approved' && (
                    <button 
                      onClick={() => handleStatusUpdate(review._id, 'approved')}
                      className="flex-1 lg:flex-none w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button 
                      onClick={() => handleStatusUpdate(review._id, 'rejected')}
                      className="flex-1 lg:flex-none w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <X size={14} /> Reject
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteReview(review._id)}
                    className="flex-1 lg:flex-none w-full px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition border border-rose-100"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedPhoto(null)}
        >
          <button 
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition"
          >
            <X size={20} />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-xl bg-white shadow-2xl p-1" onClick={e => e.stopPropagation()}>
            <img src={getDirectImageLink(selectedPhoto)} className="max-w-full max-h-[80vh] object-contain rounded-lg" alt="Full screen preview" />
          </div>
        </div>
      )}
    </div>
  );
}
