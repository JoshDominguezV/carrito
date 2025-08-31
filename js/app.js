// Formateador de moneda
const fmt = new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" });

// Clases básicas
class Product { 
  constructor(id, name, price, stock){ 
    Object.assign(this, {id, name, price, stock}); 
  } 
}

class CartItem { 
  constructor(product, qty){ 
    Object.assign(this, {product, qty}); 
  } 
  
  get subtotal(){ 
    return this.qty * this.product.price; 
  } 
}

class Cart {
  constructor(){ 
    this.items = [];
  }
  
  add(product, qty){
    const existing = this.items.find(i => i.product.id === product.id);
    if(existing){ 
      existing.qty += qty; 
    } else {
      this.items.push(new CartItem(product, qty));
    }
  }
}