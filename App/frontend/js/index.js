document.addEventListener("DOMContentLoaded", function () {
    const tabla = document.getElementById("tablaCuotas");
    const filtro = document.getElementById("filtroFecha");
    const apiUrl = "https://backpracticaagile.onrender.com/api/cuotas/pendientes";

    filtro.addEventListener("change", cargarCuotas);
    cargarCuotas();

    function cargarCuotas() {
        fetch(apiUrl)
            .then(res => res.json())
            .then(data => pintarCuotas(data))
            .catch(err => console.error("Error al cargar cuotas:", err));
    }

            function pintarCuotas(cuotas) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // ✅ Normaliza a medianoche

    const filtro = document.getElementById("filtroFecha").value;

    cuotas.forEach((cuota) => {
        const fechaPagoParts = cuota.fechaPago.split("-");
        const fechaPago = new Date(
            Number(fechaPagoParts[0]),
            Number(fechaPagoParts[1]) - 1,
            Number(fechaPagoParts[2])
        );
        fechaPago.setHours(0, 0, 0, 0);

        const dias = Math.floor((fechaPago - hoy) / (1000 * 60 * 60 * 24));
        let clase = "", estado = "";

        if (cuota.pagado) {
            clase = "pagado";
            estado = "Pagado";
            cuota._orden = 5;
        } else if (dias === 0) {
            clase = "hoy";
            estado = "Vence Hoy";
            cuota._orden = 1;
        } else if (dias > 0 && dias <= 7) {
            clase = "semana";
            estado = "Vence esta semana";
            cuota._orden = 2;
        } else if (fechaPago < hoy && fechaPago.getMonth() === hoy.getMonth() && fechaPago.getFullYear() === hoy.getFullYear()) {
            clase = "atrasada";
            estado = "Atrasada";
            cuota._orden = 3;
        } else if (fechaPago < hoy) {
            clase = "muy-atrasada";
            estado = "Atrasada de Meses Anteriores";
            cuota._orden = 3.5;
        } else {
            estado = "Pendiente";
            cuota._orden = 4;
        }


        cuota._clase = clase;
        cuota._estado = estado;
        cuota._dias = dias;
    });

    cuotas.sort((a, b) => a._orden - b._orden);

    // --- Paginación ---
    const filasPorPagina = 20;
    let paginaActual = 1;
    const totalPaginas = Math.ceil(cuotas.length / filasPorPagina);

    function renderTabla() {
        const tablaHTML = [
        "<table><tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Monto</th><th>Intereses</th><th>Monto Final</th><th>Estado</th><th>Acciones</th></tr>"
        ];
        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const cuotasPagina = cuotas.slice(inicio, fin);

        let contador = inicio + 1;
        cuotasPagina.forEach((cuota) => {
            const fechaPago = new Date(cuota.fechaPago);
            const clase = cuota._clase;
            const estado = cuota._estado;

            if (filtro === "hoy" && clase !== "hoy") return;
            if (filtro === "semana" && clase !== "semana") return;
            if (filtro === "mes" && fechaPago.getMonth() !== hoy.getMonth()) return;
            if (filtro === "anio" && fechaPago.getFullYear() !== hoy.getFullYear()) return;

            let boton = "-";
            if (!cuota.pagado && clase !== "" && clase !== "pagado") {
                boton = `<button onclick="pagar(${cuota.id})">Pagar</button>`;
            } else if (!cuota.pagado && clase === "") {
                boton = `<button disabled style="opacity:0.5;cursor:not-allowed;">Pagar</button>`;
            }

            tablaHTML.push(`
            <tr class="${clase}">
                <td>${contador++}</td>
                <td>${cuota.prestamo.cliente.nombre}</td>
                <td>${cuota.fechaPago}</td>
                <td>S/ ${parseFloat(cuota.monto).toFixed(2)}</td>
                <td>S/ ${cuota.intereses ? parseFloat(cuota.intereses).toFixed(2) : "0.00"}</td>
                <td>S/ ${cuota.montoFinal ? parseFloat(cuota.montoFinal).toFixed(2) : "0.00"}</td>
                <td>${estado}</td>
                <td>${boton}</td>
            </tr>
        `);

        });

        tablaHTML.push("</table>");
        tabla.innerHTML = tablaHTML.join("");
        renderPaginacion();
    }

    function renderPaginacion() {
        const paginacion = document.getElementById("paginacion");
        paginacion.innerHTML = "";

        for (let i = 1; i <= totalPaginas; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.className = i === paginaActual ? "btn-page active" : "btn-page";
            btn.addEventListener("click", () => {
                paginaActual = i;
                renderTabla();
            });
            paginacion.appendChild(btn);
        }
    }

    renderTabla();
}
});

function pagar(id) {
    window.location.href = "pago.html?cuotaId=" + id;
}
