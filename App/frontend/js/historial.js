const API_URL = "https://backpracticaagile.onrender.com/api";

const tabla = document.getElementById("tabla-historial");
const rowsPerPage = 5; // Cambia este valor si quieres más registros por página
let currentPage = 1;
let prestamos = [];

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`${API_URL}/prestamos/historial`);
    if (!res.ok) throw new Error("No se pudo cargar el historial.");
    prestamos = await res.json();

    // Ordenar por fecha (más reciente primero)
    prestamos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (!prestamos.length) {
      tabla.innerHTML = `<tr><td colspan="6">No hay préstamos registrados.</td></tr>`;
      return;
    }

    renderTabla(currentPage);
    renderPaginacion();

  } catch (err) {
    console.error("Error al cargar historial:", err.message || err);
    tabla.innerHTML = `<tr><td colspan="6">Error al cargar historial.</td></tr>`;
  }
});

function renderTabla(page) {
  tabla.innerHTML = "";
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const prestamosPagina = prestamos.slice(start, end);

  prestamosPagina.forEach(prestamo => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${prestamo.id}</td>
      <td>${prestamo.dniRuc}</td>
      <td>${prestamo.nombre}</td>
      <td>${prestamo.fecha}</td>
      <td>S/ ${prestamo.monto}</td>
      <td>
        <button onclick="verCronograma(${prestamo.id})">📄 Ver</button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

function renderPaginacion() {
  const totalPages = Math.ceil(prestamos.length / rowsPerPage);
  const paginacionDiv = document.getElementById("paginacion");
  paginacionDiv.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentPage = i;
      renderTabla(currentPage);
      renderPaginacion();
    });

    paginacionDiv.appendChild(btn);
  }
}

function verCronograma(prestamoId) {
  window.open(`${API_URL}/cronograma/descargar/${prestamoId}`, "_blank");
}

