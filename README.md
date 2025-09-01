# 🛒 Tienda Supernova - Carrito de Compras

Sistema de **carrito de compras** desarrollado en **JavaScript Vanilla** con **Programación Orientada a Objetos (POO)**, usando **Bootstrap 5** para una interfaz moderna y responsive.

---

## 🚀 Cómo Ejecutar la Aplicación

### 🔗 Opción 1: GitHub Pages (Recomendada)  
👉 [Acceder a la App](https://joshdominguezv.github.io/carrito/)

### 💻 Opción 2: Localmente  
1. Descargar o clonar el repositorio.  
2. Abrir `index.html` en cualquier navegador moderno.  
3. ¡Listo! No se requiere instalación adicional.  

---

## 📁 Estructura del Proyecto



carrito/
├── index.html        # Interfaz principal con Bootstrap 5
├── productos.json    # Base de datos de productos
├── css/
│   └── styles.css    # Estilos personalizados
└── js/
└── app.js        # Lógica principal con clases POO

`

---

## 🏗️ Arquitectura POO

### 📦 Clases Principales

**Product** – Modelo de productos:  
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
`

**CartItem** – Items del carrito:

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


**Cart** – Gestión del carrito:

javascript
class Cart {
    constructor() {
        this.items = this.load(); // Carga desde localStorage
    }
    add(product, quantity) { /* ... */ }
    remove(productId) { /* ... */ }
    save() { /* Persiste en localStorage */ }
}


---

## ⚡ Funcionalidades

* ✅ Catálogo dinámico de productos cargado desde JSON
* ✅ Carrito persistente en **localStorage**
* ✅ Cálculo automático de **subtotal, impuestos y total**
* ✅ Búsqueda y filtros por nombre y precio
* ✅ Generación de **facturas en PDF**
* ✅ Validación de stock en tiempo real
* ✅ Diseño **responsive** con Bootstrap 5

---

## 🛠️ Tecnologías Utilizadas

* **HTML5** → Estructura semántica
* **CSS3 + Bootstrap 5.3** → Estilos y diseño responsive
* **JavaScript ES6+** → Lógica con POO
* **LocalStorage** → Persistencia de datos
* **jsPDF** → Generación de facturas PDF

---

## 🔧 Configuración

### 📦 Modificar Productos

Editar el archivo `productos.json`:

json
{
  "id": 1,
  "name": "Producto Ejemplo",
  "price": 100.00,
  "stock": 50,
  "category": "Categoría"
}


### 💰 Cambiar Impuestos

En `index.html`, modificar el selector:

html
<select id="taxSelect">
    <option value="0.13">13% IVA</option>
    <option value="0.15">15%</option>
</select>


---

## 📞 Soporte

* 📂 Repositorio: [GitHub](https://github.com/JoshDominguezV/carrito)
* 🌍 Sitio Live: [GitHub Pages](https://joshdominguezv.github.io/carrito/)

---

✍️ Desarrollado por **Josue Domínguez**
🚀 Proyecto de **DPS941 - Universidad**


