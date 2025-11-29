import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Star, ArrowRight, Sun, Truck, Shield, Phone } from 'lucide-react';
import ProductImageCarousel, { CarouselImageInput } from '../../components/ProductImageCarousel';

interface Product {
  id: string;
  name: string;
  image: string | null;
  brand: string;
  average_rating: number;
  min_price: number;
  is_featured: boolean;
  images?: CarouselImageInput[];
}

interface Category {
  id: string;
  name: string;
  image: string;
  product_count: number;
}

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products/?featured=true'),
        api.get('/categories/')
      ]);
      
      setFeaturedProducts(productsRes.data.results || productsRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
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
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/d5c4d84f-587a-405e-8ffb-d8917d11f73b copy.jpeg"
            alt="Surya Rice Background"
            className="w-full h-full object-cover"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 md:px-6 py-16 md:py-24 lg:py-32">
          <div className="flex justify-center items-center mb-6">
            <div className="w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
              <img 
                src="/logo-removebg-preview.png" 
                alt="Surya Rice Logo" 
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg leading-tight">
            <span className="text-orange-400">SURYA</span>
          </h1>
          <p className="text-xl md:text-2xl mb-3 text-orange-300 font-semibold drop-shadow-md">
            SHINE BRIGHT WITH EVERY BITE
          </p>
          <p className="text-lg md:text-xl mb-8 text-white/90 drop-shadow-md max-w-2xl mx-auto leading-relaxed">
            Premium Low GI Rice delivered fresh to your doorstep
          </p>
          <Link
            to="/products"
            className="inline-flex items-center bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-xl touch-manipulation min-h-[56px]"
          >
            Shop Now <ArrowRight className="ml-3 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">Get your rice delivered within 5-7 days across the region</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Premium Quality</h3>
              <p className="text-gray-600 leading-relaxed">Handpicked, low GI rice varieties for healthy living</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">24/7 Support</h3>
              <p className="text-gray-600 leading-relaxed">Round-the-clock customer support for all your needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-8 md:mb-12">
            Explore Our <span className="text-orange-500">Rice Varieties</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl active:shadow-lg transition-all duration-200 overflow-hidden transform hover:scale-105 active:scale-95 touch-manipulation"
              >
                <div className="aspect-square bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center group-hover:from-orange-200 group-hover:to-yellow-200 transition-colors">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Sun className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-4 text-center bg-white">
                  <h3 className="font-bold text-gray-800 mb-1 text-sm md:text-base">{category.name}</h3>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">{category.product_count} products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
              Featured <span className="text-orange-500">Products</span>
            </h2>
            <Link
              to="/products"
              className="text-orange-500 hover:text-orange-600 active:text-orange-700 font-semibold flex items-center transition-colors touch-manipulation text-sm md:text-base"
            >
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl active:shadow-lg transition-all duration-200 overflow-hidden transform hover:scale-105 active:scale-95 touch-manipulation"
              >
                <ProductImageCarousel
                  primaryImage={product.image}
                  gallery={product.images}
                  aspectClassName="aspect-square"
                  className="overflow-hidden rounded-t-xl"
                  altFallback={product.name}
                />
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm md:text-base leading-tight">{product.name}</h3>
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
                    <span className="text-xs md:text-sm text-gray-500 ml-2 font-medium">
                      ({product.average_rating?.toFixed(1) || '0.0'})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg md:text-xl font-bold text-orange-500">
                      ₹{product.min_price}
                    </span>
                      <span className="text-xs text-gray-500 ml-1">from</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-gradient-to-r from-teal-800 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            Ready to Experience Premium Rice?
          </h2>
          <p className="text-base md:text-xl lg:text-2xl mb-8 md:mb-10 text-teal-100 leading-relaxed max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust Surya for their daily rice needs
          </p>
          <Link
            to="/products"
            className="inline-flex items-center bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-8 md:px-10 py-4 md:py-5 rounded-full text-lg md:text-xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-2xl touch-manipulation min-h-[56px] md:min-h-[64px]"
          >
            Start Shopping <ArrowRight className="ml-2 md:ml-3 w-5 h-5 md:w-6 md:h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;