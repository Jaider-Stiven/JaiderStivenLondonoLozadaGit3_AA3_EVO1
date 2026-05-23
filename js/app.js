/**
 * ============================================================
 * ARCHIVO: app.js
 * MÓDULO:  Funciones compartidas / Capa de datos
 * EVIDENCIA: GA7-220501096-AA3-EV01
 * DESCRIPCIÓN:
 *   Contiene las funciones utilitarias que son usadas en
 *   todas las páginas del sistema: lectura y escritura en
 *   localStorage, formateo de moneda y fechas.
 * ============================================================
 */

'use strict';

// -------------------------------------------------------
// CONSTANTE: clave usada en localStorage para los registros
// -------------------------------------------------------
const STORAGE_KEY = 'salestrack_registros';

/**
 * Obtiene todos los registros guardados en localStorage.
 * @returns {Array} - Array de objetos con los datos de clientes/ventas.
 */
function obtenerRegistros() {
  const data = localStorage.getItem(STORAGE_KEY);
  // Si no existe nada guardado, retorna un array vacío
  return data ? JSON.parse(data) : [];
}

/**
 * Guarda el array completo de registros en localStorage.
 * Reemplaza el contenido anterior.
 * @param {Array} registros - Array con todos los registros.
 */
function guardarRegistros(registros) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
}

/**
 * Agrega un nuevo registro al almacenamiento.
 * Genera automáticamente un ID único y una marca de tiempo.
 * @param {Object} nuevoRegistro - Datos del cliente y la venta.
 * @returns {Object} - El registro con ID y timestamp asignados.
 */
function agregarRegistro(nuevoRegistro) {
  const registros = obtenerRegistros();

  // Asignar un identificador único basado en la fecha actual
  nuevoRegistro.id = Date.now().toString();
  nuevoRegistro.timestamp = new Date().toISOString();

  registros.push(nuevoRegistro);
  guardarRegistros(registros);

  return nuevoRegistro;
}

/**
 * Elimina un registro por su ID.
 * @param {string} id - ID del registro a eliminar.
 * @returns {boolean} - true si fue eliminado, false si no existe.
 */
function eliminarRegistro(id) {
  let registros = obtenerRegistros();
  const longitudAnterior = registros.length;

  // Filtrar todos los registros excepto el que tiene ese ID
  registros = registros.filter(r => r.id !== id);

  if (registros.length === longitudAnterior) {
    // No se encontró el registro
    return false;
  }

  guardarRegistros(registros);
  return true;
}

/**
 * Elimina TODOS los registros del almacenamiento.
 * Usar con precaución.
 */
function limpiarTodosLosRegistros() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Formatea un número como moneda colombiana (COP).
 * Ejemplo: 150000 → "$150,000.00"
 * @param {number} valor - Valor numérico a formatear.
 * @returns {string} - Cadena formateada.
 */
function formatearMoneda(valor) {
  if (isNaN(valor) || valor === null || valor === undefined) return '$0.00';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(valor));
}

/**
 * Formatea una cadena de fecha (YYYY-MM-DD) a formato legible.
 * Ejemplo: "2024-05-15" → "15 de mayo de 2024"
 * @param {string} fechaStr - Fecha en formato ISO.
 * @returns {string} - Fecha formateada en español.
 */
function formatearFecha(fechaStr) {
  if (!fechaStr) return '—';
  // Se agrega T00:00:00 para evitar desfase horario
  const fecha = new Date(fechaStr + 'T00:00:00');
  return fecha.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Capitaliza la primera letra de cada palabra en una cadena.
 * Ejemplo: "carlos andrés" → "Carlos Andrés"
 * @param {string} texto - Texto a capitalizar.
 * @returns {string} - Texto capitalizado.
 */
function capitalizarTexto(texto) {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

/**
 * Calcula el total acumulado de ventas de todos los registros.
 * @returns {number} - Suma total.
 */
function calcularTotalVentas() {
  const registros = obtenerRegistros();
  return registros.reduce((acumulado, r) => {
    return acumulado + (Number(r.totalVenta) || 0);
  }, 0);
}


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
