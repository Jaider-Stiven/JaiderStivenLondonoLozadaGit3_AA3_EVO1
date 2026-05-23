/**
 * ============================================================
 * ARCHIVO: dashboard.js
 * MÓDULO:  Estadísticas del dashboard (página de inicio)
 * EVIDENCIA: GA7-220501096-AA3-EV01
 * DESCRIPCIÓN:
 *   Actualiza las tarjetas flotantes del hero con datos
 *   reales obtenidos del localStorage al cargar el inicio.
 * ============================================================
 */

'use strict';

/**
 * Actualiza las estadísticas visibles en la página de inicio.
 * Lee los datos desde localStorage a través de las funciones
 * compartidas definidas en app.js.
 */
function actualizarDashboard() {
  const registros = obtenerRegistros();

  // Total de clientes únicos (por número de documento)
  const clientesUnicos = new Set(registros.map(r => r.numDoc)).size;

  // Total de ventas (número de transacciones)
  const totalVentas = registros.length;

  // Suma total de ingresos
  const totalIngresos = registros.reduce((acc, r) => acc + (Number(r.totalVenta) || 0), 0);

  // Actualizar el DOM con los valores calculados
  const elClientes = document.getElementById('stat-clientes');
  const elVentas   = document.getElementById('stat-ventas');
  const elTotal    = document.getElementById('stat-total');

  if (elClientes) elClientes.textContent = clientesUnicos;
  if (elVentas)   elVentas.textContent   = totalVentas;
  if (elTotal)    elTotal.textContent    = formatearMoneda(totalIngresos);
}

// Ejecutar al cargar la página de inicio
actualizarDashboard();


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
