// app.js - carrito funcional con POO y modales Bootstrap

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

// Variables paginación
let currentPage = 1;
const itemsPerPage = 15;

// Inicialización
document.addEventListener("DOMContentLoaded",async()=>{
    const products = await fetch("productos.json").then(r=>r.json()).catch(()=>[]);
    const cart = new Cart();

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
            col.className="col-12 col-md-6 col-xl-4";
            const inCart = cart.items.find(i=>i.product.id===p.id);

            col.innerHTML=`<div class="card h-100 border-0 shadow-sm">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6>${p.name}</h6>
                        <span class="badge bg-secondary">Stock: ${p.stock}</span>
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

        cart.clear(); renderCart(); renderProducts();

        const fac = document.getElementById("facContent");
        fac.innerHTML=`<div class="mb-3">
            <strong>Factura #${uid()}</strong><br>
            Cliente: ${nombre}<br>
            DUI: ${dui}<br>
            Fecha: ${new Date().toLocaleString("es-SV")}
        </div>
        <table class="table table-sm">
            <thead><tr><th>Producto</th><th>Cant.</th><th>P.Unit</th><th>Total</th></tr></thead>
            <tbody>${purchasedItems.map(i=>`<tr><td>${i.product.name}</td><td>${i.qty}</td><td>${fmt.format(i.product.price)}</td><td>${fmt.format(i.subtotal)}</td></tr>`).join("")}</tbody>
        </table>
        <div class="text-end fw-bold">Subtotal: ${fmt.format(subtotal)}</div>
        <div class="text-end fw-bold">Impuesto: ${fmt.format(tax)}</div>
        <div class="text-end fs-5">Total: ${fmt.format(total)}</div>`;

        new bootstrap.Modal(document.getElementById("invoiceModal")).show();
        bootstrap.Modal.getInstance(document.getElementById("clientModal")).hide();
    });

    // Cliente por defecto
    document.getElementById("clienteNombre").value="Consumidor Final";
    document.getElementById("clienteDui").value="00000000-0";

    taxSelect.addEventListener("change",renderCart);

    renderProducts();
    renderCart();
    document.getElementById("year").textContent=new Date().getFullYear();
});