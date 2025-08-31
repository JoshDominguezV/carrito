// app.js - carrito funcional con POO, modales Bootstrap y compatibilidad con GitHub Pages

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
class Product { constructor(id,name,price,stock){ Object.assign(this,{id,name,price,stock}); } }
class CartItem { constructor(product,qty){ Object.assign(this,{product,qty}); } get subtotal(){ return this.qty*this.product.price; } }
class Cart {
    constructor(){ this.items=this.load(); }
    load(){ return JSON.parse(localStorage.getItem("cart")||"[]").map(i=>new CartItem(new Product(i.product.id,i.product.name,i.product.price,i.product.stock),i.qty)); }
    save(){ localStorage.setItem("cart",JSON.stringify(this.items)); }
    clear(){ this.items=[]; this.save(); }
    count(){ return this.items.reduce((a,b)=>a+b.qty,0); }
    add(product,qty){
        const existing=this.items.find(i=>i.product.id===product.id);
        if(existing){ existing.qty+=qty; showToast(`Se agregó +${qty} de ${product.name}`,"success"); this.save(); return; }
        this.items.push(new CartItem(product,qty));
        showToast(`${product.name} agregado al carrito`,"success");
        this.save();
    }
    updateQty(productId,qty){ const it=this.items.find(i=>i.product.id===productId); if(!it)return; if(qty<=0){ this.remove(productId); } else{ it.qty=qty; this.save(); } }
    remove(productId){ const it=this.items.find(i=>i.product.id===productId); if(it) showToast(`${it.product.name} eliminado del carrito`,"warning"); this.items=this.items.filter(i=>i.product.id!==productId); this.save(); }
    subtotal(){ return this.items.reduce((s,i)=>s+i.subtotal,0); }
}

// Función para generar PDF de la factura 
function generarPDFFactura(nombre, dui, purchasedItems, subtotal, tax, total) {
    // Usar jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configuración
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let yPosition = margin;
    
    // Logo y encabezado
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text("TIENDA SUPERNOVA", pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text("Factura de Venta", pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    // Información de la factura
    doc.setFontSize(10);
    doc.text(`No. Factura: ${uid()}`, margin, yPosition);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-SV')}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 6;
    
    doc.text(`Cliente: ${nombre}`, margin, yPosition);
    yPosition += 6;
    
    doc.text(`DUI: ${dui}`, margin, yPosition);
    yPosition += 12;
    
    // Tabla de productos
    doc.setFont(undefined, 'bold');
    doc.text("Productos", margin, yPosition);
    yPosition += 6;
    
    // Configurar la tabla
    const tableColumn = ["Producto", "Cant.", "P. Unitario", "Total"];
    const tableRows = [];
    
    purchasedItems.forEach(item => {
        const productData = [
            item.product.name,
            item.qty,
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
        styles: { fontSize: 9 },
        headStyles: { fillColor: [13, 110, 253] }
    });
    
    // Obtener la posición final después de la tabla
    let finalY = doc.lastAutoTable.finalY + 10;
    
    // Totales
    doc.setFont(undefined, 'bold');
    doc.text("Subtotal:", pageWidth - 60, finalY);
    doc.text(fmt.format(subtotal), pageWidth - margin, finalY, { align: 'right' });
    finalY += 7;
    
    doc.text("Impuesto:", pageWidth - 60, finalY);
    doc.text(fmt.format(tax), pageWidth - margin, finalY, { align: 'right' });
    finalY += 7;
    
    doc.setFontSize(12);
    doc.text("TOTAL:", pageWidth - 60, finalY);
    doc.text(fmt.format(total), pageWidth - margin, finalY, { align: 'right' });
    finalY += 15;
    
    // Pie de página
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text("¡Gracias por su compra!", pageWidth / 2, finalY, { align: 'center' });
    finalY += 5;
    doc.text("Tienda Supernova - El Salvador", pageWidth / 2, finalY, { align: 'center' });
    
    // Descargar el PDF 
    doc.save(`factura-supernova-${new Date().getTime()}.pdf`);
}

// Función para mostrar factura como HTML (para GitHub Pages)
function mostrarFacturaHTML(nombre, dui, purchasedItems, subtotal, tax, total) {
    const fac = document.getElementById("facContent");
    fac.innerHTML = `
        <div class="invoice-header">
            <h5 class="mb-1">Factura #${uid()}</h5>
            <p class="mb-0">Fecha: ${new Date().toLocaleString("es-SV")}</p>
        </div>
        <div class="invoice-details">
            <p class="mb-1"><strong>Cliente:</strong> ${nombre}</p>
            <p class="mb-0"><strong>DUI:</strong> ${dui}</p>
        </div>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead><tr><th>Producto</th><th>Cant.</th><th>P.Unit</th><th>Total</th></tr></thead>
                <tbody>
                    ${purchasedItems.map(i => `
                        <tr>
                            <td>${i.product.name}</td>
                            <td>${i.qty}</td>
                            <td>${fmt.format(i.product.price)}</td>
                            <td>${fmt.format(i.subtotal)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="invoice-totals">
            <div class="d-flex justify-content-between"><span>Subtotal:</span><strong>${fmt.format(subtotal)}</strong></div>
            <div class="d-flex justify-content-between"><span>Impuesto:</span><strong>${fmt.format(tax)}</strong></div>
            <div class="d-flex justify-content-between fs-5 mt-2"><span>TOTAL:</span><strong>${fmt.format(total)}</strong></div>
        </div>
    `;
}

// Variables paginación
let currentPage = 1;
const itemsPerPage = 15;
let cart; // Variable global para el carrito

// Inicialización
document.addEventListener("DOMContentLoaded",async()=>{
    const products = await fetch("productos.json").then(r=>r.json()).catch(()=>[]);
    cart = new Cart();

    const productGrid = document.getElementById("productGrid");
    const cartBody = document.getElementById("cartTableBody");
    const lblSubtotal = document.getElementById("lblSubtotal");
    const lblTax = document.getElementById("lblTax");
    const lblTotal = document.getElementById("lblTotal");
    const taxSelect = document.getElementById("taxSelect");
    const cartCount = document.getElementById("cartCount");

    // Render productos
    function renderProducts(){
        productGrid.innerHTML="";
        const start=(currentPage-1)*itemsPerPage;
        const end=start+itemsPerPage;
        const pageProducts = products.slice(start,end);

        for(const p of pageProducts){
            const col=document.createElement("div");
            col.className=`col-12 col-md-6 col-xl-4 ${p.stock===0 ? 'producto-agotado' : ''}`;
            const inCart = cart.items.find(i=>i.product.id===p.id);

            col.innerHTML=`<div class="card h-100 border-0 shadow-sm">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6>${p.name}</h6>
                        <span class="badge bg-${p.stock===0 ? 'danger' : 'secondary'}">Stock: ${p.stock}</span>
                    </div>
                    <div class="mt-auto">
                        <div class="mb-2 fw-bold">${fmt.format(p.price)}</div>
                        <div class="input-group input-group-sm">
                            <span class="input-group-text">Cant.</span>
                            <input type="number" min="1" max="${p.stock}" class="form-control qty-input" id="qty-${p.id}" value="1" ${p.stock===0?"disabled":""}>
                            <button class="btn btn-primary me-1" data-id="${p.id}" ${p.stock===0?"disabled":""}><i class="bi bi-plus-lg"></i> Agregar</button>
                            <button class="btn btn-danger" data-id="${p.id}" ${!inCart?"disabled":""}><i class="bi bi-trash3-fill"></i></button>
                        </div>
                        ${p.stock===0?'<div class="form-text text-danger">Agotado</div>':""}
                    </div>
                </div>
            </div>`;

            const btnAdd = col.querySelector(".btn-primary");
            const btnRemove = col.querySelector(".btn-danger");

            btnAdd.addEventListener("click",()=>{
                const qty=parseInt(document.getElementById(`qty-${p.id}`).value)||1;
                if(qty>p.stock){ showToast("No hay suficiente stock","danger"); return; }
                cart.add(p,qty);
                renderCart();
                renderProducts();
            });

            btnRemove.addEventListener("click",()=>{
                cart.remove(p.id);
                renderCart();
                renderProducts();
            });

            productGrid.appendChild(col);
        }

        renderPagination();
    }

    // Render paginación
    function renderPagination(){
        const pagination = document.getElementById("pagination");
        pagination.innerHTML="";
        const totalPages = Math.ceil(products.length/itemsPerPage);
        for(let i=1;i<=totalPages;i++){
            const li=document.createElement("li");
            li.className=`page-item ${i===currentPage?"active":""}`;
            li.innerHTML=`<a class="page-link" href="#">${i}</a>`;
            li.addEventListener("click",e=>{ e.preventDefault(); currentPage=i; renderProducts(); });
            pagination.appendChild(li);
        }
    }

    // Render carrito
    function renderCart(){
        cartBody.innerHTML="";
        for(const item of cart.items){
            const tr=document.createElement("tr");
            tr.innerHTML=`<td>${item.product.name}</td>
                <td><input type="number" min="1" max="${item.product.stock}" value="${item.qty}" class="form-control form-control-sm w-50"></td>
                <td>${fmt.format(item.product.price)}</td>
                <td>${fmt.format(item.subtotal)}</td>
                <td><button class="btn btn-sm btn-danger">X</button></td>`;
            tr.querySelector("input").addEventListener("change",e=>{ const newQty=parseInt(e.target.value); cart.updateQty(item.product.id,newQty); renderCart(); renderProducts(); updateCartIcon(); });
            tr.querySelector("button").addEventListener("click",()=>{ cart.remove(item.product.id); renderCart(); renderProducts(); updateCartIcon(); });
            cartBody.appendChild(tr);
        }
        const subtotal = cart.subtotal();
        const taxRate = parseFloat(taxSelect.value);
        const tax = +(subtotal*taxRate).toFixed(2);
        const total = subtotal+tax;
        lblSubtotal.textContent = fmt.format(subtotal);
        lblTax.textContent = fmt.format(tax);
        lblTotal.textContent = fmt.format(total);
        updateCartIcon();
        document.getElementById("btnCheckout").disabled = cart.items.length===0;
    }

    function updateCartIcon(){ cartCount.textContent = cart.count(); }

    // Checkout / Factura
    document.getElementById("btnConfirmClient").addEventListener("click",()=>{
        const nombre=document.getElementById("clienteNombre").value.trim();
        const dui=document.getElementById("clienteDui").value.trim();
        if(!nombre||!dui){ showToast("Ingrese nombre y DUI","danger"); return; }

        const purchasedItems = [...cart.items];
        const subtotal = cart.subtotal();
        const taxRate = parseFloat(taxSelect.value);
        const tax = +(subtotal*taxRate).toFixed(2);
        const total = subtotal+tax;

        purchasedItems.forEach(i=>{ const prod=products.find(p=>p.id===i.product.id); if(prod) prod.stock-=i.qty; });

        // Mostrar factura como HTML (compatible con GitHub Pages)
        mostrarFacturaHTML(nombre, dui, purchasedItems, subtotal, tax, total);
        
        // Limpiar el carrito
        cart.clear(); 
        renderCart(); 
        renderProducts();

        new bootstrap.Modal(document.getElementById("invoiceModal")).show();
        bootstrap.Modal.getInstance(document.getElementById("clientModal")).hide();
    });

    // Botón para descargar PDF desde el modal de factura
    document.getElementById("btnImprimir").addEventListener("click", () => {
        const nombre = document.getElementById("clienteNombre").value || "Consumidor Final";
        const dui = document.getElementById("clienteDui").value || "00000000-0";
        const purchasedItems = cart.items.length > 0 ? [...cart.items] : [];
        const subtotal = cart.subtotal();
        const taxRate = parseFloat(taxSelect.value);
        const tax = +(subtotal * taxRate).toFixed(2);
        const total = subtotal + tax;
        
        // Descargar el PDF
        generarPDFFactura(nombre, dui, purchasedItems, subtotal, tax, total);
    });

    // Cliente por defecto
    document.getElementById("clienteNombre").value="Consumidor Final";
    document.getElementById("clienteDui").value="00000000-0";

    taxSelect.addEventListener("change",renderCart);

    renderProducts();
    renderCart();
    document.getElementById("year").textContent=new Date().getFullYear();
});