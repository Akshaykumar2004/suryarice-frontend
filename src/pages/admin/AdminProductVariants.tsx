// import React, { useState, useEffect } from 'react';
// import { api } from '../../services/api';
// import { Plus, Search, CreditCard as Edit, Trash2, Package, AlertTriangle } from 'lucide-react';

// interface ProductVariant {
//   id: string;
//   product?: string | {
//     id: string;
//     name: string;
//     category?: string | {
//       id: string;
//       name: string;
//     } | null;
//   };
//   product_name?: string;
//   product_category?: string;
//   weight: number;
//   weight_unit: string;
//   sku: string;
//   price: number;
//   discount_price: number;
//   effective_price: number;
//   stock_quantity: number;
//   low_stock_threshold: number;
//   max_order_quantity: number;
//   is_active: boolean;
//   is_available: boolean;
//   is_low_stock: boolean;
//   created_at: string;
//   updated_at: string;
// }

// interface Product {
//   id: string;
//   name: string;
//   category?: string;
// }

// const AdminProductVariants = () => {
//   const [variants, setVariants] = useState<ProductVariant[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [productFilter, setProductFilter] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
//   const [formData, setFormData] = useState({
//     product: '',
//     weight: 1,
//     weight_unit: 'kg',
//     sku: '',
//     price: 0,
//     discount_price: 0,
//     stock_quantity: 0,
//     low_stock_threshold: 10,
//     max_order_quantity: 30,
//     is_active: true,
//     is_available: true
//   });

//   const getProductName = (variant: ProductVariant): string => {
//     if (variant.product_name) return variant.product_name;
//     if (typeof variant.product === 'object' && variant.product?.name) return variant.product.name;
//     return 'Unknown Product';
//   };

//   const getProductId = (variant: ProductVariant): string => {
//     if (typeof variant.product === 'string') return variant.product;
//     if (typeof variant.product === 'object' && variant.product?.id) return variant.product.id;
//     return '';
//   };

//   const getProductCategory = (variant: ProductVariant): string => {
//     if (variant.product_category) return variant.product_category;
    
//     if (typeof variant.product === 'object' && variant.product?.category) {
//       const category = variant.product.category;
//       if (typeof category === 'string') return category;
//       if (category && typeof category === 'object' && 'name' in category) {
//         return (category as { name?: string }).name || '';
//       }
//     }
    
//     return '';
//   };

//   useEffect(() => {
//     fetchVariants();
//     fetchProducts();
//   }, [productFilter]);

//   const fetchVariants = async () => {
//     try {
//       const params: any = {};
//       if (searchQuery) params.search = searchQuery;
//       if (productFilter) params.product = productFilter;

//       const response = await api.get('/admin/product-variants/', { params });
//       setVariants(response.data.results || response.data);
//     } catch (error) {
//       console.error('Error fetching variants:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       const response = await api.get('/products/');
//       setProducts(response.data.results || response.data);
//     } catch (error) {
//       console.error('Error fetching products:', error);
//     }
//   };

//   const handleSearch = () => {
//     setIsLoading(true);
//     fetchVariants();
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       if (editingVariant) {
//         await api.put(`/admin/product-variants/${editingVariant.id}/`, formData);
//       } else {
//         await api.post('/admin/product-variants/', formData);
//       }
//       setShowModal(false);
//       setEditingVariant(null);
//       resetForm();
//       fetchVariants();
//       alert('Product variant saved successfully!');
//     } catch (error) {
//       console.error('Error saving variant:', error);
//       alert('Failed to save product variant');
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       product: '',
//       weight: 1,
//       weight_unit: 'kg',
//       sku: '',
//       price: 0,
//       discount_price: 0,
//       stock_quantity: 0,
//       low_stock_threshold: 10,
//       max_order_quantity: 30,
//       is_active: true,
//       is_available: true
//     });
//   };

//   const handleEdit = (variant: ProductVariant) => {
//     setEditingVariant(variant);
//     setFormData({
//       product: getProductId(variant),
//       weight: variant.weight,
//       weight_unit: variant.weight_unit,
//       sku: variant.sku,
//       price: variant.price,
//       discount_price: variant.discount_price || 0,
//       stock_quantity: variant.stock_quantity,
//       low_stock_threshold: variant.low_stock_threshold,
//       max_order_quantity: variant.max_order_quantity,
//       is_active: variant.is_active,
//       is_available: variant.is_available
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id: string) => {
//     if (window.confirm('Are you sure you want to delete this variant?')) {
//       try {
//         await api.delete(`/admin/product-variants/${id}/`);
//         fetchVariants();
//         alert('Product variant deleted successfully!');
//       } catch (error) {
//         console.error('Error deleting variant:', error);
//         alert('Failed to delete product variant');
//       }
//     }
//   };

//   const toggleActive = async (id: string, currentStatus: boolean) => {
//     try {
//       await api.patch(`/admin/product-variants/${id}/`, { is_active: !currentStatus });
//       fetchVariants();
//     } catch (error) {
//       console.error('Error updating variant:', error);
//       alert('Failed to update variant status');
//     }
//   };

//   const getStockStatus = (variant: ProductVariant) => {
//     if (variant.stock_quantity === 0) {
//       return { color: 'text-red-600 bg-red-100', label: 'Out of Stock' };
//     } else if (variant.is_low_stock) {
//       return { color: 'text-orange-600 bg-orange-100', label: 'Low Stock' };
//     } else {
//       return { color: 'text-green-600 bg-green-100', label: 'In Stock' };
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 md:space-y-6 p-4 md:p-6 pb-20 md:pb-6">
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
//         <div className="flex flex-col space-y-4">
//           <h1 className="text-xl md:text-2xl font-bold text-gray-900">Product Variants</h1>
          
//           <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
//             {/* Search */}
//             <div className="flex flex-1 gap-2">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//                   placeholder="Search..."
//                   className="w-full pl-10 pr-4 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
//                 />
//               </div>
//               <button
//                 onClick={handleSearch}
//                 className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 min-h-[44px] rounded-lg transition-colors flex items-center justify-center"
//               >
//                 <Search className="w-5 h-5 md:hidden" />
//                 <span className="hidden md:inline">Search</span>
//               </button>
//             </div>

//             {/* Product Filter */}
//             <select
//               value={productFilter}
//               onChange={(e) => setProductFilter(e.target.value)}
//               className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
//             >
//               <option value="">All Products</option>
//               {products.map((product) => (
//                 <option key={product.id} value={product.id}>
//                   {product.name}
//                 </option>
//               ))}
//             </select>

//             <button
//               onClick={() => setShowModal(true)}
//               className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 min-h-[44px] rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
//             >
//               <Plus className="w-5 h-5" />
//               <span className="hidden sm:inline">Add Variant</span>
//             </button>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
//           <div className="bg-blue-50 rounded-lg p-3 md:p-4">
//             <div className="flex items-center">
//               <Package className="w-6 h-6 md:w-8 md:h-8 text-blue-500 flex-shrink-0" />
//               <div className="ml-2 md:ml-3 min-w-0">
//                 <p className="text-xs md:text-sm font-medium text-blue-600 truncate">Total</p>
//                 <p className="text-lg md:text-2xl font-bold text-blue-900">{variants.length}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-green-50 rounded-lg p-3 md:p-4">
//             <div className="flex items-center">
//               <Package className="w-6 h-6 md:w-8 md:h-8 text-green-500 flex-shrink-0" />
//               <div className="ml-2 md:ml-3 min-w-0">
//                 <p className="text-xs md:text-sm font-medium text-green-600 truncate">Active</p>
//                 <p className="text-lg md:text-2xl font-bold text-green-900">
//                   {variants.filter(v => v.is_active).length}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-orange-50 rounded-lg p-3 md:p-4">
//             <div className="flex items-center">
//               <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-orange-500 flex-shrink-0" />
//               <div className="ml-2 md:ml-3 min-w-0">
//                 <p className="text-xs md:text-sm font-medium text-orange-600 truncate">Low Stock</p>
//                 <p className="text-lg md:text-2xl font-bold text-orange-900">
//                   {variants.filter(v => v.is_low_stock).length}
//                 </p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-red-50 rounded-lg p-4">
//             <div className="flex items-center">
//               <Package className="w-8 h-8 text-red-500" />
//               <div className="ml-3">
//                 <p className="text-sm font-medium text-red-600">Out of Stock</p>
//                 <p className="text-2xl font-bold text-red-900">
//                   {variants.filter(v => v.stock_quantity === 0).length}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Variants Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Product & Variant
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   SKU
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Pricing
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Stock
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {variants.map((variant) => {
//                 const stockStatus = getStockStatus(variant);
//                 return (
//                   <tr key={variant.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">
//                           {getProductName(variant)}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {variant.weight}{variant.weight_unit}
//                         </div>
//                         {getProductCategory(variant) && (
//                           <div className="text-xs text-gray-400">
//                             {getProductCategory(variant)}
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{variant.sku}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         <div className="font-semibold text-orange-500">
//                           ₹{variant.effective_price}
//                         </div>
//                         {variant.discount_price && (
//                           <div className="text-xs text-gray-500 line-through">
//                             ₹{variant.price}
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div>
//                         <div className="text-sm text-gray-900">
//                           {variant.stock_quantity} units
//                         </div>
//                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
//                           {stockStatus.label}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="space-y-1">
//                         <button
//                           onClick={() => toggleActive(variant.id, variant.is_active)}
//                           className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                             variant.is_active
//                               ? 'bg-green-100 text-green-800'
//                               : 'bg-red-100 text-red-800'
//                           }`}
//                         >
//                           {variant.is_active ? 'Active' : 'Inactive'}
//                         </button>
//                         <br />
//                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                           variant.is_available
//                             ? 'bg-blue-100 text-blue-800'
//                             : 'bg-gray-100 text-gray-800'
//                         }`}>
//                           {variant.is_available ? 'Available' : 'Unavailable'}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
//                       <button
//                         onClick={() => handleEdit(variant)}
//                         className="text-orange-600 hover:text-orange-900 inline-flex items-center"
//                       >
//                         <Edit className="w-4 h-4 mr-1" />
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(variant.id)}
//                         className="text-red-600 hover:text-red-900 inline-flex items-center"
//                       >
//                         <Trash2 className="w-4 h-4 mr-1" />
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {variants.length === 0 && (
//           <div className="text-center py-12">
//             <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No variants found</h3>
//             <p className="text-gray-500">Get started by adding your first product variant.</p>
//           </div>
//         )}
//       </div>

//       {/* Add/Edit Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               {editingVariant ? 'Edit Product Variant' : 'Add New Product Variant'}
//             </h3>
            
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Product *
//                   </label>
//                   <select
//                     value={formData.product}
//                     onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                     required
//                   >
//                     <option value="">Select Product</option>
//                     {products.map((product) => (
//                       <option key={product.id} value={product.id}>
//                         {product.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     SKU *
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.sku}
//                     onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Weight *
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     value={formData.weight}
//                     onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Weight Unit
//                   </label>
//                   <select
//                     value={formData.weight_unit}
//                     onChange={(e) => setFormData(prev => ({ ...prev, weight_unit: e.target.value }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   >
//                     <option value="kg">kg</option>
//                     <option value="g">g</option>
//                     <option value="lb">lb</option>
//                   </select>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Price *
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     value={formData.price}
//                     onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Discount Price
//                   </label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     value={formData.discount_price}
//                     onChange={(e) => setFormData(prev => ({ ...prev, discount_price: parseFloat(e.target.value) }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Stock Quantity *
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.stock_quantity}
//                     onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Low Stock Threshold
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.low_stock_threshold}
//                     onChange={(e) => setFormData(prev => ({ ...prev, low_stock_threshold: parseInt(e.target.value) }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Max Order Quantity
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.max_order_quantity}
//                     onChange={(e) => setFormData(prev => ({ ...prev, max_order_quantity: parseInt(e.target.value) }))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   />
//                 </div>
//               </div>
              
//               <div className="flex items-center space-x-6">
//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="is_active"
//                     checked={formData.is_active}
//                     onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
//                     className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
//                   />
//                   <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
//                     Active
//                   </label>
//                 </div>
                
//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="is_available"
//                     checked={formData.is_available}
//                     onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
//                     className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
//                   />
//                   <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
//                     Available for Order
//                   </label>
//                 </div>
//               </div>

//               <div className="flex space-x-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false);
//                     setEditingVariant(null);
//                     resetForm();
//                   }}
//                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
//                 >
//                   {editingVariant ? 'Update' : 'Create'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminProductVariants;

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Search, CreditCard as Edit, Trash2, Package, AlertTriangle, Filter, X } from 'lucide-react';

interface ProductVariant {
  id: string;
  product?: string | {
    id: string;
    name: string;
    category?: string | {
      id: string;
      name: string;
    } | null;
  };
  product_name?: string;
  product_category?: string;
  weight: number;
  weight_unit: string;
  sku: string;
  price: number;
  discount_price: number;
  effective_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  max_order_quantity: number;
  is_active: boolean;
  is_available: boolean;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  name: string;
  category?: string;
}

const AdminProductVariants = () => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [formData, setFormData] = useState({
    product: '',
    weight: 1,
    weight_unit: 'kg',
    sku: '',
    price: 0,
    discount_price: 0,
    stock_quantity: 0,
    low_stock_threshold: 10,
    max_order_quantity: 30,
    is_active: true,
    is_available: true
  });

  const getProductName = (variant: ProductVariant): string => {
    if (variant.product_name) return variant.product_name;
    if (typeof variant.product === 'object' && variant.product?.name) return variant.product.name;
    return 'Unknown Product';
  };

  const getProductId = (variant: ProductVariant): string => {
    if (typeof variant.product === 'string') return variant.product;
    if (typeof variant.product === 'object' && variant.product?.id) return variant.product.id;
    return '';
  };

  const getProductCategory = (variant: ProductVariant): string => {
    if (variant.product_category) return variant.product_category;
    
    if (typeof variant.product === 'object' && variant.product?.category) {
      const category = variant.product.category;
      if (typeof category === 'string') return category;
      if (category && typeof category === 'object' && 'name' in category) {
        return (category as { name?: string }).name || '';
      }
    }
    
    return '';
  };

  useEffect(() => {
    fetchVariants();
    fetchProducts();
  }, [productFilter]);

  const fetchVariants = async () => {
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (productFilter) params.product = productFilter;

      const response = await api.get('/admin/product-variants/', { params });
      setVariants(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    fetchVariants();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVariant) {
        await api.put(`/admin/product-variants/${editingVariant.id}/`, formData);
      } else {
        await api.post('/admin/product-variants/', formData);
      }
      setShowModal(false);
      setEditingVariant(null);
      resetForm();
      fetchVariants();
      alert('Product variant saved successfully!');
    } catch (error) {
      console.error('Error saving variant:', error);
      alert('Failed to save product variant');
    }
  };

  const resetForm = () => {
    setFormData({
      product: '',
      weight: 1,
      weight_unit: 'kg',
      sku: '',
      price: 0,
      discount_price: 0,
      stock_quantity: 0,
      low_stock_threshold: 10,
      max_order_quantity: 30,
      is_active: true,
      is_available: true
    });
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      product: getProductId(variant),
      weight: variant.weight,
      weight_unit: variant.weight_unit,
      sku: variant.sku,
      price: variant.price,
      discount_price: variant.discount_price || 0,
      stock_quantity: variant.stock_quantity,
      low_stock_threshold: variant.low_stock_threshold,
      max_order_quantity: variant.max_order_quantity,
      is_active: variant.is_active,
      is_available: variant.is_available
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this variant?')) {
      try {
        await api.delete(`/admin/product-variants/${id}/`);
        fetchVariants();
        alert('Product variant deleted successfully!');
      } catch (error) {
        console.error('Error deleting variant:', error);
        alert('Failed to delete product variant');
      }
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/product-variants/${id}/`, { is_active: !currentStatus });
      fetchVariants();
    } catch (error) {
      console.error('Error updating variant:', error);
      alert('Failed to update variant status');
    }
  };

  const getStockStatus = (variant: ProductVariant) => {
    if (variant.stock_quantity === 0) {
      return { color: 'text-red-600 bg-red-100', label: 'Out of Stock' };
    } else if (variant.is_low_stock) {
      return { color: 'text-orange-600 bg-orange-100', label: 'Low Stock' };
    } else {
      return { color: 'text-green-600 bg-green-100', label: 'In Stock' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Product Variants</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="sr-only">Add Variant</span>
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search variants..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSearch}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>

        {/* Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center">
              <Package className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-blue-600 truncate">Total</p>
                <p className="text-lg font-bold text-blue-900">{variants.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center">
              <Package className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-green-600 truncate">Active</p>
                <p className="text-lg font-bold text-green-900">
                  {variants.filter(v => v.is_active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-orange-600 truncate">Low Stock</p>
                <p className="text-lg font-bold text-orange-900">
                  {variants.filter(v => v.is_low_stock).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center">
              <Package className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-red-600 truncate">Out of Stock</p>
                <p className="text-lg font-bold text-red-900">
                  {variants.filter(v => v.stock_quantity === 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variants List - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {variants.map((variant) => {
            const stockStatus = getStockStatus(variant);
            return (
              <div key={variant.id} className="p-4 hover:bg-gray-50">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {getProductName(variant)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {variant.weight}{variant.weight_unit} • {getProductCategory(variant)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleEdit(variant)}
                      className="text-orange-600 hover:text-orange-900 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(variant.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">SKU</p>
                    <p className="font-medium text-gray-900 truncate">{variant.sku}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Price</p>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-orange-500">
                        ₹{variant.effective_price}
                      </p>
                      {variant.discount_price > 0 && (
                        <p className="text-xs text-gray-500 line-through">
                          ₹{variant.price}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Stock</p>
                    <p className="font-medium text-gray-900">{variant.stock_quantity} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                      {stockStatus.label}
                    </span>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleActive(variant.id, variant.is_active)}
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      variant.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {variant.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    variant.is_available
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {variant.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {variants.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No variants found</h3>
            <p className="text-gray-500">Get started by adding your first product variant.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal - Mobile Optimized */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 sm:items-center sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-lg w-full max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingVariant ? 'Edit Variant' : 'Add Variant'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingVariant(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product *
                  </label>
                  <select
                    value={formData.product}
                    onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      value={formData.weight_unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight_unit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_price: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock
                    </label>
                    <input
                      type="number"
                      value={formData.low_stock_threshold}
                      onChange={(e) => setFormData(prev => ({ ...prev, low_stock_threshold: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Order
                    </label>
                    <input
                      type="number"
                      value={formData.max_order_quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_order_quantity: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_available"
                      checked={formData.is_available}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
                      Available
                    </label>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingVariant(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    {editingVariant ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductVariants;