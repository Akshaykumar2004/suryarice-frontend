// import React, { useState, useEffect } from 'react';
// import { api } from '../../services/api';
// import { Package, AlertTriangle, Plus, Minus, Search, TrendingUp, TrendingDown } from 'lucide-react';

// interface ProductVariant {
//   id: string;
//   product?: string | {
//     name: string;
//     category: string;
//   };
//   product_name?: string;
//   weight: number;
//   weight_unit: string;
//   price: number;
//   stock_quantity: number;
//   low_stock_threshold: number;
//   is_low_stock: boolean;
//   is_active: boolean;
// }

// interface InventoryTransaction {
//   id: string;
//   product_name: string;
//   variant_name: string;
//   transaction_type: string;
//   quantity: number;
//   new_stock: number;
//   created_at: string;
//   reference_number: string;
// }

// const AdminInventory = () => {
//   const [variants, setVariants] = useState<ProductVariant[]>([]);
//   const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showLowStockOnly, setShowLowStockOnly] = useState(false);
//   const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
//   const [restockData, setRestockData] = useState({
//     quantity: '',
//     reference_number: '',
//     notes: ''
//   });
//   const [isRestocking, setIsRestocking] = useState(false);

//   const getProductName = (variant: ProductVariant): string => {
//     if (variant.product_name) return variant.product_name;
//     if (typeof variant.product === 'object' && variant.product?.name) return variant.product.name;
//     return 'Unknown Product';
//   };

//   useEffect(() => {
//     fetchInventoryData();
//   }, [showLowStockOnly]);

//   const fetchInventoryData = async () => {
//     try {
//       const [variantsRes, transactionsRes] = await Promise.all([
//         api.get('/admin/inventory/', {
//           params: {
//             search: searchQuery,
//             low_stock: showLowStockOnly || undefined
//           }
//         }),
//         api.get('/admin/inventory/transactions/')
//       ]);
      
//       setVariants(variantsRes.data.results || variantsRes.data);
//       setTransactions(transactionsRes.data.results || transactionsRes.data);
//     } catch (error) {
//       console.error('Error fetching inventory data:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSearch = () => {
//     setIsLoading(true);
//     fetchInventoryData();
//   };

//   const handleRestock = async () => {
//     if (!selectedVariant || !restockData.quantity) return;

//     setIsRestocking(true);
//     try {
//       await api.post(`/admin/inventory/${selectedVariant.id}/restock/`, {
//         quantity: parseInt(restockData.quantity),
//         reference_number: restockData.reference_number,
//         notes: restockData.notes
//       });

//       // Update local state
//       setVariants(variants.map(variant => 
//         variant.id === selectedVariant.id
//           ? { ...variant, stock_quantity: variant.stock_quantity + parseInt(restockData.quantity) }
//           : variant
//       ));

//       setSelectedVariant(null);
//       setRestockData({ quantity: '', reference_number: '', notes: '' });
//       alert('Inventory restocked successfully!');
      
//       // Refresh transactions
//       fetchInventoryData();
//     } catch (error) {
//       console.error('Error restocking inventory:', error);
//       alert('Failed to restock inventory');
//     } finally {
//       setIsRestocking(false);
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

//   const getTransactionIcon = (type: string) => {
//     switch (type) {
//       case 'purchase':
//         return <TrendingUp className="w-4 h-4 text-green-500" />;
//       case 'sale':
//         return <TrendingDown className="w-4 h-4 text-red-500" />;
//       case 'adjustment':
//         return <Package className="w-4 h-4 text-blue-500" />;
//       default:
//         return <Package className="w-4 h-4 text-gray-500" />;
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   const lowStockCount = variants.filter(v => v.is_low_stock).length;
//   const outOfStockCount = variants.filter(v => v.stock_quantity === 0).length;
//   const totalValue = variants.reduce((sum, v) => sum + (v.price * v.stock_quantity), 0);

//   return (
//     <div className="space-y-6">
//       {/* Header & Stats */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          
//           <div className="flex space-x-4">
//             {/* Search */}
//             <div className="flex space-x-2">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//                   placeholder="Search products..."
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                 />
//               </div>
//               <button
//                 onClick={handleSearch}
//                 className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
//               >
//                 Search
//               </button>
//             </div>

//             <label className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 checked={showLowStockOnly}
//                 onChange={(e) => setShowLowStockOnly(e.target.checked)}
//                 className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
//               />
//               <span className="text-sm text-gray-700">Low stock only</span>
//             </label>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="bg-blue-50 rounded-lg p-4">
//             <div className="flex items-center">
//               <Package className="w-8 h-8 text-blue-500" />
//               <div className="ml-3">
//                 <p className="text-sm font-medium text-blue-600">Total Products</p>
//                 <p className="text-2xl font-bold text-blue-900">{variants.length}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-orange-50 rounded-lg p-4">
//             <div className="flex items-center">
//               <AlertTriangle className="w-8 h-8 text-orange-500" />
//               <div className="ml-3">
//                 <p className="text-sm font-medium text-orange-600">Low Stock</p>
//                 <p className="text-2xl font-bold text-orange-900">{lowStockCount}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-red-50 rounded-lg p-4">
//             <div className="flex items-center">
//               <Package className="w-8 h-8 text-red-500" />
//               <div className="ml-3">
//                 <p className="text-sm font-medium text-red-600">Out of Stock</p>
//                 <p className="text-2xl font-bold text-red-900">{outOfStockCount}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-green-50 rounded-lg p-4">
//             <div className="flex items-center">
//               <TrendingUp className="w-8 h-8 text-green-500" />
//               <div className="ml-3">
//                 <p className="text-sm font-medium text-green-600">Total Value</p>
//                 <p className="text-2xl font-bold text-green-900">₹{totalValue.toLocaleString()}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Inventory Table */}
//         <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 py-4 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900">Product Inventory</h2>
//           </div>
          
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Product
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Stock
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {variants.map((variant) => {
//                   const status = getStockStatus(variant);
//                   return (
//                     <tr key={variant.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">
//                             {getProductName(variant)}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {variant.weight}{variant.weight_unit} • ₹{variant.price}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {variant.stock_quantity} units
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           Threshold: {variant.low_stock_threshold}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
//                           {status.label}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <button
//                           onClick={() => setSelectedVariant(variant)}
//                           className="text-orange-600 hover:text-orange-900 inline-flex items-center"
//                         >
//                           <Plus className="w-4 h-4 mr-1" />
//                           Restock
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {variants.length === 0 && (
//             <div className="text-center py-12">
//               <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
//               <p className="text-gray-500">No products match your current filters.</p>
//             </div>
//           )}
//         </div>

//         {/* Recent Transactions */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           <div className="px-6 py-4 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
//           </div>
          
//           <div className="p-6">
//             <div className="space-y-4 max-h-96 overflow-y-auto">
//               {transactions.slice(0, 10).map((transaction) => (
//                 <div key={transaction.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
//                   {getTransactionIcon(transaction.transaction_type)}
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-900 truncate">
//                       {transaction.product_name}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       {transaction.variant_name} • {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} units
//                     </p>
//                     <p className="text-xs text-gray-400">
//                       {formatDate(transaction.created_at)}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm font-medium text-gray-900">
//                       {transaction.new_stock} units
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Restock Modal */}
//       {selectedVariant && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Restock Inventory
//             </h3>
//             <div className="mb-4">
//               <p className="text-sm text-gray-600">
//                 {getProductName(selectedVariant)} - {selectedVariant.weight}{selectedVariant.weight_unit}
//               </p>
//               <p className="text-sm text-gray-500">
//                 Current stock: {selectedVariant.stock_quantity} units
//               </p>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Quantity to Add *
//                 </label>
//                 <input
//                   type="number"
//                   value={restockData.quantity}
//                   onChange={(e) => setRestockData(prev => ({ ...prev, quantity: e.target.value }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   placeholder="Enter quantity"
//                   min="1"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Reference Number
//                 </label>
//                 <input
//                   type="text"
//                   value={restockData.reference_number}
//                   onChange={(e) => setRestockData(prev => ({ ...prev, reference_number: e.target.value }))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   placeholder="Purchase order, invoice number, etc."
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Notes
//                 </label>
//                 <textarea
//                   value={restockData.notes}
//                   onChange={(e) => setRestockData(prev => ({ ...prev, notes: e.target.value }))}
//                   rows={3}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   placeholder="Additional notes (optional)"
//                 />
//               </div>
//             </div>

//             <div className="flex space-x-3 mt-6">
//               <button
//                 onClick={() => setSelectedVariant(null)}
//                 disabled={isRestocking}
//                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleRestock}
//                 disabled={isRestocking || !restockData.quantity}
//                 className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isRestocking ? 'Restocking...' : 'Restock'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminInventory;

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Package, AlertTriangle, Plus, Minus, Search, TrendingUp, TrendingDown, Filter, X } from 'lucide-react';

interface ProductVariant {
  id: string;
  product?: string | {
    name: string;
    category: string;
  };
  product_name?: string;
  weight: number;
  weight_unit: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
  is_active: boolean;
}

interface InventoryTransaction {
  id: string;
  product_name: string;
  variant_name: string;
  transaction_type: string;
  quantity: number;
  new_stock: number;
  created_at: string;
  reference_number: string;
}

const AdminInventory = () => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [restockData, setRestockData] = useState({
    quantity: '',
    reference_number: '',
    notes: ''
  });
  const [isRestocking, setIsRestocking] = useState(false);

  const getProductName = (variant: ProductVariant): string => {
    if (variant.product_name) return variant.product_name;
    if (typeof variant.product === 'object' && variant.product?.name) return variant.product.name;
    return 'Unknown Product';
  };

  useEffect(() => {
    fetchInventoryData();
  }, [showLowStockOnly]);

  const fetchInventoryData = async () => {
    try {
      const [variantsRes, transactionsRes] = await Promise.all([
        api.get('/admin/inventory/', {
          params: {
            search: searchQuery,
            low_stock: showLowStockOnly || undefined
          }
        }),
        api.get('/admin/inventory/transactions/')
      ]);
      
      setVariants(variantsRes.data.results || variantsRes.data);
      setTransactions(transactionsRes.data.results || transactionsRes.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    fetchInventoryData();
  };

  const handleRestock = async () => {
    if (!selectedVariant || !restockData.quantity) return;

    setIsRestocking(true);
    try {
      await api.post(`/admin/inventory/${selectedVariant.id}/restock/`, {
        quantity: parseInt(restockData.quantity),
        reference_number: restockData.reference_number,
        notes: restockData.notes
      });

      // Update local state
      setVariants(variants.map(variant => 
        variant.id === selectedVariant.id
          ? { ...variant, stock_quantity: variant.stock_quantity + parseInt(restockData.quantity) }
          : variant
      ));

      setSelectedVariant(null);
      setRestockData({ quantity: '', reference_number: '', notes: '' });
      alert('Inventory restocked successfully!');
      
      // Refresh transactions
      fetchInventoryData();
    } catch (error) {
      console.error('Error restocking inventory:', error);
      alert('Failed to restock inventory');
    } finally {
      setIsRestocking(false);
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'sale':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'adjustment':
        return <Package className="w-4 h-4 text-blue-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  const lowStockCount = variants.filter(v => v.is_low_stock).length;
  const outOfStockCount = variants.filter(v => v.stock_quantity === 0).length;
  const totalValue = variants.reduce((sum, v) => sum + (v.price * v.stock_quantity), 0);

  return (
    <div className="space-y-4 p-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Inventory Management</h1>
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
                placeholder="Search products..."
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
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showLowStockOnly}
                  onChange={(e) => setShowLowStockOnly(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Show low stock only</span>
              </label>
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
                <p className="text-xs font-medium text-blue-600 truncate">Total Products</p>
                <p className="text-lg font-bold text-blue-900">{variants.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-orange-600 truncate">Low Stock</p>
                <p className="text-lg font-bold text-orange-900">{lowStockCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center">
              <Package className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-red-600 truncate">Out of Stock</p>
                <p className="text-lg font-bold text-red-900">{outOfStockCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-green-600 truncate">Total Value</p>
                <p className="text-lg font-bold text-green-900">₹{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory List - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Product Inventory</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {variants.map((variant) => {
            const status = getStockStatus(variant);
            return (
              <div key={variant.id} className="p-4 hover:bg-gray-50">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {getProductName(variant)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {variant.weight}{variant.weight_unit} • ₹{variant.price}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedVariant(variant)}
                    className="ml-2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Stock Details */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Current Stock</p>
                    <p className="font-medium text-gray-900">{variant.stock_quantity} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Threshold</p>
                    <p className="font-medium text-gray-900">{variant.low_stock_threshold}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    variant.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {variant.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {variants.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">No products match your current filters.</p>
          </div>
        )}
      </div>

      {/* Recent Transactions - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        
        <div className="p-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getTransactionIcon(transaction.transaction_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.product_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {transaction.variant_name}
                      </p>
                    </div>
                    <div className="ml-2 text-right">
                      <p className={`text-sm font-medium ${
                        transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.new_stock} units
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400 truncate">
                      {transaction.reference_number}
                    </p>
                    <p className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Restock Modal - Mobile Optimized */}
      {selectedVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 sm:items-center sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-lg w-full max-h-[90vh] overflow-y-auto sm:max-w-md">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Restock Inventory</h3>
              <button
                onClick={() => setSelectedVariant(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getProductName(selectedVariant)}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedVariant.weight}{selectedVariant.weight_unit}
                </p>
                <p className="text-sm text-gray-500">
                  Current stock: <span className="font-semibold">{selectedVariant.stock_quantity} units</span>
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity to Add *
                  </label>
                  <input
                    type="number"
                    value={restockData.quantity}
                    onChange={(e) => setRestockData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={restockData.reference_number}
                    onChange={(e) => setRestockData(prev => ({ ...prev, reference_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Purchase order, invoice number, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={restockData.notes}
                    onChange={(e) => setRestockData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Additional notes (optional)"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedVariant(null)}
                  disabled={isRestocking}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestock}
                  disabled={isRestocking || !restockData.quantity}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isRestocking ? 'Restocking...' : 'Restock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;