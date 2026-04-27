document.addEventListener('DOMContentLoaded', () => {

            const track = document.getElementById('carousel-track');
            const btnPrev = document.getElementById('btn-prev');
            const btnNext = document.getElementById('btn-next');
            const slides = document.querySelectorAll('.carousel-slide');
            let currentIndex = 0;
            let carouselInterval;

            function updateCarousel() {
                if (!track) return;
                const amountToMove = currentIndex * 100;
                track.style.transform = `translateX(-${amountToMove}%)`;
            }

            function moveNext() {
                currentIndex = (currentIndex < slides.length - 1) ? currentIndex + 1 : 0;
                updateCarousel();
            }

            function movePrev() {
                currentIndex = (currentIndex > 0) ? currentIndex - 1 : slides.length - 1;
                updateCarousel();
            }

            function iniciarCarrusel() {
                carouselInterval = setInterval(moveNext, 5000); // Rota cada 5 segundos
            }

            function resetearCarrusel() {
                clearInterval(carouselInterval);
                iniciarCarrusel();
            }

            if (btnNext && btnPrev && slides.length > 0) {
                btnNext.addEventListener('click', () => {
                    moveNext();
                    resetearCarrusel();
                });
                btnPrev.addEventListener('click', () => {
                    movePrev();
                    resetearCarrusel();
                });
                iniciarCarrusel();
            }

            const btnAbrirModalNav = document.getElementById('btn-abrir-politicas');
            const btnAbrirModalFooter = document.getElementById('btn-abrir-politicas-footer');
            const modalPoliticas = document.getElementById('modal-politicas');

            const abrirAccion = (e) => { e.preventDefault(); if (modalPoliticas) modalPoliticas.classList.remove('oculto'); };
            if (btnAbrirModalNav) btnAbrirModalNav.addEventListener('click', abrirAccion);
            if (btnAbrirModalFooter) btnAbrirModalFooter.addEventListener('click', abrirAccion);

            if (document.getElementById('btn-cerrar-modal')) {
                const cerrarAccion = () => modalPoliticas.classList.add('oculto');
                document.getElementById('btn-cerrar-modal').addEventListener('click', cerrarAccion);
                document.getElementById('btn-entendido').addEventListener('click', cerrarAccion);
            }

            const showcaseTrack = document.getElementById('showcase-track');
            const btnShowcasePrev = document.getElementById('showcase-prev');
            const btnShowcaseNext = document.getElementById('showcase-next');
            let showcaseSlides = [];
            let currentShowcaseIndex = 0;

            function updateShowcase() {
                if (!showcaseTrack || showcaseSlides.length === 0) return;
                const moveAmount = currentShowcaseIndex * 100;
                showcaseTrack.style.transform = `translateX(-${moveAmount}%)`;
            }

            if (btnShowcaseNext && btnShowcasePrev) {
                btnShowcaseNext.addEventListener('click', () => {
                    if (showcaseSlides.length === 0) return;
                    currentShowcaseIndex = (currentShowcaseIndex < showcaseSlides.length - 1) ? currentShowcaseIndex + 1 : 0;
                    updateShowcase();
                });
                btnShowcasePrev.addEventListener('click', () => {
                    if (showcaseSlides.length === 0) return;
                    currentShowcaseIndex = (currentShowcaseIndex > 0) ? currentShowcaseIndex - 1 : showcaseSlides.length - 1;
                    updateShowcase();
                });
            }

            function renderizarShowcase(productos) {
                if (!showcaseTrack) return;
                showcaseTrack.innerHTML = '';

                // Filtramos destacados Y promociones
                let paraShowcase = productos.filter(p => p.destacado || p.en_promocion);

                // Ordenamos por precio (del más barato al más caro) para enganchar al cliente
                paraShowcase.sort((a, b) => a.precio - b.precio);

                // Tomamos máximo los 5 mejores
                const topShowcase = paraShowcase.slice(0, 5);

                topShowcase.forEach(prod => {
                            let colorBase = '#4D7BFE';
                            let gradient = 'linear-gradient(135deg, #4D7BFE, #1E3A8A)';
                            if (prod.categoria === 'sensores') {
                                colorBase = '#F6B173';
                                gradient = 'linear-gradient(135deg, #F6B173, #D97706)';
                            } else if (prod.categoria === 'software') {
                                colorBase = '#a855f7';
                                gradient = 'linear-gradient(135deg, #a855f7, #4c1d95)';
                            }

                            if (prod.en_promocion) {
                                colorBase = '#ef4444';
                                gradient = 'linear-gradient(135deg, #ef4444, #7f1d1d)';
                            }

                            let precioHTML = `S/ ${prod.precio.toFixed(2)}<span>${prod.moneda}</span>`;
                            let promoInfo = `<p>CATEGORÍA</p><div class="showcase-pills"><span class="active">${prod.categoria.toUpperCase()}</span></div>`;

                            if (prod.en_promocion && prod.fin_promo) {
                                precioHTML = `S/ ${prod.precio.toFixed(2)} <s style="font-size: 1.2rem; color: var(--texto-suave); margin-left: 10px;">S/ ${(prod.precio_normal || prod.precio).toFixed(2)}</s>`;
                                promoInfo = `
                    <p style="color: ${colorBase};">TIEMPO DE LA OFERTA</p>
                    <div class="contador-oferta" data-fin="${prod.fin_promo}" style="background: transparent; border: none; padding: 0; box-shadow: none;">
                        <div class="showcase-pills">
                            <span class="active tiempo-restante" style="border-color: ${colorBase}; color: ${colorBase}; background: ${colorBase}26; font-size: 1.1rem; font-weight: bold; padding: 12px 30px; letter-spacing: 2px;">Calculando...</span>
                        </div>
                    </div>
                `;
                            }

                            showcaseTrack.innerHTML += `
                <div class="showcase-slide">
                    <div class="showcase-left">
                        <div class="showcase-shape" style="background: ${gradient};"></div>
                        <img src="${prod.imagen}" alt="${prod.nombre}" class="showcase-img" onerror="this.src='https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400'">
                    </div>
                    <div class="showcase-right">
                        <span class="showcase-category" style="color: ${prod.en_promocion ? colorBase : 'var(--texto-suave)'}; font-weight: ${prod.en_promocion ? '900' : 'normal'};">${prod.en_promocion ? '🔥 OFERTA / ' : (prod.destacado ? '⭐ DESTACADO / ' : '')}${prod.categoria}</span>
                        <h2 class="showcase-title">${prod.nombre}</h2>
                        
                        <div class="showcase-price" style="color: ${prod.en_promocion ? colorBase : 'var(--texto-brillante)'};">
                            ${precioHTML}
                        </div>

                        <div class="showcase-specs">
                            ${promoInfo}
                        </div>

                        <div class="showcase-stock">
                            <div class="stock-ring" style="border-top-color: ${colorBase};"><span>${prod.stock > 99 ? '∞' : prod.stock}</span></div>
                            <p>UNIDADES<br>DISPONIBLES</p>
                        </div>

                        <button class="btn-comprar showcase-add-btn" data-nombre="${prod.nombre}" data-precio="${prod.precio}" style="${prod.en_promocion ? `background: ${colorBase}; box-shadow: 0 10px 20px ${colorBase}4D;` : ''}">AGREGAR AL CARRITO</button>
                    </div>
                </div>
            `;
        });

        showcaseSlides = document.querySelectorAll('.showcase-slide');
        currentShowcaseIndex = 0;
        updateShowcase();
    }

    let productosGlobales = [];

    async function cargarProductos() {
        try {
            // Evitamos la caché añadiendo un timestamp
            let respuesta;
            try {
                respuesta = await fetch('/api/productos?v=' + new Date().getTime());
                if(!respuesta.ok) throw new Error("API falló");
            } catch(e) {
                respuesta = await fetch('productos.json?v=' + new Date().getTime());
            }
            
            const data = await respuesta.json();
            productosGlobales = data.productos || data; 
            
            renderizarShowcase(productosGlobales);

            if (document.getElementById('grid-productos')) {
                renderizarProductos(productosGlobales, 'grid-productos');
            }
            
            if (document.getElementById('grid-promos')) {
                const promociones = productosGlobales.filter(p => p.en_promocion === true);
                if(promociones.length > 0) renderizarProductos(promociones, 'grid-promos', true);
            }

            iniciarContadoresReales();
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    }

    function renderizarProductos(productos, containerId, isPromo = false) {
        const grid = document.getElementById(containerId);
        if (!grid) return;
        grid.innerHTML = ''; 
        
        productos.forEach(producto => {
            let badgeHTML = '';
            let precioHTML = `S/. ${producto.precio.toFixed(2)} <span>${producto.moneda}</span>`;
            let contadorHTML = '';

            if (isPromo || producto.en_promocion) {
                let porcentaje = '';
                if(producto.precio_normal) {
                    const desc = Math.round(((producto.precio_normal - producto.precio) / producto.precio_normal) * 100);
                    porcentaje = `-${desc}% OFF`;
                    precioHTML = `S/. ${producto.precio.toFixed(2)} <span style="text-decoration:line-through; color:var(--texto-suave); font-size:0.8rem;">S/ ${producto.precio_normal.toFixed(2)}</span>`;
                }
                badgeHTML = `<span class="badge badge-seller">${porcentaje || 'OFERTA'}</span>`;
                
                // Usamos la fecha real en milisegundos
                if(producto.fin_promo) {
                    contadorHTML = `<div class="contador-oferta" data-fin="${producto.fin_promo}">⏳ Termina en <span class="tiempo-restante">Calculando...</span></div>`;
                }
            } else {
                if (producto.destacado) badgeHTML = `<span class="badge badge-seller">DESTACADO</span>`;
                else if (producto.stock < 20) badgeHTML = `<span class="badge badge-nuevo">POCO STOCK</span>`;
            }

            grid.innerHTML += `
                <article class="producto-card">
                    ${badgeHTML}
                    <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&auto=format&fit=crop'">
                    <span class="producto-categoria">${producto.categoria}</span>
                    <h3 style="margin-bottom: 2px;">${producto.nombre}</h3>
                    <p class="producto-precio">${precioHTML}</p>
                    ${contadorHTML}
                    <button class="btn-comprar" data-nombre="${producto.nombre}" data-precio="${producto.precio}">
                        Añadir al carrito
                    </button>
                </article>
            `;
        });
    }

    cargarProductos();

    const botonesTipo = document.querySelectorAll('.filtro-tipo');
    const inputBuscar = document.getElementById('input-buscar');
    const btnBuscar = document.getElementById('btn-buscar');

    botonesTipo.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tipo = btn.getAttribute('data-tipo');
            
            // Si hace click en la categoría promociones (filtro especial)
            if (btn.classList.contains('filtro-promo')) {
                return; // Este abre un modal, no filtra aquí
            }

            botonesTipo.forEach(b => b.style.borderColor = 'var(--borde-sutil)');
            btn.style.borderColor = 'var(--acento-gamer)';

            let filtrados = [];
            if (tipo === 'hardware') filtrados = productosGlobales.filter(p => p.categoria !== 'software');
            else if (tipo === 'software') filtrados = productosGlobales.filter(p => p.categoria === 'software');

            renderizarProductos(filtrados, 'grid-productos');
            iniciarContadoresReales(); // Reiniciar contadores de los productos filtrados
        });
    });

    function realizarBusqueda() {
        if(!inputBuscar) return;
        const texto = inputBuscar.value.toLowerCase().trim();
        const filtrados = productosGlobales.filter(p => p.nombre.toLowerCase().includes(texto));
        renderizarProductos(filtrados, 'grid-productos');
        iniciarContadoresReales();
    }

    if(btnBuscar) btnBuscar.addEventListener('click', realizarBusqueda);
    if(inputBuscar) inputBuscar.addEventListener('keyup', (e) => { if(e.key === 'Enter') realizarBusqueda(); });

    function iniciarContadoresReales() {
        document.querySelectorAll('.contador-oferta').forEach(contador => {
            if(contador.getAttribute('data-iniciado') === 'true') return;
            contador.setAttribute('data-iniciado', 'true');

            const finMs = parseInt(contador.getAttribute('data-fin'));
            const spanTiempo = contador.querySelector('.tiempo-restante');

            if(!spanTiempo || isNaN(finMs)) return;

            const intervalo = setInterval(() => {
                const ahora = new Date().getTime();
                const diferenciaMs = finMs - ahora;

                if (diferenciaMs <= 0) {
                    clearInterval(intervalo);
                    spanTiempo.textContent = '¡EXPIRADA!';
                    contador.style.color = '#94A3B8';
                    contador.style.borderColor = 'rgba(148,163,184,0.3)';
                    // Podríamos deshabilitar el botón aquí si quisiéramos
                    return;
                }

                // Calcular horas, minutos y segundos restantes
                const h = Math.floor(diferenciaMs / (1000 * 60 * 60));
                const m = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diferenciaMs % (1000 * 60)) / 1000);

                spanTiempo.textContent = `${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
            }, 1000);
        });
    }

    let carrito = JSON.parse(localStorage.getItem('carritoLenaPro')) || [];
    const contadorCarrito = document.getElementById('contador-carrito');
    const contenedorItems = document.getElementById('carrito-items');
    const totalEl = document.getElementById('total');
    const panelCarrito = document.getElementById('carrito-panel');

    document.getElementById('btn-toggle-carrito')?.addEventListener('click', (e) => {
        e.preventDefault();
        panelCarrito.classList.toggle('oculto');
    });

    function actualizarCarrito() {
        localStorage.setItem('carritoLenaPro', JSON.stringify(carrito));
        let total = 0, cantidadTotal = 0;
        
        if(contenedorItems) {
            contenedorItems.innerHTML = '';
            if (carrito.length === 0) contenedorItems.innerHTML = '<p class="carrito-vacio">El carrito está vacío</p>';
        }

        carrito.forEach((item, index) => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;
            cantidadTotal += item.cantidad;

            if(contenedorItems) {
                contenedorItems.innerHTML += `
                    <div class="carrito-item" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--borde-sutil); padding: 10px 0;">
                        <div style="flex: 1; text-align: left;">
                            <p style="font-size: 0.9rem; margin-bottom: 5px; color: white;">${item.nombre} <strong style="color: var(--acento-calido);">(x${item.cantidad})</strong></p>
                            <p style="color: var(--acento-gamer); font-weight: bold; margin: 0;">S/ ${subtotal.toFixed(2)}</p>
                        </div>
                        <button onclick="eliminarDelCarrito(${index})" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; font-weight: bold;">X</button>
                    </div>
                `;
            }
        });

        if(totalEl) totalEl.innerText = total.toFixed(2);
        if(contadorCarrito) contadorCarrito.innerText = cantidadTotal;
    }

    window.eliminarDelCarrito = function(index) {
        if (carrito[index].cantidad > 1) carrito[index].cantidad--; 
        else carrito.splice(index, 1); 
        actualizarCarrito();
    };

    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-comprar')) {
            const btn = e.target;
            
            btn.classList.add("animar");
            setTimeout(() => btn.classList.remove("animar"), 300);

            const nombre = btn.getAttribute('data-nombre');
            const precio = parseFloat(btn.getAttribute('data-precio'));

            const existente = carrito.find(item => item.nombre === nombre);
            if (existente) existente.cantidad++;
            else carrito.push({ nombre, precio, cantidad: 1 });

            actualizarCarrito();
            
            if(panelCarrito && panelCarrito.classList.contains('oculto')) {
                panelCarrito.classList.remove('oculto');
            }
        }
    });

    actualizarCarrito();

    const btnAbrirCheckout = document.getElementById('btn-abrir-checkout');
    const modalCheckout = document.getElementById('checkout');
    const formCheckout = document.getElementById('form-checkout');

    if (btnAbrirCheckout && modalCheckout) {
        btnAbrirCheckout.addEventListener('click', () => {
            if (carrito.length === 0) return alert("Tu carrito está vacío.");
            
            const checkoutItems = document.getElementById('checkout-items');
            checkoutItems.innerHTML = '';
            let total = 0;
            carrito.forEach(item => {
                const sub = item.precio * item.cantidad;
                total += sub;
                checkoutItems.innerHTML += `
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted var(--borde-sutil); padding: 8px 0; color: var(--texto-suave);">
                        <span>${item.nombre} <strong style="color: white;">x${item.cantidad}</strong></span>
                        <span style="color: white; font-weight: bold;">S/ ${sub.toFixed(2)}</span>
                    </div>
                `;
            });
            document.getElementById('checkout-total').innerText = total.toFixed(2);
            panelCarrito.classList.add('oculto');
            modalCheckout.classList.remove('oculto');
        });
    }

    document.getElementById('btn-volver-carrito')?.addEventListener('click', () => {
        modalCheckout.classList.add('oculto');
        panelCarrito.classList.remove('oculto');
    });

    if (formCheckout) {
        formCheckout.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const nombre = document.getElementById('envio-nombre').value;
            const dni = document.getElementById('envio-dni').value;
            const email = document.getElementById('envio-email').value;
            const departamento = document.getElementById('envio-departamento').value;
            const distrito = document.getElementById('envio-distrito').value;
            const direccion = document.getElementById('envio-direccion').value;
            const referencia = document.getElementById('envio-referencia').value;
            const metodoPago = document.querySelector('input[name="pago"]:checked').value;
            
            const numeroWhatsApp = "51987911585"; 
            const codigoOrden = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();

            let total = 0;
            carrito.forEach(item => total += item.precio * item.cantidad);

            const datosOrden = { 
                codigo: codigoOrden, cliente: nombre, dni: dni, email_cliente: email,
                departamento: departamento, distrito: distrito, direccion: direccion, referencia: referencia,
                total: total, carrito: carrito 
            };

            // Enviar a Python para guardar en BD
            try {
                await fetch('/api/ordenes', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(datosOrden) 
                });
            } catch (error) { 
                console.warn("Error enviando al servidor:", error); 
            }

            // Preparar mensaje WhatsApp
            let mensaje = `Hola Lena Pro, deseo confirmar mi compra.%0A%0A*📦 CÓDIGO:* ${codigoOrden}%0A*TOTAL:* S/ ${total.toFixed(2)}`;
            window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, '_blank');

            // Limpiar
            carrito = []; 
            actualizarCarrito(); 
            formCheckout.reset(); 
            modalCheckout.classList.add('oculto');
        });
    }

    const modalPromos = document.getElementById('modal-promos');
    document.querySelectorAll('.filtro-promo').forEach(btn => btn.addEventListener('click', (e) => { 
        e.preventDefault(); 
        modalPromos?.classList.remove('oculto'); 
    }));
    document.getElementById('btn-cerrar-promos')?.addEventListener('click', () => modalPromos?.classList.add('oculto'));

});