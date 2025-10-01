const API_URL = "https://backpracticaagile.onrender.com/api/auth";

// Cambiar nombre de usuario
async function cambiarUsuario() {
  const nuevoUsuario = document.getElementById("nuevo-usuario").value;

  if (!nuevoUsuario) {
    alert("Debes ingresar un nuevo nombre de usuario.");
    return;
  }

  try {
    const token = sessionStorage.getItem("token");

    const response = await fetch(`${API_URL}/cambiar-usuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        nuevoUsername: nuevoUsuario
      })
    });

    if (response.ok) {
      alert("Nombre de usuario actualizado correctamente.");
      document.getElementById("nuevo-usuario").value = "";
    } else {
      const error = await response.text();
      alert("Error al cambiar el nombre de usuario: " + error);
    }
  } catch (error) {
    alert("Error en la solicitud: " + error);
  }
}

// Cambiar contraseña
async function cambiarContrasena() {
  const nuevaPass = document.getElementById("nueva-contrasena").value;
  const confirmarPass = document.getElementById("confirmar-contrasena").value;

  if (!nuevaPass || !confirmarPass) {
    alert("Completa ambos campos de contraseña.");
    return;
  }

  if (nuevaPass !== confirmarPass) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  try {
    const token = sessionStorage.getItem("token");

    const response = await fetch(`${API_URL}/cambiar-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        nuevaPassword: nuevaPass
      })
    });

    if (response.ok) {
      alert("Contraseña actualizada correctamente.");
      document.getElementById("nueva-contrasena").value = "";
      document.getElementById("confirmar-contrasena").value = "";
    } else {
      const error = await response.text();
      alert("Error al cambiar la contraseña: " + error);
    }
  } catch (error) {
    alert("Error en la solicitud: " + error);
  }
}
