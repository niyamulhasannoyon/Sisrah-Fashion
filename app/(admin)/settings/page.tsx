'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Save, Loader2, UploadCloud, X, Users, Image as ImageIcon, Sliders, Layers, Truck, Settings, Trash2 } from 'lucide-react';
import { getDirectImageLink } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

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
    paymentNumber: '',
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
  const [activeTab, setActiveTab] = useState('general');

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
            paymentNumber: '',
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
        const data = await res.json();
        if (data.success) {
          useSettingsStore.setState({ settings: data.settings });
          alert("Settings updated successfully!");
        }
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
    <div className="max-w-6xl animate-in fade-in duration-500 pb-20">
      
      {/* Header section with Title and Save Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans">Store Configurations</h1>
          <p className="text-sm text-slate-500 mt-1">Configure your online store brand identity, shipping, rules, and visuals.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="bg-black text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#A31F24] transition-all shadow-md disabled:opacity-70 shrink-0"
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} 
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Vertical Menu / Sidebar */}
        <div className="w-full lg:w-[260px] shrink-0 lg:sticky lg:top-20">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 space-y-1">
            {[
              { id: 'general', label: 'General Details', icon: Settings, desc: 'Identity, contacts, & socials' },
              { id: 'announcement', label: 'Announcements', icon: Sliders, desc: 'Top promo bar config' },
              { id: 'hero', label: 'Hero Banner & Story', icon: ImageIcon, desc: 'Homepage slides & copy' },
              { id: 'categories', label: 'Category Banners', icon: Layers, desc: 'Grid banner backgrounds' },
              { id: 'shipping', label: 'Shipping & Delivery', icon: Truck, desc: 'Rates & free shipping rules' },
              { id: 'community', label: 'Community Gallery', icon: Users, desc: 'Tag-to-be-featured uploads' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left group ${
                    activeTab === tab.id
                      ? 'bg-black text-white shadow-sm'
                      : 'text-slate-600 hover:text-black hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-black'} />
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
                    <span className={`text-[9px] font-medium mt-0.5 ${activeTab === tab.id ? 'text-slate-300' : 'text-slate-400'}`}>{tab.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Tab Content Panel */}
        <div className="flex-1 w-full min-w-0">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Tab 1: General Details */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    Social Media Accounts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                {/* Preview Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">Visual Previews</h3>
                  <div className="flex gap-12">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Logo Preview</p>
                      <div className="w-32 h-20 bg-slate-50 border rounded-xl flex items-center justify-center p-2">
                        {settings.logo ? <Image src={getDirectImageLink(settings.logo)} alt="Logo preview" width={128} height={80} className="max-w-full max-h-full object-contain" /> : 'No Logo'}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Favicon Preview</p>
                      <div className="w-16 h-16 bg-slate-50 border rounded-xl flex items-center justify-center p-2">
                        {settings.favicon ? <Image src={getDirectImageLink(settings.favicon)} alt="Favicon preview" width={32} height={32} className="w-8 h-8 object-contain" /> : 'No Icon'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Announcements */}
            {activeTab === 'announcement' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            )}

            {/* Tab 3: Hero Banner & Brand Story */}
            {activeTab === 'hero' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    Homepage Hero Slider Images
                  </h3>
                  <div className="flex flex-col gap-2">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Hero Slider Images (Backgrounds)</label>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Add as many images as you like. They will rotate automatically on the homepage hero banner.</p>
                    </div>
                                       {/* List of current hero images */}
                    <div className="space-y-4 mt-2 mb-4">
                      {settings.heroImages?.map((img: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 shadow-sm relative group">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Slide #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = settings.heroImages.filter((_: any, index: number) => index !== idx);
                                setSettings({ ...settings, heroImages: newImages });
                              }}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <Trash2 size={14} /> Remove Slide
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Desktop Image Section */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Desktop Image</label>
                              <div className="flex gap-3">
                                {/* Preview */}
                                <div className="relative w-24 h-16 border border-slate-200 rounded-lg overflow-hidden shrink-0 bg-white shadow-sm flex items-center justify-center">
                                  {img.url ? (
                                    <Image src={getDirectImageLink(img.url)} fill sizes="96px" className="object-cover" alt="desktop preview" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                      <ImageIcon size={20} />
                                    </div>
                                  )}
                                </div>
                                {/* Upload & URL */}
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={img.url || ''}
                                    onChange={(e) => {
                                      const newImages = [...settings.heroImages];
                                      newImages[idx] = { ...newImages[idx], url: e.target.value };
                                      setSettings({ ...settings, heroImages: newImages });
                                    }}
                                    placeholder="Desktop Image URL"
                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-xs"
                                  />
                                  <div className="flex gap-2">
                                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 text-[10px] font-bold text-slate-600 transition-all">
                                      <UploadCloud size={12} />
                                      <span>Upload</span>
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                          if (!e.target.files?.length) return;
                                          setSaving(true);
                                          try {
                                            const data = await uploadToCloudinary(e.target.files[0]);
                                            const newImages = [...settings.heroImages];
                                            newImages[idx] = { ...newImages[idx], url: data.secure_url, public_id: data.public_id };
                                            setSettings({ ...settings, heroImages: newImages });
                                          } catch (error) {
                                            alert("Upload failed!");
                                          } finally {
                                            setSaving(false);
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Mobile Image Section */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Mobile Image (Optional)</label>
                              <div className="flex gap-3">
                                {/* Preview */}
                                <div className="relative w-24 h-16 border border-slate-200 rounded-lg overflow-hidden shrink-0 bg-white shadow-sm flex items-center justify-center">
                                  {img.mobileUrl ? (
                                    <Image src={getDirectImageLink(img.mobileUrl)} fill sizes="96px" className="object-cover" alt="mobile preview" />
                                  ) : img.url ? (
                                    <div className="relative w-full h-full opacity-60">
                                      <Image src={getDirectImageLink(img.url)} fill sizes="96px" className="object-cover grayscale-[30%]" alt="fallback desktop preview" />
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[9px] font-black uppercase tracking-wider text-white text-center px-1">
                                        Same as Desktop
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                      <ImageIcon size={20} />
                                    </div>
                                  )}
                                </div>
                                {/* Upload & URL */}
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={img.mobileUrl || ''}
                                    onChange={(e) => {
                                      const newImages = [...settings.heroImages];
                                      newImages[idx] = { ...newImages[idx], mobileUrl: e.target.value };
                                      setSettings({ ...settings, heroImages: newImages });
                                    }}
                                    placeholder="Mobile Image URL (falls back to desktop)"
                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-black text-xs"
                                  />
                                  <div className="flex gap-2">
                                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 text-[10px] font-bold text-slate-600 transition-all">
                                      <UploadCloud size={12} />
                                      <span>Upload Mobile</span>
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                          if (!e.target.files?.length) return;
                                          setSaving(true);
                                          try {
                                            const data = await uploadToCloudinary(e.target.files[0]);
                                            const newImages = [...settings.heroImages];
                                            newImages[idx] = { ...newImages[idx], mobileUrl: data.secure_url, mobilePublicId: data.public_id };
                                            setSettings({ ...settings, heroImages: newImages });
                                          } catch (error) {
                                            alert("Upload failed!");
                                          } finally {
                                            setSaving(false);
                                          }
                                        }}
                                      />
                                    </label>
                                    {img.mobileUrl && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newImages = [...settings.heroImages];
                                          newImages[idx] = { ...newImages[idx], mobileUrl: '', mobilePublicId: '' };
                                          setSettings({ ...settings, heroImages: newImages });
                                        }}
                                        className="text-red-500 hover:text-red-700 text-[10px] font-bold px-2 py-1.5 border border-red-200 rounded-lg bg-red-50/50 hover:bg-red-50 transition-all"
                                      >
                                        Clear Mobile
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add new slide container */}
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-slate-700">Add a New Hero Slide</h4>
                        <p className="text-[10px] text-slate-400">Upload a desktop image to start. You can then add an optional mobile-specific crop.</p>
                      </div>
                      
                      <div className="flex gap-3 w-full md:w-auto shrink-0">
                        {/* Upload */}
                        <label className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-black hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition-all">
                          {uploadingHero ? (
                            <Loader2 size={14} className="animate-spin text-slate-400" />
                          ) : (
                            <>
                              <UploadCloud size={14} className="text-slate-500" />
                              <span>Upload Image</span>
                            </>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                            if (!e.target.files?.length) return;
                            setSaving(true);
                            setUploadingHero(true);
                            try {
                              const data = await uploadToCloudinary(e.target.files[0]);
                              setSettings({
                                ...settings,
                                heroImages: [...(settings.heroImages || []), { url: data.secure_url, public_id: data.public_id, mobileUrl: '', mobilePublicId: '' }]
                              });
                            } catch (error) {
                              alert("Upload failed!");
                            } finally {
                              setUploadingHero(false);
                              setSaving(false);
                            }
                          }} />
                        </label>
                        
                        {/* Add empty slide */}
                        <button
                          type="button"
                          onClick={() => {
                            setSettings({
                              ...settings,
                              heroImages: [...(settings.heroImages || []), { url: '', public_id: '', mobileUrl: '', mobilePublicId: '' }]
                            });
                          }}
                          className="flex-1 md:w-auto px-4 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-lg hover:bg-slate-800 transition-all font-sans"
                        >
                          + Add Empty Slide
                        </button>
                      </div>
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
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                    Brand Ethos & Homepage Story
                  </h3>
                  <div className="flex flex-col gap-2">
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
            )}

            {/* Tab 4: Category Banners */}
            {activeTab === 'categories' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                  Homepage Category Banner Backgrounds
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Men's Banner */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-widest block">Men's Category Image</label>
                    <div className="aspect-[4/5] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative group">
                      {settings.categoryImageMen ? (
                        <Image src={getDirectImageLink(settings.categoryImageMen)} fill sizes="(max-width: 768px) 100vw, 33vw" className="w-full h-full object-cover animate-in fade-in duration-300" alt="Men's Banner" />
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
                        <Image src={getDirectImageLink(settings.categoryImageWomen)} fill sizes="(max-width: 768px) 100vw, 33vw" className="w-full h-full object-cover animate-in fade-in duration-300" alt="Women's Banner" />
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
                        <Image src={getDirectImageLink(settings.categoryImageFusion)} fill sizes="(max-width: 768px) 100vw, 33vw" className="w-full h-full object-cover animate-in fade-in duration-300" alt="Fusion Banner" />
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
            )}

            {/* Tab 5: Shipping & Delivery */}
            {activeTab === 'shipping' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                  E-Commerce Shipping Configurations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Mobile Banking Settings */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">
                    Mobile Banking Settings
                  </h4>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Payment Recipient Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 01733919156"
                      value={settings.paymentNumber || ''}
                      onChange={e => setSettings({...settings, paymentNumber: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                    />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      This number is displayed to customers at checkout under Mobile Banking instructions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: Community Gallery */}
            {activeTab === 'community' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                        <Image src={img.url} fill sizes="128px" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="community" />
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
            )}

            {/* Bottom Actions Row */}
            <div className="flex justify-end pt-4 border-t border-slate-200 mt-6">
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

      </div>
    </div>
  );
}
