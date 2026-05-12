'use client';

import { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export function SocialGallery() {
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings?.communityImages) {
          setImages(data.settings.communityImages);
        }
      });
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="bg-white py-24 border-t border-slate-50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[4px] text-loomra-red mb-2">Our Community</p>
          <h2 className="text-4xl font-black uppercase tracking-tight text-loomra-black">Everyday style in real life <span className="text-loomra-red">.</span></h2>
          <p className="text-loomra-muted mt-2 text-sm">Tag us on Instagram <span className="font-bold text-loomra-black">@loomra_official</span> to be featured.</p>
        </div>
        
        {/* Horizontal Scroll Layout for better community feel */}
        <div className="flex overflow-x-auto gap-4 pb-8 px-4 -mx-10 custom-scrollbar snap-x">
          {images.map((img, idx) => (
            <div key={idx} className="relative w-64 md:w-80 aspect-[4/5] shrink-0 snap-center rounded-2xl overflow-hidden group cursor-pointer shadow-md">
              <img 
                src={img.url} 
                alt="Community Style" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                <ImageIcon className="text-white" size={32} />
                <span className="text-white text-[10px] font-black uppercase tracking-widest border-b-2 border-white pb-1">Shop The Look</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
