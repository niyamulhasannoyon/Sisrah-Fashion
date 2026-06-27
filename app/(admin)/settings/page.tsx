'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, UploadCloud, X, Users, Image as ImageIcon } from 'lucide-react';
import { getDirectImageLink } from '@/lib/utils';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({
    logo: '',
    favicon: '',
    whatsappNumber: '',
    heroImage: '',
    heroImages: [],
    ethosImage: '',
    communityImages: [],
    announcementText: '',
    announcementLink: '',
    announcementBgColor: '#A31F24',
    contactEmail: '',
    contactAddress: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    shippingInsideDhaka: 60,
    shippingOutsideDhaka: 120,
    freeShippingTrigger: 'none',
    freeShippingMinQuantity: 2,
    freeShippingMinAmount: 3000,
    categoryImageMen: '',
    categoryImageWomen: '',
    categoryImageFusion: '',
    heroHeadline: '',
    heroSubheadline: '',
    ethosHeadline: '',
    ethosDescription: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [communityUrl, setCommunityUrl] = useState('');
  const [uploadingHero, setUploadingHero] = useState(false);
  const [heroUrl, setHeroUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (data.success && data.settings) {
          setSettings({
            logo: '',
            favicon: '',
            whatsappNumber: '',
            heroImage: '',
            heroImages: [],
            ethosImage: '',
            communityImages: [],
            announcementText: '',
            announcementLink: '',
            announcementBgColor: '#A31F24',
            contactEmail: '',
            contactAddress: '',
            facebookUrl: '',
            instagramUrl: '',
            youtubeUrl: '',
            shippingInsideDhaka: 60,
            shippingOutsideDhaka: 120,
            freeShippingTrigger: 'none',
            freeShippingMinQuantity: 2,
            freeShippingMinAmount: 3000,
            categoryImageMen: '',
            categoryImageWomen: '',
            categoryImageFusion: '',
            heroHeadline: '',
            heroSubheadline: '',
            ethosHeadline: '',
            ethosDescription: '',
            ...data.settings
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching settings:", err);
        setLoading(false);
      });
  }, []);

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'loomra_preset'); 
    const CLOUD_NAME = 'dj3uym3gv'; 
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
    return await res.json();
  };

  const handleCommunityImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingImg(true);
    try {
      const data = await uploadToCloudinary(e.target.files[0]);
      setSettings({
        ...settings, 
        communityImages: [...(settings.communityImages || []), { url: data.secure_url, public_id: data.public_id }]
      });
    } catch (error) { 
      alert("Upload failed!"); 
    } finally { 
      setUploadingImg(false); 
    }
  };

  const handleAddCommunityByUrl = () => {
    if (!communityUrl) return;
    setSettings({
      ...settings,
      communityImages: [...(settings.communityImages || []), { url: communityUrl, public_id: 'external' }]
    });
    setCommunityUrl('');
  };

  const removeCommunityImage = (indexToRemove: number) => {
    const newImages = settings.communityImages.filter((_: any, index: number) => index !== indexToRemove);
    setSettings({ ...settings, communityImages: newImages });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert("Settings updated successfully!");
      }
    } catch (error) {
      alert("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="animate-spin text-[#A31F24]" size={32} />
      <p className="text-sm font-medium text-slate-500">Loading settings...</p>
    </div>
  );

  return (
    <div className="max-w-4xl animate-in fade-in duration-500 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Site Customization</h1>
        <p className="text-sm text-slate-500 mt-1">Control your brand identity and homepage content from one place.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Configuration & Contact */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              General Identity & Contacts
            </h3>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">WhatsApp Business Number</label>
              <input 
                type="text" 
                value={settings.whatsappNumber || ''}
                onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                placeholder="e.g. +8801733919156"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Support Email Address</label>
              <input 
                type="email" 
                value={settings.contactEmail || ''}
                onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                placeholder="support@brand.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Store Address</label>
              <input 
                type="text" 
                value={settings.contactAddress || ''}
                onChange={e => setSettings({...settings, contactAddress: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                placeholder="Gulshan-2, Dhaka, Bangladesh"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Brand Logo URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={settings.logo || ''}
                  onChange={e => setSettings({...settings, logo: e.target.value})}
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                  placeholder="Logo URL..."
                />
                <label className="px-4 py-3 bg-slate-100 text-slate-600 rounded-lg cursor-pointer hover:bg-slate-200 transition-all flex items-center gap-2 shrink-0">
                  <UploadCloud size={18} />
                  <span className="text-[10px] font-black uppercase">Upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    if (!e.target.files?.[0]) return;
                    setSaving(true);
                    const data = await uploadToCloudinary(e.target.files[0]);
                    setSettings({...settings, logo: data.secure_url});
                    setSaving(false);
                  }} />
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Site Icon (Favicon) URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={settings.favicon || ''}
                  onChange={e => setSettings({...settings, favicon: e.target.value})}
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                  placeholder="Favicon URL..."
                />
                <label className="px-4 py-3 bg-slate-100 text-slate-600 rounded-lg cursor-pointer hover:bg-slate-200 transition-all flex items-center gap-2 shrink-0">
                  <UploadCloud size={18} />
                  <span className="text-[10px] font-black uppercase">Upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    if (!e.target.files?.[0]) return;
                    setSaving(true);
                    const data = await uploadToCloudinary(e.target.files[0]);
                    setSettings({...settings, favicon: data.secure_url});
                    setSaving(false);
                  }} />
                </label>
              </div>
            </div>
          </div>

          {/* Marketing & Visuals */}
          <div className="space-y-6">
            
            {/* Promo Announcement Bar */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                Promotional Announcement Bar
              </h3>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Announcement Text</label>
                <input 
                  type="text" 
                  value={settings.announcementText || ''}
                  onChange={e => setSettings({...settings, announcementText: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                  placeholder="e.g. Free delivery on orders over ৳3,000!"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Action Link</label>
                  <input 
                    type="text" 
                    value={settings.announcementLink || ''}
                    onChange={e => setSettings({...settings, announcementLink: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                    placeholder="e.g. /category/men"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Background Color</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={settings.announcementBgColor || '#A31F24'}
                      onChange={e => setSettings({...settings, announcementBgColor: e.target.value})}
                      className="w-12 h-11 border border-slate-200 rounded-lg cursor-pointer bg-slate-50 p-1"
                    />
                    <input 
                      type="text" 
                      value={settings.announcementBgColor || '#A31F24'}
                      onChange={e => setSettings({...settings, announcementBgColor: e.target.value})}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm font-mono"
                      placeholder="#A31F24"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Homepage Banner Visuals */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                Homepage Hero & Brand Images
              </h3>
              <div className="flex flex-col gap-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Hero Slider Images (Backgrounds)</label>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Add as many images as you like. They will rotate automatically on the homepage hero banner.</p>
                </div>
                
                {/* List of current hero images */}
                <div className="flex flex-wrap gap-4 mb-2">
                  {settings.heroImages?.map((img: any, idx: number) => (
                    <div key={idx} className="relative w-32 h-20 border border-slate-100 rounded-xl overflow-hidden group shadow-sm bg-slate-50">
                      <img src={getDirectImageLink(img.url)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="hero slider banner" />
                      <button 
                        type="button" 
                        onClick={() => {
                          const newImages = settings.heroImages.filter((_: any, index: number) => index !== idx);
                          setSettings({ ...settings, heroImages: newImages });
                        }} 
                        className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Upload new hero image */}
                  <label className="w-32 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-black transition-all group shrink-0">
                    {uploadingHero ? (
                      <Loader2 size={16} className="animate-spin text-slate-400" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadCloud size={16} className="text-slate-500 mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-black">Upload</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      if (!e.target.files?.length) return;
                      setSaving(true);
                      setUploadingHero(true);
                      try {
                        const data = await uploadToCloudinary(e.target.files[0]);
                        setSettings({
                          ...settings,
                          heroImages: [...(settings.heroImages || []), { url: data.secure_url, public_id: data.public_id }]
                        });
                      } catch (error) {
                        alert("Upload failed!");
                      } finally {
                        setUploadingHero(false);
                        setSaving(false);
                      }
                    }} />
                  </label>
                </div>

                {/* Add by URL */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Or paste image URL here..." 
                    value={heroUrl}
                    onChange={(e) => setHeroUrl(e.target.value)}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black text-xs"
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      if (!heroUrl) return;
                      setSettings({
                        ...settings,
                        heroImages: [...(settings.heroImages || []), { url: heroUrl, public_id: 'external' }]
                      });
                      setHeroUrl('');
                    }}
                    className="px-4 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-lg hover:bg-slate-800 transition-all shrink-0 font-sans"
                  >
                    Add URL
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Hero Banner Headline</label>
                <input 
                  type="text" 
                  value={settings.heroHeadline || ''}
                  onChange={e => setSettings({...settings, heroHeadline: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                  placeholder="e.g. Minimalist Fashion, Maximum Breathing Room."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Hero Banner Subheadline</label>
                <input 
                  type="text" 
                  value={settings.heroSubheadline || ''}
                  onChange={e => setSettings({...settings, heroSubheadline: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                  placeholder="e.g. We build clothing that stands up to humidity..."
                />
              </div>
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Our Ethos / Brand Story Image URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={settings.ethosImage || ''}
                    onChange={e => setSettings({...settings, ethosImage: e.target.value})}
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                  />
                  <label className="px-4 py-3 bg-slate-100 text-slate-600 rounded-lg cursor-pointer hover:bg-slate-200 transition-all flex items-center gap-2 shrink-0">
                    <UploadCloud size={18} />
                    <span className="text-[10px] font-black uppercase">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      if (!e.target.files?.[0]) return;
                      setSaving(true);
                      const data = await uploadToCloudinary(e.target.files[0]);
                      setSettings({...settings, ethosImage: data.secure_url});
                      setSaving(false);
                    }} />
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Brand Story Title</label>
                <input 
                  type="text" 
                  value={settings.ethosHeadline || ''}
                  onChange={e => setSettings({...settings, ethosHeadline: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                  placeholder="e.g. Crafted for the Climate. Rooted in Tradition."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Brand Story Paragraph</label>
                <textarea 
                  value={settings.ethosDescription || ''}
                  onChange={e => setSettings({...settings, ethosDescription: e.target.value})}
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm resize-none"
                  placeholder="e.g. We source the finest long-staple cotton..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Homepage Category Banner Images */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
            <ImageIcon size={18} className="text-slate-400" /> Homepage Category Banners
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Men's Banner */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest block">Men's Category Image</label>
              <div className="aspect-[4/5] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative group">
                {settings.categoryImageMen ? (
                  <img src={getDirectImageLink(settings.categoryImageMen)} className="w-full h-full object-cover animate-in fade-in duration-300" alt="Men's Banner" />
                ) : (
                  <span className="text-xs text-slate-400">Default Unsplash Image</span>
                )}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={settings.categoryImageMen || ''}
                  onChange={e => setSettings({...settings, categoryImageMen: e.target.value})}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-xs"
                  placeholder="URL..."
                />
                <label className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg cursor-pointer hover:bg-slate-200 transition-all flex items-center gap-1 shrink-0">
                  <UploadCloud size={14} />
                  <span className="text-[9px] font-black uppercase">Upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    if (!e.target.files?.[0]) return;
                    setSaving(true);
                    const data = await uploadToCloudinary(e.target.files[0]);
                    setSettings({...settings, categoryImageMen: data.secure_url});
                    setSaving(false);
                  }} />
                </label>
              </div>
            </div>
            {/* Women's Banner */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest block">Women's Category Image</label>
              <div className="aspect-[4/5] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative group">
                {settings.categoryImageWomen ? (
                  <img src={getDirectImageLink(settings.categoryImageWomen)} className="w-full h-full object-cover animate-in fade-in duration-300" alt="Women's Banner" />
                ) : (
                  <span className="text-xs text-slate-400">Default Unsplash Image</span>
                )}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={settings.categoryImageWomen || ''}
                  onChange={e => setSettings({...settings, categoryImageWomen: e.target.value})}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-xs"
                  placeholder="URL..."
                />
                <label className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg cursor-pointer hover:bg-slate-200 transition-all flex items-center gap-1 shrink-0">
                  <UploadCloud size={14} />
                  <span className="text-[9px] font-black uppercase">Upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    if (!e.target.files?.[0]) return;
                    setSaving(true);
                    const data = await uploadToCloudinary(e.target.files[0]);
                    setSettings({...settings, categoryImageWomen: data.secure_url});
                    setSaving(false);
                  }} />
                </label>
              </div>
            </div>
            {/* Fusion's Banner */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest block">Fusion Category Image</label>
              <div className="aspect-[4/5] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative group">
                {settings.categoryImageFusion ? (
                  <img src={getDirectImageLink(settings.categoryImageFusion)} className="w-full h-full object-cover animate-in fade-in duration-300" alt="Fusion Banner" />
                ) : (
                  <span className="text-xs text-slate-400">Default Unsplash Image</span>
                )}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={settings.categoryImageFusion || ''}
                  onChange={e => setSettings({...settings, categoryImageFusion: e.target.value})}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-xs"
                  placeholder="URL..."
                />
                <label className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg cursor-pointer hover:bg-slate-200 transition-all flex items-center gap-1 shrink-0">
                  <UploadCloud size={14} />
                  <span className="text-[9px] font-black uppercase">Upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    if (!e.target.files?.[0]) return;
                    setSaving(true);
                    const data = await uploadToCloudinary(e.target.files[0]);
                    setSettings({...settings, categoryImageFusion: data.secure_url});
                    setSaving(false);
                  }} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & E-Commerce Constants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              E-Commerce Shipping Configurations
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Inside Dhaka (৳)</label>
                <input 
                  type="number" 
                  value={settings.shippingInsideDhaka ?? 80}
                  onChange={e => setSettings({...settings, shippingInsideDhaka: parseInt(e.target.value) || 0})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Outside Dhaka (৳)</label>
                <input 
                  type="number" 
                  value={settings.shippingOutsideDhaka ?? 150}
                  onChange={e => setSettings({...settings, shippingOutsideDhaka: parseInt(e.target.value) || 0})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            {/* Free Shipping Rules Section */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">
                Free Shipping Rules
              </h4>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Trigger Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'Disabled' },
                    { id: 'quantity', label: 'By Quantity' },
                    { id: 'amount', label: 'By Amount' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, freeShippingTrigger: option.id })}
                      className={`p-2.5 text-xs font-bold uppercase rounded-lg border transition-all text-center ${
                        settings.freeShippingTrigger === option.id
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {settings.freeShippingTrigger === 'quantity' && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Minimum Items Count</label>
                  <div className="flex gap-2 items-center">
                    {[2, 3].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setSettings({ ...settings, freeShippingMinQuantity: qty })}
                        className={`px-4 py-2.5 text-xs font-bold rounded-lg border transition-all ${
                          settings.freeShippingMinQuantity === qty
                            ? 'bg-[#A31F24] text-white border-[#A31F24] shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {qty} Items
                      </button>
                    ))}
                    <div className="relative flex-1">
                      <input 
                        type="number"
                        placeholder="Custom Qty..."
                        value={![2, 3].includes(settings.freeShippingMinQuantity) ? settings.freeShippingMinQuantity : ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setSettings({ ...settings, freeShippingMinQuantity: isNaN(val) ? 0 : val });
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm pl-3 pr-16"
                      />
                      {![2, 3].includes(settings.freeShippingMinQuantity) && (
                        <span className="absolute right-3 top-2.5 text-[9px] font-black uppercase text-[#A31F24]">Custom</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {settings.freeShippingTrigger === 'amount' && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Minimum Order Amount (৳)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      placeholder="e.g. 3000"
                      value={settings.freeShippingMinAmount ?? ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSettings({ ...settings, freeShippingMinAmount: isNaN(val) ? 0 : val });
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm pl-8"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">৳</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              Social Media Accounts
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Facebook Link</label>
                <input 
                  type="text" 
                  value={settings.facebookUrl || ''}
                  onChange={e => setSettings({...settings, facebookUrl: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-xs"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Instagram Link</label>
                <input 
                  type="text" 
                  value={settings.instagramUrl || ''}
                  onChange={e => setSettings({...settings, instagramUrl: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-xs"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">YouTube Link</label>
                <input 
                  type="text" 
                  value={settings.youtubeUrl || ''}
                  onChange={e => setSettings({...settings, youtubeUrl: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-xs"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-slate-400" /> "From The Community" Gallery
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Gallery Image URL {idx + 1}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://..." 
                    value={settings.communityImages?.[idx]?.url || ''}
                    onChange={e => {
                      const newImages = [...(settings.communityImages || [])];
                      if (newImages[idx]) {
                        newImages[idx].url = e.target.value;
                      } else {
                        newImages[idx] = { url: e.target.value, public_id: 'external' };
                      }
                      setSettings({...settings, communityImages: newImages});
                    }}
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black text-xs"
                  />
                  {settings.communityImages?.[idx] && (
                    <button 
                      type="button"
                      onClick={() => {
                        const newImages = [...settings.communityImages];
                        newImages.splice(idx, 1);
                        setSettings({...settings, communityImages: newImages});
                      }}
                      className="p-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Upload via Computer</label>
            <div className="flex flex-wrap gap-4 mt-2">
              {settings.communityImages?.map((img: any, idx: number) => (
              <div key={idx} className="relative w-32 h-40 border border-slate-100 rounded-xl overflow-hidden group shadow-sm">
                <img src={img.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="community" />
                <button 
                  type="button" 
                  onClick={() => removeCommunityImage(idx)} 
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            <label className="w-32 h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-black transition-all group">
              {uploadingImg ? (
                <Loader2 size={24} className="animate-spin text-slate-400" />
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud size={20} className="text-slate-500 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-black">Upload</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleCommunityImageUpload} />
            </label>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">Visual Previews</h3>
          <div className="flex gap-12">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Logo Preview</p>
              <div className="w-32 h-20 bg-slate-50 border rounded-xl flex items-center justify-center p-2">
                {settings.logo ? <img src={getDirectImageLink(settings.logo)} className="max-w-full max-h-full object-contain" /> : 'No Logo'}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Favicon Preview</p>
              <div className="w-16 h-16 bg-slate-50 border rounded-xl flex items-center justify-center p-2">
                {settings.favicon ? <img src={getDirectImageLink(settings.favicon)} className="w-8 h-8 object-contain" /> : 'No Icon'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={saving} 
            className="bg-black text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#A31F24] transition-all shadow-xl disabled:opacity-70"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
            {saving ? 'Updating...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
