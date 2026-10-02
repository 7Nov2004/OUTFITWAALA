// ==========================================
// OutfitWaala - Data & State Management
// ==========================================

const STORAGE_KEYS = {
  PRODUCTS: 'outfitwaala_products',
  CART: 'outfitwaala_cart',
  ADMIN_AUTH: 'outfitwaala_admin_session',
  STORE_INFO: 'outfitwaala_store_info'
};

// Default Store Information (Dukandar Settings)
const DEFAULT_STORE_INFO = {
  name: "OutfitWaala (आउटफिट वाला)",
  tagline: "Aapki Apni Fashion Ki Dukaan",
  phone: "9876543210",
  whatsapp: "919876543210",
  address: "Main Market, Shop No. 12, Near Clock Tower, Delhi - 110001",
  timing: "Subah 10:00 AM se Raat 9:30 PM tak (Somwar se Ravivar)"
};

// Initial Sample Products (Unsplash High Quality Fashion Images)
const DEFAULT_PRODUCTS = [
  {
    id: "prod_1",
    name: "Royal Designer Men's Kurta & Jacket Set",
    category: "Ethnic",
    price: 1899,
    mrp: 3499,
    description: "Premium silk blend kurta pajama set with embroidered ethnic jacket. Perfect for weddings & festivals.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    featured: true,
    sizes: ["M", "L", "XL", "XXL"],
    createdAt: Date.now() - 500000
  },
  {
    id: "prod_2",
    name: "Banarasi Art Silk Embroidered Saree",
    category: "Women",
    price: 2499,
    mrp: 4999,
    description: "Traditional Banarasi zari work saree with matching blouse piece. Luxurious look for special occasions.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    featured: true,
    sizes: ["Free Size"],
    createdAt: Date.now() - 400000
  },
  {
    id: "prod_3",
    name: "Men's Premium Slim Fit Cotton Shirt",
    category: "Men",
    price: 899,
    mrp: 1499,
    description: "100% breathable pure cotton formal & casual shirt. All-day comfort and wrinkle-resistant.",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    featured: true,
    sizes: ["S", "M", "L", "XL"],
    createdAt: Date.now() - 300000
  },
  {
    id: "prod_4",
    name: "Women's Anarkali Flared Kurti Set",
    category: "Women",
    price: 1399,
    mrp: 2299,
    description: "Hand-printed rayon Anarkali style kurti with dupatta. Soft on skin and stylish.",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    featured: true,
    sizes: ["S", "M", "L", "XL"],
    createdAt: Date.now() - 200000
  },
  {
    id: "prod_5",
    name: "Kids Party Wear Sherwani Suit",
    category: "Kids",
    price: 1199,
    mrp: 1999,
    description: "Adorable festive wear sherwani set for boys (Age 2-10 yrs). Comfortable inner lining.",
    image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    featured: false,
    sizes: ["2-4 Y", "4-6 Y", "6-8 Y", "8-10 Y"],
    createdAt: Date.now() - 100000
  },
  {
    id: "prod_6",
    name: "Casual Denim Jacket for Men & Women",
    category: "Men",
    price: 1299,
    mrp: 2599,
    description: "Heavy duty classic blue denim jacket with metal buttons. Rugged style for winter & evening outings.",
    image: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=800&auto=format&fit=crop&q=80",
    inStock: true,
    featured: false,
    sizes: ["M", "L", "XL"],
    createdAt: Date.now() - 50000
  }
];

// Initialize LocalStorage Data
function initData() {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STORE_INFO)) {
    localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(DEFAULT_STORE_INFO));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CART)) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
  }
}
initData();

// Store Info API
function getStoreInfo() {
  const info = localStorage.getItem(STORAGE_KEYS.STORE_INFO);
  return info ? JSON.parse(info) : DEFAULT_STORE_INFO;
}

function updateStoreInfo(newInfo) {
  localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(newInfo));
}

// Product APIs
function getProducts() {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
}

function getProductById(id) {
  const products = getProducts();
  return products.find(p => String(p.id) === String(id));
}

function saveProduct(product) {
  const products = getProducts();
  if (product.id) {
    // Update existing
    const index = products.findIndex(p => String(p.id) === String(product.id));
    if (index !== -1) {
      products[index] = { ...products[index], ...product, updatedAt: Date.now() };
    } else {
      products.unshift({ ...product, id: 'prod_' + Date.now(), createdAt: Date.now() });
    }
  } else {
    // Add new
    product.id = 'prod_' + Date.now();
    product.createdAt = Date.now();
    products.unshift(product);
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return product;
}

function deleteProduct(id) {
  const products = getProducts();
  const filtered = products.filter(p => String(p.id) !== String(id));
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  return true;
}

// Cart APIs
function getCart() {
  const data = localStorage.getItem(STORAGE_KEYS.CART);
  return data ? JSON.parse(data) : [];
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, selectedSize = "Standard") {
  const product = getProductById(productId);
  if (!product) return false;

  const cart = getCart();
  const existingItemIndex = cart.findIndex(
    item => String(item.productId) === String(productId) && item.size === selectedSize
  );

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: product.image,
      size: selectedSize,
      quantity: 1
    });
  }

  saveCart(cart);
  showToast(`"${product.name}" cart mein add ho gaya!`);
  return true;
}

function updateCartQuantity(productId, size, change) {
  const cart = getCart();
  const itemIndex = cart.findIndex(
    item => String(item.productId) === String(productId) && item.size === size
  );

  if (itemIndex > -1) {
    cart[itemIndex].quantity += change;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
    saveCart(cart);
  }
}

function removeFromCart(productId, size) {
  let cart = getCart();
  cart = cart.filter(
    item => !(String(item.productId) === String(productId) && item.size === size)
  );
  saveCart(cart);
  showToast("Item cart se hata diya gaya");
}

function clearCart() {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
  updateCartBadge();
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartBadge() {
  const count = getCartCount();
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

// Authentication for Dukandar (Admin)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123"
};

function isAdminLoggedIn() {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === "true";
}

function adminLogin(username, password) {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, "true");
    return true;
  }
  return false;
}

function adminLogout() {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  window.location.href = "login.html";
}

// UI Notification Toast
function showToast(message, type = "success") {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;
  toast.innerHTML = `
    <div style="background: ${type === 'error' ? '#dc2626' : '#1e293b'}; color: #fff; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 10px; margin-top: 10px; font-size: 14px; border-left: 4px solid #f97316; animation: slideIn 0.3s ease;">
      <span>${type === 'error' ? '⚠️' : '🛍️'}</span>
      <span>${message}</span>
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Ensure badge is updated on window load
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
});
