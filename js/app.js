// Formateador de moneda
const fmt = new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" });
const uid = () => Math.random().toString(36).slice(2, 9);

// Toast Bootstrap
function showToast(msg, type = "primary") {
    // Implementación simplificada
    console.log(`${type}: ${msg}`);
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

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
    const products = await fetch("productos.json").then(r => r.json()).catch(() => []);
    const cart = new Cart();
    
    console.log("Aplicación cargada con", products.length, "productos");
    console.log("Carrito:", cart.items);
});