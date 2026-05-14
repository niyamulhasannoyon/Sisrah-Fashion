'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X, Save, UploadCloud, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [category, setCategory] = useState('Men');
  const [isTrending, setIsTrending] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mainImages, setMainImages] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  // Variants States
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const [dynamicColors, setDynamicColors] = useState(['Black', 'White', 'Navy Blue', 'Red', 'Olive', 'Gray', 'Mustard']);
  const [colorInput, setColorInput] = useState('');
  
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  // ডাটাবেস থেকে প্রোডাক্ট লোড করা
  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const p = data.product;
          setTitle(p.title);
          setDescription(p.description);
          setBasePrice(p.basePrice);
          setOfferPrice(p.offerPrice || 0);
          setCategory(p.category);
          setIsTrending(p.isTrending || false);
          setIsNewArrival(p.isNewArrival || false);
          setTags(p.tags || []);
          setMainImages(p.images || []);
          
          if (p.variants && p.variants.length > 0) {
            setVariants(p.variants);
            const eSizes = Array.from(new Set(p.variants.map((v:any) => v.size))) as string[];
            const eColors = Array.from(new Set(p.variants.map((v:any) => v.color))) as string[];
            setSelectedSizes(eSizes);
            setSelectedColors(eColors);
            
            // কাস্টম কালার থাকলে লিস্টে অ্যাড করা
            const newColors = eColors.filter(c => !dynamicColors.includes(c));
            if(newColors.length > 0) setDynamicColors([...dynamicColors, ...newColors]);
          }
        }
        setLoading(false);
      });
  }, [params.id]);

  // Cloudinary Upload Logic
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'loomra_preset'); 
    const CLOUD_NAME = 'dj3uym3gv'; 
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
    return await res.json();
  };

  const addImageViaUrl = () => {
    if (!imageUrl) return;
    setMainImages([...mainImages, { url: imageUrl, public_id: `url-${Date.now()}` }]);
    setImageUrl('');
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingImage(true);
    try {
      const data = await uploadToCloudinary(e.target.files[0]);
      setMainImages([...mainImages, { url: data.secure_url, public_id: data.public_id }]);
    } catch (error) { alert("Upload failed!"); } finally { setUploadingImage(false); }
  };

  const handleVariantImageUpload = async (index: number, file: File) => {
    setUploadingImage(true);
    try {
      const data = await uploadToCloudinary(file);
      handleVariantChange(index, 'image', { url: data.secure_url, public_id: data.public_id });
    } catch (error) { alert("Upload failed!"); } finally { setUploadingImage(false); }
  };

  // Variants Generator Logic
  useEffect(() => {
    if (loading) return; 
    if (selectedSizes.length === 0 || selectedColors.length === 0) {
      setVariants([]); return;
    }
    const newVariants: any[] = [];
    selectedSizes.forEach(size => {
      selectedColors.forEach(color => {
        const existing = variants.find(v => v.size === size && v.color === color);
        newVariants.push({
          size, color,
          price: existing ? existing.price : basePrice,
          stock: existing ? existing.stock : 10,
          image: existing?.image || null,
        });
      });
    });
    setVariants(newVariants);
  }, [selectedSizes, selectedColors, basePrice]);

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  const handleColorInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newColor = colorInput.trim();
      if (newColor && !dynamicColors.includes(newColor)) {
        setDynamicColors([...dynamicColors, newColor]);
        setSelectedColors([...selectedColors, newColor]);
      }
      setColorInput('');
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(',', '');
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const productData = { title, slug, description, basePrice, offerPrice, category, isTrending, isNewArrival, tags, images: mainImages, variants };

    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (res.ok) router.push('/products');
      else alert('Failed to update product');
    } catch (error) { console.error(error); } finally { setUpdating(false); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#A31F24]" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"><ArrowLeft size={18} /></button>
        <div><h1 className="text-2xl font-bold text-slate-900">Edit Product</h1></div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          
          {/* Images */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
               <ImageIcon size={18} className="text-slate-400" /> Main Product Gallery
            </h3>
            <div className="flex flex-wrap gap-4 mb-4">
              {mainImages.map((img, idx) => (
                <div key={idx} className="relative w-24 h-32 border rounded-lg overflow-hidden group">
                  <img src={img.url} className="w-full h-full object-cover" alt="img" />
                  <button type="button" onClick={() => setMainImages(mainImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X size={12} /></button>
                </div>
              ))}
              <label className="w-24 h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
                {uploadingImage ? <Loader2 size={24} className="animate-spin text-slate-400" /> : <UploadCloud size={24} className="text-slate-400" />}
                <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Add Gallery</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleMainImageUpload} />
              </label>
            </div>
            
            <div className="flex gap-2 mt-4">
              <input 
                type="text" 
                placeholder="Or paste image URL here..." 
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="flex-1 p-2 text-xs bg-slate-50 border border-slate-200 rounded outline-none focus:border-black transition-all"
              />
              <button 
                type="button" 
                onClick={addImageViaUrl}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded hover:bg-slate-200 transition-all"
              >
                Add Link
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">General Information</h3>
            <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Product Title</label><input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black transition-all" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Regular Price (৳)</label><input type="number" required value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black transition-all" /></div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Offer Price (৳)</label><input type="number" value={offerPrice} onChange={e => setOfferPrice(Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black transition-all" placeholder="0 if no offer" /></div>
            </div>
            <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Description</label><textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black resize-none transition-all" /></div>
          </div>

          {/* Variants */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 border-b pb-2">Inventory Variants (Sizes & Colors)</h3>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 mb-3">Sizes</p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <label key={size} className={`cursor-pointer px-4 py-2 border rounded-md text-sm font-bold transition-all ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 hover:border-black'}`}>
                    <input type="checkbox" className="hidden" checked={selectedSizes.includes(size)} onChange={(e) => { e.target.checked ? setSelectedSizes([...selectedSizes, size]) : setSelectedSizes(selectedSizes.filter(s => s !== size)); }} />
                    {size}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 mb-3">Colors</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {dynamicColors.map(color => (
                  <label key={color} className={`cursor-pointer px-4 py-2 border rounded-md text-sm font-bold transition-all ${selectedColors.includes(color) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 hover:border-black'}`}>
                    <input type="checkbox" className="hidden" checked={selectedColors.includes(color)} onChange={(e) => { e.target.checked ? setSelectedColors([...selectedColors, color]) : setSelectedColors(selectedColors.filter(c => c !== color)); }} />
                    {color}
                  </label>
                ))}
              </div>
              <input type="text" placeholder="+ Add custom color & hit Enter" value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={handleColorInput} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-black text-sm transition-all" />
            </div>

            {variants.length > 0 && (
              <div className="pt-4 border-t border-slate-100 overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50"><tr><th className="p-3 font-bold text-slate-600 border-b">Variant</th><th className="p-3 font-bold text-slate-600 border-b">Price (৳)</th><th className="p-3 font-bold text-slate-600 border-b">Stock</th><th className="p-3 font-bold text-slate-600 border-b">Color-wise Image</th></tr></thead>
                  <tbody>
                    {variants.map((variant, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-gray-800">{variant.size} / {variant.color}</td>
                        <td className="p-3"><input type="number" value={variant.price} onChange={e => handleVariantChange(idx, 'price', Number(e.target.value))} className="w-24 p-2 bg-white border border-slate-200 rounded outline-none focus:border-black" /></td>
                        <td className="p-3"><input type="number" value={variant.stock} onChange={e => handleVariantChange(idx, 'stock', Number(e.target.value))} className="w-24 p-2 bg-white border border-slate-200 rounded outline-none focus:border-black" /></td>
                        <td className="p-3">
                          <div className="flex flex-col gap-2">
                            {variant.image ? (
                               <div className="relative w-12 h-16 border rounded overflow-hidden group shadow-sm">
                                 <img src={variant.image.url} className="w-full h-full object-cover" alt="var" />
                                 <button type="button" onClick={() => handleVariantChange(idx, 'image', null)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                               </div>
                            ) : (
                               <div className="flex items-center gap-2">
                                 <label className="w-12 h-16 flex shrink-0 items-center justify-center border-2 border-dashed border-slate-200 rounded cursor-pointer hover:bg-slate-100 text-slate-400 hover:text-black transition-all">
                                   <UploadCloud size={16} />
                                   <input type="file" className="hidden" accept="image/*" onChange={(e) => { if(e.target.files) handleVariantImageUpload(idx, e.target.files[0]); }} />
                                 </label>
                                 <input 
                                   type="text" 
                                   placeholder="URL" 
                                   className="w-24 p-2 text-[10px] bg-white border border-slate-200 rounded outline-none focus:border-black"
                                   onBlur={(e) => {
                                     if (e.target.value) {
                                       handleVariantChange(idx, 'image', { url: e.target.value, public_id: `var-url-${Date.now()}` });
                                     }
                                   }}
                                 />
                               </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[320px] space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">Organization</h3>
            <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Category</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"><option value="Men">Men</option><option value="Women">Women</option><option value="Kids">Kids</option><option value="Accessories">Accessories</option></select></div>
            
            {/* Trending Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg mt-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Trending</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">Show on homepage</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isTrending} 
                  onChange={(e) => setIsTrending(e.target.checked)} 
                />
                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-[#A31F24] peer-focus:ring-2 peer-focus:ring-red-100 transition-all after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            {/* New Arrival Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg mt-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">New Drop</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">Mark as latest drop</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isNewArrival} 
                  onChange={(e) => setIsNewArrival(e.target.checked)} 
                />
                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-[#A31F24] peer-focus:ring-2 peer-focus:ring-red-100 transition-all after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100"><label className="text-xs font-bold uppercase text-slate-500">Smart Tags</label><input type="text" placeholder="Type tag & Enter" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagInput} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all" />
              <div className="flex flex-wrap gap-2 mt-2">{tags.map(tag => (<span key={tag} className="bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-slate-200">{tag} <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500 transition-colors"><X size={12} /></button></span>))}</div>
            </div>
          </div>
          <button type="submit" disabled={updating} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#A31F24] transition-all duration-300 shadow-lg flex justify-center items-center gap-2">
            {updating ? <Loader2 className="animate-spin" /> : <Save size={20} />} {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
