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

// Mostrar el carrito
verCarritoBtn.addEventListener("click", () => {
  if (carrito.length === 0) {
    Swal.fire("Tu carrito está vacío.");
    return;
  }

  let html = "<ul class='list-group'>";
  carrito.forEach(carta => {
    const subtotal = carta.precio * carta.cantidad;
    html += `
      <li class="list-group-item d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <img src="${carta.imagen}" alt="${carta.nombre}" style="width: 40px; height: 40px; margin-right: 10px;">
          <div>
            <div>${carta.nombre}</div>
            <div>$${carta.precio} x ${carta.cantidad} = <strong>$${subtotal}</strong></div>
          </div>
        </div>
        <div class="d-flex align-items-center">
          <button class="btn btn-sm btn-outline-secondary me-1" onclick="cambiarCantidad(${carta.id}, -1)">-</button>
          <button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad(${carta.id}, 1)">+</button>
        </div>
      </li>
    `;
  });
  html += "</ul>";

  const total = carrito.reduce((acc, c) => acc + c.precio * c.cantidad, 0);

  html += `
    <div class="mt-3 text-end"><strong>Total: $${total}</strong></div>
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

// Cambiar cantidad de cartas
function cambiarCantidad(id, cambio) {
  const index = carrito.findIndex(c => c.id === id);
  if (index !== -1) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
      carrito.splice(index, 1);
    }
    actualizarContadorCarrito();
    guardarCarritoEnStorage();
    verCarritoBtn.click(); // Reabrir modal actualizado
  }
}

// Agregar carta al carrito
function agregarAlCarrito(id) {
  const seleccionada = cartas.find(c => c.id === id);
  const index = carrito.findIndex(c => c.id === id);

  if (index !== -1) {
    carrito[index].cantidad += 1;
  } else {
    carrito.push({ ...seleccionada, cantidad: 1 });
  }

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
  const totalCantidad = carrito.reduce((acc, c) => acc + c.cantidad, 0);
  carritoCantidad.textContent = totalCantidad;
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
  if (carrito.length === 0) {
    Swal.fire("Carrito vacío", "Agregá cartas antes de finalizar la compra.", "info");
    return;
  }

  const total = carrito.reduce((sum, carta) => sum + carta.precio * carta.cantidad, 0);

  Swal.fire({
    title: "Finalizar Compra",
    html: `
      <p>Total a pagar: <strong>$${total}</strong></p>
      <input type="text" id="nombre" class="swal2-input" placeholder="Nombre completo" value="Federico Test">
      <input type="text" id="direccion" class="swal2-input" placeholder="Dirección" value="Calle Siempre Viva 123">
      <input type="text" id="tarjeta" class="swal2-input" placeholder="Número de tarjeta" value="1234 5678 9012 3456">
      <input type="text" id="codigo" class="swal2-input" placeholder="Código de seguridad" value="123">
    `,
    showCancelButton: true,
    confirmButtonText: "Confirmar compra",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const nombre = document.getElementById("nombre").value.trim();
      const direccion = document.getElementById("direccion").value.trim();
      const tarjeta = document.getElementById("tarjeta").value.trim();
      const codigo = document.getElementById("codigo").value.trim();

      if (!nombre || !direccion || !tarjeta || !codigo) {
        Swal.showValidationMessage("Por favor, completá todos los campos.");
        return false;
      }

      return { nombre, direccion, tarjeta, codigo };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      carrito = [];
      guardarCarritoEnStorage();
      actualizarContadorCarrito();

      Swal.fire({
        icon: "success",
        title: "¡Compra realizada!",
        text: `Gracias, ${result.value.nombre}. El total fue de $${total}.`,
        confirmButtonText: "Aceptar"
      }).then(() => {
        verCarritoBtn.click(); // Refresca el modal del carrito vacío
      });
    }
  });
}
