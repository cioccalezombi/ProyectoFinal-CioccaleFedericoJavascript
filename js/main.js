let cartas = [];
let carrito = [];

// Elementos del DOM
const catalogo = document.getElementById("catalogo");
const colorFiltro = document.getElementById("colorFiltro");
const legendariaFiltro = document.getElementById("legendariaFiltro");
const verCarritoBtn = document.getElementById("verCarritoBtn");
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

// Mostrar el carrito con botones de "Finalizar Compra" y "Vaciar Carrito"
verCarritoBtn.addEventListener("click", () => {
  if (carrito.length === 0) {
    Swal.fire("Tu carrito está vacío.");
    return;
  }

let html = "<ul class='list-group'>";
carrito.forEach(carta => {
  html += `
    <li class="list-group-item d-flex align-items-center">
      <img src="${carta.imagen}" alt="${carta.nombre}" style="width: 40px; height: 40px; margin-right: 10px;">
      ${carta.nombre} - $${carta.precio}
    </li>
  `;
});
html += "</ul>";

  html += `
    <button id="finalizarCompraBtn" class="btn btn-success mt-3">Finalizar Compra</button>
    <button id="vaciarCarritoBtn" class="btn btn-danger mt-3">Vaciar Carrito</button>
  `;

  Swal.fire({
    title: "Carrito de compras",
    html,
    showConfirmButton: false
  });

  document.addEventListener("click", (event) => {
    if (event.target.id === "finalizarCompraBtn") {
      mostrarFormularioCompra();
    }
    if (event.target.id === "vaciarCarritoBtn") {
      confirmarVaciadoCarrito();
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

// Vaciar carrito con confirmación
function confirmarVaciadoCarrito() {
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

// Formulario de compra al finalizar
function mostrarFormularioCompra() {
  Swal.fire({
    title: "Completa tus datos para la compra",
    html: `
      <input id="nombreComprador" class="swal2-input" placeholder="Nombre">
      <input id="emailComprador" type="email" class="swal2-input" placeholder="Correo electrónico">
      <input id="tarjetaComprador" class="swal2-input" placeholder="Número de tarjeta">
      <input id="cvvComprador" class="swal2-input" placeholder="Código de seguridad (CVV)">
      <input id="direccionComprador" class="swal2-input" placeholder="Dirección">
    `,
    showCancelButton: true,
    confirmButtonText: "Comprar",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const nombre = document.getElementById("nombreComprador").value;
      const email = document.getElementById("emailComprador").value;
      const tarjeta = document.getElementById("tarjetaComprador").value;
      const cvv = document.getElementById("cvvComprador").value;
      const direccion = document.getElementById("direccionComprador").value;

      if (!nombre || !email || !tarjeta || !cvv || !direccion) {
        Swal.showValidationMessage("Todos los campos obligatorios deben estar completos.");
        return false;
      }

      return { nombre, email, tarjeta, cvv, direccion, carrito };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      console.log("Datos de la compra:", result.value);
      Swal.fire("¡Compra realizada!", "Te contactaremos pronto.", "success");
      vaciarCarrito();
    }
  });
}