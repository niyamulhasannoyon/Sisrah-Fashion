'use client';

import { useMemo, useState, useEffect } from 'react';
import { Heart, Share2, Star, ShieldCheck, UploadCloud, X, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import MobileStickyCart from '@/components/product/MobileStickyCart';
import SizeGuideModal from '@/components/product/SizeGuideModal';
import WhatsAppButton from '@/components/product/WhatsAppButton';
import { formatCurrency, getDirectImageLink } from '@/lib/utils';

interface ProductVariant {
  size: string;
  color: string;
  stock?: number;
  price?: number;
  offerPrice?: number;
  image?: { url: string; public_id: string };
}

interface ProductImage {
  url: string;
}

interface ProductDetailsClientProps {
  product: {
    _id: string;
    title: string;
    description?: string;
    category: string;
    basePrice: number;
    offerPrice?: number;
    rating?: number;
    numReviews?: number;
    reviews?: any[];
    discountPrice?: number;
    averageRating?: number;
    images?: ProductImage[];
    variants?: ProductVariant[];
  };
  reviews: Array<{
    _id: string;
    name: string;
    rating: number;
    comment: string;
    createdAt: string;
    images?: Array<{ url: string; public_id: string }>;
    verifiedPurchase?: boolean;
  }>;
}

export default function ProductDetailsClient({ product, reviews }: ProductDetailsClientProps) {
  const [selectedColor, setSelectedColor] = useState(product.variants?.[0]?.color ?? '');
  const [selectedSize, setSelectedSize] = useState(product.variants?.[0]?.size ?? '');
  const [activeImage, setActiveImage] = useState(0);
  const [productUrl, setProductUrl] = useState('');

  // Reviews submission state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewImages, setReviewImages] = useState<Array<{url: string, public_id: string}>>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localReviews, setLocalReviews] = useState<any[]>(reviews || []);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLocalReviews(reviews || []);
  }, [reviews]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProductUrl(window.location.href);
    }
  }, []);
  const addToCart = useCartStore((state) => state.addToCart);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'loomra_preset';
      const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dj3uym3gv';
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) {
        setReviewImages(prev => [...prev, { url: data.secure_url, public_id: data.public_id }]);
      } else {
        alert("Upload failed!");
      }
    } catch (error) { 
      alert("Upload failed!"); 
    } finally { 
      setUploading(false); 
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return alert("Please select a rating between 1 and 5 stars.");
    if (!comment.trim()) return alert("Please enter a review comment.");
    
    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment,
          images: reviewImages
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Review submitted successfully!");
        setComment('');
        setRating(5);
        setReviewImages([]);
      } else {
        alert(data.error || "Failed to submit review");
      }
    } catch (err) {
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const availableColors = useMemo(
    () => [...new Set(product.variants?.map((variant) => variant.color).filter(Boolean))],
    [product.variants]
  );

  const availableSizes = useMemo(
    () => [...new Set(product.variants?.map((variant) => variant.size).filter(Boolean))],
    [product.variants]
  );

  const currentVariant = useMemo(() => {
    return product.variants?.find((v: any) => v.color === selectedColor && v.size === selectedSize);
  }, [product.variants, selectedColor, selectedSize]);

  const displayPrice = currentVariant?.price || product.basePrice;
  const displayOfferPrice = currentVariant?.offerPrice || product.offerPrice || 0;

  const imageUrl = useMemo(() => {
    if (currentVariant?.image?.url) return currentVariant.image.url;
    return product.images?.[activeImage]?.url ?? product.images?.[0]?.url ?? '/images/linen-shirt.jpg';
  }, [currentVariant, product.images, activeImage]);

  const hasSelectedOptions = Boolean(selectedColor && selectedSize);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 lg:py-16 pb-48 md:pb-8">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 relative">
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          {/* Main Image Container - Fixed Max Height to avoid screen overflow */}
          <div className="w-full bg-loomra-surface relative group cursor-zoom-in overflow-hidden aspect-[4/5] max-h-[600px] 2xl:max-h-[750px] rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
            <img
              src={imageUrl}
              alt={`AS SIDRAT ${product.title} for Men Bangladesh`}
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          {/* Thumbnail Gallery - Horizontal for better space management */}
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar shrink-0">
            {product.images?.map((img: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative w-20 h-24 shrink-0 border-2 rounded-xl overflow-hidden transition-all ${activeImage === idx ? 'border-loomra-black shadow-md opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img.url} alt={`AS SIDRAT ${product.title} for Men Bangladesh - View ${idx + 1}`} className="w-full h-full object-cover object-top" />
              </button>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-2/5 lg:sticky lg:top-[100px] h-fit flex flex-col gap-6 pb-8 lg:pb-0">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h1 className="text-product-title font-bold text-loomra-black leading-tight">{product.title}</h1>
              <button className="text-loomra-muted hover:text-loomra-red transition-colors">
                <Share2 size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              {displayOfferPrice > 0 && displayOfferPrice < displayPrice ? (
                <>
                  <p className="text-price font-bold text-loomra-red">{formatCurrency(displayOfferPrice)}</p>
                  <p className="text-small font-medium text-loomra-muted line-through">{formatCurrency(displayPrice)}</p>
                  <span className="bg-loomra-red/10 text-loomra-red text-[10px] font-black uppercase px-2 py-1 rounded-full">
                    Save {Math.round(((displayPrice - displayOfferPrice) / displayPrice) * 100)}%
                  </span>
                </>
              ) : (
                <p className="text-price font-bold text-loomra-red">{formatCurrency(displayPrice)}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
             {/* reviews logic ... */}
          </div>

          <hr className="border-loomra-surface" />

          <div className="flex flex-col gap-4">
            <span className="text-small font-bold uppercase tracking-widest text-loomra-black">
              Color: <span className="font-normal text-loomra-muted">{selectedColor}</span>
            </span>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color: any) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border text-xs font-bold uppercase tracking-widest transition-all ${selectedColor === color ? 'bg-loomra-black text-loomra-white border-loomra-black shadow-lg' : 'bg-white text-loomra-muted border-loomra-surface hover:border-loomra-black'}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-small font-bold uppercase tracking-widest text-loomra-black">Size: {selectedSize}</span>
              <button 
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-small text-loomra-muted underline hover:text-loomra-black transition-colors"
              >
                Size Guide
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {availableSizes.map((size: any) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-4 border ${selectedSize === size ? 'border-loomra-black bg-loomra-black text-loomra-white shadow-md' : 'border-loomra-surface text-loomra-black hover:border-loomra-black'} text-small font-medium transition-all`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Dynamic Scarcity/Stock Urgency Indicator */}
            {hasSelectedOptions && currentVariant && (
              <div className="mt-4 text-xs font-bold transition-all">
                {currentVariant.stock === 0 ? (
                  <span className="text-[#A31F24] uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    ⚡ Out of Stock (Select another option)
                  </span>
                ) : (currentVariant.stock || 0) <= 10 ? (
                  <span className="text-[#A31F24] uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    ⚡ Only {currentVariant.stock} items left in stock — order soon!
                  </span>
                ) : (currentVariant.stock || 0) <= 20 ? (
                  <span className="text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                    ⚠️ Limited quantity available
                  </span>
                ) : (
                  <span className="text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                    ✓ In Stock (Ready to Ship)
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:flex gap-4 mt-4">
            <button
              onClick={() => {
                const finalPrice = displayOfferPrice > 0 ? displayOfferPrice : displayPrice;
                addToCart({
                  _id: product._id,
                  title: product.title,
                  price: finalPrice,
                  image: imageUrl,
                  selectedSize,
                  selectedColor,
                  availableSizes,
                  availableColors
                });
              }}
              disabled={!hasSelectedOptions || currentVariant?.stock === 0}
              className="flex-1 bg-loomra-red text-loomra-white py-4 text-small font-bold uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button className="px-6 border border-loomra-surface text-loomra-black hover:border-loomra-red hover:text-loomra-red transition-all flex items-center justify-center">
              <Heart size={24} />
            </button>
          </div>

          <div className="mt-2">
            <WhatsAppButton 
              productName={product.title} 
              productUrl={productUrl} 
              price={displayOfferPrice > 0 ? displayOfferPrice : displayPrice} 
            />
          </div>

          {product.description && (
            <div className="mt-6 border-t border-loomra-surface pt-6 flex flex-col gap-3">
              <span className="text-small font-bold uppercase tracking-widest text-loomra-black">Description & Details</span>
              <p className="text-small text-loomra-muted leading-relaxed whitespace-pre-line font-light">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <MobileStickyCart
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        disabled={!hasSelectedOptions || currentVariant?.stock === 0}
        buttonText={
          currentVariant?.stock === 0 
            ? 'Out of Stock' 
            : !hasSelectedOptions 
              ? 'Select Size' 
              : 'Add to Cart'
        }
      />

      <SizeGuideModal 
        isOpen={isSizeGuideOpen} 
        onClose={() => setIsSizeGuideOpen(false)} 
      />

      {/* Customer Reviews Section */}
      <div className="mt-16 lg:mt-24 border-t border-loomra-surface pt-10 lg:pt-16">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-black uppercase tracking-[4px] text-loomra-black mb-10">
            Customer Reviews <span className="text-loomra-red">.</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Review Summary */}
            <div className="lg:col-span-1">
              <div className="bg-loomra-surface p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-black text-loomra-black mb-2">
                  {product.rating?.toFixed(1) || '0.0'}
                </span>
                <div className="flex text-loomra-red mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={20} fill={i < Math.round(product.rating || 0) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <p className="text-small font-bold text-loomra-muted uppercase tracking-widest">
                  Based on {product.numReviews || 0} reviews
                </p>
              </div>
            </div>

            {/* Review List */}
            <div className="lg:col-span-2 space-y-8">
              {/* Submission Form */}
              <form onSubmit={handleSubmitReview} className="bg-white p-8 border border-loomra-surface rounded-2xl shadow-sm space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-loomra-black">Write a review</h3>
                
                {message && (
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs font-semibold border border-emerald-100 animate-in fade-in duration-300">
                    {message}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Rating Selector */}
                  <div className="flex gap-1.5 items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Your Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-colors focus:outline-none"
                      >
                        <Star 
                          size={24} 
                          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} 
                        />
                      </button>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <textarea 
                    placeholder="Share your honest feedback about this product (quality, fit, fabric...)" 
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    required
                    className="w-full p-4 bg-loomra-surface border-none rounded-xl outline-none focus:ring-2 focus:ring-loomra-black/5 text-small transition-all resize-none"
                  />

                  {/* Image Upload for Review */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 hover:border-slate-800 transition-all flex items-center gap-2 select-none">
                        {uploading ? (
                          <Loader2 size={16} className="animate-spin text-slate-400" />
                        ) : (
                          <UploadCloud size={16} className="text-slate-500" />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {uploading ? 'Uploading...' : 'Add Photos'}
                        </span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          disabled={uploading}
                          onChange={handlePhotoUpload} 
                        />
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">Show other customers how it looks in real life!</span>
                    </div>

                    {/* Image Thumbnails preview */}
                    {reviewImages.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 pt-1">
                        {reviewImages.map((img, idx) => (
                          <div key={idx} className="relative w-14 h-14 border rounded-xl overflow-hidden shadow-sm bg-slate-50 group">
                            <img src={getDirectImageLink(img.url)} className="w-full h-full object-cover" alt="Review thumbnail" />
                            <button
                              type="button"
                              onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting || uploading}
                    className="bg-loomra-black text-loomra-white px-8 py-4 text-[10px] font-black uppercase tracking-[2px] hover:bg-loomra-red transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-6 divide-y divide-loomra-surface">
                {localReviews && localReviews.length > 0 ? (
                  localReviews.map((review: any) => (
                    <div key={review._id} className="pt-6 first:pt-0 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-loomra-black text-small uppercase tracking-widest">{review.name}</span>
                          {review.verifiedPurchase && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded select-none">
                              <ShieldCheck size={11} className="text-emerald-500" /> Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-loomra-muted font-bold uppercase">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Star rating */}
                      <div className="flex text-amber-400 gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < review.rating ? 'currentColor' : 'none'} 
                            className={i < review.rating ? 'text-amber-400' : 'text-slate-200'}
                          />
                        ))}
                      </div>

                      <p className="text-small text-slate-600 leading-relaxed italic bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        "{review.comment}"
                      </p>

                      {/* Display review photos */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {review.images.map((img: any, idx: number) => (
                            <div key={idx} className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shadow-sm shrink-0 bg-slate-50">
                              <a href={getDirectImageLink(img.url)} target="_blank" rel="noopener noreferrer">
                                <img src={getDirectImageLink(img.url)} className="w-full h-full object-cover hover:scale-105 transition duration-300" alt="Review photo upload" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-small text-loomra-muted italic">No reviews yet. Be the first to share your experience!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
