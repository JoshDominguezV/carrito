# 🛒 Tienda Supernova - Sistema de Carrito de Compras

## 📋 Descripción del Proyecto

Tienda Supernova es un sistema para comercio electrónico desarrollado con JavaScript utilizando Programación Orientada a Objetos (POO). El sistema incluye un catálogo de productos, carrito de compras persistente, sistema de facturación y una interfaz responsive construida con Bootstrap 5.


## 📞 Repositorio y Demo

- **Repositorio GitHub**: [https://github.com/JoshDominguezV/carrito](https://github.com/JoshDominguezV/carrito)
- **Demo en Vivo**: [https://joshdominguezv.github.io/carrito/](https://joshdominguezv.github.io/carrito/)

## 🚀 Cómo Ejecutar la Aplicación

### Opción 1: GitHub Pages (Recomendada)
Acceder a: [https://joshdominguezv.github.io/carrito/](https://joshdominguezv.github.io/carrito/)

### Opción 2: Ejecución Local
1. Descargar o clonar todos los archivos del proyecto
2. Asegurarse de que todos los archivos estén en la misma carpeta:
   - `index.html`
   - `productos.json` 
   - `css/styles.css`
   - `js/app.js`
3. Abrir `index.html` en cualquier navegador moderno
4. No se requiere instalación adicional o servidor web

## 📁 Estructura del Proyecto

```
carrito/
├── index.html          # Interfaz principal con Bootstrap 5
├── productos.json      # Base de datos de productos en formato JSON
├── css/
│   └── styles.css     # Estilos personalizados y complementarios
└── js/
    └── app.js         # Lógica principal con implementación POO
```

## 🏗️ Arquitectura y Explicación de app.js

### Configuración Inicial y Utilidades

```javascript
// Formateador de moneda para valores en dólares
const fmt = new Intl.NumberFormat("es-SV", { 
    style: "currency", 
    currency: "USD" 
});

// Generador de IDs únicos para facturas
const uid = () => Math.random().toString(36).slice(2, 9);

// Sistema de notificaciones Toast
function showToast(msg, type = "primary") {
    const el = document.getElementById("toast");
    if (el) {
        document.getElementById("toastMsg").textContent = msg;
        el.className = `toast align-items-center text-bg-${type} border-0`;
        bootstrap.Toast.getOrCreateInstance(el).show();
    }
}
```

### Sistema de Clases POO

#### Clase Product - Modelo de Productos
```javascript
class Product {
    constructor(id, name, price, stock) {
        this.id = parseInt(id);          // Convertir a número
        this.name = name;                // Nombre del producto
        this.price = parseFloat(price);  // Precio (convertido a decimal)
        this.stock = parseInt(stock);    // Stock disponible (convertido a entero)
    }
}
```

#### Clase CartItem - Items del Carrito
```javascript
class CartItem {
    constructor(product, qty) {
        this.product = product;      // Objeto Producto completo
        this.qty = qty;              // Cantidad seleccionada
    }
    
    // Getter que calcula el subtotal automáticamente
    get subtotal() {
        return this.qty * this.product.price;
    }
}
```

#### Clase Cart - Gestión Completa del Carrito
```javascript
class Cart {
    constructor() {
        this.items = this.load();    // Cargar desde localStorage al iniciar
    }
    
    // Cargar carrito desde localStorage
    load() {
        const cartData = localStorage.getItem("cart");
        if (!cartData) return [];
        
        return JSON.parse(cartData).map(item => 
            new CartItem(
                new Product(
                    item.product.id,
                    item.product.name, 
                    item.product.price,
                    item.product.stock
                ),
                item.qty
            )
        );
    }
    
    // Guardar carrito en localStorage
    save() {
        localStorage.setItem("cart", JSON.stringify(this.items));
    }
    
    // Vaciar carrito completamente
    clear() {
        this.items = [];
        this.save();
    }
    
    // Contar total de items en el carrito
    count() {
        return this.items.reduce((total, item) => total + item.qty, 0);
    }
    
    // Agregar producto al carrito
    add(product, qty) {
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
    
    // Actualizar cantidad de un producto
    updateQty(productId, qty) {
        const item = this.items.find(i => i.product.id === productId);
        if (!item) return;
        
        if (qty <= 0) {
            this.remove(productId);
        } else {
            item.qty = qty;
            this.save();
        }
    }
    
    // Eliminar producto del carrito
    remove(productId) {
        const item = this.items.find(i => i.product.id === productId);
        if (item) {
            showToast(`${item.product.name} eliminado del carrito`, "warning");
        }
        this.items = this.items.filter(i => i.product.id !== productId);
        this.save();
    }
    
    // Calcular subtotal del carrito
    subtotal() {
        return this.items.reduce((total, item) => total + item.subtotal, 0);
    }
}
```

### Variables Globales y Configuración

```javascript
// Variables de estado global
let currentPage = 1;                 // Página actual de productos
const itemsPerPage = 15;             // Productos por página
let cart;                            // Instancia del carrito
let products = [];                   // Array de productos cargados
let currentPurchase = null;          // Datos de la compra actual para facturación
```

### Funcionalidades Principales

#### 1. Gestión de Productos y Renderizado

```javascript
// Función principal para renderizar productos
function renderProducts(productosMostrar = products) {
    const productGrid = document.getElementById("productGrid");
    productGrid.innerHTML = "";
    
    // Calcular rango de productos para la página actual
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageProducts = productosMostrar.slice(start, end);
    
    // Renderizar cada producto
    pageProducts.forEach(p => {
        const col = document.createElement("div");
        col.className = `col-12 col-md-6 col-xl-4 ${p.stock === 0 ? 'producto-agotado' : ''}`;
        
        // Verificar si el producto ya está en el carrito
        const inCart = cart.items.find(i => i.product.id === p.id);
        
        // Crear HTML del producto
        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6 class="card-title">${p.name}</h6>
                        <span class="badge bg-${p.stock === 0 ? 'danger' : 'secondary'}">Stock: ${p.stock}</span>
                    </div>
                    <div class="mt-auto">
                        <div class="mb-2 fw-bold text-primary">${fmt.format(p.price)}</div>
                        <div class="input-group input-group-sm">
                            <span class="input-group-text">Cant.</span>
                            <input type="number" min="1" max="${p.stock}" 
                                   class="form-control qty-input" id="qty-${p.id}" 
                                   value="1" ${p.stock === 0 ? "disabled" : ""}>
                            <button class="btn btn-primary" data-id="${p.id}" 
                                    ${p.stock === 0 ? "disabled" : ""}>
                                <i class="bi bi-plus-lg"></i> Agregar
                            </button>
                            <button class="btn btn-danger" data-id="${p.id}" 
                                    ${!inCart ? "disabled" : ""}>
                                <i class="bi bi-trash3"></i>
                            </button>
                        </div>
                        ${p.stock === 0 ? '<div class="form-text text-danger mt-1">Agotado</div>' : ""}
                    </div>
                </div>
            </div>
        `;
        
        // Agregar event listeners para los botones
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
            qtyInput.value = 1;
        });
        
        btnRemove.addEventListener("click", () => {
            cart.remove(p.id);
            renderCart();
            renderProducts();
        });
        
        productGrid.appendChild(col);
    });
    
    renderPagination(productosMostrar.length);
}
```

#### 2. Sistema de Paginación

```javascript
function renderPagination(totalItems) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return;
    
    // Botón Anterior
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
    
    // Botón Siguiente
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
}
```

#### 3. Gestión del Carrito

```javascript
function renderCart() {
    const cartBody = document.getElementById("cartTableBody");
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
        cart.items.forEach(item => {
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
            
            // Event listener para cambiar cantidad
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
            
            // Event listener para eliminar item
            tr.querySelector("button").addEventListener("click", () => {
                cart.remove(item.product.id);
                renderCart();
                renderProducts();
                updateCartIcon();
            });
            
            cartBody.appendChild(tr);
        });
    }
    
    // Actualizar totales
    const subtotal = cart.subtotal();
    const taxRate = parseFloat(document.getElementById("taxSelect").value);
    const tax = +(subtotal * taxRate).toFixed(2);
    const total = subtotal + tax;
    
    document.getElementById("lblSubtotal").textContent = fmt.format(subtotal);
    document.getElementById("lblTax").textContent = fmt.format(tax);
    document.getElementById("lblTotal").textContent = fmt.format(total);
    updateCartIcon();
    document.getElementById("btnCheckout").disabled = cart.items.length === 0;
}

function updateCartIcon() {
    const count = cart.count();
    document.getElementById("cartCount").textContent = count;
    document.getElementById("cartCount").style.display = count > 0 ? "block" : "none";
}
```

#### 4. Sistema de Facturación y PDF

```javascript
// Función para generar y visualizar PDF
function generarYVisualizarPDF(nombre, dui, purchasedItems, subtotal, tax, total) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configuración del documento
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let yPosition = margin;
    
    // Encabezado
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
    
    // Configurar y generar tabla
    const tableColumn = ["Producto", "Cant.", "P. Unitario", "Total"];
    const tableRows = purchasedItems.map(item => [
        item.product.name.substring(0, 30),
        item.qty.toString(),
        fmt.format(item.product.price),
        fmt.format(item.subtotal)
    ]);
    
    doc.autoTable({
        startY: yPosition,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { 
            fillColor: [13, 110, 253],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        }
    });
    
    // ... (continuación con totales y pie de página)
}

// Función para mostrar factura en HTML
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
```

#### 5. Inicialización de la Aplicación

```javascript
// Función principal que se ejecuta al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Cargar productos desde el JSON
        const response = await fetch("productos.json");
        if (!response.ok) throw new Error("Error loading products");
        
        const productsData = await response.json();
        products = productsData.map(p => new Product(p.id, p.name, p.price, p.stock));
    } catch (error) {
        console.error("Error loading products:", error);
        products = [];
        showToast("Error cargando productos. Usando datos de ejemplo.", "warning");
        
        // Datos de ejemplo en caso de error
        products = [
            new Product("1", "Laptop Gaming", 899.99, 15),
            new Product("2", "Mouse RGB", 25.50, 30),
            new Product("3", "Teclado Mecánico", 75.00, 20)
        ];
    }
    
    // Inicializar carrito
    cart = new Cart();
    
    // Configurar event listeners
    document.getElementById("taxSelect").addEventListener("change", renderCart);
    document.getElementById("searchBox").addEventListener("input", filtrarProductos);
    document.getElementById("priceMin").addEventListener("input", filtrarProductos);
    document.getElementById("priceMax").addEventListener("input", filtrarProductos);
    
    // Configurar botones de facturación
    document.getElementById("btnConfirmClient").addEventListener("click", procesarCompra);
    document.getElementById("btnVerPDF").addEventListener("click", mostrarPDF);
    
    // Valores por defecto
    document.getElementById("clienteNombre").value = "Consumidor Final";
    document.getElementById("clienteDui").value = "00000000-0";
    document.getElementById("year").textContent = new Date().getFullYear();
    
    // Renderizar inicialmente
    renderProducts();
    renderCart();
});

// Función para filtrar productos
function filtrarProductos() {
    const searchTerm = document.getElementById("searchBox").value.toLowerCase();
    const minPrice = parseFloat(document.getElementById("priceMin").value) || 0;
    const maxPrice = parseFloat(document.getElementById("priceMax").value) || Number.MAX_SAFE_INTEGER;
    
    const productosFiltrados = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) && 
        p.price >= minPrice && 
        p.price <= maxPrice
    );
    
    currentPage = 1;
    renderProducts(productosFiltrados);
}

// Función para procesar la compra
function procesarCompra() {
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
    const taxRate = parseFloat(document.getElementById("taxSelect").value);
    const tax = +(subtotal * taxRate).toFixed(2);
    const total = subtotal + tax;
    
    // Actualizar stock
    purchasedItems.forEach(item => {
        const product = products.find(p => p.id === item.product.id);
        if (product) product.stock -= item.qty;
    });
    
    // Mostrar factura
    mostrarFacturaHTML(nombre, dui, purchasedItems, subtotal, tax, total);
    currentPurchase = { nombre, dui, purchasedItems, subtotal, tax, total };
    
    // Limpiar carrito y actualizar
    cart.clear();
    renderCart();
    renderProducts();
    
    // Mostrar modal de factura
    new bootstrap.Modal(document.getElementById("invoiceModal")).show();
    bootstrap.Modal.getInstance(document.getElementById("clientModal")).hide();
}

// Función para mostrar PDF
function mostrarPDF() {
    if (!currentPurchase) {
        showToast("No hay datos de compra para mostrar", "warning");
        return;
    }
    
    const { nombre, dui, purchasedItems, subtotal, tax, total } = currentPurchase;
    generarYVisualizarPDF(nombre, dui, purchasedItems, subtotal, tax, total);
    bootstrap.Modal.getInstance(document.getElementById("invoiceModal")).hide();
}
```

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica del documento
- **CSS3 con Bootstrap 5.3** - Framework de estilos y componentes UI
- **JavaScript ES6+** - Lógica de aplicación con Programación Orientada a Objetos
- **LocalStorage API** - Persistencia de datos del carrito
- **jsPDF + AutoTable** - Generación de documentos PDF profesionales
- **Fetch API** - Carga asíncrona de datos de productos
- **Bootstrap Icons** - Biblioteca de iconos modernos

## ⚡ Características Destacadas

1. **Arquitectura POO Sólida**: Implementación limpia con clases bien definidas
2. **Persistencia de Datos**: El carrito se mantiene entre sesiones gracias a localStorage
3. **Interfaz Responsive**: Diseño adaptable a todos los dispositivos
4. **Validación en Tiempo Real**: Control de stock y validación de entradas
5. **Sistema de Facturación**: Generación de PDFs profesionales con totales calculados
6. **Búsqueda y Filtros**: Sistema avanzado de búsqueda y filtrado por precio
7. **Feedback al Usuario**: Notificaciones toast para todas las acciones importantes

## 🔧 Personalización

### Modificar Productos
Editar el archivo `productos.json`:
```json
[
  {"id": "1", "name": "Laptop Gaming", "price": 899.99, "stock": 15},
  {"id": "2", "name": "Mouse RGB", "price": 25.50, "stock": 30},
  {"id": "3", "name": "Teclado Mecánico", "price": 75.00, "stock": 20}
]
```

### Configurar Impuestos
Modificar las opciones en `index.html`:
```html
<select id="taxSelect" class="form-select form-select-sm">
    <option value="0">0%</option>
    <option value="0.13" selected>13% IVA</option>
    <option value="0.15">15%</option>
    <option value="0.18">18%</option>
</select>
```

## 📞 Repositorio y Demo

- **Repositorio GitHub**: [https://github.com/JoshDominguezV/carrito](https://github.com/JoshDominguezV/carrito)
- **Demo en Vivo**: [https://joshdominguezv.github.io/carrito/](https://joshdominguezv.github.io/carrito/)

---

**Desarrollado por Josue Domínguez** - 🚀 Proyecto DPS941