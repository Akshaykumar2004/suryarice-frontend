# Mobile Design System

This document outlines the mobile design principles and components applied to the Surya Rice frontend application, based on the Ecommerce App Mobile Screens design.

## Color Palette

The application uses a warm, organic color scheme:

```css
--deep-green: #0C3B2E  /* Primary brand color */
--maroon: #7A1E20      /* Accent color for badges and alerts */
--gold: #D4A857        /* CTA buttons and highlights */
--beige: #F5F1E8       /* Secondary background */
--beige-light: #FAF8F3 /* Primary background */
```

## Typography

- **Font Family**: Inter, system-ui, -apple-system, sans-serif
- **Base Size**: 16px
- **Line Heights**: 1.2 (headings) to 1.5 (body text)
- **Font Weights**: 500 (medium), 600 (semibold)

## Mobile-First Components

### 1. BottomNav
Fixed bottom navigation with 4 main sections:
- Home, Products, Cart (with badge), Profile
- Active state: gold color
- Touch-friendly 44px minimum hit area
- Cart badge shows item count

```tsx
<BottomNav cartCount={5} />
```

### 2. MobileHeader
Sticky header with back button and actions:
- Back navigation
- Title
- Action buttons (heart, share, etc.)
- 48px touch targets

```tsx
<MobileHeader 
  title="Product Details" 
  showBack 
  showActions 
/>
```

### 3. MobileButton
Primary CTA button with variants:
- **primary**: Gold gradient (main actions)
- **secondary**: Deep green gradient
- **outline**: White with border
- Sizes: sm, md, lg
- Active state: scale(0.98)

```tsx
<MobileButton 
  variant="primary" 
  size="lg" 
  fullWidth
  onClick={handleClick}
>
  Buy Now
</MobileButton>
```

### 4. MobileCard
Flexible card component:
- Rounded corners: 2xl, 3xl
- Soft shadows
- Padding options: sm, md, lg
- Optional click handler

```tsx
<MobileCard padding="md" shadow="md" rounded="3xl">
  <YourContent />
</MobileCard>
```

### 5. HeroSection
Full-width hero with mandala pattern:
- Gradient background (deep-green to darker)
- Decorative mandala pattern overlay
- Curved bottom edge (SVG)
- Badge, title, subtitle, description

```tsx
<HeroSection
  title="SURYA"
  subtitle="WELCOME TO"
  badge="Premium Low GI Rice"
  description="Experience the perfect blend..."
  height="h-[600px]"
/>
```

### 6. ProductCard
Product display card:
- Image with mandala background
- Badge overlay
- Rating display
- Price with discount
- CTA button

```tsx
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
```

### 7. FeatureCard
Icon-based feature highlight:
- Colored icon background
- Title and optional description
- Grid layout (3 columns)

```tsx
<FeatureCard
  icon={Award}
  title="Premium Quality"
  color="var(--gold)"
/>
```

### 8. QuantityControl
Quantity selector with +/- buttons:
- Sizes: sm, md, lg
- Min/max constraints
- Touch-friendly buttons

```tsx
<QuantityControl
  quantity={2}
  onIncrease={() => setQty(qty + 1)}
  onDecrease={() => setQty(qty - 1)}
  min={1}
  max={10}
  size="md"
/>
```

### 9. MandalaPattern
Decorative SVG pattern:
- Used in hero sections and product cards
- Adjustable opacity
- Adds brand identity

```tsx
<MandalaPattern opacity={0.12} />
```

## Design Principles

### 1. Mobile-First Layout
- Max width: 1080px (mobile viewport)
- Bottom padding: 96px (pb-24) for fixed nav
- Single column layouts
- Generous spacing (px-8 = 32px)

### 2. Touch-Friendly
- Minimum touch target: 44px × 44px
- Active states: `active:scale-[0.98]`
- Touch manipulation class for better response
- Generous padding on interactive elements

### 3. Visual Hierarchy
- Large headings: 32-40px
- Product prices: 28-32px
- Body text: 14-16px
- Clear color contrast

### 4. Shadows & Depth
- Soft shadows: `shadow-soft` (0 4px 20px rgba(0,0,0,0.08))
- Gold shadows for CTAs: `shadow-gold`
- Layered z-index for fixed elements

### 5. Rounded Corners
- Cards: `rounded-3xl` (24px)
- Buttons: `rounded-2xl` (16px)
- Small elements: `rounded-xl` (12px)

### 6. Gradients
- Primary button: `from-gold to-[#c99d4a]`
- Hero background: `from-deep-green to-[#0f4a38]`
- Smooth color transitions

### 7. Spacing System
- Base unit: 4px (Tailwind default)
- Common spacing: 4, 6, 8, 12, 16, 24, 32px
- Consistent margins and padding

### 8. Animations
- Transitions: 150ms ease-in-out
- Scale on press: 0.98
- Fade in: 300ms
- Slide up: 300ms

## Layout Patterns

### Hero + Features + Products
```tsx
<HeroSection />
<div className="px-8 -mt-12 relative z-20">
  <div className="grid grid-cols-3 gap-4 mb-12">
    <FeatureCard />
    <FeatureCard />
    <FeatureCard />
  </div>
  <ProductCard />
</div>
```

### List with Cards
```tsx
<div className="px-8 pt-8">
  <h2 className="text-deep-green mb-6">Section Title</h2>
  <div className="space-y-4">
    <MobileCard>...</MobileCard>
    <MobileCard>...</MobileCard>
  </div>
</div>
```

### Form with Button
```tsx
<div className="px-8 pt-8">
  <MobileCard padding="lg">
    <form>
      {/* Form fields */}
    </form>
  </MobileCard>
  <MobileButton fullWidth className="mt-6">
    Submit
  </MobileButton>
</div>
```

## Responsive Behavior

- **Mobile**: Full mobile design (< 768px)
- **Tablet**: Same mobile design with max-width container
- **Desktop**: Optional desktop navigation, mobile nav hidden

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Touch target sizes meet WCAG guidelines (44px minimum)
- Color contrast ratios meet AA standards

## Best Practices

1. **Always use the component library** - Don't create custom buttons/cards
2. **Maintain consistent spacing** - Use Tailwind spacing scale
3. **Test on real devices** - Emulators don't capture touch feel
4. **Keep touch targets large** - Minimum 44px × 44px
5. **Use the color palette** - Don't introduce new colors
6. **Add loading states** - Show feedback for async actions
7. **Handle errors gracefully** - Use toast notifications
8. **Optimize images** - Use appropriate sizes and formats

## Example Implementation

See `MobileHomePage.example.tsx` for a complete example of how to use all components together.

## Migration Guide

To migrate existing pages to the new design system:

1. Replace background colors with `bg-beige-light`
2. Update buttons to use `<MobileButton>`
3. Wrap content in `<MobileCard>` components
4. Add `<BottomNav>` to layout
5. Use `<MobileHeader>` for page headers
6. Apply color palette (deep-green, gold, maroon)
7. Update spacing to use px-8 for main content
8. Add pb-24 to pages for bottom nav clearance
