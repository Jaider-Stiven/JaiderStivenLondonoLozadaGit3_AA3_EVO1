/**
 * ============================================================
 * ARCHIVO: registro.js
 * MÓDULO:  Lógica del formulario de registro
 * EVIDENCIA: GA7-220501096-AA3-EV01
 * DESCRIPCIÓN:
 *   Maneja la validación en tiempo real del formulario,
 *   el cálculo automático del total de venta, el guardado
 *   en localStorage y la confirmación mediante modal.
 *
 * ESTÁNDAR DE CODIFICACIÓN:
 *   - Variables y funciones en camelCase
 *   - Constantes en UPPER_SNAKE_CASE
 *   - Comentarios JSDoc en funciones públicas
 *   - Uso de 'use strict' para prevenir errores implícitos
 *   - Separación de responsabilidades (validar / guardar / UI)
 * ============================================================
 */

'use strict';

// -------------------------------------------------------
// REFERENCIAS AL DOM (se obtienen cuando carga la página)
// -------------------------------------------------------
const formulario       = document.getElementById('formRegistro');
const inputCantidad    = document.getElementById('cantidad');
const inputPrecio      = document.getElementById('precioUnitario');
const spanTotal        = document.getElementById('totalVenta');
const textareaObs      = document.getElementById('observaciones');
const spanCharCount    = document.getElementById('charCount');
const btnLimpiar       = document.getElementById('btnLimpiar');
const modalConfirm     = document.getElementById('modalConfirm');
const spanModalDesc    = document.getElementById('modalDesc');
const btnModalNuevo    = document.getElementById('modalNuevo');
const inputFecha       = document.getElementById('fechaRegistro');

// -------------------------------------------------------
// INICIALIZACIÓN: establecer fecha de hoy por defecto
// -------------------------------------------------------
(function inicializarFecha() {
  const hoy = new Date().toISOString().split('T')[0];
  inputFecha.value = hoy;
})();

// -------------------------------------------------------
// CÁLCULO AUTOMÁTICO DEL TOTAL
// Se ejecuta cada vez que cambia cantidad o precio unitario
// -------------------------------------------------------

/**
 * Calcula el total de la venta multiplicando cantidad × precio.
 * Actualiza el elemento visual en la página.
 */
function calcularTotal() {
  const cantidad = parseFloat(inputCantidad.value) || 0;
  const precio   = parseFloat(inputPrecio.value)   || 0;
  const total    = cantidad * precio;

  // Mostrar el total formateado en la pantalla
  spanTotal.textContent = formatearMoneda(total);
}

// Escuchar cambios en los campos numéricos para recalcular
inputCantidad.addEventListener('input', calcularTotal);
inputPrecio.addEventListener('input', calcularTotal);

// -------------------------------------------------------
// CONTADOR DE CARACTERES EN TEXTAREA
// -------------------------------------------------------
textareaObs.addEventListener('input', function () {
  const actual  = this.value.length;
  const maximo  = this.getAttribute('maxlength');
  spanCharCount.textContent = `${actual} / ${maximo}`;
});

// -------------------------------------------------------
// VALIDACIÓN DE CAMPOS
// -------------------------------------------------------

/**
 * Muestra un mensaje de error bajo un campo del formulario.
 * @param {string} idCampo - ID del input.
 * @param {string} mensaje - Texto del error. Vacío para limpiar.
 */
function mostrarError(idCampo, mensaje) {
  const input = document.getElementById(idCampo);
  const error = document.getElementById('error-' + idCampo);
  if (!input || !error) return;

  if (mensaje) {
    input.classList.add('input-error');
    input.classList.remove('input-ok');
    error.textContent = mensaje;
  } else {
    input.classList.remove('input-error');
    input.classList.add('input-ok');
    error.textContent = '';
  }
}

/**
 * Valida todos los campos requeridos del formulario.
 * Aplica reglas específicas por campo.
 * @returns {boolean} - true si el formulario es válido.
 */
function validarFormulario() {
  let esValido = true;

  // --- Tipo de documento ---
  const tipoDoc = document.getElementById('tipoDoc').value.trim();
  if (!tipoDoc) {
    mostrarError('tipoDoc', 'Seleccione un tipo de documento.');
    esValido = false;
  } else {
    mostrarError('tipoDoc', '');
  }

  // --- Número de documento (solo dígitos) ---
  const numDoc = document.getElementById('numDoc').value.trim();
  if (!numDoc) {
    mostrarError('numDoc', 'Ingrese el número de documento.');
    esValido = false;
  } else if (!/^\d{5,15}$/.test(numDoc)) {
    mostrarError('numDoc', 'El documento debe tener entre 5 y 15 dígitos.');
    esValido = false;
  } else {
    mostrarError('numDoc', '');
  }

  // --- Nombres ---
  const nombres = document.getElementById('nombres').value.trim();
  if (!nombres) {
    mostrarError('nombres', 'Ingrese los nombres del cliente.');
    esValido = false;
  } else if (nombres.length < 2) {
    mostrarError('nombres', 'Los nombres deben tener al menos 2 caracteres.');
    esValido = false;
  } else {
    mostrarError('nombres', '');
  }

  // --- Apellidos ---
  const apellidos = document.getElementById('apellidos').value.trim();
  if (!apellidos) {
    mostrarError('apellidos', 'Ingrese los apellidos del cliente.');
    esValido = false;
  } else if (apellidos.length < 2) {
    mostrarError('apellidos', 'Los apellidos deben tener al menos 2 caracteres.');
    esValido = false;
  } else {
    mostrarError('apellidos', '');
  }

  // --- Correo electrónico ---
  const email = document.getElementById('email').value.trim();
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    mostrarError('email', 'Ingrese el correo electrónico.');
    esValido = false;
  } else if (!regexEmail.test(email)) {
    mostrarError('email', 'El formato del correo no es válido.');
    esValido = false;
  } else {
    mostrarError('email', '');
  }

  // --- Teléfono (10 dígitos en Colombia) ---
  const telefono = document.getElementById('telefono').value.trim();
  if (!telefono) {
    mostrarError('telefono', 'Ingrese el número de teléfono.');
    esValido = false;
  } else if (!/^\d{7,10}$/.test(telefono)) {
    mostrarError('telefono', 'El teléfono debe tener entre 7 y 10 dígitos.');
    esValido = false;
  } else {
    mostrarError('telefono', '');
  }

  // --- Fecha de registro ---
  const fechaRegistro = document.getElementById('fechaRegistro').value;
  if (!fechaRegistro) {
    mostrarError('fechaRegistro', 'Seleccione la fecha de registro.');
    esValido = false;
  } else {
    mostrarError('fechaRegistro', '');
  }

  // --- Producto/servicio ---
  const producto = document.getElementById('producto').value.trim();
  if (!producto) {
    mostrarError('producto', 'Ingrese el nombre del producto o servicio.');
    esValido = false;
  } else {
    mostrarError('producto', '');
  }

  // --- Cantidad ---
  const cantidad = parseFloat(document.getElementById('cantidad').value);
  if (!cantidad || cantidad < 1) {
    mostrarError('cantidad', 'La cantidad debe ser mayor a 0.');
    esValido = false;
  } else {
    mostrarError('cantidad', '');
  }

  // --- Precio unitario ---
  const precio = parseFloat(document.getElementById('precioUnitario').value);
  if (isNaN(precio) || precio < 0) {
    mostrarError('precioUnitario', 'Ingrese un precio válido (mayor o igual a 0).');
    esValido = false;
  } else {
    mostrarError('precioUnitario', '');
  }

  return esValido;
}

// -------------------------------------------------------
// RECOLECCIÓN DE DATOS DEL FORMULARIO
// -------------------------------------------------------

/**
 * Lee todos los valores del formulario y los agrupa en un objeto.
 * @returns {Object} - Objeto con los datos del cliente y la venta.
 */
function recolectarDatos() {
  const cantidad = parseFloat(document.getElementById('cantidad').value) || 0;
  const precio   = parseFloat(document.getElementById('precioUnitario').value) || 0;

  return {
    // Datos personales
    tipoDoc:       document.getElementById('tipoDoc').value,
    numDoc:        document.getElementById('numDoc').value.trim(),
    nombres:       capitalizarTexto(document.getElementById('nombres').value.trim()),
    apellidos:     capitalizarTexto(document.getElementById('apellidos').value.trim()),
    email:         document.getElementById('email').value.trim().toLowerCase(),
    telefono:      document.getElementById('telefono').value.trim(),
    direccion:     document.getElementById('direccion').value.trim(),
    ciudad:        capitalizarTexto(document.getElementById('ciudad').value.trim()),
    fechaRegistro: document.getElementById('fechaRegistro').value,
    // Datos de venta
    producto:      capitalizarTexto(document.getElementById('producto').value.trim()),
    categoria:     document.getElementById('categoria').value,
    cantidad:      cantidad,
    precioUnitario:precio,
    totalVenta:    cantidad * precio,
    observaciones: document.getElementById('observaciones').value.trim()
  };
}

// -------------------------------------------------------
// ENVÍO DEL FORMULARIO
// -------------------------------------------------------
formulario.addEventListener('submit', function (event) {
  // Prevenir recarga de la página (comportamiento nativo del form)
  event.preventDefault();

  // Validar antes de guardar
  if (!validarFormulario()) {
    // Hacer scroll al primer error visible
    const primerError = document.querySelector('.input-error');
    if (primerError) {
      primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // Recolectar y guardar los datos
  const datos = recolectarDatos();
  const registroGuardado = agregarRegistro(datos);

  // Mostrar confirmación al usuario
  spanModalDesc.textContent =
    `${datos.nombres} ${datos.apellidos} — Venta: ${formatearMoneda(datos.totalVenta)}`;
  modalConfirm.classList.remove('hidden');
});

// -------------------------------------------------------
// LIMPIAR FORMULARIO
// -------------------------------------------------------
btnLimpiar.addEventListener('click', function () {
  formulario.reset();
  // Restablecer fecha a hoy
  inputFecha.value = new Date().toISOString().split('T')[0];
  // Restablecer total
  spanTotal.textContent = '$0';
  // Limpiar estilos de error y ok
  document.querySelectorAll('.form-control').forEach(el => {
    el.classList.remove('input-error', 'input-ok');
  });
  // Limpiar mensajes de error
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
  });
  // Restablecer contador de caracteres
  spanCharCount.textContent = '0 / 300';
});

// -------------------------------------------------------
// MODAL: botón "Nuevo registro" → limpiar y cerrar modal
// -------------------------------------------------------
btnModalNuevo.addEventListener('click', function () {
  modalConfirm.classList.add('hidden');
  btnLimpiar.click(); // Reutilizar la lógica de limpieza
});


// ======================================
// FUNCIONES DEMO DE API LOGIN
// ======================================

function registrarDemo() {

    APIUsuarios.registrar({
        nombre: "Admin",
        correo: "admin@gmail.com",
        password: "123456"
    });

    console.log("Usuario registrado");
}

function loginDemo() {

    const resultado = APIUsuarios.login(
        "admin@gmail.com",
        "123456"
    );

    console.log(resultado);
}
