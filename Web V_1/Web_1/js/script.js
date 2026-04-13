// ==========================================
// LÓGICA BÁSICA FUNCIONAL
// ==========================================

let carrito = [];

document.addEventListener('DOMContentLoaded', () => {

    // ==========================
    // CATÁLOGO SIMPLE
    // ==========================
    const productos = [
        {
            nombre: "Arduino Uno",
            precio: 45,
            img: "../img/arduino.jpg"
        },
        {
            nombre: "Sensor Ultrasónico",
            precio: 20,
            img: "../img/sensorultra.jpg"
        },
        {
            nombre: "Protoboard",
            precio: 15,
            img: "../img/protoboard.webp"
        }
    ];

    function renderProductos() {
        const grid = document.getElementById("grid-productos");
        if (!grid) return;

        grid.innerHTML = "";

        productos.forEach(p => {
            grid.innerHTML += `
                <div class="producto-card">
                    <img src="${p.img}" alt="${p.nombre}">
                    <h3>${p.nombre}</h3>
                    <p>S/ ${p.precio}</p>
                    <button class="btn-comprar"
                        data-nombre="${p.nombre}"
                        data-precio="${p.precio}">
                        Agregar
                    </button>
                </div>
            `;
        });

        activarBotones();
    }

    function activarBotones() {
        document.querySelectorAll(".btn-comprar").forEach(btn => {
            btn.addEventListener("click", () => {

                const nombre = btn.dataset.nombre;
                const precio = parseFloat(btn.dataset.precio);

                const existente = carrito.find(p => p.nombre === nombre);

                if (existente) {
                    existente.cantidad++;
                } else {
                    carrito.push({ nombre, precio, cantidad: 1 });
                }

                renderCarrito();
                actualizarContador();
            });
        });
    }
    // ==========================
// CHECKOUT (CONEXIÓN)
// ==========================
const btnComprar = document.getElementById("btn-comprar");

if (btnComprar) {
    btnComprar.addEventListener("click", () => {

        console.log("CLICK DETECTADO"); // prueba

        const checkout = document.getElementById("checkout");
        const panelCarrito = document.getElementById("carrito-panel");
        const checkoutItems = document.getElementById("checkout-items");
        const checkoutTotal = document.getElementById("checkout-total");

        if (!checkout || !panelCarrito) return;

        if (carrito.length === 0) {
            alert("Carrito vacío");
            return;
        }

        // Mostrar checkout
        panelCarrito.classList.add("oculto");
        checkout.classList.remove("oculto");

        // Renderizar productos
        checkoutItems.innerHTML = "";
        let total = 0;

        carrito.forEach(p => {
            const sub = p.precio * p.cantidad;
            total += sub;

            checkoutItems.innerHTML += `
                <div>${p.nombre} x${p.cantidad} - S/ ${sub}</div>
            `;
        });

        checkoutTotal.innerText = total.toFixed(2);
    });
}

    // ==========================
    // CARRITO
    // ==========================
    function renderCarrito() {
        const contenedor = document.getElementById("carrito-items");
        const totalEl = document.getElementById("total");

        if (!contenedor || !totalEl) return;

        if (carrito.length === 0) {
            contenedor.innerHTML = '<p>El carrito está vacío</p>';
            totalEl.innerText = "0.00";
            return;
        }

        contenedor.innerHTML = "";
        let total = 0;

        carrito.forEach(p => {
            const sub = p.precio * p.cantidad;
            total += sub;

            contenedor.innerHTML += `
                <div>${p.nombre} x${p.cantidad} - S/ ${sub}</div>
            `;
        });

        totalEl.innerText = total.toFixed(2);
    }

    function actualizarContador() {
        const contador = document.getElementById("contador-carrito");
        if (!contador) return;

        const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);
        contador.innerText = totalItems;
    }

    // ==========================
    // PANEL CARRITO
    // ==========================
    const btnToggleCarrito = document.getElementById('btn-toggle-carrito');
    const panelCarrito = document.getElementById('carrito-panel');

    if (btnToggleCarrito && panelCarrito) {
        btnToggleCarrito.addEventListener('click', (e) => {
            e.preventDefault();
            panelCarrito.classList.toggle('oculto');
        });
    }

document.addEventListener('DOMContentLoaded', () => {

    // ==========================
    // CATÁLOGO SIMPLE
    // ==========================
    const productos = [
        {
            nombre: "Arduino Uno",
            precio: 45,
            img: "../img/arduino.jpg"
        },
        {
            nombre: "Sensor Ultrasónico",
            precio: 20,
            img: "../img/sensorultra.jpg"
        },
        {
            nombre: "Protoboard",
            precio: 15,
            img: "../img/protoboard.webp"
        }
    ];

    function renderProductos() {
        const grid = document.getElementById("grid-productos");
        if (!grid) return;

        grid.innerHTML = "";

        productos.forEach(p => {
            grid.innerHTML += `
                <div class="producto-card">
                    <img src="${p.img}" alt="${p.nombre}">
                    <h3>${p.nombre}</h3>
                    <p>S/ ${p.precio}</p>
                    <button class="btn-comprar"
                        data-nombre="${p.nombre}"
                        data-precio="${p.precio}">
                        Agregar
                    </button>
                </div>
            `;
        });

        activarBotones();
    }

    function activarBotones() {
        document.querySelectorAll(".btn-comprar").forEach(btn => {
            btn.addEventListener("click", () => {

                const nombre = btn.dataset.nombre;
                const precio = parseFloat(btn.dataset.precio);

                const existente = carrito.find(p => p.nombre === nombre);

                if (existente) {
                    existente.cantidad++;
                } else {
                    carrito.push({ nombre, precio, cantidad: 1 });
                }

                renderCarrito();
                actualizarContador();
            });
        });
    }
    // ==========================
// CHECKOUT
// ==========================
const btnComprar = document.getElementById("btn-comprar");
const btnVolver = document.getElementById("btn-volver");
const btnConfirmar = document.getElementById("btn-confirmar");

if (btnComprar) {
    btnComprar.addEventListener("click", () => {

        if (carrito.length === 0) {
            alert("Carrito vacío");
            return;
        }

        const checkout = document.getElementById("checkout");
        const checkoutItems = document.getElementById("checkout-items");
        const checkoutTotal = document.getElementById("checkout-total");

        panelCarrito.classList.add("oculto");
        checkout.classList.remove("oculto");

        checkoutItems.innerHTML = "";

        let total = 0;

        carrito.forEach(p => {
            const sub = p.precio * p.cantidad;
            total += sub;

            checkoutItems.innerHTML += `
                <div>${p.nombre} x${p.cantidad} - S/ ${sub}</div>
            `;
        });

        checkoutTotal.innerText = total.toFixed(2);
    });
}

if (btnVolver) {
    btnVolver.addEventListener("click", () => {
        document.getElementById("checkout").classList.add("oculto");
        panelCarrito.classList.remove("oculto");
    });
}

if (btnConfirmar) {
    btnConfirmar.addEventListener("click", () => {

        alert("Compra realizada");

        carrito = [];

        renderCarrito();
        actualizarContador();

        document.getElementById("checkout").classList.add("oculto");
    });
}

    // ==========================
    // CARRITO
    // ==========================
    function renderCarrito() {
        const contenedor = document.getElementById("carrito-items");
        const totalEl = document.getElementById("total");

        if (!contenedor || !totalEl) return;

        if (carrito.length === 0) {
            contenedor.innerHTML = '<p>El carrito está vacío</p>';
            totalEl.innerText = "0.00";
            return;
        }

        contenedor.innerHTML = "";
        let total = 0;

        carrito.forEach(p => {
            const sub = p.precio * p.cantidad;
            total += sub;

            contenedor.innerHTML += `
                <div>${p.nombre} x${p.cantidad} - S/ ${sub}</div>
            `;
        });

        totalEl.innerText = total.toFixed(2);
    }

    function actualizarContador() {
        const contador = document.getElementById("contador-carrito");
        if (!contador) return;

        const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);
        contador.innerText = totalItems;
    }

    // ==========================
    // PANEL CARRITO
    // ==========================
    const btnToggleCarrito = document.getElementById('btn-toggle-carrito');
    const panelCarrito = document.getElementById('carrito-panel');

    if (btnToggleCarrito && panelCarrito) {
        btnToggleCarrito.addEventListener('click', (e) => {
            e.preventDefault();
            panelCarrito.classList.toggle('oculto');
        });
    }

    // ==========================
    // INICIALIZACIÓN
    // ==========================
    renderProductos();
    renderCarrito();
    actualizarContador();

});

    // ==========================
    // INICIALIZACIÓN
    // ==========================
    renderProductos();
    renderCarrito();
    actualizarContador();

});