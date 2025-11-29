import React, { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { api } from '../../services/api';
import { Plus, Search, Edit, Eye, Star, Package, X } from 'lucide-react';
import ProductImageCarousel, { CarouselImageInput } from '../../components/ProductImageCarousel';

interface ProductVariant {
  id: string;
  weight: number | string;
  weight_unit: string;
  price: number | string;
  discount_price?: number | string | null;
  effective_price?: number | string | null;
}

interface Product {
  id: string;
  name: string;
  category: string;
  category_id: string;
  description: string | null;
  brand: string | null;
  origin: string | null;
  image?: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number | null;
  average_rating: number | null;
  total_reviews: number;
  variants?: ProductVariant[];
  images?: CarouselImageInput[];
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  category_id: string;
  description: string;
  brand: string;
  origin: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
}

type ProductImage = CarouselImageInput & {
  id: string;
  product_id: string;
  display_order: number;
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category_id: '',
    description: '',
    brand: '',
    origin: '',
    display_order: 0,
    is_featured: false,
    is_active: true
  });
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (showModal && editingProduct) {
      void loadProductImages(editingProduct.id);
    } else {
      setProductImages([]);
      setSelectedImageFiles([]);
      setImageUploadError(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  }, [showModal, editingProduct]);

  const fetchProducts = async () => {
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await api.get('/admin/products/', { params });
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories/');
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const loadProductImages = async (productId: string) => {
    try {
      const response = await api.get('/admin/product-images/', {
        params: { product: productId }
      });
      const imagesData = (response.data.results || response.data) as Array<Record<string, unknown>>;
      const mappedImages: ProductImage[] = imagesData
        .map((image) => ({
          id: String(image.id ?? ''),
          product_id: String(image.product_id ?? image.product ?? productId),
          image: String(image.image ?? ''),
          alt_text: typeof image.alt_text === 'string' ? image.alt_text : '',
          display_order: Number(image.display_order ?? 0) || 0,
        }))
        .filter((image) => image.image);

      setProductImages(mappedImages.sort((a, b) => a.display_order - b.display_order));
    } catch (error) {
      console.error('Error fetching product images:', error);
      alert('Failed to load product images');
    }
  };

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedImageFiles(files);
    setImageUploadError(null);
  };

  const uploadSelectedImages = async () => {
    if (!editingProduct) {
      alert('Please save the product details before uploading images.');
      return;
    }

    if (selectedImageFiles.length === 0) {
      setImageUploadError('Please select one or more images to upload.');
      return;
    }

    setIsUploadingImages(true);
    setImageUploadError(null);

    try {
      for (const [index, file] of selectedImageFiles.entries()) {
        const formData = new FormData();
        formData.append('product', editingProduct.id);
        formData.append('image', file);
        formData.append('display_order', String(productImages.length + index));

        await api.post('/admin/product-images/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      setSelectedImageFiles([]);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }

      await loadProductImages(editingProduct.id);
    } catch (error) {
      console.error('Error uploading product images:', error);
      setImageUploadError('Failed to upload one or more images. Please try again.');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleImageFieldChange = (imageId: string, field: 'alt_text' | 'display_order', value: string) => {
    if (field === 'display_order') {
      const numeric = Number(value);
      const safeValue = Number.isNaN(numeric) ? 0 : numeric;
      setProductImages((prev) =>
        prev.map((image) =>
          image.id === imageId
            ? { ...image, display_order: safeValue }
            : image
        )
      );
    } else {
      setProductImages((prev) =>
        prev.map((image) =>
          image.id === imageId
            ? { ...image, alt_text: value }
            : image
        )
      );
    }
  };

  const saveProductImageDetails = async (image: ProductImage) => {
    try {
      await api.patch(`/admin/product-images/${image.id}/`, {
        alt_text: image.alt_text,
        display_order: image.display_order
      });
      alert('Image details updated successfully!');
      if (editingProduct) {
        await loadProductImages(editingProduct.id);
      }
    } catch (error) {
      console.error('Error updating product image:', error);
      alert('Failed to update image details');
    }
  };

  const deleteProductImage = async (imageId: string) => {
    if (!editingProduct) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this image?');
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/admin/product-images/${imageId}/`);
      setProductImages((prev) => prev.filter((image) => image.id !== imageId));
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting product image:', error);
      alert('Failed to delete product image');
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    fetchProducts();
  };

  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/products/${productId}/`, {
        is_featured: !currentStatus
      });
      
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, is_featured: !currentStatus }
            : product
        )
      );
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const toggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/products/${productId}/`, {
        is_active: !currentStatus
      });
      
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, is_active: !currentStatus }
            : product
        )
      );
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: '',
      description: '',
      brand: '',
      origin: '',
      display_order: 0,
      is_featured: false,
      is_active: true
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingProduct(null);
    setProductImages([]);
    setSelectedImageFiles([]);
    setImageUploadError(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category_id: product.category_id,
      description: product.description || '',
      brand: product.brand || '',
      origin: product.origin || '',
      display_order: product.display_order || 0,
      is_featured: product.is_featured,
      is_active: product.is_active
    });
    setSelectedImageFiles([]);
    setImageUploadError(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
    resetForm();
    setProductImages([]);
    setSelectedImageFiles([]);
    setImageUploadError(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleFormChange = (field: keyof ProductFormData, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert('Product name is required.');
      return;
    }

    if (!formData.category_id) {
      alert('Please select a category.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}/`, formData);
        alert('Product updated successfully!');
      } else {
        await api.post('/admin/products/', formData);
        alert('Product created successfully!');
      }

      handleModalClose();
      setIsLoading(true);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleChange = (field: 'is_featured' | 'is_active', value: boolean) => {
    handleFormChange(field, value);
  };

  const getStartingPrice = (product: Product): string => {
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants
        .map((variant) => {
          const rawValue = variant.effective_price ?? variant.price;
          const numeric = typeof rawValue === 'string' ? parseFloat(rawValue) : Number(rawValue);
          return Number.isNaN(numeric) ? null : numeric;
        })
        .filter((price): price is number => price !== null);

      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        return `₹${minPrice}`;
      }
    }

    return '—';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Products</h1>
            <button
              onClick={openCreateModal}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center space-x-1 md:space-x-2 transition-colors text-sm md:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
          
          <div className="flex gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm md:text-base"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm md:text-base"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Product Image */}
            <ProductImageCarousel
              primaryImage={product.image}
              gallery={product.images}
              aspectClassName="aspect-square"
              className="rounded-none"
              altFallback={product.name}
            />

            {/* Product Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1">
                  {product.name}
                </h3>
                <div className="flex space-x-1 ml-2">
                  {product.is_featured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Category:</span> {product.category}
                </p>
                {product.brand && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Brand:</span> {product.brand}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {Number(product.average_rating ?? 0).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-orange-500">
                    {getStartingPrice(product)}{' '}
                    <span className="text-sm text-gray-500 font-normal">from</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => openEditModal(product)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Toggle Buttons */}
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => toggleFeatured(product.id, product.is_featured)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    product.is_featured
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {product.is_featured ? 'Remove Featured' : 'Make Featured'}
                </button>
                <button
                  onClick={() => toggleActive(product.id, product.is_active)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    product.is_active
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {product.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first product.</p>
          <button
            onClick={openCreateModal}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg my-8">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleFormChange('category_id', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleFormChange('brand', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Origin
                  </label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => handleFormChange('origin', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => handleFormChange('display_order', Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Product description"
                />
              </div>

              {/* {editingProduct ? (
                <div className="rounded-lg border border-gray-200 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">
                      Product Gallery
                    </h4>
                    {productImages.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {productImages.length} image{productImages.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Add Images
                    </label>
                    <input
                      key={editingProduct.id}
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileChange}
                      className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {selectedImageFiles.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {selectedImageFiles.length} file{selectedImageFiles.length === 1 ? '' : 's'} selected
                      </p>
                    )}
                    {imageUploadError && (
                      <p className="text-xs text-red-600">{imageUploadError}</p>
                    )}
                    <button
                      type="button"
                      onClick={uploadSelectedImages}
                      disabled={isUploadingImages || selectedImageFiles.length === 0}
                      className="inline-flex items-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUploadingImages ? 'Uploading...' : 'Upload Images'}
                    </button>
                  </div>

                  <div>
                    {productImages.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No gallery images yet. Upload images to build the product gallery.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {productImages.map((image) => (
                          <div
                            key={image.id}
                            className="overflow-hidden rounded-lg border border-gray-200"
                          >
                            <div className="aspect-video bg-gray-100">
                              <img
                                src={image.image}
                                alt={image.alt_text || formData.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="space-y-3 p-4">
                              <div>
                                <label className="text-xs font-medium text-gray-600">
                                  Alt Text
                                </label>
                                <input
                                  type="text"
                                  value={image.alt_text ?? ''}
                                  onChange={(e) =>
                                    handleImageFieldChange(image.id, 'alt_text', e.target.value)
                                  }
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  placeholder="Describe the image (optional)"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600">
                                  Display Order
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={image.display_order}
                                  onChange={(e) =>
                                    handleImageFieldChange(image.id, 'display_order', e.target.value)
                                  }
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => saveProductImageDetails(image)}
                                  className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteProductImage(image.id)}
                                  className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                  Save the product first, then edit it to manage gallery images.
                </div>
              )} */}

              <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleToggleChange('is_featured', e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Featured product</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleToggleChange('is_active', e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={isSaving}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm md:text-base text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm md:text-base text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;