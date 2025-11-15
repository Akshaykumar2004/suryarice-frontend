import React, { useEffect, useMemo, useState } from 'react';
import { Package } from 'lucide-react';

export interface CarouselImageInput {
  id?: string;
  image: string;
  alt_text?: string | null;
}

interface ProductImageCarouselProps {
  primaryImage?: string | null;
  gallery?: CarouselImageInput[];
  aspectClassName?: string;
  className?: string;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  hoverPause?: boolean;
  altFallback?: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  primaryImage,
  gallery = [],
  aspectClassName = 'aspect-square',
  className = '',
  interval = 4000,
  showControls = true,
  showIndicators = true,
  hoverPause = true,
  altFallback = 'Product image',
}) => {
  const slides = useMemo(() => {
    const uniqueSources = new Map<string, { key: string; src: string; alt: string }>();

    const addImage = (src?: string | null, alt?: string | null, keyPrefix?: string) => {
      if (!src) return;
      if (!uniqueSources.has(src)) {
        uniqueSources.set(src, {
          key: keyPrefix ? `${keyPrefix}-${src}` : src,
          src,
          alt: alt?.trim() || altFallback,
        });
      }
    };

    addImage(primaryImage, altFallback, 'primary');

    gallery.forEach((image) => {
      addImage(image?.image, image?.alt_text ?? altFallback, image?.id);
    });

    return Array.from(uniqueSources.values());
  }, [primaryImage, gallery, altFallback]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    if (hoverPause && isHovered) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, Math.max(interval, 2000));

    return () => window.clearInterval(timer);
  }, [slides.length, interval, hoverPause, isHovered]);

  const goTo = (index: number) => {
    if (slides.length <= 1) return;
    setCurrentIndex((index + slides.length) % slides.length);
  };

  const showFallback = slides.length === 0;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-orange-50 to-yellow-50 ${aspectClassName} ${className}`}
      onMouseEnter={() => hoverPause && setIsHovered(true)}
      onMouseLeave={() => hoverPause && setIsHovered(false)}
    >
      {showFallback ? (
        <div className="flex h-full w-full items-center justify-center">
          <Package className="h-12 w-12 text-orange-400" />
        </div>
      ) : (
        <>
          {slides.map((slide, index) => (
            <img
              key={slide.key}
              src={slide.src}
              alt={slide.alt}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}

          {showControls && slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(currentIndex - 1)}
                className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/70"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => goTo(currentIndex + 1)}
                className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/70"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          {showIndicators && slides.length > 1 && (
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
              {slides.map((slide, index) => (
                <button
                  key={`indicator-${slide.key}`}
                  type="button"
                  onClick={() => goTo(index)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductImageCarousel;

