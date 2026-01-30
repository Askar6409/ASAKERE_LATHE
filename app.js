class SalesSystem {
    constructor() {
        this.products = JSON.parse(localStorage.getItem("products")) || [
            { id: 1, name: "پیچ", price: 10000, stock: 50 },
            { id: 2, name: "مهره", price: 8000, stock: 80 },
            { id: 3, name: "بلبرینگ", price: 120000, stock: 15 }
        ];
        this.invoices = JSON.parse(localStorage.getItem("invoices")) || [];
        this.invoiceNumber = Number(localStorage.getItem("invoiceNumber")) || 1;
        this.container = document.getElementById("products");
        this.init();
    }

    init() {
        this.renderProducts();
        this.renderHistory();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // رویداد کلیک برای دکمه افزودن محصول
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.addProduct();
        });

        // رویداد کلیک برای دکمه صدور فاکتور
        document.getElementById('generateInvoiceBtn').addEventListener('click', () => {
            this.generateInvoice();
        });

        // رویداد input برای محاسبه خودکار جمع کل
        document.addEventListener('input', (e) => {
            if (e.target.id.startsWith('qty-') || e.target.id.startsWith('price-')) {
                this.calculateTotal();
            }
        });

        // رویداد change برای چک‌باکس‌ها
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.calculateTotal();
            }
        });

        // رویداد keypress برای Enter در فیلدهای محصول جدید
        document.getElementById('newName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addProduct();
        });
        document.getElementById('newPrice').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addProduct();
        });
        document.getElementById('newStock').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addProduct();
        });

        // رویداد keypress برای Enter در فیلدهای مشتری
        document.getElementById('customerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateInvoice();
        });
        document.getElementById('customerPhone').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateInvoice();
        });
    }

    save() {
        localStorage.setItem("products", JSON.stringify(this.products));
        localStorage.setItem("invoices", JSON.stringify(this.invoices));
        localStorage.setItem("invoiceNumber", this.invoiceNumber);
    }

    showAlert(message, type = 'success') {
        const alert = document.getElementById('alert');
        alert.textContent = message;
        alert.className = `alert ${type}`;
        alert.classList.add('show');
        
        setTimeout(() => {
            alert.classList.remove('show');
        }, 3000);
    }

    renderProducts() {
        this.container.innerHTML = '';
        
        if (this.products.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <i class='bx bx-package'></i>
                    <p>هیچ محصولی ثبت نشده است</p>
                </div>
            `;
            return;
        }
        
        this.products.forEach((product, index) => {
            const productElement = document.createElement('div');
            productElement.className = 'product-item';
            
            productElement.innerHTML = `
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <small>موجودی: ${product.stock.toLocaleString('fa-IR')} عدد</small>
                </div>
                <input type="number" 
                       id="price-${index}" 
                       class="product-input" 
                       value="${product.price}" 
                       min="0"
                       placeholder="قیمت (ریال)">
                <input type="number" 
                       id="qty-${index}" 
                       class="product-input" 
                       value="0" 
                       min="0" 
                       max="${product.stock}"
                       placeholder="تعداد">
                <input type="checkbox" 
                       class="product-checkbox" 
                       ${product.stock === 0 ? 'disabled' : ''}>
            `;
            
            this.container.appendChild(productElement);
        });
        
        this.calculateTotal();
    }

    addProduct() {
        const name = document.getElementById("newName").value.trim();
        const price = Number(document.getElementById("newPrice").value);
        const stock = Number(document.getElementById("newStock").value);

        if (!name) {
            this.showAlert("نام محصول الزامی است!", "error");
            document.getElementById("newName").focus();
            return;
        }

        if (price <= 0 || isNaN(price)) {
            this.showAlert("قیمت باید بیشتر از صفر باشد!", "error");
            document.getElementById("newPrice").focus();
            return;
        }

        if (stock < 0 || isNaN(stock)) {
            this.showAlert("موجودی معتبر وارد کنید!", "error");
            document.getElementById("newStock").focus();
            return;
        }

        const newProduct = {
            id: Date.now(),
            name,
            price: price,
            stock: stock
        };

        this.products.push(newProduct);
        this.save();
        this.renderProducts();

        // پاک کردن فیلدها
        document.getElementById("newName").value = "";
        document.getElementById("newPrice").value = "";
        document.getElementById("newStock").value = "";

        // فوکوس روی فیلد نام
        document.getElementById("newName").focus();

        this.showAlert("محصول با موفقیت اضافه شد!");
    }

    calculateTotal() {
        let total = 0;

        this.products.forEach((product, index) => {
            const qtyInput = document.getElementById(`qty-${index}`);
            const priceInput = document.getElementById(`price-${index}`);
            const checkbox = document.querySelectorAll('.product-checkbox')[index];
            
            if (qtyInput && priceInput && checkbox) {
                const qty = Number(qtyInput.value) || 0;
                const price = Number(priceInput.value) || 0;
                
                // اعتبارسنجی تعداد
                if (qty < 0) {
                    qtyInput.value = 0;
                }
                
                if (qty > product.stock) {
                    qtyInput.value = product.stock;
                }
                
                // اعتبارسنجی قیمت
                if (price < 0) {
                    priceInput.value = product.price;
                }
                
                // به‌روزرسانی قیمت محصول در صورت تغییر
                if (product.price !== price && price > 0) {
                    product.price = price;
                    this.save();
                }
                
                if (checkbox.checked) {
                    total += qty * price;
                }
            }
        });

        const totalElement = document.getElementById("total");
        totalElement.innerHTML = `
            <i class='bx bx-calculator'></i>
            جمع کل: ${total.toLocaleString('fa-IR')} ریال
        `;
    }

    generateInvoice() {
        const name = document.getElementById("customerName").value.trim();
        const phone = document.getElementById("customerPhone").value.trim();
        const items = [];
        let total = 0;
        let hasError = false;

        this.products.forEach((product, index) => {
            const qtyInput = document.getElementById(`qty-${index}`);
            const checkbox = document.querySelectorAll('.product-checkbox')[index];
            
            if (!qtyInput || !checkbox) return;
            
            const qty = Number(qtyInput.value) || 0;

            if (checkbox.checked && qty > 0) {
                if (product.stock !== undefined && qty > product.stock) {
                    this.showAlert(`موجودی ${product.name} کافی نیست! (موجودی: ${product.stock} عدد)`, "error");
                    hasError = true;
                    return;
                }

                const subtotal = qty * product.price;
                total += subtotal;

                items.push({
                    name: product.name,
                    quantity: qty,
                    price: product.price,
                    subtotal
                });

                // به‌روزرسانی موجودی
                if (product.stock !== undefined) {
                    product.stock -= qty;
                }
            }
        });

        if (hasError) return;

        if (items.length === 0) {
            this.showAlert("لطفا حداقل یک محصول انتخاب کنید!", "error");
            return;
        }

        const invoice = {
            number: this.invoiceNumber++,
            customer: name || "مشتری ناشناس",
            phone: phone || "ثبت نشده",
            date: new Date().toLocaleString('fa-IR'),
            items,
            total
        };

        this.invoices.unshift(invoice);
        this.save();
        this.renderHistory();
        this.renderProducts();

        // پاک کردن فیلدهای مشتری
        document.getElementById("customerName").value = "";
        document.getElementById("customerPhone").value = "";

        // پاک کردن مقادیر محصولات
        this.products.forEach((product, index) => {
            const qtyInput = document.getElementById(`qty-${index}`);
            const checkbox = document.querySelectorAll('.product-checkbox')[index];
            if (qtyInput) qtyInput.value = 0;
            if (checkbox) checkbox.checked = false;
        });

        this.calculateTotal();
        this.showAlert(`فاکتور شماره ${invoice.number} با موفقیت صادر شد!`);
    }

    renderHistory() {
        const historyContainer = document.getElementById("history");
        historyContainer.innerHTML = '';

        if (this.invoices.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <i class='bx bx-info-circle'></i>
                    <p>هیچ فاکتوری ثبت نشده است</p>
                </div>
            `;
            return;
        }

        this.invoices.forEach(invoice => {
            const invoiceElement = document.createElement('div');
            invoiceElement.className = 'invoice-item';

            invoiceElement.innerHTML = `
                <div class="invoice-header">
                    <strong>فاکتور #${invoice.number}</strong>
                    <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 8px;">
                        <i class='bx bx-calendar'></i> ${invoice.date}
                    </div>
                </div>
                <div style="margin: var(--spacing-md) 0; text-align: center;">
                    <div><i class='bx bx-user'></i> ${invoice.customer}</div>
                    <div><i class='bx bx-phone'></i> ${invoice.phone}</div>
                </div>
                <div class="invoice-items">
                    ${invoice.items.map(item => `
                        <div class="invoice-item-row">
                            <span>${item.name}</span>
                            <span>${item.quantity} عدد × ${item.price.toLocaleString('fa-IR')} ریال</span>
                            <span>${item.subtotal.toLocaleString('fa-IR')} ریال</span>
                        </div>
                    `).join('')}
                </div>
                <div class="invoice-total">
                    <i class='bx bx-credit-card'></i>
                    مبلغ نهایی: ${invoice.total.toLocaleString('fa-IR')} ریال
                </div>
            `;

            historyContainer.appendChild(invoiceElement);
        });
    }

    // متدهای کمکی برای مدیریت بهتر
    clearAllData() {
        if (confirm("آیا از پاک کردن تمام داده‌ها اطمینان دارید؟ این عمل قابل بازگشت نیست.")) {
            localStorage.clear();
            this.products = [];
            this.invoices = [];
            this.invoiceNumber = 1;
            this.save();
            this.renderProducts();
            this.renderHistory();
            this.showAlert("تمامی داده‌ها با موفقیت پاک شدند.");
        }
    }

    exportData() {
        const data = {
            products: this.products,
            invoices: this.invoices,
            invoiceNumber: this.invoiceNumber
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-system-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showAlert("داده‌ها با موفقیت دانلود شدند.");
    }
}

// ایجاد نمونه از سیستم فروش
const salesSystem = new SalesSystem();

// اضافه کردن توابع به window برای دسترسی آسان (اختیاری)
window.salesSystem = salesSystem;
window.clearAllData = () => salesSystem.clearAllData();
window.exportData = () => salesSystem.exportData();
