import React, { useState, useEffect, useRef, useMemo } from 'react';
import { gizmoRuntime } from '@gizmo/runtime';
import { Search, ShoppingCart, Menu, User, Home, Star, ChevronLeft, Check, MapPin, X } from 'lucide-react';

// -----------------------------------------------------------------------------
// TWEAKS
// -----------------------------------------------------------------------------

const tweaks = gizmoRuntime.tweaks({
  headerColor: { index: 0, name: 'Header Color', type: 'color', value: '#232f3e', group: 'theme' },
  accentColor: { index: 1, name: 'Accent Color', type: 'color', value: '#febd69', group: 'theme' },
  buttonColor: { index: 2, name: 'Button Color', type: 'color', value: '#ffd814', group: 'theme' },
  backgroundColor: { index: 3, name: 'Background Color', type: 'color', value: '#e3e6e6', group: 'theme' },
  
  appName: { index: 4, name: 'App Name', type: 'text', value: 'Amazin', group: 'text' },
  currency: { index: 5, name: 'Currency', type: 'text', value: '$', group: 'text' },
  
  deliveryText: { index: 6, name: 'Delivery Text', type: 'text', value: 'FREE Delivery by Tomorrow', group: 'text' },
});

// -----------------------------------------------------------------------------
// MOCK DATA & UTILS
// -----------------------------------------------------------------------------

const PRODUCT_TEMPLATES = [
  { emoji: '🎧', name: 'Wireless Noise Cancelling Headphones', price: 299.99, category: 'Electronics' },
  { emoji: '📱', name: 'Smart Phone Pro Max Ultra', price: 999.00, category: 'Electronics' },
  { emoji: '💻', name: 'Laptop Pro 16-inch', price: 1299.00, category: 'Electronics' },
  { emoji: '⌚', name: 'Smart Watch Series 7', price: 399.00, category: 'Electronics' },
  { emoji: '🎮', name: 'NextGen Gaming Console', price: 499.00, category: 'Gaming' },
  { emoji: '📚', name: 'The Great Novel: Special Edition', price: 24.99, category: 'Books' },
  { emoji: '👟', name: 'Running Shoes - Air Flow', price: 89.95, category: 'Fashion' },
  { emoji: '👕', name: 'Cotton T-Shirt 3-Pack', price: 19.99, category: 'Fashion' },
  { emoji: '🎒', name: 'Travel Backpack Waterproof', price: 45.00, category: 'Fashion' },
  { emoji: '🪴', name: 'Artificial Potted Plant', price: 15.99, category: 'Home' },
  { emoji: '🕯️', name: 'Scented Candle - Vanilla', price: 12.50, category: 'Home' },
  { emoji: '☕', name: 'Ceramic Coffee Mug Set', price: 22.00, category: 'Home' },
  { emoji: '🧴', name: 'Moisturizing Lotion', price: 8.99, category: 'Beauty' },
  { emoji: '💊', name: 'Vitamins & Minerals', price: 14.99, category: 'Health' },
  { emoji: '🧸', name: 'Plush Teddy Bear', price: 18.99, category: 'Toys' },
  { emoji: '🚲', name: 'Mountain Bike 21-Speed', price: 250.00, category: 'Sports' },
  { emoji: '🎸', name: 'Acoustic Guitar for Beginners', price: 120.00, category: 'Music' },
  { emoji: '📷', name: 'Digital Camera 4K', price: 650.00, category: 'Electronics' },
  { emoji: '🕶️', name: 'Polarized Sunglasses', price: 15.99, category: 'Fashion' },
  { emoji: '🍕', name: 'Pizza Stone & Cutter', price: 35.00, category: 'Kitchen' },
  { emoji: '🎹', name: 'Electric Keyboard 88-Key', price: 450.00, category: 'Music' },
  { emoji: '🏀', name: 'Basketball Official Size', price: 29.99, category: 'Sports' },
  { emoji: '⚽', name: 'Soccer Ball Premium', price: 24.99, category: 'Sports' },
  { emoji: '🎾', name: 'Tennis Racket Pro Series', price: 149.00, category: 'Sports' },
  { emoji: '🏋️', name: 'Adjustable Dumbbell Set', price: 199.00, category: 'Sports' },
  { emoji: '🧘', name: 'Yoga Mat Extra Thick', price: 34.99, category: 'Sports' },
  { emoji: '🎨', name: 'Acrylic Paint Set 24 Colors', price: 28.50, category: 'Arts & Crafts' },
  { emoji: '✏️', name: 'Sketching Pencils Professional', price: 16.99, category: 'Arts & Crafts' },
  { emoji: '🖌️', name: 'Watercolor Brush Set', price: 22.00, category: 'Arts & Crafts' },
  { emoji: '📖', name: 'Hardcover Journal Leather', price: 19.99, category: 'Books' },
  { emoji: '🔦', name: 'LED Flashlight Rechargeable', price: 25.99, category: 'Tools' },
  { emoji: '🔧', name: 'Tool Set 100-Piece', price: 79.99, category: 'Tools' },
  { emoji: '🪛', name: 'Electric Screwdriver Kit', price: 45.00, category: 'Tools' },
  { emoji: '🔨', name: 'Hammer Multi-Purpose', price: 18.99, category: 'Tools' },
  { emoji: '🎬', name: 'Ring Light with Tripod', price: 55.00, category: 'Electronics' },
  { emoji: '🎤', name: 'USB Microphone for Streaming', price: 89.00, category: 'Electronics' },
  { emoji: '🖱️', name: 'Wireless Gaming Mouse RGB', price: 59.99, category: 'Electronics' },
  { emoji: '⌨️', name: 'Mechanical Keyboard RGB', price: 129.00, category: 'Electronics' },
  { emoji: '🖥️', name: 'Monitor 27-inch 4K', price: 399.00, category: 'Electronics' },
  { emoji: '🔌', name: 'USB-C Hub 7-in-1', price: 39.99, category: 'Electronics' },
  { emoji: '🔋', name: 'Power Bank 20000mAh', price: 34.99, category: 'Electronics' },
  { emoji: '🎧', name: 'Earbuds Wireless Pro', price: 149.00, category: 'Electronics' },
  { emoji: '📡', name: 'WiFi Router Mesh System', price: 179.00, category: 'Electronics' },
  { emoji: '🧊', name: 'Mini Fridge Portable', price: 89.99, category: 'Appliances' },
  { emoji: '☕', name: 'Coffee Maker Programmable', price: 69.99, category: 'Kitchen' },
  { emoji: '🍳', name: 'Non-Stick Pan Set 3-Piece', price: 44.99, category: 'Kitchen' },
  { emoji: '🔪', name: 'Chef Knife Set 8-Piece', price: 79.00, category: 'Kitchen' },
  { emoji: '🥤', name: 'Blender High-Speed 1000W', price: 99.00, category: 'Kitchen' },
  { emoji: '🧃', name: 'Water Bottle Insulated 32oz', price: 24.99, category: 'Kitchen' },
  { emoji: '🛋️', name: 'Throw Pillow Set of 4', price: 39.99, category: 'Home' },
  { emoji: '🪑', name: 'Office Chair Ergonomic', price: 189.00, category: 'Furniture' },
  { emoji: '🛏️', name: 'Bed Sheets Queen Size', price: 34.99, category: 'Home' },
  { emoji: '🧺', name: 'Storage Basket Set of 3', price: 29.99, category: 'Home' },
  { emoji: '🧹', name: 'Vacuum Cleaner Cordless', price: 159.00, category: 'Appliances' },
  { emoji: '🧴', name: 'Hand Soap Refill Pack', price: 12.99, category: 'Beauty' },
  { emoji: '🧼', name: 'Bath Bombs Gift Set', price: 19.99, category: 'Beauty' },
  { emoji: '💄', name: 'Lipstick Set 6 Colors', price: 24.99, category: 'Beauty' },
  { emoji: '🪒', name: 'Electric Shaver Rechargeable', price: 79.99, category: 'Beauty' },
  { emoji: '👜', name: 'Crossbody Bag Leather', price: 49.99, category: 'Fashion' },
  { emoji: '👗', name: 'Summer Dress Floral Print', price: 39.99, category: 'Fashion' },
  { emoji: '🧥', name: 'Winter Jacket Waterproof', price: 129.00, category: 'Fashion' },
  { emoji: '🧢', name: 'Baseball Cap Adjustable', price: 14.99, category: 'Fashion' },
  { emoji: '🧤', name: 'Winter Gloves Touchscreen', price: 19.99, category: 'Fashion' },
  { emoji: '🧦', name: 'Athletic Socks 6-Pack', price: 16.99, category: 'Fashion' },
  { emoji: '👶', name: 'Baby Monitor with Camera', price: 89.99, category: 'Baby' },
  { emoji: '🍼', name: 'Baby Bottles Set of 6', price: 24.99, category: 'Baby' },
  { emoji: '🧸', name: 'Stuffed Animal Collection', price: 34.99, category: 'Toys' },
  { emoji: '🪀', name: 'Building Blocks 500-Piece', price: 39.99, category: 'Toys' },
  { emoji: '🎲', name: 'Board Game Family Night', price: 29.99, category: 'Toys' },
  { emoji: '🧩', name: 'Jigsaw Puzzle 1000-Piece', price: 19.99, category: 'Toys' },
  { emoji: '🐕', name: 'Dog Bed Orthopedic Large', price: 59.99, category: 'Pet Supplies' },
  { emoji: '🐈', name: 'Cat Tree Multi-Level', price: 79.99, category: 'Pet Supplies' },
  { emoji: '🦴', name: 'Dog Treats Variety Pack', price: 14.99, category: 'Pet Supplies' },
  { emoji: '🌱', name: 'Seed Starter Kit Indoor', price: 24.99, category: 'Garden' },
  { emoji: '🌻', name: 'Garden Tool Set 10-Piece', price: 39.99, category: 'Garden' },
  { emoji: '💡', name: 'Smart LED Bulbs 4-Pack', price: 34.99, category: 'Smart Home' },
  { emoji: '🔊', name: 'Smart Speaker with Alexa', price: 49.99, category: 'Smart Home' },
  { emoji: '📹', name: 'Security Camera Outdoor', price: 79.99, category: 'Smart Home' },
  { emoji: '🚪', name: 'Smart Door Lock Keyless', price: 149.00, category: 'Smart Home' },
  { emoji: '👨‍💼', name: 'Professional Assistant (Human)', price: 45000.00, category: 'Humans' },
  { emoji: '👩‍🍳', name: 'Personal Chef (Human)', price: 55000.00, category: 'Humans' },
  { emoji: '🧑‍🎨', name: 'Resident Artist (Human)', price: 32000.00, category: 'Humans' },
  { emoji: '🧑‍🚀', name: 'Personal Astronaut (Human)', price: 1500000.00, category: 'Humans' },
  { emoji: '🧛', name: 'Ancient Vampire (Human-ish)', price: 999999.99, category: 'Humans' },
  { emoji: '🖥️', name: 'Ultimate RGB Gamer PC - RTX 4090', price: 3499.99, category: 'Gaming' },
];

const generateProducts = () => {
  return PRODUCT_TEMPLATES.map((template, index) => ({
    id: index,
    ...template,
    rating: (3.5 + Math.random() * 1.5).toFixed(1),
    reviews: Math.floor(Math.random() * 5000) + 50,
    isPrime: Math.random() > 0.3,
  }));
};

const playSound = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } else if (type === 'success') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }
};

// -----------------------------------------------------------------------------
// COMPONENTS
// -----------------------------------------------------------------------------

export default function Component() {
  // Tweaks
  const headerColor = tweaks.headerColor.useState();
  const accentColor = tweaks.accentColor.useState();
  const buttonColor = tweaks.buttonColor.useState();
  const backgroundColor = tweaks.backgroundColor.useState();
  const appName = tweaks.appName.useState();
  const currency = tweaks.currency.useState();
  const deliveryText = tweaks.deliveryText.useState();

  // State
  const [showAppPrompt, setShowAppPrompt] = useState(true);
  const [view, setView] = useState('home'); // home, detail, cart, search
  const [products] = useState(generateProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orders, setOrders] = useState([]);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [deliveryTime, setDeliveryTime] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    name: 'Eren Nawht',
    street: 'Genève stresse 23',
    city: 'Gizmo City',
    state: 'GC',
    zip: '12345'
  });

  // Effect to progress order status every 5 seconds
  useEffect(() => {
    if (orders.length === 0) return;

    const interval = setInterval(() => {
      setOrders(prevOrders => {
        let changed = false;
        const nextOrders = prevOrders.map(order => {
          if (order.statusStep < 4) {
            changed = true;
            const nextStep = order.statusStep + 1;
            const statuses = ['Preparing', 'Shipped', 'Out for delivery', 'Arriving'];
            return {
              ...order,
              statusStep: nextStep,
              status: statuses[nextStep - 1]
            };
          }
          return order;
        });
        
        if (changed) {
          gizmoRuntime.performHaptic('light');
        }
        return nextOrders;
      });
    }, 5000); // Progress every 5 seconds

    return () => clearInterval(interval);
  }, [orders.length]);

  // Derived
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleProductClick = (product) => {
    gizmoRuntime.performHaptic('light');
    setSelectedProduct(product);
    setView('detail');
  };

  const addToCart = (product) => {
    gizmoRuntime.performHaptic('medium');
    playSound('success');
    setCart([...cart, product]);
  };

  const goHome = () => {
    gizmoRuntime.performHaptic('light');
    setView('home');
    setSearchQuery('');
  };

  const goCart = () => {
    gizmoRuntime.performHaptic('light');
    setView('cart');
  };

  const goOrders = () => {
    gizmoRuntime.performHaptic('light');
    setView('orders');
  };

  const trackOrder = (order) => {
    gizmoRuntime.performHaptic('medium');
    setTrackingOrder(order);
    setView('tracking');
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() !== '' && view !== 'home') {
      setView('home');
    }
  };

  // Render Helpers
  const renderStars = (rating) => {
    return (
      <div className="flex items-center text-yellow-500 text-sm">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            fill={i < Math.floor(rating) ? "currentColor" : "none"} 
            className={i < Math.floor(rating) ? "" : "text-gray-300"}
          />
        ))}
        <span className="ml-1 text-cyan-700 text-xs">{rating}</span>
      </div>
    );
  };

  const renderPrice = (price, large = false) => {
    const [whole, fraction] = price.toFixed(2).split('.');
    return (
      <div className={`flex items-start font-medium ${large ? 'text-2xl' : 'text-lg'}`}>
        <span className="text-xs mt-1">{currency}</span>
        <span>{whole}</span>
        <span className="text-xs mt-1">{fraction}</span>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // VIEWS
  // ---------------------------------------------------------------------------

  const Header = () => (
    <div style={{ backgroundColor: headerColor }} className="text-white pb-2 sticky top-0 z-50 shadow-md">
      {/* Top Row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight" onClick={goHome}>
          {appName} <span className="text-xs font-normal opacity-80 mt-1">.com</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative" onClick={goCart}>
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#232f3e]">
                {cart.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-2">
        <div className="bg-white rounded-md flex items-center h-10 px-3 shadow-sm">
          <Search size={20} className="text-gray-500 mr-2" />
          <input 
            type="text" 
            placeholder={`Search ${appName}`}
            className="flex-1 bg-transparent outline-none text-black placeholder-gray-400 text-base"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Location / Sub-nav */}
      <div className="bg-[#37475a] px-4 py-2 flex items-center text-xs text-white/90 gap-2 overflow-x-auto whitespace-nowrap">
        <MapPin size={14} />
        <span className="font-bold">Deliver to {shippingAddress.name} - {shippingAddress.city} {shippingAddress.zip}</span>
      </div>
    </div>
  );

  const ProductList = () => (
    <div className="p-2 grid grid-cols-2 gap-2 pb-24">
      {filteredProducts.length === 0 ? (
        <div className="col-span-2 text-center py-10 text-gray-500">
          No products found for "{searchQuery}"
        </div>
      ) : (
        filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="bg-white p-3 rounded-sm shadow-sm flex flex-col border border-gray-200 active:scale-[0.98] transition-transform"
            onClick={() => handleProductClick(product)}
          >
            <div className="aspect-square flex items-center justify-center bg-gray-50 mb-2 rounded-sm text-6xl">
              {product.emoji}
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="text-sm text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</h3>
              <div className="mb-1">{renderStars(product.rating)}</div>
              <div className="mt-auto">
                {renderPrice(product.price)}
                {product.isPrime && (
                  <div className="text-[10px] text-cyan-600 flex items-center gap-1 mt-1 font-bold">
                    <Check size={10} strokeWidth={4} className="text-orange-400" /> prime
                  </div>
                )}
                <div className="text-[10px] text-gray-500 mt-1">
                  Delivery by <span className="font-bold text-gray-700">Tomorrow</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const ProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <div className="bg-white min-h-full pb-24">
        {/* Nav back */}
        <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-40 flex items-center gap-2">
          <button onClick={() => setView('home')} className="p-2">
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <span className="font-medium text-sm truncate">{selectedProduct.category}</span>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
            <span>Brand: Generic</span>
            <span>{renderStars(selectedProduct.rating)}</span>
          </div>
          
          <h1 className="text-lg font-medium text-gray-900 leading-snug mb-4">
            {selectedProduct.name}
          </h1>

          <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-9xl mb-6 border border-gray-100">
            {selectedProduct.emoji}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-red-700 text-lg font-light">-15%</span>
                {renderPrice(selectedProduct.price, true)}
              </div>
              <div className="text-gray-500 text-sm">
                List Price: <span className="line-through">{currency}{(selectedProduct.price * 1.15).toFixed(2)}</span>
              </div>
            </div>

            {selectedProduct.isPrime && (
              <div className="flex items-center gap-1 text-cyan-600 font-bold text-sm">
                <Check size={16} strokeWidth={4} className="text-orange-400" /> prime
              </div>
            )}

            <div className="text-sm text-gray-600">
              {deliveryText}
            </div>

            <div className="text-green-700 text-lg font-medium">
              In Stock
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button 
                onClick={() => addToCart(selectedProduct)}
                style={{ backgroundColor: buttonColor }}
                className="w-full py-3 rounded-full font-medium text-sm shadow-sm active:opacity-80 active:scale-[0.99] transition-all text-black"
              >
                Add to Cart
              </button>
              <button 
                onClick={() => {
                  addToCart(selectedProduct);
                  goCart();
                }}
                style={{ backgroundColor: accentColor }}
                className="w-full py-3 rounded-full font-medium text-sm shadow-sm active:opacity-80 active:scale-[0.99] transition-all text-black"
              >
                Buy Now
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
              <div className="flex-1 flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px]">🔒</div>
                Secure transaction
              </div>
            </div>
            
            <div className="text-xs text-gray-500 space-y-1 mt-2">
              <div className="grid grid-cols-[80px_1fr]">
                <span>Ships from</span>
                <span>{appName}</span>
              </div>
              <div className="grid grid-cols-[80px_1fr]">
                <span>Sold by</span>
                <span>{appName} Services LLC</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-4">
             <h3 className="font-bold text-lg mb-2">Product Description</h3>
             <p className="text-sm text-gray-700 leading-relaxed">
               This {selectedProduct.name} is the perfect addition to your {selectedProduct.category.toLowerCase()} collection. 
               Featuring state-of-the-art emoji technology, it delivers premium performance at an affordable price. 
               Highly rated by {selectedProduct.reviews} customers worldwide.
             </p>
          </div>
        </div>
      </div>
    );
  };

  const Cart = () => (
    <div className="bg-gray-100 min-h-full pb-24">
      <div className="bg-white p-4 border-b border-gray-200 sticky top-0 z-40">
        <h1 className="text-xl font-medium">Shopping Cart</h1>
      </div>

      {orderPlaced ? (
        <div className="p-8 text-center mt-12">
          <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Check size={64} className="text-green-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-green-700">Order Confirmed!</h2>
          <p className="text-lg text-gray-700 mb-2">Your order will come to you by</p>
          <p className="text-xl font-bold text-gray-900 mb-6">tomorrow afternoon at 3:30pm</p>
          <button 
            onClick={goOrders}
            style={{ backgroundColor: accentColor }}
            className="w-full py-3 rounded-lg font-medium text-sm shadow-sm mb-4"
          >
            Track your package
          </button>
          <p className="text-sm text-gray-500">Total: {currency}{cartTotal.toFixed(2)}</p>
        </div>
      ) : cart.length === 0 ? (
        <div className="p-8 text-center">
          <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShoppingCart size={48} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your {appName} Cart is empty</h2>
          <p className="text-sm text-cyan-700 mb-6" onClick={goHome}>Shop today's deals</p>
          
          <button 
            onClick={goHome}
            style={{ backgroundColor: buttonColor }}
            className="w-full py-3 rounded-lg font-medium text-sm shadow-sm"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Subtotal Card */}
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="text-lg mb-4">
              Subtotal ({cart.length} items): <span className="font-bold">{currency}{cartTotal.toFixed(2)}</span>
            </div>
            <button 
              style={{ backgroundColor: buttonColor }}
              className="w-full py-3 rounded-lg font-medium text-sm shadow-sm active:opacity-80"
              onClick={() => {
                gizmoRuntime.performHaptic('heavy');
                playSound('success');
                const newOrder = {
                  id: Math.random().toString(36).substr(2, 9).toUpperCase(),
                  date: new Date().toLocaleDateString(),
                  items: [...cart],
                  total: cartTotal,
                  status: 'Preparing',
                  statusStep: 1,
                };
                setOrders([newOrder, ...orders]);
                setOrderPlaced(true);
                setDeliveryTime('tomorrow afternoon at 3:30pm');
                setTimeout(() => {
                  setCart([]);
                  setOrderPlaced(false);
                }, 4000);
              }}
            >
              Proceed to checkout
            </button>
          </div>

          {/* Cart Items */}
          <div className="space-y-2">
            {cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="bg-white p-3 rounded shadow-sm flex gap-3">
                <div className="w-24 h-24 bg-gray-50 flex items-center justify-center text-4xl rounded border border-gray-100 flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium line-clamp-2 mb-1">{item.name}</h3>
                  <div className="font-bold text-lg mb-1">{currency}{item.price.toFixed(2)}</div>
                  <div className="text-green-700 text-xs mb-2">In Stock</div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="px-3 py-1 border border-gray-300 rounded-md text-xs shadow-sm bg-gray-50"
                      onClick={() => {
                        const newCart = [...cart];
                        newCart.splice(idx, 1);
                        setCart(newCart);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const Orders = () => (
    <div className="bg-gray-100 min-h-full pb-24">
      <div className="bg-white p-4 border-b border-gray-200 sticky top-0 z-40">
        <h1 className="text-xl font-medium">Your Orders</h1>
      </div>
      
      {orders.length === 0 ? (
        <div className="p-8 text-center">
          <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShoppingCart size={48} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <button 
            onClick={goHome}
            style={{ backgroundColor: buttonColor }}
            className="w-full py-3 rounded-lg font-medium text-sm shadow-sm mt-4"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
              <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between text-xs text-gray-600">
                <div>
                  <div className="uppercase font-bold">Order Placed</div>
                  <div>{order.date}</div>
                </div>
                <div className="text-right">
                  <div className="uppercase font-bold">Order #</div>
                  <div>{order.id}</div>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex -space-x-4">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-xl shadow-sm">
                        {item.emoji}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-green-700 text-sm">Arriving Tomorrow</div>
                    <div className="text-xs text-gray-500">Status: {order.status}</div>
                  </div>
                </div>
                <button 
                  onClick={() => trackOrder(order)}
                  style={{ backgroundColor: buttonColor }}
                  className="w-full py-2 rounded-lg font-medium text-sm shadow-sm active:opacity-80"
                >
                  Track package
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const Tracking = () => {
    if (!trackingOrder) return null;
    
    // Find the current order from orders state to get live status
    const currentOrder = orders.find(o => o.id === trackingOrder.id) || trackingOrder;
    
    const steps = [
      { label: 'Ordered', date: currentOrder.date, done: true },
      { label: 'Shipped', date: 'Today', done: currentOrder.statusStep >= 2 },
      { label: 'Out for delivery', date: 'Tomorrow', done: currentOrder.statusStep >= 3 },
      { label: 'Arriving', date: 'Tomorrow by 3:30 PM', done: currentOrder.statusStep >= 4 },
    ];

    return (
      <div className="bg-white min-h-full pb-24">
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-40 flex items-center gap-2">
          <button onClick={() => setView('orders')} className="p-2">
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <span className="font-medium">Tracking Details</span>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-green-700 mb-1">Arriving Tomorrow</h2>
            <p className="text-gray-600">Your package is on its way!</p>
          </div>

          <div className="relative pl-8 space-y-10">
            {/* Vertical Line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200" />
            
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 z-10 ${step.done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}>
                  {step.done && <Check size={10} className="text-white mx-auto mt-0.5" strokeWidth={4} />}
                </div>
                <div>
                  <div className={`font-bold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</div>
                  <div className="text-sm text-gray-500">{step.date}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-bold mb-2">Shipping Address</h3>
            <p className="text-sm text-gray-600">{shippingAddress.name}</p>
            <p className="text-sm text-gray-600">{shippingAddress.street}</p>
            <p className="text-sm text-gray-600">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
          </div>

          <div className="mt-6">
            <h3 className="font-bold mb-3">Items in this shipment</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {currentOrder.items.map((item, i) => (
                <div key={i} className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded border border-gray-200 flex items-center justify-center text-3xl">
                  {item.emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Footer = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 pb-2 z-50 text-gray-600">
      <button 
        className={`flex flex-col items-center justify-center w-full h-full ${view === 'home' ? 'text-cyan-700 border-t-2 border-cyan-700' : ''}`}
        onClick={goHome}
      >
        <Home size={24} strokeWidth={view === 'home' ? 2.5 : 2} />
        <span className="text-[10px] mt-1">Home</span>
      </button>
      <button 
        className={`flex flex-col items-center justify-center w-full h-full ${view === 'orders' ? 'text-cyan-700 border-t-2 border-cyan-700' : ''}`}
        onClick={goOrders}
      >
        <User size={24} strokeWidth={view === 'orders' ? 2.5 : 2} />
        <span className="text-[10px] mt-1">Orders</span>
      </button>
      <button 
        className={`flex flex-col items-center justify-center w-full h-full ${view === 'cart' ? 'text-cyan-700 border-t-2 border-cyan-700' : ''}`}
        onClick={goCart}
      >
        <div className="relative">
          <ShoppingCart size={24} strokeWidth={view === 'cart' ? 2.5 : 2} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-transparent text-orange-500 font-bold text-xs">
              {cart.length}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-1">Cart</span>
      </button>
      <button 
        className="flex flex-col items-center justify-center w-full h-full"
        onClick={() => setIsMenuOpen(true)}
      >
        <Menu size={24} />
        <span className="text-[10px] mt-1">Menu</span>
      </button>
    </div>
  );

  const MenuOverlay = () => (
    <div className={`fixed inset-0 z-[60] transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
      <div className="absolute top-0 right-0 bottom-0 w-4/5 bg-white shadow-xl flex flex-col">
        <div style={{ backgroundColor: headerColor }} className="p-4 pt-12 text-white flex justify-between items-center">
          <h2 className="font-bold text-xl">Browse {appName}</h2>
          <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Trending</h3>
            {['Best Sellers', 'New Releases', 'Movers & Shakers'].map(item => (
              <div key={item} className="py-2 text-gray-700 active:bg-gray-100 px-2 rounded">{item}</div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Shop By Department</h3>
            {['Humans', 'Electronics', 'Computers', 'Smart Home', 'Arts & Crafts'].map(item => (
              <div 
                key={item} 
                className="py-2 text-gray-700 active:bg-gray-100 px-2 rounded"
                onClick={() => {
                  setSearchQuery(item);
                  setView('home');
                  setIsMenuOpen(false);
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Settings & Support</h3>
            <div className="py-2 text-gray-700 active:bg-gray-100 px-2 rounded">Customer Service</div>
            <div className="py-2 text-gray-700 active:bg-gray-100 px-2 rounded">Sign Out</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // APP PROMPT MODAL
  // ---------------------------------------------------------------------------

  const AppPrompt = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-8 mx-4 max-w-sm shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Opening {appName} app?</h2>
        <button
          onClick={() => {
            gizmoRuntime.performHaptic('medium');
            setShowAppPrompt(false);
          }}
          style={{ backgroundColor: buttonColor }}
          className="w-full py-3 rounded-lg font-bold text-lg shadow-md active:opacity-80 active:scale-[0.98] transition-all text-black"
        >
          OK
        </button>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------

  if (showAppPrompt) {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col font-sans text-gray-900 select-none" style={{ backgroundColor }}>
        <AppPrompt />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans text-gray-900 select-none" style={{ backgroundColor }}>
      <Header />
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {view === 'home' && <ProductList />}
        {view === 'detail' && <ProductDetail />}
        {view === 'cart' && <Cart />}
        {view === 'orders' && <Orders />}
        {view === 'tracking' && <Tracking />}
      </div>

      <Footer />
      <MenuOverlay />
    </div>
  );
}