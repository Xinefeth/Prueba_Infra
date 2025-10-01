const tablaBody = document.querySelector("#tablaCuotas tbody");
const modal = document.getElementById("modal");
const resumen = document.getElementById("comprobanteResumen");
const descargarBtn = document.getElementById("descargarBtn");

let idCuotaActual = null;

document.addEventListener("DOMContentLoaded", () => {
  obtenerCuotas(); // ✅ Carga automática al abrir la página
});

function obtenerCuotas() {
  fetch("https://backpracticaagile.onrender.com/api/cuotas/pendientes")
    .then(res => res.json())
    .then(cuotas => mostrarCuotas(cuotas))
    .catch(err => {
      console.error("Error al obtener cuotas:", err);
      alert("No se pudieron cargar las cuotas.");
    });
}

function mostrarCuotas(cuotas) {
  tablaBody.innerHTML = "";
  const hoy = new Date();
  let mostroAlertaHoy = false;

  // Agrega prioridad y clase visual a cada cuota
  const cuotasConPrioridad = cuotas.map(cuota => {
  const fechaPago = new Date(cuota.fechaPago);
  const pagado = cuota.pagado;
  let prioridad = 99;
  let clase = "pendiente";

  if (pagado) {
    prioridad = 5;
    clase = "pagado";
  } else if (mismaFecha(fechaPago, hoy)) {
    prioridad = 0;
    clase = "hoy";
    if (!mostroAlertaHoy) {
      alert("¡Atención! Hay cuotas que vencen hoy y aún no han sido pagadas.");
      mostroAlertaHoy = true;
    }
  } else if (diasDiferencia(hoy, fechaPago) <= 7 && fechaPago > hoy) {
    prioridad = 1;
    clase = "porVencer";
  } else if (esDelMes(fechaPago, hoy)) {
    prioridad = 2;
    clase = "atrasado";
  } else {
    prioridad = 3;
    clase = "pendiente";
  }

  return { ...cuota, prioridad, clase };
});

  // Ordena por prioridad
  cuotasConPrioridad.sort((a, b) => a.prioridad - b.prioridad);

  // Renderiza las filas en orden
  cuotasConPrioridad.forEach(cuota => {
    const tr = document.createElement("tr");
    tr.classList.add(cuota.clase);

    tr.innerHTML = `
      <td>${cuota.numero}</td>
      <td><strong>${cuota.fechaPago}</strong></td>
      <td><strong>S/ ${cuota.monto.toFixed(2)}</strong></td>
      <td>${cuota.pagado ? "Pagado" : "Pendiente"}</td>
      <td>
        ${cuota.pagado
          ? `<button disabled class="btn btn-disabled">Pagado</button>`
          : `<button class="btn btn-pagar">Pagar</button>`}
      </td>
    `;

    if (!cuota.pagado) {
      tr.querySelector(".btn-pagar").addEventListener("click", () => pagarCuota(cuota.id));
    }

    tablaBody.appendChild(tr);
  });
}


function diasDiferencia(fecha1, fecha2) {
  const diff = fecha2 - fecha1;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function mismaFecha(f1, f2) {
  return f1.toISOString().slice(0, 10) === f2.toISOString().slice(0, 10);
}

function esDelMes(fecha, ref) {
  return fecha.getMonth() === ref.getMonth() && fecha.getFullYear() === ref.getFullYear();
}

function pagarCuota(id) {
  const medioPago = prompt("Seleccione medio de pago: EFECTIVO, TRANSFERENCIA o TARJETA").toUpperCase();
  if (!["EFECTIVO", "TRANSFERENCIA", "TARJETA"].includes(medioPago)) {
    alert("Medio de pago inválido.");
    return;
  }

  fetch(`https://backpracticaagile.onrender.com/api/cuotas/${id}/pagar?medioPago=${medioPago}`, {
    method: 'PUT'
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al pagar");
      return res.json();
    })
    .then(data => {
      idCuotaActual = id;
      resumen.innerText = `
Empresa: ${data.nombreEmpresa}
RUC: ${data.rucEmpresa}
Dirección: ${data.direccionEmpresa}
Teléfono: ${data.telefonoEmpresa}
Email: ${data.emailEmpresa}

Cliente: ${data.nombreCliente}
DNI/RUC: ${data.dniCliente}
Fecha de Pago: ${data.fechaPago}
Monto Pagado: S/ ${parseFloat(data.montoPagado).toFixed(2)}
Medio de Pago: ${data.medioPago}
Comprobante N°: ${data.numeroComprobante}
      `.trim();
      modal.classList.add("show");

    })
    .catch(err => {
      console.error("Error:", err);
      alert("No se pudo procesar el pago.");
    });
}

descargarBtn.addEventListener("click", () => {
  if (idCuotaActual) {
    window.open(`https://backpracticaagile.onrender.com/api/comprobantes/${idCuotaActual}/descargar`, "_blank");
    cerrarModal();
    obtenerCuotas();
  }
});

function cerrarModal() {
  modal.classList.remove("show");

  resumen.innerText = "";
  idCuotaActual = null;
}
