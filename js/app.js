
// Formateador de moneda
const fmt = new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" });
const uid = () => Math.random().toString(36).slice(2, 9);

// Toast Bootstrap
function showToast(msg, type = "primary") {
    const el = document.getElementById("toast");
    if (el) {
        document.getElementById("toastMsg").textContent = msg;
        el.className = `toast align-items-center text-bg-${type} border-0`;
        bootstrap.Toast.getOrCreateInstance(el).show();
    } else console.log(msg);
}

// Clases básicas
class Product { 
    constructor(id, name, price, stock, category = ""){ 
        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.category = category;
    } 
}

class CartItem { 
    constructor(product, qty){ 
        this.product = product;
        this.qty = qty;
    } 
    
    get subtotal(){ 
        return this.qty * this.product.price; 
    } 
}

class Cart {
    constructor(){ 
        this.items = this.load(); 
    }
    
    load(){ 
        const cartData = localStorage.getItem("cart");
        if (!cartData) return [];
        
        return JSON.parse(cartData).map(item => 
            new CartItem(
                new Product(
                    item.product.id,
                    item.product.name,
                    item.product.price,
                    item.product.stock,
                    item.product.category
                ),
                item.qty
            )
        );
    }
    
    save(){ 
        localStorage.setItem("cart", JSON.stringify(this.items)); 
    }
    
    clear(){ 
        this.items = []; 
        this.save(); 
    }
    
    count(){ 
        return this.items.reduce((total, item) => total + item.qty, 0); 
    }
    
    add(product, qty){
        const existing = this.items.find(i => i.product.id === product.id);
        if (existing) { 
            existing.qty += qty; 
            showToast(`Se agregó +${qty} de ${product.name}`, "success"); 
        } else {
            this.items.push(new CartItem(product, qty));
            showToast(`${product.name} agregado al carrito`, "success");
        }
        this.save();
    }
    
    updateQty(productId, qty){ 
        const item = this.items.find(i => i.product.id === productId); 
        if (!item) return;
        
        if (qty <= 0) { 
            this.remove(productId); 
        } else { 
            item.qty = qty; 
            this.save(); 
        } 
    }
    
    remove(productId){ 
        const item = this.items.find(i => i.product.id === productId); 
        if (item) {
            showToast(`${item.product.name} eliminado del carrito`, "warning");
        }
        this.items = this.items.filter(i => i.product.id !== productId); 
        this.save(); 
    }
    
    subtotal(){ 
        return this.items.reduce((total, item) => total + item.subtotal, 0); 
    }
}

// Variables globales
let currentPage = 1;
const itemsPerPage = 15;
let cart;
let products = [];
let currentPurchase = null; // Almacena los datos de la compra actual

// Función para generar y visualizar PDF
function generarYVisualizarPDF(nombre, dui, purchasedItems, subtotal, tax, total) {
    // Usar jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configuración
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let yPosition = margin;
    
    // Logo y encabezado
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("TIENDA SUPERNOVA", pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Factura de Venta", pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    // Información de la factura
    doc.setFontSize(10);
    const facturaId = `FAC-${uid().toUpperCase().slice(0, 8)}`;
    doc.text(`No. Factura: ${facturaId}`, margin, yPosition);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-SV')}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 6;
    
    doc.text(`Cliente: ${nombre}`, margin, yPosition);
    yPosition += 6;
    
    doc.text(`DUI: ${dui}`, margin, yPosition);
    yPosition += 12;
    
    // Tabla de productos
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE PRODUCTOS", margin, yPosition);
    yPosition += 6;
    
    // Configurar la tabla
    const tableColumn = ["Producto", "Cant.", "P. Unitario", "Total"];
    const tableRows = [];
    
    purchasedItems.forEach(item => {
        const productData = [
            item.product.name.substring(0, 30), // Limitar longitud para que quepa
            item.qty.toString(),
            fmt.format(item.product.price),
            fmt.format(item.subtotal)
        ];
        tableRows.push(productData);
    });
    
    // Generar la tabla
    doc.autoTable({
        startY: yPosition,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { 
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak'
        },
        headStyles: { 
            fillColor: [13, 110, 253],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        margin: { left: margin, right: margin },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30 }
        }
    });
    
    // Obtener la posición final después de la tabla
    let finalY = doc.lastAutoTable.finalY + 10;
    
    // Totales
    const taxRate = parseFloat(document.getElementById("taxSelect").value) * 100;
    
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal:", pageWidth - margin - 60, finalY);
    doc.text(fmt.format(subtotal), pageWidth - margin, finalY, { align: 'right' });
    finalY += 7;
    
    doc.text(`Impuesto (${taxRate}%):`, pageWidth - margin - 60, finalY);
    doc.text(fmt.format(tax), pageWidth - margin, finalY, { align: 'right' });
    finalY += 7;
    
    doc.setFontSize(12);
    doc.text("TOTAL:", pageWidth - margin - 60, finalY);
    doc.text(fmt.format(total), pageWidth - margin, finalY, { align: 'right' });
    finalY += 15;
    
    // Pie de página
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("¡Gracias por su compra!", pageWidth / 2, finalY, { align: 'center' });
    finalY += 5;
    doc.text("Tienda Supernova - El Salvador", pageWidth / 2, finalY, { align: 'center' });
    
    // Convertir PDF a Data URL para visualización
    const pdfDataUrl = doc.output('datauristring');
    
    // Crear iframe para visualizar el PDF
    const pdfModal = document.createElement('div');
    pdfModal.className = 'modal fade';
    pdfModal.id = 'pdfViewerModal';
    pdfModal.innerHTML = `
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="bi bi-file-earmark-pdf"></i> Vista Previa de Factura - ${facturaId}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info mb-3">
                        <i class="bi bi-info-circle"></i> Esta es una vista previa de su factura en PDF.
                    </div>
                    <iframe src="${pdfDataUrl}" width="100%" height="500px" frameborder="0" class="border rounded"></iframe>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar Vista Previa</button>
                    <button type="button" class="btn btn-primary" onclick="descargarFactura()">
                        <i class="bi bi-download"></i> Descargar PDF
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(pdfModal);
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('pdfViewerModal'));
    modal.show();
    
    // Limpiar cuando se cierre el modal
    document.getElementById('pdfViewerModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
    
    // Guardar datos de la compra actual para posible descarga
    currentPurchase = { nombre, dui, purchasedItems, subtotal, tax, total };
}

// Función para descargar factura
function descargarFactura() {
    if (!currentPurchase) {
        showToast("No hay datos de compra para descargar", "warning");
        return;
    }
    
    const { nombre, dui, purchasedItems, subtotal, tax, total } = currentPurchase;
    
    // Usar jsPDF para descargar
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configuración
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let yPosition = margin;
    
    // Logo y encabezado
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("TIENDA SUPERNOVA", pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Factura de Venta", pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    // Información de la factura
    doc.setFontSize(10);
    const facturaId = `FAC-${uid().toUpperCase().slice(0, 8)}`;
    doc.text(`No. Factura: ${facturaId}`, margin, yPosition);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-SV')}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 6;
    
    doc.text(`Cliente: ${nombre}`, margin, yPosition);
    yPosition += 6;
    
    doc.text(`DUI: ${dui}`, margin, yPosition);
    yPosition += 12;
    
    // Tabla de productos
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE PRODUCTOS", margin, yPosition);
    yPosition += 6;
    
    // Configurar la tabla
    const tableColumn = ["Producto", "Cant.", "P. Unitario", "Total"];
    const tableRows = [];
    
    purchasedItems.forEach(item => {
        const productData = [
            item.product.name.substring(0, 30),
            item.qty.toString(),
            fmt.format(item.product.price),
            fmt.format(item.subtotal)
        ];
        tableRows.push(productData);
    });
    
    // Generar la tabla
    doc.autoTable({
        startY: yPosition,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { 
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak'
        },
        headStyles: { 
            fillColor: [13, 110, 253],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        margin: { left: margin, right: margin },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30 }
        }
    });
    
    // Obtener la posición final después de la tabla
    let finalY = doc.lastAutoTable.finalY + 10;
    
    // Totales
    const taxRate = parseFloat(document.getElementById("taxSelect").value) * 100;
    
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal:", pageWidth - margin - 60, finalY);
    doc.text(fmt.format(subtotal), pageWidth - margin, finalY, { align: 'right' });
    finalY += 7;
    
    doc.text(`Impuesto (${taxRate}%):`, pageWidth - margin - 60, finalY);
    doc.text(fmt.format(tax), pageWidth - margin, finalY, { align: 'right' });
    finalY += 7;
    
    doc.setFontSize(12);
    doc.text("TOTAL:", pageWidth - margin - 60, finalY);
    doc.text(fmt.format(total), pageWidth - margin, finalY, { align: 'right' });
    finalY += 15;
    
    // Pie de página
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("¡Gracias por su compra!", pageWidth / 2, finalY, { align: 'center' });
    finalY += 5;
    doc.text("Tienda Supernova - El Salvador", pageWidth / 2, finalY, { align: 'center' });
    
    // Descargar el PDF
    doc.save(`factura-supernova-${new Date().getTime()}.pdf`);
    
    // Cerrar el modal de vista previa
    bootstrap.Modal.getInstance(document.getElementById('pdfViewerModal')).hide();
}

// Función para mostrar factura como HTML
function mostrarFacturaHTML(nombre, dui, purchasedItems, subtotal, tax, total) {
    const fac = document.getElementById("facContent");
    const taxRate = parseFloat(document.getElementById("taxSelect").value) * 100;
    
    fac.innerHTML = `
        <div class="invoice-header">
            <h5 class="mb-1">Factura #${uid().toUpperCase().slice(0, 8)}</h5>
            <p class="mb-0">Fecha: ${new Date().toLocaleString("es-SV")}</p>
        </div>
        <div class="invoice-details">
            <p class="mb-1"><strong>Cliente:</strong> ${nombre}</p>
            <p class="mb-0"><strong>DUI:</strong> ${dui}</p>
        </div>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th class="text-center">Cant.</th>
                        <th class="text-end">P.Unit</th>
                        <th class="text-end">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${purchasedItems.map(i => `
                        <tr>
                            <td>${i.product.name}</td>
                            <td class="text-center">${i.qty}</td>
                            <td class="text-end">${fmt.format(i.product.price)}</td>
                            <td class="text-end">${fmt.format(i.subtotal)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="invoice-totals">
            <div class="d-flex justify-content-between">
                <span>Subtotal:</span>
                <strong>${fmt.format(subtotal)}</strong>
            </div>
            <div class="d-flex justify-content-between">
                <span>Impuesto (${taxRate}%):</span>
                <strong>${fmt.format(tax)}</strong>
            </div>
            <div class="d-flex justify-content-between fs-5 mt-2 border-top pt-2">
                <span>TOTAL:</span>
                <strong class="text-primary">${fmt.format(total)}</strong>
            </div>
        </div>
    `;
}

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("productos.json");
        if (!response.ok) throw new Error("Error loading products");
        
        const productsData = await response.json();
        products = productsData.map(p => new Product(p.id, p.name, p.price, p.stock, p.category || ""));
    } catch (error) {
        console.error("Error loading products:", error);
        products = [];
        showToast("Error cargando productos. Usando datos de ejemplo.", "warning");
        
        // Datos de ejemplo en caso de error
        products = [
            new Product(1, "Laptop HP Pavilion 15.6\"", 899.99, 10, "Computadoras"),
            new Product(2, "Mouse Inalámbrico Logitech", 25.50, 30, "Accesorios"),
            new Product(3, "Teclado Mecánico RGB", 75.00, 15, "Accesorios")
        ];
    }
    
    cart = new Cart();

    const productGrid = document.getElementById("productGrid");
    const cartBody = document.getElementById("cartTableBody");
    const lblSubtotal = document.getElementById("lblSubtotal");
    const lblTax = document.getElementById("lblTax");
    const lblTotal = document.getElementById("lblTotal");
    const taxSelect = document.getElementById("taxSelect");
    const cartCount = document.getElementById("cartCount");
    const searchBox = document.getElementById("searchBox");
    const priceMin = document.getElementById("priceMin");
    const priceMax = document.getElementById("priceMax");

    // Render productos
    function renderProducts(productosMostrar = products) {
        productGrid.innerHTML = "";
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageProducts = productosMostrar.slice(start, end);

        if (pageProducts.length === 0) {
            productGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search display-4 text-muted"></i>
                    <p class="mt-3 text-muted">No se encontraron productos</p>
                </div>
            `;
            document.getElementById("pagination").innerHTML = "";
            return;
        }

        for (const p of pageProducts) {
            const col = document.createElement("div");
            col.className = `col-12 col-md-6 col-xl-4 ${p.stock === 0 ? 'producto-agotado' : ''}`;
            const inCart = cart.items.find(i => i.product.id === p.id);

            col.innerHTML = `
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start">
                            <h6 class="card-title">${p.name}</h6>
                            <span class="badge bg-${p.stock === 0 ? 'danger' : 'secondary'}">Stock: ${p.stock}</span>
                        </div>
                        ${p.category ? `<span class="badge bg-info mb-2 align-self-start">${p.category}</span>` : ''}
                        <div class="mt-auto">
                            <div class="mb-2 fw-bold text-primary">${fmt.format(p.price)}</div>
                            <div class="input-group input-group-sm">
                                <span class="input-group-text">Cant.</span>
                                <input type="number" min="1" max="${p.stock}" class="form-control qty-input" id="qty-${p.id}" value="1" ${p.stock === 0 ? "disabled" : ""}>
                                <button class="btn btn-primary" data-id="${p.id}" ${p.stock === 0 ? "disabled" : ""}>
                                    <i class="bi bi-plus-lg"></i> Agregar
                                </button>
                                <button class="btn btn-danger" data-id="${p.id}" ${!inCart ? "disabled" : ""}>
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </div>
                            ${p.stock === 0 ? '<div class="form-text text-danger mt-1">Agotado</div>' : ""}
                        </div>
                    </div>
                </div>
            `;

            const btnAdd = col.querySelector(".btn-primary");
            const btnRemove = col.querySelector(".btn-danger");

            btnAdd.addEventListener("click", () => {
                const qtyInput = document.getElementById(`qty-${p.id}`);
                const qty = parseInt(qtyInput.value) || 1;
                
                if (qty > p.stock) { 
                    showToast("No hay suficiente stock", "danger"); 
                    return; 
                }
                if (qty <= 0) {
                    showToast("La cantidad debe ser mayor a 0", "warning");
                    return;
                }
                
                cart.add(p, qty);
                renderCart();
                renderProducts();
                qtyInput.value = 1; // Reset quantity
            });

            btnRemove.addEventListener("click", () => {
                cart.remove(p.id);
                renderCart();
                renderProducts();
            });

            productGrid.appendChild(col);
        }

        renderPagination(productosMostrar.length);
    }

    // Render paginación
    function renderPagination(totalItems) {
        const pagination = document.getElementById("pagination");
        pagination.innerHTML = "";
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (totalPages <= 1) return;
        
        // Botón anterior
        const liPrev = document.createElement("li");
        liPrev.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
        liPrev.innerHTML = `<a class="page-link" href="#">&laquo;</a>`;
        liPrev.addEventListener("click", e => { 
            e.preventDefault(); 
            if (currentPage > 1) {
                currentPage--; 
                renderProducts(); 
            }
        });
        pagination.appendChild(liPrev);
        
        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i === currentPage ? "active" : ""}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener("click", e => { 
                e.preventDefault(); 
                currentPage = i; 
                renderProducts(); 
            });
            pagination.appendChild(li);
        }
        
        // Botón siguiente
        const liNext = document.createElement("li");
        liNext.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
        liNext.innerHTML = `<a class="page-link" href="#">&raquo;</a>`;
        liNext.addEventListener("click", e => { 
            e.preventDefault(); 
            if (currentPage < totalPages) {
                currentPage++; 
                renderProducts(); 
            }
        });
        pagination.appendChild(liNext);
    }

    // Render carrito
    function renderCart() {
        cartBody.innerHTML = "";
        
        if (cart.items.length === 0) {
            cartBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-muted">
                        <i class="bi bi-cart-x display-4"></i>
                        <p class="mt-2">El carrito está vacío</p>
                    </td>
                </tr>
            `;
        } else {
            for (const item of cart.items) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${item.product.name}</td>
                    <td>
                        <input type="number" min="1" max="${item.product.stock}" 
                               value="${item.qty}" class="form-control form-control-sm w-50 mx-auto">
                    </td>
                    <td class="text-end">${fmt.format(item.product.price)}</td>
                    <td class="text-end">${fmt.format(item.subtotal)}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-danger">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                
                tr.querySelector("input").addEventListener("change", e => { 
                    const newQty = parseInt(e.target.value) || 1;
                    if (newQty > item.product.stock) {
                        showToast("No hay suficiente stock", "danger");
                        e.target.value = item.qty;
                        return;
                    }
                    cart.updateQty(item.product.id, newQty); 
                    renderCart(); 
                    updateCartIcon(); 
                });
                
                tr.querySelector("button").addEventListener("click", () => { 
                    cart.remove(item.product.id); 
                    renderCart(); 
                    renderProducts(); 
                    updateCartIcon(); 
                });
                
                cartBody.appendChild(tr);
            }
        }
        
        const subtotal = cart.subtotal();
        const taxRate = parseFloat(taxSelect.value);
        const tax = +(subtotal * taxRate).toFixed(2);
        const total = subtotal + tax;
        
        lblSubtotal.textContent = fmt.format(subtotal);
        lblTax.textContent = fmt.format(tax);
        lblTotal.textContent = fmt.format(total);
        updateCartIcon();
        document.getElementById("btnCheckout").disabled = cart.items.length === 0;
    }

    function updateCartIcon() { 
        const count = cart.count();
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? "block" : "none";
    }

    // Checkout / Factura
    document.getElementById("btnConfirmClient").addEventListener("click", () => {
        const nombre = document.getElementById("clienteNombre").value.trim();
        const dui = document.getElementById("clienteDui").value.trim();
        
        if (!nombre || !dui) { 
            showToast("Ingrese nombre y DUI", "danger"); 
            return; 
        }

        const purchasedItems = [...cart.items];
        if (purchasedItems.length === 0) {
            showToast("El carrito está vacío", "warning");
            return;
        }

        const subtotal = cart.subtotal();
        const taxRate = parseFloat(taxSelect.value);
        const tax = +(subtotal * taxRate).toFixed(2);
        const total = subtotal + tax;

        // Actualizar stock
        purchasedItems.forEach(item => { 
            const product = products.find(p => p.id === item.product.id); 
            if (product) product.stock -= item.qty; 
        });

        // Mostrar resumen HTML en el modal
        mostrarFacturaHTML(nombre, dui, purchasedItems, subtotal, tax, total);
        
        // Guardar datos para PDF
        currentPurchase = { nombre, dui, purchasedItems, subtotal, tax, total };
        
        // Limpiar el carrito
        cart.clear(); 
        renderCart(); 
        renderProducts();

        // Mostrar modal de factura
        new bootstrap.Modal(document.getElementById("invoiceModal")).show();
        // Cerrar modal de cliente
        bootstrap.Modal.getInstance(document.getElementById("clientModal")).hide();
    });

    // Botón para ver PDF desde el modal de factura
    document.getElementById("btnVerPDF").addEventListener("click", () => {
        if (!currentPurchase) {
            showToast("No hay datos de compra para mostrar", "warning");
            return;
        }
        
        const { nombre, dui, purchasedItems, subtotal, tax, total } = currentPurchase;
        
        // Visualizar PDF
        generarYVisualizarPDF(nombre, dui, purchasedItems, subtotal, tax, total);
        
        // Cerrar modal de factura
        bootstrap.Modal.getInstance(document.getElementById("invoiceModal")).hide();
    });

    // Filtros y búsqueda
    searchBox.addEventListener("input", filtrarProductos);
    priceMin.addEventListener("input", filtrarProductos);
    priceMax.addEventListener("input", filtrarProductos);

    function filtrarProductos() {
        const searchTerm = searchBox.value.toLowerCase();
        const minPrice = parseFloat(priceMin.value) || 0;
        const maxPrice = parseFloat(priceMax.value) || Number.MAX_SAFE_INTEGER;
        
        const productosFiltrados = products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) && 
            p.price >= minPrice && 
            p.price <= maxPrice
        );
        
        currentPage = 1;
        renderProducts(productosFiltrados);
    }

    // Cliente por defecto
    document.getElementById("clienteNombre").value = "Consumidor Final";
    document.getElementById("clienteDui").value = "00000000-0";

    taxSelect.addEventListener("change", renderCart);

    // Inicializar
    renderProducts();
    renderCart();
    document.getElementById("year").textContent = new Date().getFullYear();
});