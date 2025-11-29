import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Search, CreditCard as Edit, Trash2, Eye, Image as ImageIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  is_active: boolean;
  display_order: number;
  product_count: number;
  created_at: string;
  updated_at: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await api.get('/categories/', { params });
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    fetchCategories();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}/`, formData);
      } else {
        await api.post('/admin/categories/', formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', display_order: 0, is_active: true });
      fetchCategories();
      alert('Category saved successfully!');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      display_order: category.display_order,
      is_active: category.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/admin/categories/${id}/`);
        fetchCategories();
        alert('Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
      }
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/categories/${id}/`, { is_active: !currentStatus });
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category status');
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col space-y-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Categories</h1>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              {/* Search */}
              <div className="flex flex-1 gap-2">
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

              <button
                onClick={() => setShowModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 min-h-[44px] rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Category</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg overflow-hidden flex-shrink-0">
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-orange-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{category.description || 'No description'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-600">Products:</span>
                  <span className="ml-1 font-medium">{category.product_count}</span>
                </div>
                <div>
                  <span className="text-gray-600">Order:</span>
                  <span className="ml-1 font-medium">{category.display_order}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  onClick={() => toggleActive(category.id, category.is_active)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    category.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {category.is_active ? 'Active' : 'Inactive'}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
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
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
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
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg overflow-hidden flex-shrink-0">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-orange-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {category.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.product_count} products
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.display_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(category.id, category.is_active)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-orange-600 hover:text-orange-900 inline-flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
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

        {categories.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500">Get started by adding your first category.</p>
          </div>
        )}
      </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
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
                      setEditingCategory(null);
                      setFormData({ name: '', description: '', display_order: 0, is_active: true });
                    }}
                    className="flex-1 px-4 py-2 min-h-[44px] border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 min-h-[44px] rounded-lg transition-colors"
                  >
                    {editingCategory ? 'Update' : 'Create'}
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

export default AdminCategories;