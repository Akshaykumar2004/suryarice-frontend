import { Star } from 'lucide-react';
import { MandalaPattern } from './MandalaPattern';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  image?: string;
  badge?: string;
  onClick?: () => void;
}

export function ProductCard({
  name,
  description,
  price,
  originalPrice,
  discount,
  rating = 4.9,
  image,
  badge,
  onClick,
}: ProductCardProps) {
  return (
    <div 
      className="bg-white rounded-3xl shadow-soft-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="relative h-[450px] bg-gradient-to-br from-beige to-white flex items-center justify-center">
        <div className="absolute inset-0 text-deep-green opacity-5">
          <MandalaPattern opacity={1} />
        </div>
        {image ? (
          <img
            src={image}
            alt={name}
            className="relative z-10 w-[350px] h-[400px] object-contain drop-shadow-2xl"
          />
        ) : (
          <div className="relative z-10 w-[350px] h-[400px] bg-gray-200 rounded-2xl flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        {badge && (
          <div className="absolute top-6 right-6 bg-maroon text-white px-5 py-2 rounded-full text-sm shadow-lg">
            {badge}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-8">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-deep-green mb-2 text-xl font-semibold">{name}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
          <div className="flex items-center gap-1 bg-gold/10 px-4 py-2 rounded-full">
            <Star size={16} className="text-gold" fill="var(--gold)" />
            <span className="text-deep-green font-medium">{rating}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-deep-green text-3xl font-semibold">₹{price}</span>
          {originalPrice && (
            <>
              <span className="text-gray-400 line-through">₹{originalPrice}</span>
              {discount && (
                <span className="text-maroon text-sm font-medium">{discount}% OFF</span>
              )}
            </>
          )}
        </div>

        <button className="w-full bg-gradient-to-r from-gold to-[#c99d4a] text-white py-5 rounded-2xl shadow-gold hover:shadow-gold-lg transition-all active:scale-[0.98]">
          <span className="text-lg" style={{ letterSpacing: '0.5px' }}>Buy Now</span>
        </button>
      </div>
    </div>
  );
}
