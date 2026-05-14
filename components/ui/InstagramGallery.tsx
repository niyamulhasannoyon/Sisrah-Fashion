"use client";

import { Camera } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function InstagramGallery() {
  const { settings } = useSettingsStore();

  const defaultPosts = [
    { id: 1, image: '/ig-1.jpg', handle: '@rahim_styles' },
    { id: 2, image: '/ig-2.jpg', handle: '@nabilacreates' },
    { id: 3, image: '/ig-3.jpg', handle: '@dhaka.diaries' },
    { id: 4, image: '/ig-4.jpg', handle: '@urban_bengali' },
  ];

  const galleryImages = settings?.communityImages?.length 
    ? settings.communityImages.map((img, idx) => ({ id: idx, image: img.url, handle: '@LoomraApparel' }))
    : defaultPosts;

  return (
    <section className="py-64px">
      <div className="text-center mb-40px">
        <h2 className="text-product-title font-bold flex items-center justify-center gap-8px">
          <Camera /> @LoomraApparel
        </h2>
        <p className="text-small text-loomra-muted mt-8px">Tag us to be featured.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 w-full">
        {galleryImages.map((post) => (
          <div key={post.id} className="relative group aspect-square overflow-hidden bg-loomra-surface">
            <img src={post.image} alt={post.handle} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-small font-bold">{post.handle}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
