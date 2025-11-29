// Example implementation of mobile home page using the new design system
// This demonstrates how to use all the mobile components together

import { Award, Leaf, Star, ChevronRight } from 'lucide-react';
import { HeroSection } from './HeroSection';
import { FeatureCard } from './FeatureCard';
import { ProductCard } from './ProductCard';
import { MobileCard } from './MobileCard';
import { MobileButton } from './MobileButton';
import { useNavigate } from 'react-router-dom';

export function MobileHomePageExample() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-beige-light pb-24">
      {/* Hero Banner */}
      <HeroSection
        title="SURYA"
        subtitle="WELCOME TO"
        badge="Premium Low GI Rice"
        description="Experience the perfect blend of taste and health with our premium organic Low GI rice"
        height="h-[600px]"
      />

      {/* Features */}
      <div className="px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-3 gap-4 mb-12">
          <FeatureCard
            icon={Award}
            title="Premium Quality"
            color="var(--gold)"
          />
          <FeatureCard
            icon={Leaf}
            title="100% Organic"
            color="var(--deep-green)"
          />
          <FeatureCard
            icon={Star}
            title="Low GI"
            color="var(--maroon)"
          />
        </div>

        {/* Product Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-deep-green text-2xl font-semibold">Our Product</h2>
          <button 
            onClick={() => navigate('/products')}
            className="text-gold text-sm flex items-center gap-1 font-medium"
          >
            View All
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Product Card */}
        <ProductCard
          id="1"
          name="Surya Low GI Rice"
          description="Premium Organic Basmati"
          price={499}
          originalPrice={699}
          discount={28}
          rating={4.9}
          badge="Low GI"
          onClick={() => navigate('/products/1')}
        />

        {/* Why Choose Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-deep-green text-2xl font-semibold mb-6">Why Choose Surya?</h2>
          <div className="space-y-4">
            {[
              { title: "Low Glycemic Index", desc: "Helps maintain stable blood sugar levels", icon: "📊" },
              { title: "100% Organic", desc: "Grown without pesticides or chemicals", icon: "🌱" },
              { title: "Premium Quality", desc: "Handpicked and carefully processed", icon: "⭐" },
              { title: "Rich in Nutrients", desc: "High in fiber, vitamins and minerals", icon: "💪" },
            ].map((item, i) => (
              <MobileCard key={i} padding="md" shadow="sm" rounded="2xl">
                <div className="flex gap-4">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <h3 className="text-deep-green text-lg font-medium mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <MobileButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/products')}
        >
          Shop Now
        </MobileButton>
      </div>
    </div>
  );
}
