'use client';

import { useState } from 'react';
import Link from 'next/link';

type UnitType = 'inches' | 'cm';

export default function SizeGuideClient() {
  const [unit, setUnit] = useState<UnitType>('inches');
  const [activeTab, setActiveTab] = useState<'shirts' | 'panjabis' | 'fusion'>('shirts');

  // Conversion helper
  const val = (inchVal: number, cmVal: number) => {
    return unit === 'inches' ? `${inchVal}"` : `${cmVal} cm`;
  };

  const shirtSizes = [
    { size: 'S', chest: { inch: 38, cm: 96 }, length: { inch: 27.5, cm: 70 }, shoulder: { inch: 17.5, cm: 44.5 }, sleeve: { inch: 8.5, cm: 21.5 } },
    { size: 'M', chest: { inch: 40, cm: 101.5 }, length: { inch: 28.5, cm: 72 }, shoulder: { inch: 18, cm: 45.7 }, sleeve: { inch: 9, cm: 23 } },
    { size: 'L', chest: { inch: 42, cm: 106.5 }, length: { inch: 29.5, cm: 75 }, shoulder: { inch: 18.5, cm: 47 }, sleeve: { inch: 9.5, cm: 24 } },
    { size: 'XL', chest: { inch: 44, cm: 112 }, length: { inch: 30.5, cm: 77.5 }, shoulder: { inch: 19.25, cm: 49 }, sleeve: { inch: 10, cm: 25.4 } },
    { size: 'XXL', chest: { inch: 46, cm: 117 }, length: { inch: 31.5, cm: 80 }, shoulder: { inch: 20, cm: 51 }, sleeve: { inch: 10.5, cm: 26.6 } },
  ];

  const panjabiSizes = [
    { size: '38 (S)', chest: { inch: 39, cm: 99 }, length: { inch: 40, cm: 101.5 }, shoulder: { inch: 17.5, cm: 44.5 }, sleeve: { inch: 24, cm: 61 } },
    { size: '40 (M)', chest: { inch: 41, cm: 104 }, length: { inch: 42, cm: 106.5 }, shoulder: { inch: 18, cm: 45.7 }, sleeve: { inch: 24.5, cm: 62 } },
    { size: '42 (L)', chest: { inch: 43, cm: 109 }, length: { inch: 44, cm: 112 }, shoulder: { inch: 18.5, cm: 47 }, sleeve: { inch: 25, cm: 63.5 } },
    { size: '44 (XL)', chest: { inch: 45, cm: 114 }, length: { inch: 46, cm: 117 }, shoulder: { inch: 19, cm: 48.3 }, sleeve: { inch: 25.5, cm: 64.8 } },
    { size: '46 (XXL)', chest: { inch: 47, cm: 119.5 }, length: { inch: 48, cm: 122 }, shoulder: { inch: 19.75, cm: 50 }, sleeve: { inch: 26, cm: 66 } },
  ];

  const fusionSizes = [
    { size: 'S', chest: { inch: 36, cm: 91.5 }, length: { inch: 38, cm: 96.5 }, shoulder: { inch: 14.5, cm: 37 }, sleeve: { inch: 17, cm: 43 } },
    { size: 'M', chest: { inch: 38, cm: 96.5 }, length: { inch: 39, cm: 99 }, shoulder: { inch: 15, cm: 38 }, sleeve: { inch: 17.5, cm: 44.5 } },
    { size: 'L', chest: { inch: 40, cm: 101.5 }, length: { inch: 40, cm: 101.5 }, shoulder: { inch: 15.5, cm: 39.4 }, sleeve: { inch: 18, cm: 45.7 } },
    { size: 'XL', chest: { inch: 42, cm: 106.5 }, length: { inch: 41, cm: 104 }, shoulder: { inch: 16.25, cm: 41.3 }, sleeve: { inch: 18.5, cm: 47 } },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#A31F24] mb-3">Fit & Sizing</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-6">
            Size Guide<span className="text-[#A31F24]">.</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-lg mx-auto text-sm leading-relaxed">
            Find your perfect fit. Compare your body measurements with our garments to choose the ideal size.
          </p>
        </div>

        {/* Interactive Sizing Unit and Tabs */}
        <div className="bg-white p-6 md:p-10 rounded-[32px] shadow-sm border border-gray-100 mb-10">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-100 pb-6 mb-8 gap-4">
            {/* Tabs */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('shirts')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === 'shirts' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
                }`}
              >
                Linen Shirts
              </button>
              <button
                onClick={() => setActiveTab('panjabis')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === 'panjabis' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
                }`}
              >
                Panjabis
              </button>
              <button
                onClick={() => setActiveTab('fusion')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === 'fusion' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
                }`}
              >
                Fusion Wear
              </button>
            </div>

            {/* Unit Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Unit:</span>
              <div className="flex bg-gray-100/80 p-1 rounded-xl">
                <button
                  onClick={() => setUnit('inches')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    unit === 'inches' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Inches (in)
                </button>
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    unit === 'cm' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Centimeters (cm)
                </button>
              </div>
            </div>
          </div>

          {/* Sizing Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm md:text-base border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-2">Size</th>
                  <th className="py-4 px-2">Chest / Body Width</th>
                  <th className="py-4 px-2">Total Length</th>
                  <th className="py-4 px-2">Shoulder Width</th>
                  <th className="py-4 px-2">Sleeve Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60 font-semibold text-gray-800">
                {activeTab === 'shirts' &&
                  shirtSizes.map((row) => (
                    <tr key={row.size} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-2 font-black text-[#A31F24]">{row.size}</td>
                      <td className="py-4 px-2">{val(row.chest.inch, row.chest.cm)}</td>
                      <td className="py-4 px-2">{val(row.length.inch, row.length.cm)}</td>
                      <td className="py-4 px-2">{val(row.shoulder.inch, row.shoulder.cm)}</td>
                      <td className="py-4 px-2">{val(row.sleeve.inch, row.sleeve.cm)}</td>
                    </tr>
                  ))}
                {activeTab === 'panjabis' &&
                  panjabiSizes.map((row) => (
                    <tr key={row.size} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-2 font-black text-[#A31F24]">{row.size}</td>
                      <td className="py-4 px-2">{val(row.chest.inch, row.chest.cm)}</td>
                      <td className="py-4 px-2">{val(row.length.inch, row.length.cm)}</td>
                      <td className="py-4 px-2">{val(row.shoulder.inch, row.shoulder.cm)}</td>
                      <td className="py-4 px-2">{val(row.sleeve.inch, row.sleeve.cm)}</td>
                    </tr>
                  ))}
                {activeTab === 'fusion' &&
                  fusionSizes.map((row) => (
                    <tr key={row.size} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-2 font-black text-[#A31F24]">{row.size}</td>
                      <td className="py-4 px-2">{val(row.chest.inch, row.chest.cm)}</td>
                      <td className="py-4 px-2">{val(row.length.inch, row.length.cm)}</td>
                      <td className="py-4 px-2">{val(row.shoulder.inch, row.shoulder.cm)}</td>
                      <td className="py-4 px-2">{val(row.sleeve.inch, row.sleeve.cm)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-400 mt-4 leading-normal italic font-medium">
            * All measurements are garment dimensions. Sizing may vary slightly (+/- 0.5 inches) due to the handwoven and manual tailoring processes of local South Asian fabrics.
          </p>
        </div>

        {/* Measuring Instructions */}
        <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900 mb-6 flex items-center gap-3">
            <span className="h-6 w-1 bg-[#A31F24] inline-block"></span>
            How to Measure
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 leading-relaxed">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#A31F24]/5 text-[#A31F24] font-black flex items-center justify-center text-sm mb-3">1</div>
              <h4 className="font-bold text-gray-900 uppercase tracking-tight">1. Chest</h4>
              <p>Measure under your arms around the fullest part of your chest, keeping the tape parallel to the floor.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#A31F24]/5 text-[#A31F24] font-black flex items-center justify-center text-sm mb-3">2</div>
              <h4 className="font-bold text-gray-900 uppercase tracking-tight">2. Shoulder</h4>
              <p>Measure across the upper back from the tip of one shoulder bone straight to the tip of the other.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#A31F24]/5 text-[#A31F24] font-black flex items-center justify-center text-sm mb-3">3</div>
              <h4 className="font-bold text-gray-900 uppercase tracking-tight">3. Length</h4>
              <p>Measure straight down from the highest point of the shoulder (collar base) to the desired garment hemline.</p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#A1A1AA] hover:text-[#A31F24] transition-colors">
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
