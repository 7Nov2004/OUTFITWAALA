// ==========================================
// OutfitWaala - Dukandar / Admin Management
// ==========================================

let editingProductId = null;
let currentUploadedImageBase64 = "";

document.addEventListener("DOMContentLoaded", () => {
  // If on login page
  if (document.getElementById("loginForm")) {
    initAdminLoginPage();
    return;
  }

  // Check login authentication on dashboard
  if (!isAdminLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  // Dashboard init
  initAdminDashboard();
});

// 1. Admin Login
function initAdminLoginPage() {
  if (isAdminLoggedIn()) {
    window.location.href = "dashboard.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("adminUsername").value.trim();
    const pass = document.getElementById("adminPassword").value.trim();

    if (adminLogin(user, pass)) {
      window.location.href = "dashboard.html";
    } else {
      if (loginError) {
        loginError.style.display = "block";
        loginError.textContent = "Galat Username ya Password! Kripya dobara dekhein.";
      }
    }
  });
}

// 2. Admin Dashboard
function initAdminDashboard() {
  renderDashboardStats();
  renderProductsTable();
  setupModalEvents();
  setupStoreSettingsForm();

  // Search in admin table
  const searchInput = document.getElementById("adminSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderProductsTable(e.target.value.toLowerCase());
    });
  }

  // Filter in admin table
  const filterCat = document.getElementById("adminCategoryFilter");
  if (filterCat) {
    filterCat.addEventListener("change", (e) => {
      renderProductsTable("", e.target.value);
    });
  }
}

// Stats Calculation
function renderDashboardStats() {
  const products = getProducts();
  const totalCount = products.length;
  const inStockCount = products.filter(p => p.inStock).length;
  const outOfStockCount = totalCount - inStockCount;

  const categories = new Set(products.map(p => p.category));

  const totalEl = document.getElementById("statTotalProducts");
  const inStockEl = document.getElementById("statInStock");
  const outStockEl = document.getElementById("statOutStock");
  const categoriesEl = document.getElementById("statCategories");

  if (totalEl) totalEl.textContent = totalCount;
  if (inStockEl) inStockEl.textContent = inStockCount;
  if (outStockEl) outStockEl.textContent = outOfStockCount;
  if (categoriesEl) categoriesEl.textContent = categories.size;
}

// Render Products in Admin Table
function renderProductsTable(filterSearch = "", filterCategory = "all") {
  const tbody = document.getElementById("adminProductsBody");
  if (!tbody) return;

  let products = getProducts();

  if (filterCategory && filterCategory !== "all") {
    products = products.filter(p => p.category.toLowerCase() === filterCategory.toLowerCase());
  }

  if (filterSearch) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(filterSearch) || 
      p.category.toLowerCase().includes(filterSearch)
    );
  }

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
          Koi kapda nahi mila. Naya kapda add karne ke liye upar <strong>"+ Naya Kapda Add Karein"</strong> button dabayein.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = products.map((product, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>
        <img src="${product.image}" alt="${product.name}" class="product-cell-img" onerror="this.src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&auto=format&fit=crop&q=80'">
      </td>
      <td>
        <div class="product-cell-title">${product.name}</div>
        <small style="color: #64748b;">${product.description ? product.description.substring(0, 45) + '...' : ''}</small>
      </td>
      <td>
        <span style="background: #e2e8f0; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 0.8rem;">
          ${product.category}
        </span>
      </td>
      <td>
        <div style="font-weight: 800; color: #0f172a;">₹${product.price.toLocaleString('en-IN')}</div>
        ${product.mrp ? `<small style="color: #94a3b8; text-decoration: line-through;">MRP: ₹${product.mrp}</small>` : ''}
      </td>
      <td>
        <button onclick="toggleStockStatus('${product.id}')" class="badge-stock ${product.inStock ? 'badge-in-stock' : 'badge-out-stock'}" style="border: none; cursor: pointer;" title="Stock status badalne ke liye click karein">
          ${product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
        </button>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-action-edit" onclick="openEditProductModal('${product.id}')" title="Edit karein">✏️ Edit</button>
          <button class="btn-action-del" onclick="handleDeleteProduct('${product.id}')" title="Hataayein">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

// Modal handling
function setupModalEvents() {
  const modal = document.getElementById("productModal");
  const openBtn = document.getElementById("btnOpenAddModal");
  const closeBtn = document.getElementById("btnCloseModal");
  const cancelBtn = document.getElementById("btnCancelModal");
  const form = document.getElementById("productForm");

  const imageFileInput = document.getElementById("productImageFile");
  const imageUrlInput = document.getElementById("productImageUrl");
  const previewImg = document.getElementById("imagePreview");

  // Open Modal
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      editingProductId = null;
      currentUploadedImageBase64 = "";
      form.reset();
      document.getElementById("modalTitle").textContent = "Naya Kapda / Product Add Karein";
      previewImg.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&auto=format&fit=crop&q=80";
      modal.classList.add("active");
    });
  }

  // Close Modal
  const closeModal = () => modal.classList.remove("active");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  // File Upload -> Base64
  if (imageFileInput) {
    imageFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        // Compress/convert to base64
        const reader = new FileReader();
        reader.onload = (event) => {
          currentUploadedImageBase64 = event.target.result;
          previewImg.src = currentUploadedImageBase64;
          imageUrlInput.value = ""; // clear URL input if file chosen
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // URL Input -> Live Preview
  if (imageUrlInput) {
    imageUrlInput.addEventListener("input", (e) => {
      if (e.target.value.trim() !== "") {
        currentUploadedImageBase64 = e.target.value.trim();
        previewImg.src = currentUploadedImageBase64;
      }
    });
  }

  // Form Submit
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("productName").value.trim();
      const category = document.getElementById("productCategory").value;
      const price = parseFloat(document.getElementById("productPrice").value);
      const mrp = parseFloat(document.getElementById("productMrp").value) || price;
      const desc = document.getElementById("productDesc").value.trim();
      const inStock = document.getElementById("productInStock").checked;
      const featured = document.getElementById("productFeatured").checked;

      let finalImage = currentUploadedImageBase64;
      if (!finalImage) {
        finalImage = imageUrlInput.value.trim() || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80";
      }

      const productPayload = {
        id: editingProductId,
        name,
        category,
        price,
        mrp,
        description: desc,
        image: finalImage,
        inStock,
        featured
      };

      saveProduct(productPayload);
      closeModal();
      renderDashboardStats();
      renderProductsTable();
      showToast(editingProductId ? "Kapde ki details update ho gayi!" : "Naya kapda kamyabi se add ho gaya!");
    });
  }
}

// Edit Product
window.openEditProductModal = (id) => {
  const product = getProductById(id);
  if (!product) return;

  editingProductId = product.id;
  document.getElementById("modalTitle").textContent = "Kapde Ki Details / Rate Badlein";

  document.getElementById("productName").value = product.name;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productMrp").value = product.mrp || product.price;
  document.getElementById("productDesc").value = product.description || "";
  document.getElementById("productInStock").checked = product.inStock;
  document.getElementById("productFeatured").checked = product.featured || false;

  const previewImg = document.getElementById("imagePreview");
  previewImg.src = product.image;
  currentUploadedImageBase64 = product.image;
  document.getElementById("productImageUrl").value = product.image.startsWith("data:") ? "" : product.image;

  document.getElementById("productModal").classList.add("active");
};

// Toggle Stock
window.toggleStockStatus = (id) => {
  const product = getProductById(id);
  if (!product) return;

  product.inStock = !product.inStock;
  saveProduct(product);
  renderDashboardStats();
  renderProductsTable();
  showToast(`Stock status badal diya gaya: ${product.inStock ? 'In Stock' : 'Out of Stock'}`);
};

// Delete Product
window.handleDeleteProduct = (id) => {
  if (confirm("Kya aap sach mein is kapde ko store se hatana chahte hain?")) {
    deleteProduct(id);
    renderDashboardStats();
    renderProductsTable();
    showToast("Kapda store se hata diya gaya!");
  }
};

// Dukaan Settings Form
function setupStoreSettingsForm() {
  const store = getStoreInfo();

  const nameInput = document.getElementById("settingStoreName");
  const phoneInput = document.getElementById("settingPhone");
  const waInput = document.getElementById("settingWhatsapp");
  const addrInput = document.getElementById("settingAddress");
  const form = document.getElementById("storeSettingsForm");

  if (nameInput) nameInput.value = store.name;
  if (phoneInput) phoneInput.value = store.phone;
  if (waInput) waInput.value = store.whatsapp;
  if (addrInput) addrInput.value = store.address;

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const updated = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        whatsapp: waInput.value.trim(),
        address: addrInput.value.trim(),
        tagline: store.tagline,
        timing: store.timing
      };
      updateStoreInfo(updated);
      showToast("Dukaan ki details save ho gayi!");
    });
  }
}
