import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CURRENCIES } from '../data/products';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Currency State
  const [currency, setCurrency] = useState('USD');

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('collusion_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Wishlist State (Persisted in localStorage)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('collusion_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // UI Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedFit, setSelectedFit] = useState('All Fits');
  const [selectedColor, setSelectedColor] = useState('All');
  const [priceRange, setPriceRange] = useState(200);
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-asc' | 'price-desc' | 'rating'
  const [viewCols, setViewCols] = useState(4); // 2 | 4

  // Promo Code State
  const [appliedPromo, setAppliedPromo] = useState(null); // { code: 'COLLUSION20', discountPct: 20 }
  const [toast, setToast] = useState(null);

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('collusion_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // Save Wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('collusion_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.id === toast?.id ? null : prev));
    }, 3200);
  };

  // Price Formatter based on active currency
  const formatPrice = (usdAmount) => {
    const curr = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = usdAmount * curr.rate;
    if (currency === 'JPY') {
      return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${curr.symbol}${converted.toFixed(2)}`;
  };

  // Cart Operations
  const addToCart = (product, colorName, size, quantity = 1) => {
    const color = colorName || product.colors[0].name;
    const selectedSize = size || product.sizes[0];
    const image = product.colors.find((c) => c.name === color)?.images[0] || product.colors[0].images[0];
    const itemKey = `${product.id}-${color}-${selectedSize}`;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.key === itemKey);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          key: itemKey,
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          color,
          size: selectedSize,
          image,
          quantity,
        },
      ];
    });

    showToast(`Added "${product.name.slice(0, 24)}..." (${selectedSize}) to Bag`, 'success');
    setIsCartOpen(true);
  };

  const updateCartQuantity = (itemKey, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.key === itemKey) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (itemKey) => {
    setCart((prev) => prev.filter((item) => item.key !== itemKey));
    showToast('Item removed from bag', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Add Complete Outfit Bundle
  const addOutfitBundle = (bundle) => {
    bundle.productIds.forEach((pid) => {
      const p = PRODUCTS.find((item) => item.id === pid);
      if (p) {
        addToCart(p, p.colors[0].name, p.sizes[0], 1);
      }
    });
    setAppliedPromo({ code: 'BUNDLE15', discountPct: bundle.discountPct, title: `${bundle.title} Bundle Discount` });
    showToast(`✨ ${bundle.title} (3 items) added to your Bag with 15% discount!`, 'success');
  };

  // Wishlist Operations
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast(`Removed from Wishlist`, 'info');
        return prev.filter((item) => item.id !== product.id);
      } else {
        showToast(`Saved "${product.name.slice(0, 22)}..." to Wishlist`, 'success');
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Promo Code Operations
  const applyPromoCode = (codeText) => {
    const clean = codeText.trim().toUpperCase();
    if (clean === 'COLLUSION20') {
      setAppliedPromo({ code: 'COLLUSION20', discountPct: 20, title: '20% VIP Drop Discount' });
      showToast('🎉 Promo code COLLUSION20 applied! 20% off', 'success');
      return true;
    }
    if (clean === 'FREESHIP') {
      setAppliedPromo({ code: 'FREESHIP', discountPct: 0, freeShipping: true, title: 'Free Global Shipping' });
      showToast('🎉 Promo code FREESHIP applied!', 'success');
      return true;
    }
    if (clean === 'BUNDLE15') {
      setAppliedPromo({ code: 'BUNDLE15', discountPct: 15, title: '15% Streetwear Bundle Discount' });
      showToast('🎉 15% Bundle Discount applied!', 'success');
      return true;
    }
    showToast('Invalid promo code. Try "COLLUSION20" or "FREESHIP"', 'error');
    return false;
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    showToast('Promo code removed', 'info');
  };

  // Financial Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedPromo?.discountPct ? (cartSubtotal * appliedPromo.discountPct) / 100 : 0;
  const freeShippingThreshold = 75;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold || appliedPromo?.freeShipping;
  const shippingFee = cartSubtotal === 0 || isFreeShipping ? 0 : 9.99;
  const estimatedTax = cartSubtotal > 0 ? (cartSubtotal - discountAmount) * 0.08 : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee + estimatedTax);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ShopContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        cart,
        cartItemsCount,
        cartSubtotal,
        discountAmount,
        shippingFee,
        isFreeShipping,
        freeShippingThreshold,
        estimatedTax,
        cartTotal,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        addOutfitBundle,
        wishlist,
        toggleWishlist,
        isInWishlist,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        quickViewProduct,
        setQuickViewProduct,
        isCheckoutOpen,
        setIsCheckoutOpen,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedGender,
        setSelectedGender,
        selectedFit,
        setSelectedFit,
        selectedColor,
        setSelectedColor,
        priceRange,
        setPriceRange,
        sortBy,
        setSortBy,
        viewCols,
        setViewCols,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        toast,
        showToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
