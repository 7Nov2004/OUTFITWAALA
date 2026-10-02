// ==========================================
// OutfitWaala - Ultra Premium Customer Script
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // Mobile Nav Toggle
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // Load dynamic store contact info in headers/footers
  populateStoreInfo();

  // If on Homepage
  if (document.getElementById("featuredProductsGrid")) {
    loadFeaturedProducts();
  }

  // If on All Products Page
  if (document.getElementById("allProductsGrid")) {
    initProductsPage();
  }

  // If on Cart Page
  if (document.getElementById("cartItemsContainer")) {
    initCartPage();
  }

  // If on Contact Page
  if (document.getElementById("contactForm")) {
    initContactPage();
  }
});

// Update store details across pages
function populateStoreInfo() {
  const store = getStoreInfo();
  
  const phoneEls = document.querySelectorAll(".store-phone");
  phoneEls.forEach(el => el.textContent = store.phone);

  const addressEls = document.querySelectorAll(".store-address");
  addressEls.forEach(el => el.textContent = store.address);

  const timingEls = document.querySelectorAll(".store-timing");
  timingEls.forEach(el => el.textContent = store.timing);

  const waFloat = document.getElementById("whatsappFloat");
  if (waFloat) {
    waFloat.href = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent('Namaste! Mujhe OutfitWaala Designer Boutique se kapde khareedne hain.')}`;
  }
}

// Generate single product card HTML (Haute Couture Luxury Style)
function createProductCardHTML(product) {
  const discountPercent = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const store = getStoreInfo();
  const waMsg = encodeURIComponent(
    `Namaste! Main OutfitWaala se "${product.name}" (Rate: ₹${product.price}) kharidna chahta/chahti hoon. Kripya availability batayein.`
  );

  return `
    <div class="product-card" data-category="${product.category.toLowerCase()}" data-id="${product.id}">
      <div class="product-thumb">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80'">
        <div class="product-badges">
          ${discountPercent > 0 ? `<span class="badge-discount">${discountPercent}% OFF</span>` : ''}
          <span class="badge-category">${product.category} Edition</span>
        </div>
      </div>
      <div class="product-body">
        <span class="product-category-label">HAUTE COUTURE • ${product.category}</span>
        <h3 class="product-name" title="${product.name}">${product.name}</h3>
        <p class="product-desc">${product.description || 'Mastercrafted pure fabric, royal fitting aur shandar finish.'}</p>
        
        <div class="product-price-row">
          <span class="product-price">₹${product.price.toLocaleString('en-IN')}</span>
          ${product.mrp > product.price ? `<span class="product-mrp">₹${product.mrp.toLocaleString('en-IN')}</span>` : ''}
          ${discountPercent > 0 ? `<span class="product-savings">Bachat ₹${(product.mrp - product.price).toLocaleString('en-IN')}</span>` : ''}
        </div>

        <div class="product-actions">
          <button class="btn-add-cart" onclick="addToCart('${product.id}')">
            <i class="fa-solid fa-bag-shopping"></i> Add To Bag
          </button>
          <a href="https://wa.me/${store.whatsapp}?text=${waMsg}" target="_blank" class="btn-whatsapp-quick" title="WhatsApp Stylist Direct Chat">
            <i class="fa-brands fa-whatsapp"></i>
          </a>
        </div>
      </div>
    </div>
  `;
}

// 1. Featured Products for Homepage
function loadFeaturedProducts() {
  const container = document.getElementById("featuredProductsGrid");
  const products = getProducts();
  const featured = products.filter(p => p.featured || products.indexOf(p) < 4);

  if (featured.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #8e9bb0; padding: 50px;">Abhi koi kapda add nahi hai. Dukandar studio panel se kapde add karein.</p>`;
    return;
  }

  container.innerHTML = featured.slice(0, 4).map(createProductCardHTML).join("");
}

// 2. All Products Page (Search & Category Filtering)
function initProductsPage() {
  const container = document.getElementById("allProductsGrid");
  const searchInput = document.getElementById("searchInput");
  const filterPills = document.querySelectorAll(".filter-pill, .filter-pill-lux");
  const sortSelect = document.getElementById("sortSelect");

  let currentCategory = "all";
  let searchQuery = "";
  let currentSort = "default";

  // Check URL params for category
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  if (catParam) {
    currentCategory = catParam.toLowerCase();
    filterPills.forEach(pill => {
      if (pill.dataset.category.toLowerCase() === currentCategory) {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      }
    });
  }

  function renderFiltered() {
    let products = getProducts();

    // Category filter
    if (currentCategory !== "all") {
      products = products.filter(p => p.category.toLowerCase() === currentCategory);
    }

    // Search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort
    if (currentSort === "price-low") {
      products.sort((a, b) => a.price - b.price);
    } else if (currentSort === "price-high") {
      products.sort((a, b) => b.price - a.price);
    } else if (currentSort === "newest") {
      products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    if (products.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 70px 20px;">
          <div style="font-size: 3.5rem; margin-bottom: 12px; color: #d4af37;">👑</div>
          <h3 style="font-family: 'Playfair Display', serif; font-size: 1.6rem; color: #0a0e17; margin-bottom: 8px;">Koi Kapda Nahi Mila</h3>
          <p style="color: #64748b;">Dusri category ya naya naam search karke dekhein.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(createProductCardHTML).join("");
  }

  // Filter click handlers
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentCategory = pill.dataset.category.toLowerCase();
      renderFiltered();
    });
  });

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderFiltered();
    });
  }

  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderFiltered();
    });
  }

  // Initial render
  renderFiltered();
}

// 3. Cart Page
function initCartPage() {
  const container = document.getElementById("cartItemsContainer");
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalEl = document.getElementById("cartTotal");
  const whatsappBtn = document.getElementById("btnWhatsAppOrder");

  function renderCart() {
    const cart = getCart();

    if (cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px;">
          <div style="font-size: 3.8rem; margin-bottom: 16px; color: #d4af37;">🛍️</div>
          <h3 style="font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 800; color: #0a0e17; margin-bottom: 8px;">Aapka Shopping Bag Khaali Hai!</h3>
          <p style="color: #64748b; margin-bottom: 28px;">Boutique ke shandar kapde dekhein aur apne pasandida jode bag mein add karein.</p>
          <a href="products.html" class="btn-lux-primary" style="display: inline-flex;">👑 Explore Collections (Shop Now)</a>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = "₹0";
      if (totalEl) totalEl.textContent = "₹0";
      if (whatsappBtn) {
        whatsappBtn.style.opacity = "0.5";
        whatsappBtn.style.pointerEvents = "none";
      }
      return;
    }

    if (whatsappBtn) {
      whatsappBtn.style.opacity = "1";
      whatsappBtn.style.pointerEvents = "auto";
    }

    container.innerHTML = cart.map(item => `
      <div class="cart-item-lux">
        <img src="${item.image}" alt="${item.name}" class="cart-item-lux-img" onerror="this.src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&auto=format&fit=crop&q=80'">
        <div class="cart-item-lux-info">
          <h4>${item.name}</h4>
          <span class="cart-item-lux-price">₹${item.price.toLocaleString('en-IN')}</span>
        </div>
        <div class="qty-stepper-lux">
          <button class="qty-stepper-btn" onclick="handleQtyChange('${item.productId}', '${item.size}', -1)">-</button>
          <span class="qty-stepper-val">${item.quantity}</span>
          <button class="qty-stepper-btn" onclick="handleQtyChange('${item.productId}', '${item.size}', 1)">+</button>
        </div>
        <div>
          <button onclick="handleRemoveItem('${item.productId}', '${item.size}')" style="background: none; border: none; color: #ef4444; font-size: 1.15rem; cursor: pointer; padding: 6px;" title="Bag se hatayein">🗑️</button>
        </div>
      </div>
    `).join("");

    const total = getCartTotal();
    if (subtotalEl) subtotalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
  }

  window.handleQtyChange = (id, size, change) => {
    updateCartQuantity(id, size, change);
    renderCart();
  };

  window.handleRemoveItem = (id, size) => {
    removeFromCart(id, size);
    renderCart();
  };

  // WhatsApp VIP Order Submission
  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const cart = getCart();
      if (cart.length === 0) {
        showToast("Cart mein koi samaan nahi hai!", "error");
        return;
      }

      const nameInput = document.getElementById("customerName");
      const phoneInput = document.getElementById("customerPhone");
      const addressInput = document.getElementById("customerAddress");

      const custName = nameInput ? nameInput.value.trim() : "";
      const custPhone = phoneInput ? phoneInput.value.trim() : "";
      const custAddress = addressInput ? addressInput.value.trim() : "";

      if (!custName || !custPhone || !custAddress) {
        showToast("Kripya apna Naam, Phone aur Delivery Pata bharein!", "error");
        return;
      }

      const store = getStoreInfo();
      const total = getCartTotal();
      const orderId = "OW-" + Math.floor(100000 + Math.random() * 900000);

      let orderItemsText = "";
      cart.forEach((item, idx) => {
        orderItemsText += `${idx + 1}. *${item.name}*\n   Qty: ${item.quantity} x ₹${item.price} = ₹${item.quantity * item.price}\n`;
      });

      const message = 
`👑 *ROYAL ORDER RECEIPT - ${store.name}*
🏷️ *Order ID: #${orderId}*
━━━━━━━━━━━━━━━━━━━━
👤 *Customer Information:*
• Name: ${custName}
• WhatsApp: ${custPhone}
• Delivery Address: ${custAddress}

📦 *Items in Order:*
${orderItemsText}
━━━━━━━━━━━━━━━━━━━━
💰 *Grand Total: ₹${total.toLocaleString('en-IN')}*
🚚 *Express Shipping: COMPLIMENTARY (FREE)*
━━━━━━━━━━━━━━━━━━━━
Namaste Dukandar Ji! Kripya mera order confirm karein aur payment mode (UPI / QR Code / COD) share karein. Dhanyawad!`;

      // Clear cart after sending order
      clearCart();

      const waUrl = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
      renderCart();
    });
  }

  renderCart();
}

// 4. Contact Page Form
function initContactPage() {
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("senderName").value;
      const phone = document.getElementById("senderPhone").value;
      const msg = document.getElementById("senderMessage").value;
      const store = getStoreInfo();
      
      const inquiryText = `👑 *OutfitWaala Studio Inquiry*\n• Name: ${name}\n• Phone: ${phone}\n• Message: ${msg}`;
      const waUrl = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(inquiryText)}`;
      window.open(waUrl, "_blank");
      form.reset();
      showToast("Aapka message WhatsApp par khul raha hai!");
    });
  }
}
