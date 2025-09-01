 📋 README.md


 🛒 Tienda Supernova - Carrito de Compras

Sistema de carrito de compras desarrollado con JavaScript vanilla y Programación Orientada a Objetos (POO).

 🚀 Cómo Ejecutar la Aplicación

 Opción 1: GitHub Pages (Recomendada)
Acceder a: https://joshdominguezv.github.io/carrito/


 Opción 2: Localmente
1. Descargar/clonar todos los archivos
2. Abrir `index.html` en cualquier navegador moderno
3. ¡No se requiere instalación adicional!

 📁 Estructura del Proyecto


carrito/
├── index.html           Interfaz principal con Bootstrap 5
├── productos.json       Base de datos de productos (JSON)
├── css/
│   └── styles.css      Estilos personalizados
└── js/
    └── app.js          Lógica principal con clases POO


 🏗️ Arquitectura POO

 Clases Principales Implementadas

Product - Modelo de productos:
javascript
class Product {
    constructor(id, name, price, stock, category) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.category = category;
    }
}


CartItem - Items del carrito:
javascript
class CartItem {
    constructor(product, quantity) {
        this.product = product;
        this.quantity = quantity;
    }
    get subtotal() {
        return this.quantity * this.product.price;
    }
}


Cart - Gestión del carrito:
javascript
class Cart {
    constructor() {
        this.items = this.load(); // Carga desde localStorage
    }
    add(product, quantity) { /* ... */ }
    remove(productId) { /* ... */ }
    save() { /* Persiste en localStorage */ }
}


 ⚡ Funcionalidades

- ✅ Catálogo de productos con paginación
- ✅ Carrito persistente (localStorage)
- ✅ Cálculos automáticos (subtotal, impuestos, total)
- ✅ Búsqueda y filtros por nombre y precio
- ✅ Generación de facturas PDF
- ✅ Diseño responsive (Bootstrap 5)
- ✅ Validación de stock en tiempo real

 🛠️ Tecnologías Utilizadas

- HTML5 - Estructura semántica
- CSS3 + Bootstrap 5.3 - Estilos y diseño
- JavaScript ES6+ - Lógica con POO
- LocalStorage - Persistencia de datos
- jsPDF - Generación de facturas PDF

 🔧 Configuración

 Modificar Productos
Editar `productos.json`:
json
{
    "id": 1,
    "name": "Producto Ejemplo",
    "price": 100.00,
    "stock": 50,
    "category": "Categoría"
}


 Cambiar Impuestos
En `index.html`, modificar el selector:
html
<select id="taxSelect">
    <option value="0.13">13% IVA</option>
    <option value="0.15">15%</option>
</select>


 📞 Soporte

- Repositorio: https://github.com/JoshDominguezV/carrito
- Sitio Live: https://joshdominguezv.github.io/carrito/

---
Desarrollado por Josue Domínguez - 🚀 Proyecto de DPS941

