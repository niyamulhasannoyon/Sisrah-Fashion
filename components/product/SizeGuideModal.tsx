'use client';

import { X, Ruler } from 'lucide-react';

interface SizeGuideRow {
  size: string;
  chest?: string;
  length?: string;
  shoulder?: string;
  [key: string]: any;
}

export interface SizeGuideData {
  columns?: string[];
  rows?: SizeGuideRow[];
  note?: string;
}

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeGuide?: SizeGuideData;
}

const DEFAULT_ROWS: SizeGuideRow[] = [
  { size: 'S', chest: '38"', length: '27"', shoulder: '17"' },
  { size: 'M', chest: '40"', length: '28"', shoulder: '18"' },
  { size: 'L', chest: '42"', length: '29"', shoulder: '19"' },
  { size: 'XL', chest: '44"', length: '30"', shoulder: '20"' },
  { size: 'XXL', chest: '46"', length: '31"', shoulder: '21"' },
  { size: 'XXXL', chest: '48"', length: '32"', shoulder: '22"' },
];

export default function SizeGuideModal({ isOpen, onClose, sizeGuide }: SizeGuideModalProps) {
  if (!isOpen) return null;

  const rowsToDisplay = (sizeGuide?.rows && sizeGuide.rows.length > 0) ? sizeGuide.rows : DEFAULT_ROWS;
  const noteToDisplay = sizeGuide?.note || 'Note: Measurements may vary slightly by 0.5 inches due to manufacturing.';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-black uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
            <Ruler size={24} className="text-[#A31F24]" />
            Size Guide
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-black hover:border-black transition-colors shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <p className="text-sm text-gray-500 mb-6 font-medium">
            Find your perfect fit. Measurements are in inches. If you are between sizes, we recommend sizing up.
          </p>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#1A1A1A] text-white uppercase tracking-widest text-xs">
                  <th className="p-4 font-bold border-r border-gray-700">Size</th>
                  <th className="p-4 font-bold border-r border-gray-700">Chest</th>
                  <th className="p-4 font-bold border-r border-gray-700">Length</th>
                  <th className="p-4 font-bold">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {rowsToDisplay.map((row, index) => (
                  <tr key={row.size || index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-black text-black border-r border-gray-100 bg-gray-50/50">{row.size}</td>
                    <td className="p-4 border-r border-gray-100">{row.chest || '-'}</td>
                    <td className="p-4 border-r border-gray-100">{row.length || '-'}</td>
                    <td className="p-4">{row.shoulder || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-[#A31F24] bg-red-50 p-3 rounded-lg border border-red-100">
             <Ruler size={16} /> {noteToDisplay}
          </div>
        </div>

      </div>
    </div>
  );
}
