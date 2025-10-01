document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value;
  const clave = document.getElementById("clave").value;

  try {
    const response = await fetch("https://backpracticaagile.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usuario,
        password: clave
      }),
          });

    if (response.ok) {
      const data = await response.json();

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("usuario", usuario);
      window.location.href = "inicio.html";
    } else {
      alert("Credenciales incorrectas");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error de conexión");
  }
});
