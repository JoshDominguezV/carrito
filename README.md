# 🛒 Tienda Supernova - Carrito de Compras

Sistema de carrito de compras desarrollado con JavaScript vanilla y Programación Orientada a Objetos.

## 🚀 Cómo Ejecutar

**Opción 1 (Online):**  
[https://joshdominguezv.github.io/carrito/](https://joshdominguezv.github.io/carrito/)

**Opción 2 (Local):**  
1. Descargar todos los archivos
2. Abrir `index.html` en cualquier navegador
3. Listo - no requiere instalación

## 📁 Estructura del Proyecto

```
carrito/
├── index.html          # Interfaz principal
├── productos.json      # Base de datos de productos
├── css/
│   └── styles.css     # Estilos personalizados
└── js/
    └── app.js         # Lógica principal con POO
```

## 🏗️ Arquitectura POO

### Clase Product
```javascript
class Product {
    constructor(id, name, price, stock) {
        this.id = parseInt(id);
        this.name = name;
        this.price = parseFloat(price);
        this.stock = parseInt(stock);
    }
}
```

### Clase CartItem
```javascript
class CartItem {
    constructor(product, quantity) {
        this.product = product;
        this.quantity = quantity;
    }
    get subtotal() {
        return this.quantity * this.product.price;
    }
}
```

### Clase Cart
```javascript
class Cart {
    constructor() {
        this.items = this.load();
    }
    add(product, quantity) { /* ... */ }
    remove(productId) { /* ... */ }
    save() { /* Persiste en localStorage */ }
}
```

## ⚡ Funcionalidades

- ✅ **Catálogo de productos** con paginación
- ✅ **Carrito persistente** en localStorage
- ✅ **Cálculos automáticos** (subtotal, impuestos, total)
- ✅ **Búsqueda y filtros** por nombre y precio
- ✅ **Generación de facturas** PDF
- ✅ **Diseño responsive** con Bootstrap 5
- ✅ **Validación de stock** en tiempo real

## 🛠️ Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** + **Bootstrap 5.3** - Estilos y diseño
- **JavaScript ES6+** - Lógica con POO
- **LocalStorage** - Persistencia de datos
- **jsPDF** - Generación de facturas PDF

## 🔧 Configuración

### Modificar productos (productos.json):
```json
[
  {"id": "1", "name": "Laptop Gaming", "price": 899.99, "stock": 15},
  {"id": "2", "name": "Mouse RGB", "price": 25.50, "stock": 30}
]
```

### Cambiar impuestos (en index.html):
```html
<select id="taxSelect">
    <option value="0.13">13% IVA</option>
    <option value="0.15">15%</option>
</select>
```

## 📞 Repositorio

**[github.com/JoshDominguezV/carrito](https://github.com/JoshDominguezV/carrito)**

---

**Desarrollado por Josue Domínguez** - Proyecto DPS941