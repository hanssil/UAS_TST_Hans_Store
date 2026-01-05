// ===== API Configuration =====
const API_CONFIG = {
    inventory: {
        baseURL: 'https://hans.tugastst.my.id',
        endpoints: {
            products: '/products'
        }
    },
    logistics: {
        baseURL: 'https://jacob.tugastst.my.id',
        endpoints: {
            tariffs: '/tariffs',
            calculate: '/calculate'
        }
    }
};

// ===== State Management =====
let products = [];
let cities = [];
let selectedProduct = null;
let currentQuantity = 1;
let isEditMode = false;
let editingProductId = null;

// ===== DOM Elements =====
const elements = {
    // Tabs
    navBtns: document.querySelectorAll('.nav-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Storefront
    productsGrid: document.getElementById('products-grid'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('error-message'),
    errorText: document.getElementById('error-text'),
    
    // Admin Form
    addProductForm: document.getElementById('add-product-form'),
    submitBtn: document.getElementById('submit-btn'),
    formMessage: document.getElementById('form-message'),
    
    // Modal
    shippingModal: document.getElementById('shipping-modal'),
    closeModal: document.getElementById('close-modal'),
    modalProductName: document.getElementById('modal-product-name'),
    modalProductPrice: document.getElementById('modal-product-price'),
    modalProductWeight: document.getElementById('modal-product-weight'),
    quantityInput: document.getElementById('quantity-input'),
    qtyMinus: document.getElementById('qty-minus'),
    qtyPlus: document.getElementById('qty-plus'),
    destinationSelect: document.getElementById('destination-select'),
    calculateShipping: document.getElementById('calculate-shipping'),
    shippingResult: document.getElementById('shipping-result'),
    shippingLoading: document.getElementById('shipping-loading'),
    shippingError: document.getElementById('shipping-error'),
    shippingErrorText: document.getElementById('shipping-error-text'),
    
    // Shipping Results
    resultDestination: document.getElementById('result-destination'),
    resultQuantity: document.getElementById('result-quantity'),
    resultWeight: document.getElementById('result-weight'),
    resultProductTotal: document.getElementById('result-product-total'),
    resultCost: document.getElementById('result-cost'),
    resultEstimate: document.getElementById('result-estimate'),
    resultGrandTotal: document.getElementById('result-grand-total'),
    
    // Checkout
    checkoutBtn: document.getElementById('checkout-btn'),
    
    // Admin Product List
    adminProductList: document.getElementById('admin-product-list')
};

// ===== Custom Modal Functions =====
const customModal = {
    // Custom confirm dialog
    confirm: (message, title = 'Konfirmasi') => {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const titleEl = document.getElementById('confirm-title');
            const messageEl = document.getElementById('confirm-message');
            const okBtn = document.getElementById('confirm-ok');
            const cancelBtn = document.getElementById('confirm-cancel');
            
            titleEl.textContent = title;
            messageEl.innerHTML = message.replace(/\n/g, '<br>');
            modal.classList.add('active');
            
            const handleOk = () => {
                modal.classList.remove('active');
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
                resolve(true);
            };
            
            const handleCancel = () => {
                modal.classList.remove('active');
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
                resolve(false);
            };
            
            okBtn.addEventListener('click', handleOk);
            cancelBtn.addEventListener('click', handleCancel);
        });
    },
    
    // Custom success notification
    success: (message, title = 'Berhasil!') => {
        return new Promise((resolve) => {
            const modal = document.getElementById('success-modal');
            const titleEl = document.getElementById('success-title');
            const messageEl = document.getElementById('success-message');
            const okBtn = document.getElementById('success-ok');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            modal.classList.add('active');
            
            const handleOk = () => {
                modal.classList.remove('active');
                okBtn.removeEventListener('click', handleOk);
                resolve();
            };
            
            okBtn.addEventListener('click', handleOk);
        });
    }
};

// ===== Utility Functions =====
const utils = {
    // Format currency to Indonesian Rupiah
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },
    
    // Show/Hide elements
    show: (element) => {
        if (element) element.style.display = 'block';
    },
    
    hide: (element) => {
        if (element) element.style.display = 'none';
    },
    
    // Show messages
    showMessage: (element, message, type = 'success') => {
        element.textContent = message;
        element.className = `form-message ${type}`;
        utils.show(element);
        setTimeout(() => utils.hide(element), 5000);
    },
    
    // Get stock badge class
    getStockBadgeClass: (stock) => {
        if (stock === 0) return 'out-stock';
        if (stock < 10) return 'low-stock';
        return 'in-stock';
    },
    
    // Get stock text
    getStockText: (stock) => {
        if (stock === 0) return 'Habis';
        if (stock < 10) return `Stok Terbatas (${stock})`;
        return `Tersedia (${stock})`;
    },
    
    // Update quantity display
    updateQuantity: (value) => {
        if (elements.quantityInput) {
            elements.quantityInput.value = value;
            currentQuantity = value;
        }
    }
};

// ===== API Functions =====
const api = {
    // Fetch products from inventory API
    async fetchProducts() {
        try {
            const response = await fetch(`${API_CONFIG.inventory.baseURL}${API_CONFIG.inventory.endpoints.products}`);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },
    
    // Add new product to inventory
    async addProduct(productData) {
        try {
            const response = await fetch(`${API_CONFIG.inventory.baseURL}${API_CONFIG.inventory.endpoints.products}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    },
    
    // Update existing product
    async updateProduct(productData) {
        try {
            const response = await fetch(`${API_CONFIG.inventory.baseURL}${API_CONFIG.inventory.endpoints.products}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },
    
    // Fetch available cities/tariffs
    async fetchTariffs() {
        try {
            const response = await fetch(`${API_CONFIG.logistics.baseURL}${API_CONFIG.logistics.endpoints.tariffs}`);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching tariffs:', error);
            throw error;
        }
    },
    
    // Calculate shipping cost
    async calculateShipping(destination, weight_kg) {
        try {
            const response = await fetch(`${API_CONFIG.logistics.baseURL}${API_CONFIG.logistics.endpoints.calculate}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    destination: destination,
                    weight_kg: weight_kg
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error calculating shipping:', error);
            throw error;
        }
    }
};

// ===== UI Functions =====
const ui = {
    // Render products grid
    renderProducts() {
        if (!products || products.length === 0) {
            elements.productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <p style="color: var(--text-secondary); font-size: 16px;">Belum ada produk tersedia</p>
                </div>
            `;
            return;
        }
        
        elements.productsGrid.innerHTML = products.map(product => {
            const stockClass = utils.getStockBadgeClass(product.stock);
            const stockText = utils.getStockText(product.stock);
            
            return `
                <div class="product-card" data-product-id="${product.id}">
                    <span class="product-category">${product.category || 'Umum'}</span>
                    <h3 class="product-name">${product.name}</h3>
                    
                    <div class="product-details">
                        <div class="product-detail-item">
                            <span class="detail-label">Berat</span>
                            <span class="detail-value">${product.weight_kg} kg</span>
                        </div>
                        <div class="product-detail-item">
                            <span class="detail-label">Stok</span>
                            <span class="detail-value">
                                <span class="stock-badge ${stockClass}">${stockText}</span>
                            </span>
                        </div>
                    </div>
                    
                    <div class="product-price">${utils.formatCurrency(product.price)}</div>
                    
                    <button class="btn btn-shipping" onclick="app.openShippingModal('${product.id}')" ${product.stock === 0 ? 'disabled' : ''}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                        ${product.stock === 0 ? 'Stok Habis' : 'Cek Ongkir'}
                    </button>
                </div>
            `;
        }).join('');
    },
    
    // Populate cities dropdown
    populateCitiesDropdown() {
        if (!cities || cities.length === 0) {
            elements.destinationSelect.innerHTML = '<option value="">-- Tidak ada data kota --</option>';
            return;
        }
        
        elements.destinationSelect.innerHTML = `
            <option value="">-- Pilih Kota Tujuan --</option>
            ${cities.map(city => `<option value="${city.destination}">${city.destination}</option>`).join('')}
        `;
    },
    
    // Show loading state
    showLoading() {
        utils.show(elements.loading);
        utils.hide(elements.errorMessage);
        utils.hide(elements.productsGrid);
    },
    
    // Show error state
    showError(message) {
        utils.hide(elements.loading);
        elements.errorText.textContent = message;
        utils.show(elements.errorMessage);
        utils.hide(elements.productsGrid);
    },
    
    // Show products
    showProducts() {
        utils.hide(elements.loading);
        utils.hide(elements.errorMessage);
        utils.show(elements.productsGrid);
    },
    
    // Reset shipping modal
    resetShippingModal() {
        utils.hide(elements.shippingResult);
        utils.hide(elements.shippingLoading);
        utils.hide(elements.shippingError);
        utils.hide(elements.checkoutBtn);
        elements.destinationSelect.value = '';
    },
    
    // Render admin product list table
    renderAdminProductList() {
        if (!products || products.length === 0) {
            elements.adminProductList.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: var(--text-secondary);">Belum ada produk</td>
                </tr>
            `;
            return;
        }
        
        elements.adminProductList.innerHTML = products.map(product => `
            <tr>
                <td>${product.name}</td>
                <td><span class="category-badge">${product.category || 'Umum'}</span></td>
                <td>${utils.formatCurrency(product.price)}</td>
                <td><span class="stock-badge ${utils.getStockBadgeClass(product.stock)}">${product.stock}</span></td>
                <td>${product.weight_kg} kg</td>
                <td>
                    <button class="btn-table btn-edit" onclick="app.editProduct('${product.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                    </button>
                </td>
            </tr>
        `).join('');
    }
};

// ===== Event Handlers =====
const handlers = {
    // Tab switching
    switchTab(tabName) {
        elements.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });
    },
    
    // Handle add/edit product form submission
    async handleAddProduct(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(elements.addProductForm);
        const productData = {
            id: isEditMode ? editingProductId : `PROD-${Date.now()}`, // Use existing ID or generate new
            name: formData.get('name'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            weight_kg: parseFloat(formData.get('weight_kg'))
        };
        
        // Validate
        if (!productData.name || !productData.category || productData.price <= 0 || productData.stock < 0 || productData.weight_kg <= 0) {
            utils.showMessage(elements.formMessage, 'Mohon isi semua field dengan benar!', 'error');
            return;
        }
        
        // Disable submit button
        elements.submitBtn.disabled = true;
        const loadingText = isEditMode ? 'Menyimpan...' : 'Menambahkan...';
        elements.submitBtn.innerHTML = `
            <svg class="spinner" style="width: 18px; height: 18px; border-width: 2px;" viewBox="0 0 24 24"></svg>
            ${loadingText}
        `;
        
        try {
            if (isEditMode) {
                // Update existing product
                await api.updateProduct(productData);
                utils.showMessage(elements.formMessage, 'Produk berhasil diperbarui!', 'success');
                
                // Reset edit mode
                app.resetFormToAddMode();
            } else {
                // Add new product
                await api.addProduct(productData);
                utils.showMessage(elements.formMessage, 'Produk berhasil ditambahkan!', 'success');
            }
            
            // Reset form
            elements.addProductForm.reset();
            
            // Reload products
            await app.loadProducts();
            
        } catch (error) {
            const errorMsg = isEditMode 
                ? 'Gagal memperbarui produk. Pastikan API tersedia atau periksa koneksi internet.'
                : 'Gagal menambahkan produk. Pastikan API tersedia atau periksa koneksi internet.';
            utils.showMessage(elements.formMessage, errorMsg, 'error');
        } finally {
            // Re-enable submit button
            elements.submitBtn.disabled = false;
            if (!isEditMode) {
                elements.submitBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Tambah Produk
                `;
            }
        }
    },
    
    // Handle shipping calculation
    async handleCalculateShipping() {
        const destination = elements.destinationSelect.value;
        
        if (!destination) {
            elements.shippingErrorText.textContent = 'Pilih kota tujuan terlebih dahulu!';
            utils.show(elements.shippingError);
            setTimeout(() => utils.hide(elements.shippingError), 3000);
            return;
        }
        
        if (!selectedProduct) {
            elements.shippingErrorText.textContent = 'Produk tidak ditemukan!';
            utils.show(elements.shippingError);
            return;
        }
        
        // Show loading
        utils.hide(elements.shippingResult);
        utils.hide(elements.shippingError);
        utils.show(elements.shippingLoading);
        
        try {
            // Calculate total weight based on quantity
            const totalWeight = selectedProduct.weight_kg * currentQuantity;
            
            // Calculate shipping with total weight
            const result = await api.calculateShipping(destination, totalWeight);
            
            // Hide loading
            utils.hide(elements.shippingLoading);
            
            // Calculate totals
            const productTotal = selectedProduct.price * currentQuantity;
            const shippingCost = result.total_cost || 0;
            const grandTotal = productTotal + shippingCost;
            
            // Display result
            elements.resultDestination.textContent = destination;
            elements.resultQuantity.textContent = `${currentQuantity} pcs`;
            elements.resultWeight.textContent = `${totalWeight} kg`;
            elements.resultProductTotal.textContent = utils.formatCurrency(productTotal);
            elements.resultCost.textContent = utils.formatCurrency(shippingCost);
            elements.resultEstimate.textContent = result.eta || '-';
            elements.resultGrandTotal.textContent = utils.formatCurrency(grandTotal);
            
            utils.show(elements.shippingResult);
            utils.show(elements.checkoutBtn); // Show checkout button after calculation
            
        } catch (error) {
            utils.hide(elements.shippingLoading);
            elements.shippingErrorText.textContent = 'Gagal menghitung ongkir. Periksa koneksi atau coba lagi.';
            utils.show(elements.shippingError);
        }
    },
    
    // Handle checkout (buy now)
    async handleCheckout() {
        if (!selectedProduct || currentQuantity <= 0) {
            await customModal.success('Produk tidak valid!', 'Perhatian');
            return;
        }
        
        // Check stock availability
        if (currentQuantity > selectedProduct.stock) {
            await customModal.success('Stok tidak mencukupi! Silakan kurangi jumlah pembelian.', 'Stok Habis');
            return;
        }
        
        // Confirm purchase with custom modal
        const productTotal = selectedProduct.price * currentQuantity;
        const confirmMsg = `
            <div class="confirm-details">
                <p><strong>Produk:</strong> ${selectedProduct.name}</p>
                <p><strong>Jumlah:</strong> ${currentQuantity} pcs</p>
                <p><strong>Total:</strong> ${utils.formatCurrency(productTotal)}</p>
            </div>
            <p style="margin-top: 16px; color: var(--text-secondary);">Apakah Anda yakin ingin melanjutkan pembelian?</p>
        `;
        
        const confirmed = await customModal.confirm(confirmMsg, 'Konfirmasi Pembelian');
        if (!confirmed) {
            return;
        }
        
        // Disable checkout button
        elements.checkoutBtn.disabled = true;
        elements.checkoutBtn.innerHTML = `
            <svg class="spinner" style="width: 18px; height: 18px; border-width: 2px;" viewBox="0 0 24 24"></svg>
            Memproses...
        `;
        
        try {
            // Calculate new stock
            const newStock = selectedProduct.stock - currentQuantity;
            
            // Update product with reduced stock
            const updatedProduct = {
                ...selectedProduct,
                stock: newStock
            };
            
            await api.updateProduct(updatedProduct);
            
            // Show success message with custom modal
            await customModal.success('Terima kasih telah berbelanja di Hans Store!', 'Pembelian Berhasil');
            
            // Close modal
            elements.shippingModal.classList.remove('active');
            
            // Reload products to update display
            await app.loadProducts();
            
        } catch (error) {
            await customModal.success('Pembelian gagal. Silakan coba lagi atau hubungi admin.', 'Terjadi Kesalahan');
            console.error('Checkout error:', error);
        } finally {
            // Re-enable checkout button
            elements.checkoutBtn.disabled = false;
            elements.checkoutBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"></path>
                </svg>
                Beli Sekarang
            `;
        }
    },
    
    // Handle quantity change
    handleQuantityChange(action) {
        if (!selectedProduct) return;
        
        let newQuantity = currentQuantity;
        
        if (action === 'plus' && currentQuantity < selectedProduct.stock) {
            newQuantity = currentQuantity + 1;
        } else if (action === 'minus' && currentQuantity > 1) {
            newQuantity = currentQuantity - 1;
        }
        
        utils.updateQuantity(newQuantity);
    }
};

// ===== Main App =====
const app = {
    // Initialize app
    async init() {
        this.setupEventListeners();
        await this.loadProducts();
        await this.loadCities();
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Tab navigation
        elements.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                handlers.switchTab(btn.dataset.tab);
            });
        });
        
        // Add product form
        elements.addProductForm.addEventListener('submit', handlers.handleAddProduct);
        
        // Modal controls
        elements.closeModal.addEventListener('click', () => {
            elements.shippingModal.classList.remove('active');
        });
        
        elements.shippingModal.addEventListener('click', (e) => {
            if (e.target === elements.shippingModal) {
                elements.shippingModal.classList.remove('active');
            }
        });
        
        // Calculate shipping
        elements.calculateShipping.addEventListener('click', handlers.handleCalculateShipping);
        
        // Checkout
        elements.checkoutBtn.addEventListener('click', handlers.handleCheckout);
        
        // Quantity controls
        elements.qtyMinus.addEventListener('click', () => handlers.handleQuantityChange('minus'));
        elements.qtyPlus.addEventListener('click', () => handlers.handleQuantityChange('plus'));
    },
    
    // Load products
    async loadProducts() {
        ui.showLoading();
        
        try {
            const response = await api.fetchProducts();
            products = response.data;
            ui.renderProducts();
            ui.renderAdminProductList(); // Also update admin list
            ui.showProducts();
        } catch (error) {
            ui.showError('Gagal memuat produk. Pastikan API inventory tersedia atau periksa koneksi internet.');
        }
    },
    
    // Load cities
    async loadCities() {
        try {
            const response = await api.fetchTariffs(); 
            cities = response.data; 
            ui.populateCitiesDropdown();
        } catch (error) {
            console.error('Failed to load cities:', error);
            elements.destinationSelect.innerHTML = '<option value="">-- Gagal memuat data kota --</option>';
        }
    },
    
    // Open shipping modal
    async openShippingModal(productId) {
        selectedProduct = products.find(p => p.id === productId);
        
        if (!selectedProduct) {
            await customModal.success('Produk tidak ditemukan!', 'Perhatian');
            return;
        }
        
        // Set product info
        elements.modalProductName.textContent = selectedProduct.name;
        elements.modalProductPrice.textContent = utils.formatCurrency(selectedProduct.price);
        elements.modalProductWeight.textContent = `${selectedProduct.weight_kg} kg`;
        
        // Reset quantity to 1
        currentQuantity = 1;
        utils.updateQuantity(1);
        
        // Reset modal
        ui.resetShippingModal();
        
        // Show modal
        elements.shippingModal.classList.add('active');
    },
    
    // Edit product
    async editProduct(productId) {
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            await customModal.success('Produk tidak ditemukan!', 'Perhatian');
            return;
        }
        
        // Set edit mode
        isEditMode = true;
        editingProductId = productId;
        
        // Populate form with product data
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-weight').value = product.weight_kg;
        
        // Update button text
        elements.submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Simpan Perubahan
        `;
        
        // Scroll to form
        elements.addProductForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    
    // Reset form to add mode
    resetFormToAddMode() {
        isEditMode = false;
        editingProductId = null;
        
        elements.submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Tambah Produk
        `;
    }
};

// ===== Initialize App on Load =====
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
