'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Plus, Loader2, Edit, Trash2, Search,
  X, Eye, Clock, Monitor, Copy,
  AlertTriangle, BarChart3, UploadCloud,
  Sparkles, ImageOff, CheckCircle2, TrendingUp
} from 'lucide-react';
import LandingPagePreviewModal from '@/components/landing/LandingPagePreviewModal';
import LandingPageAnalyticsPanel from '@/components/landing/LandingPageAnalyticsPanel';
import { getDirectImageLink } from '@/lib/utils';

interface Testimonial {
  name: string;
  rating: number;
  comment: string;
  image?: string;
}

interface LandingPageForm {
  _id?: string;
  pageTitle: string;
  slug: string;
  layoutType: 'single-product' | 'multi-product';
  productIds: string[];
  customHero: {
    customHeading: string;
    customSubheading: string;
    customBannerImage: string;
    customMobileBannerImage: string;
  };
  promotionalElements: {
    countdownTimerToggle: boolean;
    countdownTargetDate: string;
    announcementText: string;
  };
  offerSettings: {
    freeShippingToggle: boolean;
    freeShippingMinQty: number;
    freeShippingMinAmount: number;
    comboDiscountToggle: boolean;
    comboDiscountType: 'percentage' | 'fixed';
    comboDiscountValue: number;
    comboMinQty: number;
  };
  socialProof: Testimonial[];
  isActive: boolean;
}

// ── Image Preview Component ──
function ImagePreview({ url, alt, onRemove, aspect = 'aspect-[21/9]', label = 'Banner Preview' }: { url: string; alt: string; onRemove?: () => void; aspect?: string; label?: string }) {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    return (
      <div className={`w-full ${aspect} rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300`}>
        <ImageOff size={32} />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${aspect} rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group`}>
      <img
        src={getDirectImageLink(url)}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <X size={14} />
        </button>
      )}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-1 rounded-md">
        {label}
      </div>
    </div>
  );
}

// ── URL Validation ──
function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const EMPTY_FORM: LandingPageForm = {
  pageTitle: '',
  slug: '',
  layoutType: 'single-product',
  productIds: [],
  customHero: { customHeading: '', customSubheading: '', customBannerImage: '', customMobileBannerImage: '' },
  promotionalElements: { countdownTimerToggle: false, countdownTargetDate: '', announcementText: '' },
  offerSettings: {
    freeShippingToggle: false,
    freeShippingMinQty: 0,
    freeShippingMinAmount: 0,
    comboDiscountToggle: false,
    comboDiscountType: 'percentage',
    comboDiscountValue: 0,
    comboMinQty: 2,
  },
  socialProof: [],
  isActive: true,
};

export default function AdminLandingPages() {
  const [pages, setPages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<LandingPageForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Preview modal
  const [previewPage, setPreviewPage] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Analytics panel
  const [analyticsPanel, setAnalyticsPanel] = useState<{ slug: string; title: string } | null>(null);

  // Duplicate state
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  // Analytics state
  const [lpAnalytics, setLpAnalytics] = useState<Record<string, any>>({});
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Banner upload state
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingMobileBanner, setUploadingMobileBanner] = useState(false);

  // Product search for multi-select
  const [productSearch, setProductSearch] = useState('');

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/landing-pages');
      const data = await res.json();
      if (data.success) setPages(data.pages);
    } catch (err) {
      console.error('Failed to fetch landing pages', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/landing-pages/analytics');
      const data = await res.json();
      if (data.success) setLpAnalytics(data.analytics || {});
    } catch (err) {
      console.error('Failed to fetch LP analytics', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
    fetchProducts();
    fetchAnalytics();
  }, [fetchPages, fetchProducts, fetchAnalytics]);

  const filteredPages = pages.filter((p) =>
    p.pageTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ── Cloudinary Upload (for banner) ──
  const uploadBannerImage = async (file: File, isMobile: boolean = false) => {
    if (isMobile) {
      setUploadingMobileBanner(true);
    } else {
      setUploadingBanner(true);
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'loomra_preset');
      const res = await fetch(`https://api.cloudinary.com/v1_1/dj3uym3gv/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setForm((f) => ({
          ...f,
          customHero: {
            ...f.customHero,
            [isMobile ? 'customMobileBannerImage' : 'customBannerImage']: data.secure_url,
          },
        }));
      }
    } catch {
      alert(`${isMobile ? 'Mobile banner' : 'Banner'} upload failed`);
    } finally {
      if (isMobile) {
        setUploadingMobileBanner(false);
      } else {
        setUploadingBanner(false);
      }
    }
  };

  // ── Auto-generate slug from title ──
  const autoGenerateSlug = useCallback(() => {
    const slug = form.pageTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setForm((f) => ({ ...f, slug }));
  }, [form.pageTitle]);

  // ── Open create modal ──
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setProductSearch('');
    setShowModal(true);
  };

  // ── Open edit modal ──
  const openEdit = (page: any) => {
    setEditingId(page._id);
    setForm({
      _id: page._id,
      pageTitle: page.pageTitle,
      slug: page.slug,
      layoutType: page.layoutType,
      productIds: page.productIds?.map((p: any) => (typeof p === 'string' ? p : p._id)) || [],
      customHero: {
        customHeading: page.customHero?.customHeading || '',
        customSubheading: page.customHero?.customSubheading || '',
        customBannerImage: page.customHero?.customBannerImage || '',
        customMobileBannerImage: page.customHero?.customMobileBannerImage || '',
      },
      promotionalElements: {
        countdownTimerToggle: page.promotionalElements?.countdownTimerToggle || false,
        countdownTargetDate: page.promotionalElements?.countdownTargetDate
          ? new Date(page.promotionalElements.countdownTargetDate).toISOString().slice(0, 16)
          : '',
        announcementText: page.promotionalElements?.announcementText || '',
      },
      offerSettings: {
        freeShippingToggle: page.offerSettings?.freeShippingToggle ?? false,
        freeShippingMinQty: page.offerSettings?.freeShippingMinQty ?? 0,
        freeShippingMinAmount: page.offerSettings?.freeShippingMinAmount ?? 0,
        comboDiscountToggle: page.offerSettings?.comboDiscountToggle ?? false,
        comboDiscountType: page.offerSettings?.comboDiscountType ?? 'percentage',
        comboDiscountValue: page.offerSettings?.comboDiscountValue ?? 0,
        comboMinQty: page.offerSettings?.comboMinQty ?? 2,
      },
      socialProof: page.socialProof || [],
      isActive: page.isActive ?? true,
    });
    setProductSearch('');
    setShowModal(true);
  };

  // ── Save (create or update) ──
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        productIds: form.productIds,
        promotionalElements: {
          ...form.promotionalElements,
          countdownTargetDate: form.promotionalElements.countdownTargetDate
            ? new Date(form.promotionalElements.countdownTargetDate).toISOString()
            : null,
        },
      };

      let res: Response;
      if (editingId) {
        res = await fetch(`/api/admin/landing-pages/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/landing-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        await fetchPages();
        setShowModal(false);
      } else {
        alert(data.error || 'Failed to save landing page');
      }
    } catch (err) {
      alert('Error saving landing page');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const confirmDelete = (page: any) => {
    setDeleteTarget(page);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/landing-pages/${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPages();
        setShowDeleteModal(false);
        setDeleteTarget(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      alert('Error deleting landing page');
    } finally {
      setDeleting(false);
    }
  };

  // ── Duplicate ──
  const handleDuplicate = async (page: any) => {
    const confirmed = confirm(`Duplicate "${page.pageTitle}" for A/B testing? A new copy will be created as inactive.`);
    if (!confirmed) return;

    setDuplicatingId(page._id);
    try {
      const res = await fetch(`/api/admin/landing-pages/${page._id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        await fetchPages();
        alert(data.message || 'Page duplicated successfully!');
      } else {
        alert(data.error || 'Failed to duplicate page');
      }
    } catch (err) {
      alert('Error duplicating page');
    } finally {
      setDuplicatingId(null);
    }
  };

  // ── Social proof helpers ──
  const addTestimonial = () => {
    setForm((f) => ({
      ...f,
      socialProof: [...f.socialProof, { name: '', rating: 5, comment: '' }],
    }));
  };

  const updateTestimonial = (index: number, field: string, value: any) => {
    setForm((f) => {
      const updated = [...f.socialProof];
      (updated[index] as any)[field] = value;
      return { ...f, socialProof: updated };
    });
  };

  const removeTestimonial = (index: number) => {
    setForm((f) => ({
      ...f,
      socialProof: f.socialProof.filter((_, i) => i !== index),
    }));
  };

  // ── Product selector toggle ──
  const toggleProduct = (productId: string) => {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(productId)
        ? f.productIds.filter((id) => id !== productId)
        : [...f.productIds, productId],
    }));
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Landing Pages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage Facebook Ads landing pages for your campaigns.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-md text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#A31F24] transition-colors shadow-sm"
        >
          <Plus size={18} /> New Page
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by title or slug..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all bg-white shadow-sm text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 font-bold mb-2">Total Pages</p>
          <p className="text-3xl font-black text-slate-900">{pages.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-700 font-bold mb-2">Active</p>
          <p className="text-3xl font-black text-emerald-900">{pages.filter((p) => p.isActive).length}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-700 font-bold mb-2">Inactive</p>
          <p className="text-3xl font-black text-amber-900">{pages.filter((p) => !p.isActive).length}</p>
        </div>
      </div>

      {/* ── Pages Table ── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#A31F24]" size={32} />
            <p className="text-sm text-gray-500 font-medium">Loading pages...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F9F9] text-gray-500 text-xs uppercase tracking-widest border-b border-gray-200">
                  <th className="p-4 font-bold">Title / Slug</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Products</th>
                  <th className="p-4 font-bold text-center">Views</th>
                  <th className="p-4 font-bold text-center">Clicks</th>
                  <th className="p-4 font-bold text-center">Conv.</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Countdown</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPages.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-gray-500">
                      <p className="text-base font-medium text-[#1A1A1A]">No landing pages found.</p>
                      <p className="text-sm mt-1">Create your first campaign landing page to get started.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((page) => (
                    <tr key={page._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4">
                        <p className="text-sm font-bold text-[#1A1A1A]">{page.pageTitle}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">/lp/{page.slug}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                          {page.layoutType === 'single-product' ? 'Single' : 'Bundle'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium text-gray-500">
                          {page.productIds?.length || 0} product{(page.productIds?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </td>
                      {/* ── Analytics columns ── */}
                      <td className="p-4 text-center">
                        {analyticsLoading ? (
                          <Loader2 size={14} className="animate-spin text-gray-300 mx-auto" />
                        ) : lpAnalytics[page.slug] ? (
                          <span className="text-sm font-bold text-gray-900">{lpAnalytics[page.slug].views}</span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {analyticsLoading ? (
                          <Loader2 size={14} className="animate-spin text-gray-300 mx-auto" />
                        ) : lpAnalytics[page.slug] ? (
                          <span className="text-sm font-bold text-gray-700">{lpAnalytics[page.slug].clicks}</span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {analyticsLoading ? (
                          <Loader2 size={14} className="animate-spin text-gray-300 mx-auto" />
                        ) : lpAnalytics[page.slug] ? (
                          <span className="text-xs font-bold text-emerald-600">
                            {lpAnalytics[page.slug].conversions}
                            <span className="text-[9px] text-gray-400 font-medium ml-0.5">
                              ({lpAnalytics[page.slug].conversionRate}%)
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {page.isActive ? (
                          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-emerald-100">
                            Active
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-gray-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {page.promotionalElements?.countdownTimerToggle ? (
                          <span className="flex items-center gap-1.5 text-xs text-amber-600 font-bold">
                            <Clock size={14} /> Active
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setPreviewPage(page);
                              setShowPreview(true);
                            }}
                            title="Preview"
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          >
                            <Monitor size={18} />
                          </button>
                          <button
                            onClick={() => setAnalyticsPanel({ slug: page.slug, title: page.pageTitle })}
                            title="Analytics"
                            className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <TrendingUp size={18} />
                          </button>
                          {page.isActive && (
                            <a
                              href={`/lp/${page.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open Live"
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Eye size={18} />
                            </a>
                          )}
                          <button
                            onClick={() => openEdit(page)}
                            title="Edit"
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(page)}
                            disabled={duplicatingId !== null}
                            title="Duplicate for A/B test"
                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors disabled:opacity-50"
                          >
                            {duplicatingId === page._id ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => confirmDelete(page)}
                            title="Delete"
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8 overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText size={22} className="text-blue-600" />
                {editingId ? 'Edit Landing Page' : 'Create Landing Page'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* ── Basic Info ── */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">1</div>
                  Basic Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Page Title</label>
                    <input
                      type="text"
                      required
                      value={form.pageTitle}
                      onChange={(e) => setForm({ ...form, pageTitle: e.target.value })}
                      placeholder="e.g. Summer Collection 2026"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Slug</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono shrink-0">/lp/</span>
                      <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/[^a-z0-9-]/g, '') })}
                        placeholder="summer-deal"
                        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg outline-none transition-all text-sm font-mono ${
                          form.slug && form.slug.length >= 3
                            ? 'border-emerald-300 ring-1 ring-emerald-200/50'
                            : form.slug && form.slug.length > 0
                            ? 'border-red-300 ring-1 ring-red-200/50'
                            : 'border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={autoGenerateSlug}
                        disabled={!form.pageTitle}
                        className="shrink-0 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-all disabled:opacity-40"
                        title="Auto-generate slug from title"
                      >
                        <Sparkles size={16} />
                      </button>
                    </div>
                    {form.slug && form.slug.length < 3 ? (
                      <p className="text-[9px] text-red-500 font-medium mt-0.5">Slug must be at least 3 characters</p>
                    ) : form.slug && form.slug.length >= 3 ? (
                      <p className="text-[9px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Valid — /lp/{form.slug}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Layout Type</label>
                    <select
                      value={form.layoutType}
                      onChange={(e) => setForm({ ...form, layoutType: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                    >
                      <option value="single-product">Single Product</option>
                      <option value="multi-product">Multi-Product Bundle</option>
                    </select>
                  </div>
                  <div className="space-y-1 flex items-end">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, isActive: !form.isActive })}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          form.isActive ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                            form.isActive ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">
                        {form.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                </div>
              </section>

              {/* ── Product Selector ── */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">2</div>
                  Linked Products
                </h3>
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <p className="p-4 text-xs text-slate-400 text-center italic">No products found</p>
                  ) : (
                    filteredProducts.map((product) => {
                      const selected = form.productIds.includes(product._id);
                      return (
                        <button
                          type="button"
                          key={product._id}
                          onClick={() => toggleProduct(product._id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            selected ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              selected
                                ? 'bg-slate-900 border-slate-900'
                                : 'border-slate-300'
                            }`}
                          >
                            {selected && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800 truncate">{product.title}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{product.category}</p>
                          </div>
                          <span className="text-xs font-bold text-slate-700 shrink-0">
                            ৳{(product.offerPrice || product.basePrice).toLocaleString()}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
                {form.productIds.length > 0 && (
                  <p className="text-[10px] text-slate-500 font-medium">
                    {form.productIds.length} product{form.productIds.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </section>

              {/* ── Hero Overrides ── */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">3</div>
                  Custom Hero (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Custom Heading</label>
                    <input
                      type="text"
                      value={form.customHero.customHeading}
                      onChange={(e) => setForm({ ...form, customHero: { ...form.customHero, customHeading: e.target.value } })}
                      placeholder="Override product title"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Custom Subheading</label>
                    <input
                      type="text"
                      value={form.customHero.customSubheading}
                      onChange={(e) => setForm({ ...form, customHero: { ...form.customHero, customSubheading: e.target.value } })}
                      placeholder="e.g. Limited Edition"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Custom Banner Image</label>

                  {/* Image Preview */}
                  {form.customHero.customBannerImage && isValidImageUrl(form.customHero.customBannerImage) && (
                    <ImagePreview
                      url={form.customHero.customBannerImage}
                      alt="Banner preview"
                      onRemove={() =>
                        setForm({
                          ...form,
                          customHero: { ...form.customHero, customBannerImage: '' },
                        })
                      }
                    />
                  )}

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={form.customHero.customBannerImage}
                        onChange={(e) =>
                          setForm({ ...form, customHero: { ...form.customHero, customBannerImage: e.target.value } })
                        }
                        placeholder="https://example.com/banner.jpg"
                        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg outline-none transition-all text-sm pr-8 ${
                          form.customHero.customBannerImage && isValidImageUrl(form.customHero.customBannerImage)
                            ? 'border-emerald-300 ring-1 ring-emerald-200/50'
                            : form.customHero.customBannerImage && !isValidImageUrl(form.customHero.customBannerImage)
                            ? 'border-red-300 ring-1 ring-red-200/50'
                            : 'border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10'
                        }`}
                      />
                      {form.customHero.customBannerImage && isValidImageUrl(form.customHero.customBannerImage) && (
                        <CheckCircle2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                      )}
                    </div>
                    <label className="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-all text-[10px] font-bold uppercase tracking-wider">
                      {uploadingBanner ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <UploadCloud size={14} />
                      )}
                      {uploadingBanner ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingBanner}
                        onChange={(e) => {
                          if (e.target.files?.[0]) uploadBannerImage(e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>
                  {form.customHero.customBannerImage && !isValidImageUrl(form.customHero.customBannerImage) && form.customHero.customBannerImage.length > 5 && (
                    <p className="text-[9px] text-red-500 font-medium">Invalid URL format — must start with http:// or https://</p>
                  )}
                  <p className="text-[9px] text-slate-400 font-medium">Upload or paste a URL. Recommended: 1920×800px (21:9 ratio)</p>
                </div>

                {/* Custom Mobile Banner Image */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Custom Mobile Banner Image</label>

                  {/* Image Preview */}
                  {form.customHero.customMobileBannerImage && isValidImageUrl(form.customHero.customMobileBannerImage) && (
                    <ImagePreview
                      url={form.customHero.customMobileBannerImage}
                      alt="Mobile banner preview"
                      aspect="aspect-[4/3]"
                      label="Mobile Banner Preview"
                      onRemove={() =>
                        setForm({
                          ...form,
                          customHero: { ...form.customHero, customMobileBannerImage: '' },
                        })
                      }
                    />
                  )}

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={form.customHero.customMobileBannerImage}
                        onChange={(e) =>
                          setForm({ ...form, customHero: { ...form.customHero, customMobileBannerImage: e.target.value } })
                        }
                        placeholder="https://example.com/mobile-banner.jpg"
                        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg outline-none transition-all text-sm pr-8 ${
                          form.customHero.customMobileBannerImage && isValidImageUrl(form.customHero.customMobileBannerImage)
                            ? 'border-emerald-300 ring-1 ring-emerald-200/50'
                            : form.customHero.customMobileBannerImage && !isValidImageUrl(form.customHero.customMobileBannerImage)
                            ? 'border-red-300 ring-1 ring-red-200/50'
                            : 'border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10'
                        }`}
                      />
                      {form.customHero.customMobileBannerImage && isValidImageUrl(form.customHero.customMobileBannerImage) && (
                        <CheckCircle2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                      )}
                    </div>
                    <label className="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-all text-[10px] font-bold uppercase tracking-wider">
                      {uploadingMobileBanner ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <UploadCloud size={14} />
                      )}
                      {uploadingMobileBanner ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingMobileBanner}
                        onChange={(e) => {
                          if (e.target.files?.[0]) uploadBannerImage(e.target.files[0], true);
                        }}
                      />
                    </label>
                  </div>
                  {form.customHero.customMobileBannerImage && !isValidImageUrl(form.customHero.customMobileBannerImage) && form.customHero.customMobileBannerImage.length > 5 && (
                    <p className="text-[9px] text-red-500 font-medium">Invalid URL format — must start with http:// or https://</p>
                  )}
                  <p className="text-[9px] text-slate-400 font-medium">Upload or paste a URL. Recommended: 800×1000px (4:5 ratio) or vertical aspect ratio.</p>
                </div>
              </section>

              {/* ── Promotional Elements ── */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">4</div>
                  Promotional Elements
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        promotionalElements: {
                          ...form.promotionalElements,
                          countdownTimerToggle: !form.promotionalElements.countdownTimerToggle,
                        },
                      })
                    }
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      form.promotionalElements.countdownTimerToggle ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        form.promotionalElements.countdownTimerToggle ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">
                    Countdown Timer
                  </span>
                </div>
                {form.promotionalElements.countdownTimerToggle && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Target Date & Time</label>
                    <input
                      type="datetime-local"
                      value={form.promotionalElements.countdownTargetDate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          promotionalElements: {
                            ...form.promotionalElements,
                            countdownTargetDate: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Announcement Text</label>
                  <input
                    type="text"
                    value={form.promotionalElements.announcementText}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        promotionalElements: {
                          ...form.promotionalElements,
                          announcementText: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Free shipping on all orders!"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                  />
                </div>
              </section>

              {/* ── Offers & Discounts ── */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">5</div>
                  Offers & Discounts
                </h3>

                {/* Free Shipping Settings */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-700 tracking-[0.05em]">Free Delivery</h4>
                      <p className="text-[10px] text-slate-400">Offer free shipping for orders on this page</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          offerSettings: {
                            ...form.offerSettings,
                            freeShippingToggle: !form.offerSettings.freeShippingToggle,
                          },
                        })
                      }
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        form.offerSettings.freeShippingToggle ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                          form.offerSettings.freeShippingToggle ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {form.offerSettings.freeShippingToggle && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Min Quantity for Free Delivery</label>
                        <input
                          type="number"
                          min="0"
                          value={form.offerSettings.freeShippingMinQty}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              offerSettings: {
                                ...form.offerSettings,
                                freeShippingMinQty: Math.max(0, parseInt(e.target.value) || 0),
                              },
                            })
                          }
                          placeholder="0 = No minimum quantity"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Min Amount for Free Delivery (৳)</label>
                        <input
                          type="number"
                          min="0"
                          value={form.offerSettings.freeShippingMinAmount}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              offerSettings: {
                                ...form.offerSettings,
                                freeShippingMinAmount: Math.max(0, parseInt(e.target.value) || 0),
                              },
                            })
                          }
                          placeholder="0 = No minimum amount"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Combo Package Discount Settings */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-700 tracking-[0.05em]">Combo Discount</h4>
                      <p className="text-[10px] text-slate-400">Offer a discount when buying multiple items in bundle layout</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          offerSettings: {
                            ...form.offerSettings,
                            comboDiscountToggle: !form.offerSettings.comboDiscountToggle,
                          },
                        })
                      }
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        form.offerSettings.comboDiscountToggle ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                          form.offerSettings.comboDiscountToggle ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {form.offerSettings.comboDiscountToggle && (
                    <div className="space-y-4 pt-2 border-t border-slate-200/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Min Qty to Trigger Discount</label>
                          <input
                            type="number"
                            min="1"
                            value={form.offerSettings.comboMinQty}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                offerSettings: {
                                  ...form.offerSettings,
                                  comboMinQty: Math.max(1, parseInt(e.target.value) || 2),
                                },
                              })
                            }
                            placeholder="e.g. 2"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Discount Type</label>
                          <select
                            value={form.offerSettings.comboDiscountType}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                offerSettings: {
                                  ...form.offerSettings,
                                  comboDiscountType: e.target.value as 'percentage' | 'fixed',
                                },
                              })
                            }
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Flat Amount (৳)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.1em]">Discount Value</label>
                        <input
                          type="number"
                          min="0"
                          value={form.offerSettings.comboDiscountValue}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              offerSettings: {
                                ...form.offerSettings,
                                comboDiscountValue: Math.max(0, parseFloat(e.target.value) || 0),
                              },
                            })
                          }
                          placeholder={form.offerSettings.comboDiscountType === 'percentage' ? 'e.g. 10 for 10%' : 'e.g. 200 for ৳200'}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ── Social Proof ── */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">6</div>
                    Testimonials
                  </h3>
                  <button
                    type="button"
                    onClick={addTestimonial}
                    className="text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Testimonial
                  </button>
                </div>
                {form.socialProof.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 rounded-xl p-4 text-center">
                    No testimonials yet. Add social proof to boost conversions.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {form.socialProof.map((t, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/30">
                        <div className="flex justify-between items-start">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">Customer Name</label>
                              <input
                                type="text"
                                value={t.name}
                                onChange={(e) => updateTestimonial(idx, 'name', e.target.value)}
                                placeholder="Sarah K."
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">Photo URL <span className="text-slate-300 font-normal">(optional)</span></label>
                              <div className="relative">
                                <input
                                  type="url"
                                  value={t.image || ''}
                                  onChange={(e) => updateTestimonial(idx, 'image', e.target.value)}
                                  placeholder="https://example.com/photo.jpg"
                                  className={`w-full px-3 py-2 bg-white border rounded-lg outline-none transition-all text-sm ${
                                    t.image && isValidImageUrl(t.image)
                                      ? 'border-emerald-200'
                                      : t.image && !isValidImageUrl(t.image)
                                      ? 'border-red-200'
                                      : 'border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10'
                                  }`}
                                />
                                {t.image && isValidImageUrl(t.image) && (
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full overflow-hidden border border-slate-200 bg-slate-50">
                                    <img src={t.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">Rating</label>
                              <select
                                value={t.rating}
                                onChange={(e) => updateTestimonial(idx, 'rating', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
                              >
                                {[5, 4, 3, 2, 1].map((r) => (
                                  <option key={r} value={r}>
                                    {r} Star{r !== 1 ? 's' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTestimonial(idx)}
                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors shrink-0 ml-2"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.1em]">Comment</label>
                          <textarea
                            value={t.comment}
                            onChange={(e) => updateTestimonial(idx, 'comment', e.target.value)}
                            placeholder="Absolutely love the quality and fit!"
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none transition-all text-sm focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ── Modal Footer ── */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-all disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-[#A31F24] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  {saving ? (
                    <><Loader2 className="animate-spin" size={14} /> Saving...</>
                  ) : (
                    <>{editingId ? 'Update Page' : 'Create Page'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
      {showPreview && previewPage && (
        <LandingPagePreviewModal
          page={previewPage}
          onClose={() => {
            setShowPreview(false);
            setPreviewPage(null);
          }}
        />
      )}

      {/* ── Analytics Panel ── */}
      {analyticsPanel && (
        <LandingPageAnalyticsPanel
          slug={analyticsPanel.slug}
          pageTitle={analyticsPanel.title}
          onClose={() => setAnalyticsPanel(null)}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} /> Delete Landing Page
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-[#1A1A1A]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm">
                Are you sure you want to permanently delete <strong>{deleteTarget?.pageTitle}</strong>? This action cannot be undone and the landing page will no longer be accessible at <strong className="font-mono">/lp/{deleteTarget?.slug}</strong>.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FileText(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
}
