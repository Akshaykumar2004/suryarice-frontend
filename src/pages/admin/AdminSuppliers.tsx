import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Search, CreditCard as Edit, Trash2, Phone, Mail, MapPin, Clock } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  mobile_number: string;
  email: string;
  address: string;
  lead_time_days: number;
  minimum_order_quantity: number;
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    mobile_number: '',
    email: '',
    address: '',
    lead_time_days: 2,
    minimum_order_quantity: 0,
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await api.get('/admin/suppliers/', { params });
      setSuppliers(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    fetchSuppliers();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.put(`/admin/suppliers/${editingSupplier.id}/`, formData);
      } else {
        await api.post('/admin/suppliers/', formData);
      }
      setShowModal(false);
      setEditingSupplier(null);
      resetForm();
      fetchSuppliers();
      alert('Supplier saved successfully!');
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Failed to save supplier');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      mobile_number: '',
      email: '',
      address: '',
      lead_time_days: 2,
      minimum_order_quantity: 0,
      is_active: true,
      notes: ''
    });
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person,
      mobile_number: supplier.mobile_number,
      email: supplier.email,
      address: supplier.address,
      lead_time_days: supplier.lead_time_days,
      minimum_order_quantity: supplier.minimum_order_quantity,
      is_active: supplier.is_active,
      notes: supplier.notes
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(`/admin/suppliers/${id}/`);
        fetchSuppliers();
        alert('Supplier deleted successfully!');
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Failed to delete supplier');
      }
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/suppliers/${id}/`, { is_active: !currentStatus });
      fetchSuppliers();
    } catch (error) {
      console.error('Error updating supplier:', error);
      alert('Failed to update supplier status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Suppliers</h1>
              <button
                onClick={() => setShowModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 min-h-[44px] rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
            
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 min-h-[44px] rounded-lg transition-colors flex items-center justify-center"
              >
                <Search className="w-5 h-5 md:hidden" />
                <span className="hidden md:inline">Search</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium">Total</p>
                <p className="text-xl font-bold text-blue-900">{suppliers.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 font-medium">Active</p>
                <p className="text-xl font-bold text-green-900">{suppliers.filter(s => s.is_active).length}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-600 font-medium">Inactive</p>
                <p className="text-xl font-bold text-red-900">{suppliers.filter(s => !s.is_active).length}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600 font-medium">Avg Lead Time</p>
                <p className="text-xl font-bold text-orange-900">
                  {suppliers.length > 0 ? Math.round(suppliers.reduce((sum, s) => sum + s.lead_time_days, 0) / suppliers.length) : 0}d
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                  <p className="text-sm text-gray-600">{supplier.contact_person}</p>
                </div>
                <button
                  onClick={() => toggleActive(supplier.id, supplier.is_active)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    supplier.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {supplier.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{supplier.mobile_number}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{supplier.email}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{supplier.address}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3 pt-3 border-t border-gray-100">
                <div>
                  <span className="text-gray-600">Lead Time:</span>
                  <span className="ml-1 font-medium">{supplier.lead_time_days} days</span>
                </div>
                <div>
                  <span className="text-gray-600">Min Order:</span>
                  <span className="ml-1 font-medium">{supplier.minimum_order_quantity}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 min-h-[44px] rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 min-h-[44px] rounded-lg transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-sm text-gray-500">{supplier.contact_person}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {supplier.address || 'No address provided'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        {supplier.mobile_number}
                      </div>
                      {supplier.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          {supplier.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        {supplier.lead_time_days} days
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Min Order: {supplier.minimum_order_quantity}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(supplier.id, supplier.is_active)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        supplier.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {supplier.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="text-orange-600 hover:text-orange-900 inline-flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>

          {suppliers.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
              <p className="text-gray-500">Get started by adding your first supplier.</p>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                    className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                    className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.lead_time_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, lead_time_days: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.minimum_order_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimum_order_quantity: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
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

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSupplier(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 min-h-[44px] border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 min-h-[44px] rounded-lg transition-colors"
                >
                  {editingSupplier ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminSuppliers;