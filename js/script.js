
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrusel
    const track = document.getElementById('carousel-track');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const slides = document.querySelectorAll('.carousel-slide');
    let currentIndex = 0;

    function updateCarousel() {
        if (!track) return;
        const amountToMove = currentIndex * 100;
        track.style.transform = `translateX(-${amountToMove}%)`;
    }

    if(btnNext && btnPrev) {
        btnNext.addEventListener('click', () => {
            currentIndex = (currentIndex < slides.length - 1) ? currentIndex + 1 : 0;
            updateCarousel();
        });

        btnPrev.addEventListener('click', () => {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : slides.length - 1;
            updateCarousel();
        });
    }

    // 2. Modal Políticas
    const btnAbrirModalNav = document.getElementById('btn-abrir-politicas');
    const btnAbrirModalFooter = document.getElementById('btn-abrir-politicas-footer');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnEntendido = document.getElementById('btn-entendido');
    const modal = document.getElementById('modal-politicas');

    const abrirAccion = (e) => {
        e.preventDefault();
        modal.classList.remove('oculto');
    };

    if (btnAbrirModalNav) btnAbrirModalNav.addEventListener('click', abrirAccion);
    if (btnAbrirModalFooter) btnAbrirModalFooter.addEventListener('click', abrirAccion);

    if (btnCerrarModal && btnEntendido) {
        const cerrarAccion = () => modal.classList.add('oculto');
        btnCerrarModal.addEventListener('click', cerrarAccion);
        btnEntendido.addEventListener('click', cerrarAccion);
    }

    // 3. Simulación de Agregar al Carrito (Animación)
    const botonesComprar = document.querySelectorAll(".btn-comprar");
    const contadorCarrito = document.getElementById('contador-carrito');
    let itemsEnCarrito = 0;

    botonesComprar.forEach(btn => {
        btn.addEventListener("click", () => {
            btn.classList.add("animar");
            itemsEnCarrito++;
            
            if(contadorCarrito) {
                contadorCarrito.innerText = itemsEnCarrito;
            }

            setTimeout(() => {
                btn.classList.remove("animar");
            }, 300);
            
            console.log("Producto agregado: " + btn.getAttribute('data-nombre'));
        });
    });

    // 4. Panel de Carrito (Abrir/Cerrar)
    const btnToggleCarrito = document.getElementById('btn-toggle-carrito');
    const panelCarrito = document.getElementById('carrito-panel');

    if(btnToggleCarrito && panelCarrito) {
        btnToggleCarrito.addEventListener('click', (e) => {
            e.preventDefault();
            panelCarrito.classList.toggle('oculto');
        });
    }
});