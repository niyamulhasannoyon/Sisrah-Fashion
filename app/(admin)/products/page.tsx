'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Loader2, Eye, Search, AlertTriangle, X, Copy, ImageOff, Upload } from 'lucide-react';


// Fallback-aware product image thumbnail
function ProductImage({ url, alt }: { url?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    return (
      <div className="w-12 h-12 rounded border border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center" title="No image available">
        <ImageOff size={18} className="text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-white">
      <img
        src={url}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default function AdminProductsList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkAction, setBulkAction] = useState<'none' | 'out_of_stock' | 'restock'>('none');
  const [bulkStockValue, setBulkStockValue] = useState(10);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [alertMode, setAlertMode] = useState<'all' | 'low' | 'out'>('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (product: any) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${productToDelete._id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== productToDelete._id));
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const totalStockForProduct = (product: any) => product.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0;
  const lowStockCount = useMemo(
    () => products.filter((product) => {
      const total = totalStockForProduct(product);
      return total > 0 && total <= (product.lowStockThreshold ?? 10);
    }).length,
    [products]
  );
  const outOfStockCount = useMemo(
    () => products.filter((product) => totalStockForProduct(product) <= 0).length,
    [products]
  );

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedIds.includes(product._id)),
    [products, selectedIds]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      const total = totalStockForProduct(product);
      const matchesAlert =
        alertMode === 'all' ||
        (alertMode === 'low' && total > 0 && total <= (product.lowStockThreshold ?? 10)) ||
        (alertMode === 'out' && total <= 0);

      return matchesSearch && matchesAlert;
    });
  }, [products, searchTerm, alertMode]);

  const toggleSelectProduct = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((product) => product._id));
    }
  };

  const reloadProducts = async () => {
    setLoading(true);
    await fetchProducts();
  };

  const runBulkUpdate = async (update: any) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch('/api/products/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, ...update }),
      });
      if (res.ok) {
        await reloadProducts();
        setSelectedIds([]);
      } else {
        const error = await res.json();
        alert(error.error || 'Bulk update failed');
      }
    } catch (error) {
      console.error('Bulk update failed', error);
      alert('Bulk update failed');
    }
  };

  const handleBulkCategory = async () => {
    if (!bulkCategory.trim()) return;
    await runBulkUpdate({ category: bulkCategory.trim() });
    setBulkCategory('');
  };

  const handleBulkAction = async () => {
    if (bulkAction === 'out_of_stock') {
      await runBulkUpdate({ setOutOfStock: true });
    } else if (bulkAction === 'restock') {
      await runBulkUpdate({ restockStock: Math.max(0, bulkStockValue) });
    }
    setBulkAction('none');
  };

  const downloadCsv = async () => {
    try {
      setExporting(true);
      const rows = (selectedIds.length ? selectedProducts : filteredProducts).map((product) => {
        const totalStock = totalStockForProduct(product);
        const status = totalStock <= 0 ? 'Out of Stock' : totalStock <= (product.lowStockThreshold ?? 10) ? 'Low Stock' : 'In Stock';
        return {
          productId: product._id,
          title: product.title,
          slug: product.slug,
          category: product.category,
          lowStockThreshold: product.lowStockThreshold ?? 10,
          totalStock,
          status,
        };
      });

      const csvHeader = ['Product ID', 'Title', 'Slug', 'Category', 'Low Stock Threshold', 'Total Stock', 'Status'];
      const csvBody = rows.map((row) => [
        row.productId,
        row.title,
        row.slug,
        row.category,
        String(row.lowStockThreshold),
        String(row.totalStock),
        row.status,
      ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));

      const csv = [csvHeader.join(','), ...csvBody].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedIds.length ? 'selected-products-inventory.csv' : 'products-inventory.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
      alert('CSV export failed');
    } finally {
      setExporting(false);
    }
  };

  const parseCsv = (csvText: string) => {
    const rows = csvText.trim().split(/\r?\n/);
    const header = rows.shift()?.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')) || [];
    return rows.map((row) => {
      const values = row.match(/(?:\"([^\"]*)\"|[^,\s]+)(?=,|$)/g) || [];
      const record: Record<string, string> = {};
      values.forEach((value, index) => {
        const cleaned = value.replace(/^"|"$/g, '');
        record[header[index]] = cleaned;
      });
      return record;
    });
  };

  const handleImportFile = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      const items = rows.map((row) => ({
        productId: row['Product ID'] || row['productId'] || row['id'],
        slug: row['Slug'] || row['slug'],
        category: row['Category'] || row['category'],
        lowStockThreshold: Number(row['Low Stock Threshold'] || row['lowStockThreshold'] || 10),
      })).filter((item) => item.productId || item.slug);

      if (items.length === 0) {
        alert('No valid rows found in CSV. Use Product ID or Slug to import.');
        return;
      }

      const res = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (res.ok) {
        await reloadProducts();
        setSelectedIds([]);
        alert(data.message || 'CSV imported successfully');
      } else {
        alert(data.error || 'CSV import failed');
      }
    } catch (error) {
      console.error('CSV import failed', error);
      alert('CSV import failed');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await handleImportFile(file);
  };

  const selectAllChecked = selectedIds.length === filteredProducts.length && filteredProducts.length > 0;

  const handleDuplicate = async (product: any) => {
    const confirmDuplicate = confirm(`Are you sure you want to duplicate "${product.title}"?`);
    if (!confirmDuplicate) return;
    setDuplicatingId(product._id);

    try {
      const { _id, id, createdAt, updatedAt, reviews, rating, numReviews, ...rest } = product;
      
      const duplicatedData = {
        ...rest,
        title: `${product.title} (Copy)`,
        slug: `${product.slug}-copy-${Date.now()}`,
        reviews: [],
        rating: 0,
        numReviews: 0,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProducts([data.product, ...products]);
        }
      } else {
        alert("Failed to duplicate product.");
      }
    } catch (error) {
      console.error("Duplication error:", error);
      alert("Error duplicating product.");
    } finally {
      setDuplicatingId(null);
    }
  };

    return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Products Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your catalog, edit details, and preview products.</p>
        </div>
        <Link href="/products/new" className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-md text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#A31F24] transition-colors shadow-sm">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search products by name or category..." 
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all bg-white shadow-sm text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 font-bold mb-2">Total Products</p>
          <p className="text-3xl font-black text-slate-900">{products.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-700 font-bold mb-2">Low Stock Alerts</p>
          <p className="text-3xl font-black text-amber-900">{lowStockCount}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-rose-700 font-bold mb-2">Out of Stock</p>
          <p className="text-3xl font-black text-rose-900">{outOfStockCount}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto] items-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Filter</span>
            <button onClick={() => setAlertMode('all')} className={`px-3 py-2 rounded-lg text-xs font-semibold ${alertMode === 'all' ? 'bg-[#1A1A1A] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>All</button>
            <button onClick={() => setAlertMode('low')} className={`px-3 py-2 rounded-lg text-xs font-semibold ${alertMode === 'low' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>Low Stock</button>
            <button onClick={() => setAlertMode('out')} className={`px-3 py-2 rounded-lg text-xs font-semibold ${alertMode === 'out' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}>Out of Stock</button>
          </div>
          <div className="flex flex-wrap gap-3 items-center text-sm text-slate-500">
            <span>{selectedIds.length} selected</span>
            {selectedIds.length > 0 && (
              <button onClick={() => setSelectedIds([])} className="text-slate-700 underline underline-offset-4">Clear selection</button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button onClick={downloadCsv} disabled={exporting} className="inline-flex items-center gap-2 rounded-xl bg-[#1A1A1A] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#A31F24] transition disabled:opacity-50">
            <Upload size={16} /> {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button onClick={triggerImport} disabled={importing} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-100 transition disabled:opacity-50">
            <Upload size={16} /> {importing ? 'Importing...' : 'Import CSV'}
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] items-end">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Bulk action</label>
              <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value as any)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#1A1A1A]">
                <option value="none">Select action</option>
                <option value="out_of_stock">Mark Out of Stock</option>
                <option value="restock">Set Restock Quantity</option>
              </select>
            </div>
            {bulkAction === 'restock' && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Restock value</label>
                <input type="number" value={bulkStockValue} min={0} onChange={(e) => setBulkStockValue(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#1A1A1A]" />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Bulk category</label>
              <input type="text" placeholder="New category" value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#1A1A1A]" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button onClick={handleBulkAction} disabled={selectedIds.length === 0 || bulkAction === 'none'} className="rounded-xl bg-[#1A1A1A] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#A31F24] transition disabled:opacity-50">
              Apply action
            </button>
            <button onClick={handleBulkCategory} disabled={selectedIds.length === 0 || !bulkCategory.trim()} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-100 transition disabled:opacity-50">
              Update category
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
           <div className="py-20 flex flex-col items-center justify-center gap-3">
             <Loader2 className="animate-spin text-[#A31F24]" size={32} />
             <p className="text-sm text-gray-500 font-medium">Loading inventory...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F9F9] text-gray-500 text-xs uppercase tracking-widest border-b border-gray-200">
                  <th className="p-4 font-bold w-12">
                    <input type="checkbox" checked={selectAllChecked} onChange={toggleSelectAll} className="accent-[#1A1A1A]" />
                  </th>
                  <th className="p-4 font-bold w-20">Image</th>
                  <th className="p-4 font-bold">Product Name</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Price</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="p-12 text-center text-gray-500">
                       <p className="text-base font-medium text-[#1A1A1A]">No products found.</p>
                       <p className="text-sm mt-1">Try adjusting your search or add a new product.</p>
                     </td>
                   </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4">
                        <input type="checkbox" checked={selectedIds.includes(product._id)} onChange={() => toggleSelectProduct(product._id)} className="accent-[#1A1A1A]" />
                      </td>
                      <td className="p-4">
                        <ProductImage url={product.images[0]?.url} alt={product.title} />
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-[#1A1A1A]">{product.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                      </td>
                      <td className="p-4">
                        {(() => {
                          const totalStock = product.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0;
                          const threshold = product.lowStockThreshold ?? 10;
                          if (totalStock <= 0) return (
                            <span className="bg-rose-50 text-rose-600 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-rose-100">
                              Out of Stock
                            </span>
                          );
                          if (totalStock <= threshold) return (
                            <span className="bg-amber-50 text-amber-600 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-amber-100 animate-pulse">
                              Low Stock: {totalStock}
                            </span>
                          );
                          return (
                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-emerald-100">
                              In Stock: {totalStock}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-4 text-sm font-bold text-[#A31F24]">
                        ৳ {product.basePrice.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/product/${product.slug}`} target="_blank" title="Preview" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                            <Eye size={18} />
                          </Link>
                          <Link href={`/products/edit/${product._id}`} title="Edit" className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors">
                            <Edit size={18} />
                          </Link>
                          <button 
                            type="button"
                            onClick={() => handleDuplicate(product)} 
                            disabled={duplicatingId !== null}
                            title="Duplicate" 
                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors disabled:opacity-50"
                          >
                            {duplicatingId === product._id ? (
                              <Loader2 className="animate-spin text-amber-600" size={18} />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>
                          <button onClick={() => confirmDelete(product)} title="Delete" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} /> Delete Product
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-[#1A1A1A]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm">
                Are you sure you want to permanently delete <strong>{productToDelete?.title}</strong>? This action cannot be undone and it will be removed from your store immediately.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-md transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50">
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}