'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, UploadCloud, X, Users, Image as ImageIcon } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({
    logo: '',
    whatsappNumber: '',
    heroImage: '',
    ethosImage: '',
    communityImages: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (data.success && data.settings) {
          setSettings(data.settings);
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
          {/* General Configuration */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              General Configuration
            </h3>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">WhatsApp Business Number</label>
              <input 
                type="text" 
                value={settings.whatsappNumber}
                onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                placeholder="e.g. +8801733919156"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Brand Logo</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={settings.logo}
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
              {settings.logo && (
                <div className="mt-2 w-20 h-20 border rounded-lg p-1 bg-slate-50">
                   <img src={settings.logo} className="w-full h-full object-contain" alt="logo" />
                </div>
              )}
            </div>
          </div>

          {/* Homepage Visuals */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              Homepage Visuals
            </h3>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Hero Banner Image</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={settings.heroImage}
                  onChange={e => setSettings({...settings, heroImage: e.target.value})}
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all text-sm"
                />
                <label className="px-4 py-3 bg-slate-100 text-slate-600 rounded-lg cursor-pointer hover:bg-slate-200 transition-all flex items-center gap-2 shrink-0">
                  <UploadCloud size={18} />
                  <span className="text-[10px] font-black uppercase">Upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    if (!e.target.files?.[0]) return;
                    setSaving(true);
                    const data = await uploadToCloudinary(e.target.files[0]);
                    setSettings({...settings, heroImage: data.secure_url});
                    setSaving(false);
                  }} />
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Our Ethos / Brand Story Image</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={settings.ethosImage}
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
          </div>
        </div>

        {/* From The Community Images Upload */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
            <Users size={18} className="text-slate-400" /> "From The Community" Gallery
          </h3>
          <p className="text-xs text-slate-500">Upload customer photos or Instagram lifestyle shots to show on the homepage.</p>
          
          <div className="flex flex-wrap gap-4 mt-6">
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
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
            
            <label className="w-32 h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-black transition-all group">
              {uploadingImg ? (
                <Loader2 size={24} className="animate-spin text-slate-400" />
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-slate-200 transition-colors">
                    <UploadCloud size={20} className="text-slate-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-black">Add Photo</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleCommunityImageUpload} />
            </label>
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
