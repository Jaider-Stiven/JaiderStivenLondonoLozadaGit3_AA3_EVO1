/**
 * ============================================================
 * ARCHIVO: consulta.js
 * MÓDULO:  Consulta y listado de registros
 * EVIDENCIA: GA7-220501096-AA3-EV01
 * DESCRIPCIÓN:
 *   Carga, filtra y renderiza los registros desde localStorage.
 *   Permite buscar por nombre/documento, ver detalle completo,
 *   eliminar registros individuales o todos, y exportar a CSV.
 * ============================================================
 */

'use strict';

// -------------------------------------------------------
// REFERENCIAS AL DOM
// -------------------------------------------------------
const tbodyRegistros    = document.getElementById('tbodyRegistros');
const inputBuscador     = document.getElementById('buscador');
const btnBuscar         = document.getElementById('btnBuscar');
const btnLimpiarBusq    = document.getElementById('btnLimpiarBusqueda');
const emptyState        = document.getElementById('emptyState');
const spanTotalClientes = document.getElementById('totalClientes');
const spanTotalVentas   = document.getElementById('totalVentas');
const spanTotalIngresos = document.getElementById('totalIngresos');
const btnExportar       = document.getElementById('btnExportar');
const btnBorrarTodo     = document.getElementById('btnBorrarTodo');

// Modal de detalle
const modalDetalle      = document.getElementById('modalDetalle');
const overlayDetalle    = document.getElementById('overlayDetalle');
const detalleContenido  = document.getElementById('detalleContenido');
const btnCerrarDetalle  = document.getElementById('cerrarDetalle');

// Modal eliminar
const modalEliminar     = document.getElementById('modalEliminar');
const overlayEliminar   = document.getElementById('overlayEliminar');
const btnCancelarElim   = document.getElementById('cancelarEliminar');
const btnConfirmarElim  = document.getElementById('confirmarEliminar');

// -------------------------------------------------------
// VARIABLE TEMPORAL: guarda el ID del registro a eliminar
// -------------------------------------------------------
let idParaEliminar = null;

// -------------------------------------------------------
// RENDERIZADO DE LA TABLA
// -------------------------------------------------------

/**
 * Renderiza las filas de la tabla con los registros dados.
 * Actualiza también las estadísticas superiores.
 * @param {Array} lista - Array de registros a mostrar.
 */
function renderizarTabla(lista) {
  // Limpiar filas anteriores
  tbodyRegistros.innerHTML = '';

  if (lista.length === 0) {
    // Mostrar estado vacío
    emptyState.classList.remove('hidden');
    document.querySelector('.data-table').style.display = 'none';
    actualizarEstadisticas([]);
    return;
  }

  // Ocultar estado vacío y mostrar tabla
  emptyState.classList.add('hidden');
  document.querySelector('.data-table').style.display = 'table';

  // Construir cada fila de la tabla
  lista.forEach(function (registro, indice) {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${indice + 1}</td>
      <td>
        <strong>${registro.tipoDoc || '—'}</strong><br />
        <small>${registro.numDoc || '—'}</small>
      </td>
      <td>
        <strong>${registro.nombres || ''} ${registro.apellidos || ''}</strong><br />
        <small style="color:var(--color-text-muted)">${registro.email || ''}</small>
      </td>
      <td>${registro.telefono || '—'}</td>
      <td>
        ${registro.producto || '—'}
        ${registro.categoria
          ? `<br/><span class="badge-cat">${registro.categoria}</span>`
          : ''
        }
      </td>
      <td>${registro.cantidad || 0}</td>
      <td style="color:var(--color-accent);font-weight:700;">
        ${formatearMoneda(registro.totalVenta)}
      </td>
      <td>${formatearFecha(registro.fechaRegistro)}</td>
      <td>
        <div class="table-actions">
          <button
            class="btn-icon"
            title="Ver detalle"
            onclick="verDetalle('${registro.id}')">
            👁
          </button>
          <button
            class="btn-icon btn-icon--danger"
            title="Eliminar"
            onclick="pedirEliminar('${registro.id}')">
            ✕
          </button>
        </div>
      </td>
    `;

    tbodyRegistros.appendChild(fila);
  });

  // Actualizar estadísticas con la lista visible
  actualizarEstadisticas(lista);
}

// -------------------------------------------------------
// ESTADÍSTICAS
// -------------------------------------------------------

/**
 * Actualiza los chips de estadísticas en la parte superior.
 * @param {Array} lista - Lista actual de registros mostrados.
 */
function actualizarEstadisticas(lista) {
  // Total de clientes únicos (por número de documento)
  const documentosUnicos = new Set(lista.map(r => r.numDoc));
  spanTotalClientes.textContent = documentosUnicos.size;

  // Total de filas (ventas)
  spanTotalVentas.textContent = lista.length;

  // Suma de ingresos
  const ingresos = lista.reduce((acc, r) => acc + (Number(r.totalVenta) || 0), 0);
  spanTotalIngresos.textContent = formatearMoneda(ingresos);
}

// -------------------------------------------------------
// CARGA INICIAL
// -------------------------------------------------------

/**
 * Carga todos los registros y los muestra en la tabla.
 * Se llama al iniciar la página.
 */
function cargarRegistros() {
  const todos = obtenerRegistros();
  // Ordenar del más reciente al más antiguo
  todos.sort((a, b) => b.timestamp - a.timestamp);
  renderizarTabla(todos);
}

// Ejecutar al cargar la página
cargarRegistros();

// -------------------------------------------------------
// BÚSQUEDA / FILTRO
// -------------------------------------------------------

/**
 * Filtra los registros según el texto ingresado en el buscador.
 * Busca en: nombres, apellidos, número de documento.
 */
function filtrarRegistros() {
  const termino = inputBuscador.value.trim().toLowerCase();
  const todos = obtenerRegistros();

  if (!termino) {
    // Si el campo está vacío, mostrar todos
    renderizarTabla(todos);
    return;
  }

  const filtrados = todos.filter(function (r) {
    const nombre    = `${r.nombres} ${r.apellidos}`.toLowerCase();
    const documento = (r.numDoc || '').toLowerCase();
    const ciudad    = (r.ciudad || '').toLowerCase();
    const producto  = (r.producto || '').toLowerCase();

    return (
      nombre.includes(termino) ||
      documento.includes(termino) ||
      ciudad.includes(termino) ||
      producto.includes(termino)
    );
  });

  renderizarTabla(filtrados);
}

// Eventos del buscador
btnBuscar.addEventListener('click', filtrarRegistros);

inputBuscador.addEventListener('keydown', function (e) {
  // Buscar al presionar Enter
  if (e.key === 'Enter') filtrarRegistros();
});

btnLimpiarBusq.addEventListener('click', function () {
  inputBuscador.value = '';
  cargarRegistros();
});

// -------------------------------------------------------
// VER DETALLE DE UN REGISTRO
// -------------------------------------------------------

/**
 * Muestra el modal con el detalle completo de un registro.
 * @param {string} id - ID del registro a detallar.
 */
function verDetalle(id) {
  const registros = obtenerRegistros();
  const registro  = registros.find(r => r.id === id);

  if (!registro) return;

  // Construir el contenido HTML del detalle
  const campos = [
    { label: 'Tipo de documento', value: registro.tipoDoc || '—' },
    { label: 'Número de documento', value: registro.numDoc || '—' },
    { label: 'Nombres', value: registro.nombres || '—' },
    { label: 'Apellidos', value: registro.apellidos || '—' },
    { label: 'Correo electrónico', value: registro.email || '—' },
    { label: 'Teléfono', value: registro.telefono || '—' },
    { label: 'Dirección', value: registro.direccion || '—' },
    { label: 'Ciudad', value: registro.ciudad || '—' },
    { label: 'Producto / Servicio', value: registro.producto || '—' },
    { label: 'Categoría', value: registro.categoria || '—' },
    { label: 'Cantidad', value: registro.cantidad || 0 },
    { label: 'Precio unitario', value: formatearMoneda(registro.precioUnitario) },
    { label: 'Total venta', value: formatearMoneda(registro.totalVenta) },
    { label: 'Fecha de registro', value: formatearFecha(registro.fechaRegistro) },
    { label: 'Observaciones', value: registro.observaciones || 'Sin observaciones' }
  ];

  // Generar HTML de cada campo
  detalleContenido.innerHTML = campos.map(c => `
    <div class="detalle-item">
      <span class="detalle-item__label">${c.label}</span>
      <span class="detalle-item__value">${c.value}</span>
    </div>
  `).join('');

  modalDetalle.classList.remove('hidden');
}

// Cerrar modal de detalle
btnCerrarDetalle.addEventListener('click', function () {
  modalDetalle.classList.add('hidden');
});

overlayDetalle.addEventListener('click', function () {
  modalDetalle.classList.add('hidden');
});

// -------------------------------------------------------
// ELIMINAR UN REGISTRO
// -------------------------------------------------------

/**
 * Abre el modal de confirmación para eliminar un registro.
 * @param {string} id - ID del registro a eliminar.
 */
function pedirEliminar(id) {
  idParaEliminar = id;
  modalEliminar.classList.remove('hidden');
}

// Cancelar eliminación
btnCancelarElim.addEventListener('click', function () {
  idParaEliminar = null;
  modalEliminar.classList.add('hidden');
});

overlayEliminar.addEventListener('click', function () {
  idParaEliminar = null;
  modalEliminar.classList.add('hidden');
});

// Confirmar eliminación
btnConfirmarElim.addEventListener('click', function () {
  if (!idParaEliminar) return;

  eliminarRegistro(idParaEliminar);
  idParaEliminar = null;
  modalEliminar.classList.add('hidden');

  // Refrescar la tabla manteniendo el filtro activo
  filtrarRegistros();
});

// -------------------------------------------------------
// BORRAR TODOS LOS REGISTROS
// -------------------------------------------------------
btnBorrarTodo.addEventListener('click', function () {
  const confirmacion = window.confirm(
    '¿Está seguro de que desea eliminar TODOS los registros?\nEsta acción no se puede deshacer.'
  );
  if (confirmacion) {
    limpiarTodosLosRegistros();
    cargarRegistros();
  }
});

// -------------------------------------------------------
// EXPORTAR A CSV
// -------------------------------------------------------

/**
 * Genera y descarga un archivo CSV con todos los registros.
 * Incluye encabezados y datos separados por comas.
 */
btnExportar.addEventListener('click', function () {
  const registros = obtenerRegistros();

  if (registros.length === 0) {
    alert('No hay registros para exportar.');
    return;
  }

  // Encabezados del CSV
  const encabezados = [
    'ID', 'Tipo Doc', 'Num Doc', 'Nombres', 'Apellidos',
    'Email', 'Teléfono', 'Dirección', 'Ciudad', 'Fecha Registro',
    'Producto', 'Categoría', 'Cantidad', 'Precio Unitario', 'Total Venta',
    'Observaciones', 'Timestamp'
  ];

  // Convertir cada registro a una fila CSV
  const filas = registros.map(function (r) {
    return [
      r.id,
      r.tipoDoc,
      r.numDoc,
      r.nombres,
      r.apellidos,
      r.email,
      r.telefono,
      r.direccion,
      r.ciudad,
      r.fechaRegistro,
      r.producto,
      r.categoria,
      r.cantidad,
      r.precioUnitario,
      r.totalVenta,
      // Escapar comillas en observaciones
      `"${(r.observaciones || '').replace(/"/g, '""')}"`,
      r.timestamp
    ].join(',');
  });

  // Construir el contenido completo del CSV
  const contenidoCSV = [encabezados.join(','), ...filas].join('\n');

  // Crear y descargar el archivo
  const blob = new Blob(['\uFEFF' + contenidoCSV], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', `salestrack_registros_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Liberar el objeto URL de memoria
  URL.revokeObjectURL(url);
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
