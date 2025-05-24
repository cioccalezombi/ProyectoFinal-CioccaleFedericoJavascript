let cartas = [];
let carrito = [];

// Elementos del DOM
const catalogo = document.getElementById("catalogo");
const colorFiltro = document.getElementById("colorFiltro");
const legendariaFiltro = document.getElementById("legendariaFiltro");

// Cargar cartas desde JSON
fetch("data/cartas.json")
  .then(res => res.json())
  .then(data => {
    cartas = data;
    renderizarCartas(cartas);
  })
  .catch(err => console.error("Error al cargar cartas:", err));

  document.addEventListener("DOMContentLoaded", () => {
  fetch("data/cartas.json")
    .then(response => response.json())
    .then(data => {
      cartas = data;
      renderizarCartas(cartas);
      cargarCarritoDesdeStorage(); // ✅ Cargar carrito al inicio
    });
});

  

// Función para renderizar cartas
function renderizarCartas(lista) {
  catalogo.innerHTML = ""; // Limpiar catálogo
  lista.forEach(carta => {
    const cartaHTML = document.createElement("div");
    cartaHTML.className = "col-sm-6 col-md-4 col-lg-3";
    cartaHTML.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${carta.imagen}" class="card-img-top" alt="${carta.nombre}">
        <div class="card-body">
          <h5 class="card-title">${carta.nombre}</h5>
          <p class="card-text">Color: ${carta.color}</p>
          <p class="card-text">Legendaria: ${carta.legendaria ? "Sí" : "No"}</p>
          <button class="btn btn-success btn-sm" onclick="agregarAlCarrito(${carta.id})">Agregar al carrito</button>
        </div>
      </div>
    `;
    catalogo.appendChild(cartaHTML);
  });
}

// Agregar al carrito
function agregarAlCarrito(id) {
  const seleccionada = cartas.find(c => c.id === id);
  carrito.push(seleccionada);
  console.log("Carrito:", carrito);
}

// Escuchar cambios en filtros
colorFiltro.addEventListener("change", aplicarFiltros);
legendariaFiltro.addEventListener("change", aplicarFiltros);

// Función para aplicar filtros
function aplicarFiltros() {
  const colorSeleccionado = colorFiltro.value;
  const legendariaSeleccionada = legendariaFiltro.value;

  let resultado = [...cartas];

  // Filtrar por color
  if (colorSeleccionado !== "todos") {
    resultado = resultado.filter(c => c.color === colorSeleccionado);
  }

  // Filtrar por si es legendaria
  if (legendariaSeleccionada !== "todas") {
    const esLegendaria = legendariaSeleccionada === "true";
    resultado = resultado.filter(c => c.legendaria === esLegendaria);
  }

  renderizarCartas(resultado);
}

const verCarritoBtn = document.getElementById("verCarritoBtn");
const vaciarCarritoBtn = document.getElementById("vaciarCarritoBtn");
const carritoCantidad = document.getElementById("carritoCantidad");

// Mostrar carrito con SweetAlert
verCarritoBtn.addEventListener("click", () => {
  if (carrito.length === 0) {
    Swal.fire("Tu carrito está vacío.");
    return;
  }

  let html = "<ul class='list-group'>";
  carrito.forEach(carta => {
    html += `<li class="list-group-item">${carta.nombre} - ${carta.color}</li>`;
  });
  html += "</ul>";

  Swal.fire({
    title: "Carrito de compras",
    html,
    confirmButtonText: "Cerrar"
  });
});

// Vaciar carrito con confirmación
vaciarCarritoBtn.addEventListener("click", () => {
  if (carrito.length === 0) {
    Swal.fire("No hay nada que vaciar.");
    return;
  }

  Swal.fire({
    title: "¿Estás seguro?",
    text: "Se eliminarán todas las cartas del carrito.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, vaciar",
    cancelButtonText: "Cancelar"
  }).then(result => {
    if (result.isConfirmed) {
      vaciarCarrito();
      actualizarContadorCarrito();
      Swal.fire("Carrito vaciado", "", "success");
    }
  });
});

// Actualizar el contador del botón
function actualizarContadorCarrito() {
  carritoCantidad.textContent = carrito.length;
}

// Cada vez que agregamos al carrito:
function agregarAlCarrito(id) {
  const seleccionada = cartas.find(c => c.id === id);
  carrito.push(seleccionada);
  actualizarContadorCarrito();
  guardarCarritoEnStorage();
  Swal.fire({
    title: "Agregada al carrito",
    text: seleccionada.nombre,
    icon: "success",
    timer: 1000,
    showConfirmButton: false
  });
}

function vaciarCarrito() {
  carrito = [];
  actualizarContadorCarrito();
  guardarCarritoEnStorage();
}

function guardarCarritoEnStorage() {
  localStorage.setItem("carritoMagic", JSON.stringify(carrito));
}

function cargarCarritoDesdeStorage() {
  const data = localStorage.getItem("carritoMagic");
  if (data) {
    carrito = JSON.parse(data);
    actualizarContadorCarrito();
  }
}


