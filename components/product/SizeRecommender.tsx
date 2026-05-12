'use client';

import { useState } from 'react';

export default function SizeRecommender() {
  const [weight, setWeight] = useState(''); // in kg
  const [height, setHeight] = useState(''); // in cm
  const [fit, setFit] = useState('regular'); // slim, regular, loose
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  const calculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseInt(weight);
    const h = parseInt(height);

    // Basic BMI-style heuristic logic (can be adjusted per garment type)
    let size = 'M';

    if (h < 165 && w < 60) size = 'S';
    else if (h >= 165 && h < 175 && w >= 60 && w < 75) size = 'M';
    else if (h >= 175 && h < 185 && w >= 75 && w < 85) size = 'L';
    else if (h >= 185 || w >= 85) size = 'XL';

    // Adjust for fit preference
    if (fit === 'loose' && size !== 'XL') {
       const sizes = ['S', 'M', 'L', 'XL'];
       size = sizes[sizes.indexOf(size) + 1]; // Bump up one size
    } else if (fit === 'slim' && size !== 'S') {
       const sizes = ['S', 'M', 'L', 'XL'];
       size = sizes[sizes.indexOf(size) - 1]; // Bump down one size
    }

    setRecommendedSize(size);
  };

  return (
    <div className="bg-loomra-surface p-24px border border-loomra-black/10 mt-24px rounded-[4px]">
      <h3 className="text-small font-bold uppercase tracking-widest mb-16px">Find Your Size</h3>
      
      {!recommendedSize ? (
        <form onSubmit={calculateSize} className="flex flex-col gap-16px">
          <div className="flex gap-16px">
            <input type="number" placeholder="Height (cm)" required value={height} onChange={e => setHeight(e.target.value)} className="w-full p-12px text-small border outline-none rounded-[4px]" />
            <input type="number" placeholder="Weight (kg)" required value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-12px text-small border outline-none rounded-[4px]" />
          </div>
          <select value={fit} onChange={e => setFit(e.target.value)} className="w-full p-12px text-small border outline-none bg-white rounded-[4px]">
            <option value="slim">Slim Fit</option>
            <option value="regular">Regular Fit</option>
            <option value="loose">Loose / Oversized</option>
          </select>
          <button type="submit" className="bg-loomra-black text-white py-12px text-small font-bold uppercase rounded-[4px]">Calculate</button>
        </form>
      ) : (
        <div className="text-center py-16px">
          <p className="text-small text-loomra-muted mb-8px">We recommend size</p>
          <span className="text-heading font-bold text-loomra-red">{recommendedSize}</span>
          <button onClick={() => setRecommendedSize(null)} className="block mx-auto mt-16px text-[12px] underline text-loomra-muted">Recalculate</button>
        </div>
      )}
    </div>
  );
}
