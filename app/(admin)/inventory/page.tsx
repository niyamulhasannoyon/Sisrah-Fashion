'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  RefreshCw, 
  Loader2, 
  Save, 
  DollarSign, 
  TrendingUp, 
  Layers,
  Filter,
  Plus,
  Minus
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'out_of_stock' | 'low_stock' | 'healthy'>('all');
  
  // Quick Restock Edit Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editVariants, setEditVariants] = useState<any[]>([]);
  const [savingStock, setSavingStock] = useState(false);

  const fetchInventory = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/inventory');
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const openRestockModal = (product: any) => {
    setSelectedProduct(product);
    setEditVariants(product.variants?.map((v: any) => ({ ...v })) || []);
  };

  const handleVariantStockChange = (idx: number, delta: number) => {
    setEditVariants(prev => prev.map((v, i) => {
      if (i === idx) {
        const newStock = Math.max(0, (v.stock || 0) + delta);
        return { ...v, stock: newStock };
      }
      return v;
    }));
  };

  const handleVariantStockInput = (idx: number, val: number) => {
    setEditVariants(prev => prev.map((v, i) => {
      if (i === idx) {
        return { ...v, stock: Math.max(0, val || 0) };
      }
      return v;
    }));
  };

  const handleSaveStock = async () => {
    if (!selectedProduct) return;
    setSavingStock(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct._id,
          variants: editVariants
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          alert('Stock restocked successfully!');
          setSelectedProduct(null);
          fetchInventory(true);
        }
      }
    } catch (error) {
      alert('Failed to save stock update');
    } finally {
      setSavingStock(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="animate-spin text-[#A31F24]" size={36} />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading Inventory Hub...</p>
      </div>
    );
  }

  const { summary, inventory } = data || {};

  const filteredInventory = (inventory || []).filter((item: any) => {
    const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="text-[#A31F24]" size={26} /> Inventory & Stock Control Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time low stock warnings, variant restocking, and inventory asset valuation.</p>
        </div>

        <button
          onClick={() => fetchInventory(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-[#A31F24] transition-all text-xs font-bold uppercase tracking-wider"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh Stock
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Out of Stock Items</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{summary?.outOfStockCount || 0}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <XCircle size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Products with 0 units remaining</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low Stock Warnings</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{summary?.lowStockCount || 0}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Products with ≤ 10 units left</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Retail Value</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">৳{summary?.totalInventoryValue?.toLocaleString() || 0}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">{summary?.totalItemsInStock} total units in warehouse</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Potential Margin</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">{summary?.potentialProfitMargin || 0}%</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">Cost value: ৳{summary?.totalInventoryCost?.toLocaleString() || 0}</p>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Controls Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status Filter Badges */}
          <div className="flex flex-wrap p-1 bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              All Products ({summary?.totalProducts || 0})
            </button>
            <button
              onClick={() => setStatusFilter('out_of_stock')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                statusFilter === 'out_of_stock' ? 'bg-rose-600 text-white shadow-sm' : 'hover:text-rose-600'
              }`}
            >
              Out of Stock ({summary?.outOfStockCount || 0})
            </button>
            <button
              onClick={() => setStatusFilter('low_stock')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                statusFilter === 'low_stock' ? 'bg-amber-500 text-white shadow-sm' : 'hover:text-amber-600'
              }`}
            >
              Low Stock ({summary?.lowStockCount || 0})
            </button>
            <button
              onClick={() => setStatusFilter('healthy')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                statusFilter === 'healthy' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:text-emerald-600'
              }`}
            >
              Healthy ({summary?.healthyStockCount || 0})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search product title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#A31F24] transition-all font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Inventory List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="p-4 pl-6">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Size Variants & Stock</th>
                <th className="p-4 text-center">Total Stock</th>
                <th className="p-4 text-right">Retail Price</th>
                <th className="p-4 text-center pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 italic">No matching products found in inventory.</td>
                </tr>
              ) : (
                filteredInventory.map((item: any) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 bg-slate-100 border border-slate-200 rounded overflow-hidden shrink-0">
                          <Image src={item.image || '/images/placeholder.jpg'} alt={item.title} fill sizes="48px" className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{item.title}</p>
                          <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                            item.status === 'out_of_stock' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            item.status === 'low_stock' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {item.status === 'out_of_stock' ? 'Out of Stock' : item.status === 'low_stock' ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600 capitalize">{item.category}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {item.variants && item.variants.length > 0 ? (
                          item.variants.map((v: any, idx: number) => (
                            <span key={idx} className={`px-2 py-1 rounded text-xs font-bold border ${
                              v.stock === 0 ? 'bg-rose-50 text-rose-600 border-rose-200 line-through' :
                              v.stock <= 3 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-50 text-slate-800 border-slate-200'
                            }`}>
                              {v.size}: {v.stock}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-bold text-slate-500">Base Stock: {item.totalStock}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-base font-black ${
                        item.totalStock === 0 ? 'text-rose-600' : item.totalStock <= 10 ? 'text-amber-600' : 'text-slate-900'
                      }`}>
                        {item.totalStock}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-slate-900">
                      ৳{item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.basePrice}
                    </td>
                    <td className="p-4 text-center pr-6">
                      <button
                        onClick={() => openRestockModal(item)}
                        className="px-3 py-1.5 bg-[#A31F24] hover:bg-[#8B1A1E] text-white font-bold text-xs rounded-lg transition-all shadow-sm cursor-pointer uppercase tracking-wider"
                      >
                        Restock / Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedProduct.title}</h3>
                <p className="text-xs text-slate-500">Quickly adjust variant quantities for this product.</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {editVariants.map((variant, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-sm font-bold text-slate-900">Size: {variant.size}</span>
                    {variant.color && <span className="text-xs text-slate-500 ml-2">({variant.color})</span>}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVariantStockChange(idx, -1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>

                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleVariantStockInput(idx, parseInt(e.target.value))}
                      className="w-16 p-1.5 bg-white border border-slate-300 rounded-lg text-center font-bold text-sm outline-none focus:border-[#A31F24]"
                    />

                    <button
                      onClick={() => handleVariantStockChange(idx, 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStock}
                disabled={savingStock}
                className="px-5 py-2.5 bg-[#A31F24] hover:bg-[#8B1A1E] text-white text-xs font-bold rounded-xl flex items-center gap-2 tracking-wider uppercase"
              >
                {savingStock ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                {savingStock ? 'Saving...' : 'Save Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
