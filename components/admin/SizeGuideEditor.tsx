'use client';

import React from 'react';
import { Plus, Trash2, RotateCcw, Ruler } from 'lucide-react';

export interface SizeGuideRow {
  size: string;
  chest: string;
  length: string;
  shoulder: string;
  [key: string]: string;
}

export const DEFAULT_SIZE_GUIDE_ROWS: SizeGuideRow[] = [
  { size: 'S', chest: '38"', length: '27"', shoulder: '17"' },
  { size: 'M', chest: '40"', length: '28"', shoulder: '18"' },
  { size: 'L', chest: '42"', length: '29"', shoulder: '19"' },
  { size: 'XL', chest: '44"', length: '30"', shoulder: '20"' },
  { size: 'XXL', chest: '46"', length: '31"', shoulder: '21"' },
  { size: 'XXXL', chest: '48"', length: '32"', shoulder: '22"' },
];

export const DEFAULT_SIZE_GUIDE_NOTE =
  'Note: Measurements may vary slightly by 0.5 inches due to manufacturing.';

interface SizeGuideEditorProps {
  rows: SizeGuideRow[];
  note: string;
  onChangeRows: (rows: SizeGuideRow[]) => void;
  onChangeNote: (note: string) => void;
}

export default function SizeGuideEditor({
  rows,
  note,
  onChangeRows,
  onChangeNote,
}: SizeGuideEditorProps) {
  const handleCellChange = (index: number, field: keyof SizeGuideRow, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    onChangeRows(updated);
  };

  const handleRemoveRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    onChangeRows(updated);
  };

  const handleAddRow = () => {
    onChangeRows([
      ...rows,
      { size: '', chest: '', length: '', shoulder: '' },
    ]);
  };

  const handleResetDefault = () => {
    if (confirm('Reset size guide to standard default measurements?')) {
      onChangeRows(DEFAULT_SIZE_GUIDE_ROWS);
      onChangeNote(DEFAULT_SIZE_GUIDE_NOTE);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-50 text-[#A31F24] rounded-lg">
            <Ruler size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Product Size Guide
            </h3>
            <p className="text-xs text-slate-500">
              Customize measurements or delete/add sizes for this product.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
            title="Reset to default sizes"
          >
            <RotateCcw size={14} />
            Reset Default
          </button>
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1 text-xs text-white bg-black hover:bg-[#A31F24] px-3 py-1.5 rounded-lg transition-colors font-bold uppercase tracking-wider"
          >
            <Plus size={14} />
            Add Size
          </button>
        </div>
      </div>

      {/* Editable Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
              <th className="p-3 w-1/5 border-r border-slate-800">Size</th>
              <th className="p-3 w-1/4 border-r border-slate-800">Chest</th>
              <th className="p-3 w-1/4 border-r border-slate-800">Length</th>
              <th className="p-3 w-1/4 border-r border-slate-800">Shoulder</th>
              <th className="p-3 w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
                  No sizes defined for this size guide. Click &quot;Add Size&quot; or &quot;Reset Default&quot;.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2 border-r border-slate-100">
                    <input
                      type="text"
                      placeholder="Size (e.g. S, M, L)"
                      value={row.size}
                      onChange={(e) => handleCellChange(index, 'size', e.target.value)}
                      className="w-full p-2 bg-slate-50 font-black border border-slate-200 rounded text-slate-900 outline-none focus:border-black transition-all uppercase"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-100">
                    <input
                      type="text"
                      placeholder="e.g. 38&quot;"
                      value={row.chest}
                      onChange={(e) => handleCellChange(index, 'chest', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded text-slate-800 outline-none focus:border-black transition-all"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-100">
                    <input
                      type="text"
                      placeholder="e.g. 27&quot;"
                      value={row.length}
                      onChange={(e) => handleCellChange(index, 'length', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded text-slate-800 outline-none focus:border-black transition-all"
                    />
                  </td>
                  <td className="p-2 border-r border-slate-100">
                    <input
                      type="text"
                      placeholder="e.g. 17&quot;"
                      value={row.shoulder}
                      onChange={(e) => handleCellChange(index, 'shoulder', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded text-slate-800 outline-none focus:border-black transition-all"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={`Remove size ${row.size}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Note input */}
      <div className="pt-2">
        <label className="text-xs font-bold text-slate-600 block mb-1">
          Size Guide Footer Note
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => onChangeNote(e.target.value)}
          placeholder="Note: Measurements may vary slightly..."
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:border-black transition-all"
        />
      </div>
    </div>
  );
}
