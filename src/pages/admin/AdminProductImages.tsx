import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { ImagePlus, Images, RefreshCcw, Upload, Trash2, Save, Loader2 } from 'lucide-react';

interface ProductSummary {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  product_id: string;
  image: string;
  alt_text: string;
  display_order: number;
}

type ActiveTab = 'manage' | 'upload';

const AdminProductImages: React.FC = () => {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('manage');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchImages(selectedProductId);
    } else {
      setImages([]);
    }
  }, [selectedProductId]);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await api.get('/admin/products/', {
        params: { page_size: 200, fields: 'id,name' }
      });
      const data = response.data.results || response.data;
      const parsed = (data as any[]).map((product) => ({
        id: product.id,
        name: product.name
      }));
      setProducts(parsed);
      if (parsed.length > 0) {
        setSelectedProductId(parsed[0].id);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setFeedback('Failed to load products.', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchImages = async (productId: string) => {
    setIsLoadingImages(true);
    try {
      const response = await api.get('/admin/product-images/', {
        params: { product: productId, page_size: 100 }
      });
      const data = response.data.results || response.data;
      const mapped = (data as any[]).map((image) => ({
        id: image.id,
        product_id: image.product_id,
        image: image.image,
        alt_text: image.alt_text || '',
        display_order: Number(image.display_order ?? 0)
      }));
      mapped.sort((a, b) => a.display_order - b.display_order);
      setImages(mapped);
    } catch (error) {
      console.error('Error fetching product images:', error);
      setFeedback('Failed to load product images.', 'error');
    } finally {
      setIsLoadingImages(false);
    }
  };

  const setFeedback = (message: string, type: 'success' | 'error') => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    setTimeout(() => {
      setFeedbackMessage('');
      setFeedbackType('');
    }, 4000);
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (!selectedProductId) {
      setFeedback('Select a product before uploading.', 'error');
      return;
    }
    if (selectedFiles.length === 0) {
      setFeedback('Choose at least one image to upload.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      for (const [index, file] of selectedFiles.entries()) {
        const formData = new FormData();
        formData.append('product', selectedProductId);
        formData.append('image', file);
        formData.append('display_order', String(images.length + index));
        await api.post('/admin/product-images/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      setSelectedFiles([]);
      await fetchImages(selectedProductId);
      setFeedback('Images uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error uploading images:', error);
      setFeedback('Failed to upload images.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const updateImage = async (image: ProductImage) => {
    try {
      await api.patch(`/admin/product-images/${image.id}/`, {
        alt_text: image.alt_text,
        display_order: image.display_order
      });
      setFeedback('Image updated successfully.', 'success');
      await fetchImages(selectedProductId);
    } catch (error) {
      console.error('Error updating image:', error);
      setFeedback('Failed to update image.', 'error');
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!window.confirm('Delete this image? This cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/admin/product-images/${imageId}/`);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setFeedback('Image deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting image:', error);
      setFeedback('Failed to delete image.', 'error');
    }
  };

  const selectedProductName = useMemo(() => {
    return products.find((product) => product.id === selectedProductId)?.name || 'Select a product';
  }, [products, selectedProductId]);

  const tabButtonClass = (tab: ActiveTab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tab ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center space-x-3">
              <Images className="w-6 h-6 text-orange-500" />
              <span>Product Images</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage gallery images for your products. Upload new images, edit metadata, and remove outdated visuals.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={() => fetchImages(selectedProductId)}
              disabled={!selectedProductId || isLoadingImages}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${isLoadingImages ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">
                Product
              </label>
              <select
                value={selectedProductId}
                onChange={(event) => setSelectedProductId(event.target.value)}
                className="min-w-[220px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isLoadingProducts}
              >
                {isLoadingProducts ? (
                  <option>Loading...</option>
                ) : (
                  products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                className={tabButtonClass('manage')}
                onClick={() => setActiveTab('manage')}
              >
                Manage
              </button>
              <button
                className={tabButtonClass('upload')}
                onClick={() => setActiveTab('upload')}
              >
                Upload
              </button>
            </div>
          </div>
        </div>

        {feedbackMessage && (
          <div
            className={`mx-6 mt-4 px-4 py-3 rounded-lg text-sm ${
              feedbackType === 'success'
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}
          >
            {feedbackMessage}
          </div>
        )}

        <div className="px-6 py-6">
          {activeTab === 'manage' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Gallery for {selectedProductName}
                </h2>
                <span className="text-sm text-gray-500">
                  {images.length} image{images.length === 1 ? '' : 's'}
                </span>
              </div>

              {isLoadingImages ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading images...
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <ImagePlus className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800">No images yet</h3>
                  <p className="text-sm text-gray-500">
                    Use the Upload tab to add product visuals.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white flex flex-col"
                    >
                      <div className="aspect-video bg-gray-100">
                        <img
                          src={image.image}
                          alt={image.alt_text || selectedProductName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-3 flex-1 flex flex-col">
                        <div>
                          <label className="text-xs font-medium text-gray-600">
                            Alt Text
                          </label>
                          <input
                            type="text"
                            value={image.alt_text ?? ''}
                            onChange={(event) =>
                              setImages((prev) =>
                                prev.map((img) =>
                                  img.id === image.id
                                    ? { ...img, alt_text: event.target.value }
                                    : img
                                )
                              )
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
                            onChange={(event) =>
                              setImages((prev) =>
                                prev.map((img) =>
                                  img.id === image.id
                                    ? { ...img, display_order: Number(event.target.value) }
                                    : img
                                )
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div className="flex space-x-2 pt-2 mt-auto">
                          <button
                            onClick={() => updateImage(image)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </button>
                          <button
                            onClick={() => deleteImage(image.id)}
                            className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Upload Images for {selectedProductName}
                </h2>
                <p className="text-sm text-gray-500">
                  You can add multiple images at once. Images will automatically appear in the gallery tab after upload.
                </p>
              </div>

              <div className="border border-dashed border-gray-300 rounded-xl bg-gray-50 p-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Upload className="w-8 h-8 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Select product images</h3>
                    <p className="text-sm text-gray-500">
                      Supported formats: JPG, PNG. Recommended size: at least 800px wide.
                    </p>
                  </div>
                  <div>
                    <label className="inline-flex items-center px-5 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold cursor-pointer hover:bg-orange-600 transition-colors">
                      Choose Files
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelection}
                      />
                    </label>
                  </div>
                  {selectedFiles.length > 0 && (
                    <p className="text-sm text-gray-600">
                      {selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'} selected.
                    </p>
                  )}
                  <button
                    onClick={handleUpload}
                    disabled={isUploading || selectedFiles.length === 0}
                    className="inline-flex items-center px-5 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Images
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductImages;

