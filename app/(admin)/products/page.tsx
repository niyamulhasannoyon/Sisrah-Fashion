'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Loader2, Eye, Search, AlertTriangle, X } from 'lucide-react';

export default function AdminProductsList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
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

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                        <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-white">
                          <img src={product.images[0]?.url || '/placeholder.jpg'} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-[#1A1A1A]">{product.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                      </td>
                      <td className="p-4">
                        {(() => {
                          const totalStock = product.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0;
                          if (totalStock <= 0) return (
                            <span className="bg-rose-50 text-rose-600 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-rose-100">
                              Out of Stock
                            </span>
                          );
                          if (totalStock <= 5) return (
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