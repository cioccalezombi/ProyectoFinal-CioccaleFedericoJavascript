let cartas = [];
let carrito = [];

// Elementos del DOM
const catalogo = document.getElementById("catalogo");
const colorFiltro = document.getElementById("colorFiltro");
const legendariaFiltro = document.getElementById("legendariaFiltro");
const verCarritoBtn = document.getElementById("verCarritoBtn");
const vaciarCarritoBtn = document.getElementById("vaciarCarritoBtn");
const carritoCantidad = document.getElementById("carritoCantidad");

// Cargar cartas desde JSON al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  fetch("data/cartas.json")
    .then(response => response.json())
    .then(data => {
      cartas = data;
      renderizarCartas(cartas);
      cargarCarritoDesdeStorage(); // Cargar carrito si ya existía
    })
    .catch(err => console.error("Error al cargar cartas:", err));
});

// Renderizar cartas en el catálogo
function renderizarCartas(lista) {
  catalogo.innerHTML = "";
  lista.forEach(carta => {
    const cartaHTML = document.createElement("div");
    cartaHTML.className = "col-sm-6 col-md-4 col-lg-3";
    cartaHTML.innerHTML = `
      <div class="card h-100 shadow-sm text-center" style="cursor:pointer;">
        <img src="${carta.imagen}" class="card-img-top" alt="${carta.nombre}">
        <div class="card-body">
          <p class="card-text price-tag button-55">$${carta.precio}</p>
        </div>
      </div>
    `;

    // Confirmar antes de agregar al carrito
    cartaHTML.querySelector('.card').addEventListener('click', () => {
      Swal.fire({
        title: `¿Agregar "${carta.nombre}" al carrito?`,
        text: "¿Estás seguro que deseas agregar esta carta?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, agregar",
        cancelButtonText: "Cancelar"
      }).then(result => {
        if (result.isConfirmed) {
          agregarAlCarrito(carta.id);
        }
      });
    });

    catalogo.appendChild(cartaHTML);
  });
}

// Aplicar filtros por color y legendaria
colorFiltro.addEventListener("change", aplicarFiltros);
legendariaFiltro.addEventListener("change", aplicarFiltros);

function aplicarFiltros() {
  const colorSeleccionado = colorFiltro.value;
  const legendariaSeleccionada = legendariaFiltro.value;

  let resultado = [...cartas];

  if (colorSeleccionado !== "todos") {
    resultado = resultado.filter(c => c.color === colorSeleccionado);
  }

  if (legendariaSeleccionada !== "todas") {
    const esLegendaria = legendariaSeleccionada === "true";
    resultado = resultado.filter(c => c.legendaria === esLegendaria);
  }

  renderizarCartas(resultado);
}

// Mostrar el carrito con SweetAlert
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

// Agregar carta al carrito
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

// Contador en el botón de carrito
function actualizarContadorCarrito() {
  carritoCantidad.textContent = carrito.length;
}

// Vaciar carrito
function vaciarCarrito() {
  carrito = [];
  actualizarContadorCarrito();
  guardarCarritoEnStorage();
}

// Guardar y cargar carrito desde localStorage
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
