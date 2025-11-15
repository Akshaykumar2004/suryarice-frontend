import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { Star, Filter, Search, ShoppingCart, Sun } from 'lucide-react';
import ProductImageCarousel, { CarouselImageInput } from '../../components/ProductImageCarousel';

interface Product {
  id: string;
  name: string;
  image: string | null;
  brand: string;
  category_name: string;
  average_rating: number;
  min_price: number;
  is_featured: boolean;
  images?: CarouselImageInput[];
}

interface Category {
  id: string;
  name: string;
  product_count: number;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
    
    // Set category from URL params
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products/', {
          params: {
            category: searchParams.get('category'),
            search: searchQuery,
          }
        }),
        api.get('/categories/')
      ]);
      
      setProducts(productsRes.data.results || productsRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    fetchData();
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsLoading(true);
    
    // Update URL params
    const params = new URLSearchParams();
    if (categoryId) params.set('category', categoryId);
    if (searchQuery) params.set('search', searchQuery);
    
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-8 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 text-white p-4 md:p-6 safe-area-top shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Our Products</h1>
        
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for rice varieties..."
              className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-sm md:text-base placeholder-gray-500 shadow-sm bg-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 px-4 md:px-5 py-3 md:py-4 rounded-xl transition-colors touch-manipulation min-w-[48px] md:min-w-[56px] min-h-[48px] md:min-h-[56px] flex items-center justify-center shadow-sm"
            aria-label="Toggle filters"
          >
            <Filter className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 p-4 md:p-6 shadow-md animate-in slide-in-from-top">
          <h3 className="font-bold text-gray-800 mb-4 text-base md:text-lg">Categories</h3>
          <div className="flex flex-wrap gap-2 md:gap-3 overflow-x-auto pb-2 -mx-2 px-2">
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-4 md:px-5 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 touch-manipulation min-h-[44px] whitespace-nowrap ${
                !selectedCategory
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.id)}
                className={`px-4 md:px-5 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 touch-manipulation min-h-[44px] whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                }`}
              >
                {category.name} ({category.product_count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="p-4 md:p-6">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Sun className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-700 mb-3">No products found</h3>
            <p className="text-gray-500 text-lg">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl active:shadow-lg transition-all duration-200 overflow-hidden group"
              >
                <Link to={`/products/${product.id}`}>
                  <ProductImageCarousel
                    primaryImage={product.image}
                    gallery={product.images}
                    aspectClassName="aspect-square"
                    className="overflow-hidden rounded-t-xl"
                    altFallback={product.name}
                  />
                </Link>
                
                <div className="p-3 md:p-4">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 hover:text-orange-600 active:text-orange-700 transition-colors text-sm md:text-base leading-tight group-hover:text-orange-600">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 md:w-4 md:h-4 ${
                            i < Math.floor(product.average_rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2 font-medium">
                      ({product.average_rating?.toFixed(1) || '0.0'})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base md:text-lg font-bold text-orange-500">
                        ₹{product.min_price}
                      </span>
                      <span className="text-xs text-gray-500 ml-1 font-medium">from</span>
                    </div>
                    <Link
                      to={`/products/${product.id}`}
                      className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white p-2.5 rounded-lg transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center shadow-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;