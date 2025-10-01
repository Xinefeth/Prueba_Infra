const urlBase = "https://backpracticaagile.onrender.com/api";

const cuotaId = new URLSearchParams(window.location.search).get("cuotaId");
document.getElementById("cuotaId").value = cuotaId;

const lblMontoTotal = document.getElementById("lblMontoTotal");
const lblRestante = document.getElementById("lblRestante");
const listaPagos = document.getElementById("lista-pagos");

function cargarInfoCuota() {
  Promise.all([
    fetch(`${urlBase}/cuotas/detalle/${cuotaId}`).then(r => r.json()),
    fetch(`${urlBase}/cuotas/${cuotaId}/restante`).then(r => r.json()),
    fetch(`${urlBase}/pagos/cuota/${cuotaId}`).then(r => r.json())
  ])
  .then(([cuota, restante, pagos]) => {
    document.getElementById("lblNumeroCuota").textContent = cuota.numero;
    lblMontoTotal.textContent = cuota.montoFinal.toFixed(2);
    lblRestante.textContent = parseFloat(restante).toFixed(2);

    listaPagos.innerHTML = "";

  pagos
    .filter(p => p.estadoPago === "CONFIRMADO")
    .forEach(pago => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.justifyContent = "space-between";
      li.style.padding = "4px 0";

      const span = document.createElement("span");
      span.textContent = `${pago.metodoPago}: S/ ${pago.monto.toFixed(2)}`;

      const btn = document.createElement("button");
      btn.className = "btn-eliminar btn-eliminar-clear";
      btn.setAttribute("data-id", pago.id);
      btn.textContent = "❌";
      btn.style.background = "none";
      btn.style.border = "none";
      btn.style.color = "red";
      btn.style.cursor = "pointer";
      btn.style.fontSize = "1.2em";
      btn.style.marginLeft = "10px";

      li.appendChild(span);
      li.appendChild(btn);
      listaPagos.appendChild(li);
    });

    // Agrega eventos a los botones eliminar
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", () => {
        const pagoId = btn.getAttribute("data-id");
        if (confirm("¿Estás seguro de eliminar este pago?")) {
          fetch(`${urlBase}/pagos/parcial/${pagoId}`, {
            method: "DELETE"
          })
          .then(() => {
            alert("✅ Pago eliminado correctamente.");
            cargarInfoCuota();
          })
          .catch(err => {
            alert("❌ Error al eliminar el pago.");
            console.error(err);
          });
        }
      });
    });

    // Botón finalizar
    document.getElementById("btnFinalizar").disabled = parseFloat(restante) > 0.1;

    actualizarInterfazPago(parseFloat(restante));
  })
  .catch(err => {
    alert("Error al cargar la información de la cuota.");
    console.error(err);
  });
}


document.getElementById("form-pago").addEventListener("submit", e => {
  e.preventDefault();

  const metodo = document.getElementById("metodo").value;
  let monto = parseFloat(document.getElementById("monto").value);
  const file = document.getElementById("comprobante").files[0];
  const restanteActual = parseFloat(document.getElementById("lblRestante").textContent);

if (
  (metodo === "EFECTIVO" && monto > restanteActual + 0.10) ||
  (metodo !== "EFECTIVO" && monto > restanteActual)
) {
  alert(`⚠️ El monto ingresado excede el límite permitido según el método de pago.`);
  return;
}


if (metodo === "EFECTIVO") {
  const centavos = monto * 100 % 10;
  if (centavos < 5) {
    monto = Math.floor(monto * 10) / 10;
  } else {
    monto = Math.ceil(monto * 10) / 10;
  }
  monto = parseFloat(monto.toFixed(2));
}
  if (!monto || monto <= 0) {
    alert("⚠️ Debes ingresar un monto válido.");
    return;
  }

  if (metodo === "BILLETERA_DIGITAL" && !file) {
    alert("⚠️ Debes subir un comprobante para billetera digital.");
    return;
  }

  const formData = new FormData();
  formData.append("cuotaId", cuotaId);
  formData.append("metodo", metodo);
  formData.append("monto", monto);
  if (file) formData.append("file", file);

  fetch(`${urlBase}/pagos/parcial`, {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(() => {
    alert("✅ Pago registrado.");
    cargarInfoCuota();
    document.getElementById("form-pago").reset();
  })
  .catch(err => {
    alert("Error al registrar el pago.");
    console.error(err);
  });
});


document.getElementById("btnMercadoPago").addEventListener("click", () => {
  const restante = parseFloat(document.getElementById("lblRestante").textContent);

  if (!restante || restante <= 0) {
    alert("⚠️ No hay monto pendiente para pagar con Mercado Pago.");
    return;
  }

  fetch(`${urlBase}/pagos/mp/link?cuotaId=${cuotaId}&monto=${restante}`, {
    method: "POST"
  })
  .then(res => res.json())
  .then(data => {
    if (data.link) {
      window.open(data.link, "_blank");
    } else {
      alert("No se pudo generar el link.");
    }
  })
  .catch(err => {
    alert("Error al generar el link de Mercado Pago.");
    console.error(err);
  });
});



document.getElementById("btnFinalizar").addEventListener("click", () => {
  fetch(`${urlBase}/cuotas/${cuotaId}/cerrar`, { method: "POST" })
    .then(() => {
      alert("🎉 Comprobante generado. Cuota cerrada.");
      descargarComprobanteConReintento(cuotaId);
      cargarInfoCuota();
    })
    .catch(err => {
      alert("Error al cerrar la cuota.");
      console.error(err);
    });
});




// Webhook confirmación desde Mercado Pago
const paymentId = new URLSearchParams(window.location.search).get("payment_id");
const status = new URLSearchParams(window.location.search).get("status");

if (paymentId && status === "approved") {
  alert("✅ Tu pago fue aprobado. Confirmando con el servidor...");

  fetch(`${urlBase}/pagos/mp/confirmar?payment_id=${paymentId}&cuotaId=${cuotaId}`, {
    method: "POST"
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al confirmar el pago en backend.");
    return res.text();
  })
  .then(msg => {
    alert("🎉 " + msg);
    cargarInfoCuota();
    const nuevaUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?cuotaId=${cuotaId}`;
    window.history.replaceState({}, document.title, nuevaUrl);
  })
  .catch(err => {
    alert("⚠️ Hubo un problema al confirmar el pago.");
    console.error(err);
  });
}



function actualizarInterfazPago(restante) {
  const metodo = document.getElementById("metodo").value;
  const montoInput = document.getElementById("monto");
  const fileInput = document.getElementById("comprobante");
  const btnRegistrar = document.querySelector("#form-pago button[type='submit']");
  const btnMercadoPago = document.getElementById("btnMercadoPago");

  montoInput.disabled = true;
  fileInput.disabled = true;
  btnRegistrar.disabled = true;
  btnMercadoPago.disabled = true;

  if (parseFloat(restante) === 0) return;

  if (metodo === "EFECTIVO") {
    montoInput.disabled = false;
    btnRegistrar.disabled = false;
  } else if (metodo === "BILLETERA_DIGITAL") {
    montoInput.disabled = false;
    fileInput.disabled = false;
    btnRegistrar.disabled = false;
  } else if (metodo === "MERCADO_PAGO") {
    montoInput.disabled = true;
    btnMercadoPago.disabled = false;
  }
}

document.getElementById("metodo").addEventListener("change", () => {
  const restante = parseFloat(document.getElementById("lblRestante").textContent);
  actualizarInterfazPago(restante);
});

window.onload = cargarInfoCuota;
document.getElementById("monto").addEventListener("input", () => {
  const monto = parseFloat(document.getElementById("monto").value);
  const restante = parseFloat(document.getElementById("lblRestante").textContent);

  const metodo = document.getElementById("metodo").value;
  let limite = restante;
  if (metodo === "EFECTIVO") {
    limite += 0.10; // tolerancia para efectivo
  }

    if (monto > limite) {
      document.getElementById("monto").value = limite.toFixed(2);
      alert(`⚠️ No puedes ingresar más de S/ ${limite.toFixed(2)} con el método seleccionado.`);
    }

});

if (status === "rejected") {
  alert("❌ Tu pago fue rechazado. No se ha registrado ningún abono.");
  const nuevaUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?cuotaId=${cuotaId}`;
  window.history.replaceState({}, document.title, nuevaUrl);
}
function descargarComprobanteConReintento(cuotaId, intentos = 5, delayMs = 1000) {
  if (intentos === 0) {
    alert("❌ No se pudo descargar el comprobante. Intenta nuevamente.");
    return;
  }

  fetch(`${urlBase}/cuotas/comprobantes/cuota/${cuotaId}`)
    .then(response => {
      if (!response.ok) throw new Error("No disponible aún");
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comprobante_cuota_${cuotaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      window.location.href = "index.html";
    })
    .catch(err => {
      console.warn(`Intento fallido, reintentando... (${intentos - 1} restantes)`);
      setTimeout(() => {
        descargarComprobanteConReintento(cuotaId, intentos - 1, delayMs);
      }, delayMs);
    });
}
