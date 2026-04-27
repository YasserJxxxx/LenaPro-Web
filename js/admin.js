document.addEventListener('DOMContentLoaded', () => {

    // --- 1. MENÚ MÓVIL (SIDEBAR) ---
    const sidebar = document.getElementById('sidebar-admin');
    const btnCerrarSidebar = document.getElementById('btn-cerrar-sidebar');
    const toggles = document.querySelectorAll('.toggle-sidebar');

    toggles.forEach(btn => {
        btn.addEventListener('click', () => {
            if (sidebar) sidebar.classList.add('abierto');
        });
    });

    if (btnCerrarSidebar) {
        btnCerrarSidebar.addEventListener('click', () => {
            if (sidebar) sidebar.classList.remove('abierto');
        });
    }

    // --- 2. NAVEGACIÓN DE PESTAÑAS (TABS) ---
    const tabs = {
        'tab-pedidos': document.getElementById('vista-pedidos'),
        'tab-culminados': document.getElementById('vista-culminados'),
        'tab-inventario': document.getElementById('vista-inventario'),
        'tab-promos': document.getElementById('vista-promos')
    };

    function cambiarPestana(idTabActivo) {
        Object.keys(tabs).forEach(id => {
            const tabBtn = document.getElementById(id);
            if (tabBtn) tabBtn.classList.remove('active');
            if (tabs[id]) tabs[id].classList.add('oculto');
        });

        const tabSeleccionado = document.getElementById(idTabActivo);
        if (tabSeleccionado) tabSeleccionado.classList.add('active');
        if (tabs[idTabActivo]) tabs[idTabActivo].classList.remove('oculto');

        // Cerrar menú en móviles al hacer clic
        if (sidebar && window.innerWidth <= 900) sidebar.classList.remove('abierto');
    }

    const btnTabPedidos = document.getElementById('tab-pedidos');
    const btnTabCulminados = document.getElementById('tab-culminados');
    const btnTabInventario = document.getElementById('tab-inventario');
    const btnTabPromos = document.getElementById('tab-promos');

    if (btnTabPedidos) {
        btnTabPedidos.addEventListener('click', () => {
            cambiarPestana('tab-pedidos');
            cargarPedidos('Pendiente', 'admin-tbody-pedidos');
        });
    }
    if (btnTabCulminados) {
        btnTabCulminados.addEventListener('click', () => {
            cambiarPestana('tab-culminados');
            cargarPedidos('Culminado', 'admin-tbody-culminados');
        });
    }
    if (btnTabInventario) {
        btnTabInventario.addEventListener('click', () => {
            cambiarPestana('tab-inventario');
            cargarInventarioYPromos();
        });
    }
    if (btnTabPromos) {
        btnTabPromos.addEventListener('click', () => {
            cambiarPestana('tab-promos');
            cargarInventarioYPromos();
        });
    }

    // --- 3. CARGAR PEDIDOS Y CAMBIAR ESTADO ---
    function cargarPedidos(estado, tbodyId) {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;

        // Añadimos el timestamp para romper la caché
        fetch(`/api/admin/pedidos?estado=${estado}&v=${new Date().getTime()}`)
            .then(res => res.json())
            .then(pedidos => {
                tbody.innerHTML = '';
                if (pedidos.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--texto-suave);">No hay pedidos en estado ${estado}.</td></tr>`;
                    return;
                }

                if (estado === 'Culminado') window.pedidosCulminados = pedidos;

                pedidos.forEach(p => {
                    let btnAccion = estado === 'Pendiente' ?
                        `<button class="btn-accion btn-nuevo" onclick="marcarCompletado(${p.id})">✔ Marcar Enviado</button>` :
                        `<span style="color: #10b981; font-weight: bold; background: rgba(16,185,129,0.1); padding: 5px 10px; border-radius: 5px;">Completado</span>`;

                    let detallesStr = "No hay detalles";
                    try {
                        const items = JSON.parse(p.detalles);
                        detallesStr = items.map(i => `- ${i.nombre} (x${i.cantidad})`).join('\\n');
                    } catch (e) {}

                    tbody.innerHTML += `
                        <tr>
                            <td><strong>${p.codigo}</strong><br><span style="font-size:0.75rem; color:var(--texto-suave);">${p.fecha}</span></td>
                            <td>${p.cliente}<br><span style="font-size:0.8rem; color:var(--acento-calido);">${p.direccion}, ${p.distrito}</span></td>
                            <td style="color: var(--acento-gamer); font-weight: bold;">S/ ${p.total.toFixed(2)}</td>
                            <td>
                                <button class="btn-accion btn-editar" onclick="alert('🛍️ PRODUCTOS COMPRADOS:\\n\\n${detallesStr}\\n\\nDatos contacto:\\nDNI: ${p.dni}\\nEmail: ${p.email || 'N/A'}')">Ver Productos</button>
                            </td>
                            <td>${btnAccion}</td>
                        </tr>
                    `;
                });
            })
            .catch(err => {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#ef4444;">Error conectando con servidor Python.</td></tr>`;
            });
    }

    // Cambiar estado a Culminado (Corregido y reforzado)
    window.marcarCompletado = function(id) {
        if (confirm("¿Confirmas que este pedido ya fue enviado o entregado? Se moverá a Pedidos Culminados.")) {
            fetch(`/api/pedidos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado: 'Culminado' })
                })
                .then(async res => {
                    if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(errorText);
                    }
                    return res.json();
                })
                .then(data => {
                    alert("¡Pedido actualizado exitosamente!");
                    cargarPedidos('Pendiente', 'admin-tbody-pedidos'); // Recarga instantánea
                })
                .catch(err => {
                    console.error("Error completo del servidor:", err);
                    alert("Hubo un problema de conexión con la base de datos (SQLite). Revisa la terminal donde corre app.py.");
                });
        }
    };

    // --- 4. EXPORTAR CSV ---
    window.exportarCSV = function() {
        const pedidos = window.pedidosCulminados || [];
        if (pedidos.length === 0) return alert("No hay pedidos culminados para exportar.");

        let csv = "ID,Codigo,Fecha,Cliente,DNI,Email,Distrito,Direccion,Total\n";
        pedidos.forEach(p => {
            const dirLimpia = p.direccion ? p.direccion.replace(/,/g, '') : '';
            csv += `${p.id},${p.codigo},${p.fecha},${p.cliente},${p.dni},${p.email},${p.distrito},${dirLimpia},${p.total}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `LenaPro_Ventas_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- 5. CARGAR INVENTARIO Y PROMOS ---
    let productosAdmin = [];

    function cargarInventarioYPromos() {
        fetch('/api/productos?v=' + new Date().getTime())
            .then(res => res.json())
            .then(data => {
                productosAdmin = data.productos || data;
                renderTablaInventario();
                renderTablaPromos();
            });
    }

    function renderTablaInventario() {
        const tbody = document.getElementById('admin-tbody-productos');
        if (!tbody) return;
        tbody.innerHTML = '';

        productosAdmin.forEach(prod => {
            let tags = '';
            if (prod.destacado) tags += '<span style="color:var(--acento-gamer); font-size:10px; font-weight:bold; margin-left:5px; background:rgba(77,123,254,0.1); padding:2px 4px; border-radius:4px;">⭐ DEST</span>';
            if (prod.en_promocion) tags += '<span style="color:var(--acento-calido); font-size:10px; font-weight:bold; margin-left:5px; background:rgba(246,177,115,0.1); padding:2px 4px; border-radius:4px;">🔥 PROMO</span>';

            const precioNormal = prod.precio_normal || prod.precio;

            tbody.innerHTML += `
                <tr>
                    <td><img src="${prod.imagen}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid var(--borde-sutil);"></td>
                    <td><strong>${prod.nombre}</strong> ${tags}</td>
                    <td style="color: var(--texto-brillante);">S/ ${precioNormal.toFixed(2)}</td>
                    <td>${prod.stock}</td>
                    <td>
                        <button class="btn-accion btn-editar" onclick="editarProducto(${prod.id})" style="margin-right: 5px;">Editar</button>
                        <button class="btn-accion btn-eliminar" onclick="eliminarProducto(${prod.id})">Borrar</button>
                    </td>
                </tr>
            `;
        });
    }

    function renderTablaPromos() {
        const tbody = document.getElementById('admin-tbody-promos');
        if (!tbody) return;
        tbody.innerHTML = '';

        const promos = productosAdmin.filter(p => p.en_promocion);
        if (promos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--texto-suave);">No hay ofertas activas.</td></tr>`;
            return;
        }

        promos.forEach(prod => {
            const fechaFin = prod.fin_promo ? new Date(prod.fin_promo).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : 'No definida';

            tbody.innerHTML += `
                <tr>
                    <td><img src="${prod.imagen}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;"></td>
                    <td><strong>${prod.nombre}</strong></td>
                    <td style="text-decoration: line-through; color: var(--texto-suave);">S/ ${(prod.precio_normal || prod.precio).toFixed(2)}</td>
                    <td style="color: var(--acento-calido); font-weight: bold;">S/ ${prod.precio.toFixed(2)}</td>
                    <td style="color: #ef4444; font-size: 0.85rem; font-weight: bold;">${fechaFin}</td>
                    <td><button class="btn-accion btn-editar" onclick="editarProducto(${prod.id})">Ajustar</button></td>
                </tr>
            `;
        });
    }

    // --- 6. GESTIÓN DEL MODAL DE PRODUCTOS ---
    const modalProd = document.getElementById('modal-producto');
    const checkPromo = document.getElementById('prod-promocion');
    const opcionesPromo = document.getElementById('opciones-promo');
    const inputOferta = document.getElementById('prod-precio-oferta');
    const inputFecha = document.getElementById('prod-fin-promo');
    const btnAgregarProducto = document.getElementById('btn-agregar-producto');
    const btnCerrarModalProd = document.getElementById('btn-cerrar-modal-prod');

    if (checkPromo) {
        checkPromo.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (opcionesPromo) opcionesPromo.classList.remove('oculto');
                if (inputOferta) inputOferta.required = true;
                if (inputFecha) inputFecha.required = true;
            } else {
                if (opcionesPromo) opcionesPromo.classList.add('oculto');
                if (inputOferta) inputOferta.required = false;
                if (inputFecha) inputFecha.required = false;
            }
        });
    }

    if (btnAgregarProducto) {
        btnAgregarProducto.addEventListener('click', () => {
            const form = document.getElementById('form-producto');
            if (form) form.reset();

            document.getElementById('prod-id').value = '';
            document.getElementById('imagen-actual').value = '';
            if (opcionesPromo) opcionesPromo.classList.add('oculto');

            const titulo = document.getElementById('modal-titulo-prod');
            if (titulo) titulo.textContent = 'Agregar Nuevo Componente';

            if (modalProd) modalProd.classList.remove('oculto');
        });
    }

    if (btnCerrarModalProd) {
        btnCerrarModalProd.addEventListener('click', () => {
            if (modalProd) modalProd.classList.add('oculto');
        });
    }

    window.editarProducto = function(id) {
        const prod = productosAdmin.find(p => p.id === id);
        if (!prod) return;

        document.getElementById('prod-id').value = prod.id;
        document.getElementById('prod-nombre').value = prod.nombre;
        document.getElementById('prod-categoria').value = prod.categoria;
        document.getElementById('prod-precio-normal').value = prod.precio_normal || prod.precio;
        document.getElementById('prod-stock').value = prod.stock;
        document.getElementById('prod-destacado').checked = prod.destacado || false;

        document.getElementById('imagen-actual').value = prod.imagen;
        document.getElementById('prod-imagen-file').value = '';

        if (checkPromo) checkPromo.checked = prod.en_promocion || false;

        if (prod.en_promocion) {
            if (opcionesPromo) opcionesPromo.classList.remove('oculto');
            if (inputOferta) inputOferta.value = prod.precio;

            if (prod.fin_promo && inputFecha) {
                const tzoffset = (new Date()).getTimezoneOffset() * 60000;
                const localISOTime = (new Date(prod.fin_promo - tzoffset)).toISOString().slice(0, 16);
                inputFecha.value = localISOTime;
            } else if (inputFecha) {
                inputFecha.value = '';
            }
        } else {
            if (opcionesPromo) opcionesPromo.classList.add('oculto');
        }

        const titulo = document.getElementById('modal-titulo-prod');
        if (titulo) titulo.textContent = 'Modificar Componente';

        if (modalProd) modalProd.classList.remove('oculto');
    };

    window.eliminarProducto = function(id) {
        if (confirm("¿Seguro que deseas eliminar este producto permanentemente?")) {
            fetch(`/api/productos/${id}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(() => cargarInventarioYPromos())
                .catch(err => alert("Error eliminando el producto."));
        }
    };

    // --- 7. GUARDAR CAMBIOS AL SERVIDOR ---
    const formProducto = document.getElementById('form-producto');
    if (formProducto) {
        formProducto.addEventListener('submit', async(e) => {
            e.preventDefault();

            const btnSubmit = e.target.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.textContent = '⏳ Guardando...';
                btnSubmit.disabled = true;
            }

            try {
                // Manejo de Imagen
                let imagenRuta = document.getElementById('imagen-actual').value;
                const inputArchivo = document.getElementById('prod-imagen-file');

                if (inputArchivo && inputArchivo.files.length > 0) {
                    const formData = new FormData();
                    formData.append('imagen', inputArchivo.files[0]);

                    const resImg = await fetch('/api/upload', { method: 'POST', body: formData });
                    if (resImg.ok) {
                        const dataImg = await resImg.json();
                        imagenRuta = dataImg.ruta;
                    } else {
                        throw new Error("Fallo al subir la imagen al servidor Python");
                    }
                }

                // Manejo de Promo
                const esPromo = checkPromo ? checkPromo.checked : false;
                const precioBase = parseFloat(document.getElementById('prod-precio-normal').value);
                let precioFinalCobrar = precioBase;
                let finPromoMs = null;

                if (esPromo) {
                    precioFinalCobrar = parseFloat(inputOferta.value);
                    const fechaInput = inputFecha.value;
                    finPromoMs = new Date(fechaInput).getTime();
                }

                const idForm = document.getElementById('prod-id').value;

                const productoGuardar = {
                    id: idForm ? parseInt(idForm) : null,
                    nombre: document.getElementById('prod-nombre').value,
                    categoria: document.getElementById('prod-categoria').value,
                    precio: precioFinalCobrar,
                    precio_normal: precioBase,
                    stock: parseInt(document.getElementById('prod-stock').value),
                    imagen: imagenRuta || "img/explorar.webp",
                    moneda: "PEN",
                    destacado: document.getElementById('prod-destacado').checked,
                    en_promocion: esPromo,
                    fin_promo: finPromoMs
                };

                const resGuardar = await fetch('/api/productos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productoGuardar)
                });

                if (!resGuardar.ok) throw new Error("Error al escribir el JSON");

                if (modalProd) modalProd.classList.add('oculto');
                cargarInventarioYPromos();

            } catch (error) {
                console.error("Error al guardar producto:", error);
                alert("Hubo un error al guardar. Revisa la consola para más detalles.");
            } finally {
                if (btnSubmit) {
                    btnSubmit.textContent = '💾 Guardar Cambios en Servidor';
                    btnSubmit.disabled = false;
                }
            }
        });
    }

    // Iniciar listado principal
    cargarPedidos('Pendiente', 'admin-tbody-pedidos');
});