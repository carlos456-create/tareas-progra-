// script.js
// Datos y funciones que usan todas las paginas del sistema

// ---------------- DATOS INICIALES ----------------

// usuarios de prueba (3 clientes y 1 admin)
const usuariosIniciales = [
  { id: 1, nombre: 'Andrés Morales', cedula: '1723456789', email: 'andres.morales@gmail.com', telefono: '0987654321', usuario: 'andres', clave: 'cliente123', rol: 'cliente', activo: true },
  { id: 2, nombre: 'Daniela Vega', cedula: '1712345678', email: 'dani.vega@hotmail.com', telefono: '0998877665', usuario: 'daniela', clave: 'cliente123', rol: 'cliente', activo: true },
  { id: 3, nombre: 'Luis Herrera', cedula: '1709876543', email: 'luis.herrera@gmail.com', telefono: '0991122334', usuario: 'luis', clave: 'cliente123', rol: 'cliente', activo: false },
  { id: 4, nombre: 'Patricio Salazar', cedula: '1700000001', email: 'admin@motortec.com', telefono: '0990000001', usuario: 'admin', clave: 'admin123', rol: 'admin', activo: true }
];

// catalogo de servicios (diccionario: clave -> datos del servicio)
const servicios = {
  aceite: { nombre: 'Cambio de aceite y filtro', precio: 35, descripcion: 'Aceite de motor, filtro de aceite y revisión de niveles.' },
  frenos: { nombre: 'Mantenimiento de frenos', precio: 45, descripcion: 'Cambio de pastillas, limpieza y revisión de discos.' },
  alineacion: { nombre: 'Alineación y balanceo', precio: 30, descripcion: 'Alineación computarizada y balanceo de las 4 llantas.' },
  afinamiento: { nombre: 'Afinamiento de motor', precio: 60, descripcion: 'Bujías, filtros de aire y combustible, limpieza de inyectores.' },
  suspension: { nombre: 'Revisión de suspensión', precio: 40, descripcion: 'Amortiguadores, terminales, rótulas y bujes.' },
  electrico: { nombre: 'Sistema eléctrico', precio: 50, descripcion: 'Batería, alternador, motor de arranque y luces.' },
  aire: { nombre: 'Aire acondicionado', precio: 55, descripcion: 'Carga de gas, limpieza y revisión del compresor.' },
  kilometraje: { nombre: 'Mantenimiento por kilometraje', precio: 120, descripcion: 'Mantenimiento completo según el manual (5.000, 10.000 km...).' }
};

// estados posibles de una solicitud y el color del badge de bootstrap
const estados = {
  'Pendiente': 'bg-secondary',
  'En revisión': 'bg-info text-dark',
  'En proceso': 'bg-primary',
  'Finalizado': 'bg-success',
  'Cancelado': 'bg-danger'
};

const marcas = ['Chevrolet', 'Kia', 'Hyundai', 'Toyota', 'Nissan', 'Mazda', 'Ford', 'Renault', 'Suzuki', 'Volkswagen', 'Otra'];

const extrasDisponibles = ['Lavado del vehículo', 'Revisión de luces', 'Revisión de llantas', 'Escaneo computarizado'];

const solicitudesIniciales = [
  {
    id: 1, clienteId: 1, nombre: 'Andrés Morales', email: 'andres.morales@gmail.com', telefono: '0987654321',
    placa: 'PBC-1234', marca: 'Chevrolet', modelo: 'Aveo', anio: 2015, kilometraje: 98000,
    servicio: 'aceite', prioridad: 'Normal', extras: ['Revisión de luces'],
    fecha: '2026-11-16', hora: '09:00', observaciones: 'Hace tiempo no le cambio el aceite.', estado: 'Pendiente'
  },
  {
    id: 2, clienteId: 1, nombre: 'Andrés Morales', email: 'andres.morales@gmail.com', telefono: '0987654321',
    placa: 'PBC-1234', marca: 'Chevrolet', modelo: 'Aveo', anio: 2015, kilometraje: 95500,
    servicio: 'frenos', prioridad: 'Urgente', extras: [],
    fecha: '2026-11-03', hora: '10:30', observaciones: 'Suenan los frenos al frenar.', estado: 'Finalizado'
  },
  {
    id: 3, clienteId: 2, nombre: 'Daniela Vega', email: 'dani.vega@hotmail.com', telefono: '0998877665',
    placa: 'PDA-0567', marca: 'Kia', modelo: 'Rio', anio: 2020, kilometraje: 45000,
    servicio: 'alineacion', prioridad: 'Normal', extras: ['Lavado del vehículo', 'Revisión de llantas'],
    fecha: '2026-11-18', hora: '14:00', observaciones: 'El carro se va hacia la derecha.', estado: 'En revisión'
  }
];

// ---------------- CARGAR / GUARDAR ----------------

// si ya hay datos guardados en localStorage los uso, si no uso los iniciales
let usuarios = JSON.parse(localStorage.getItem('motortec_usuarios')) || usuariosIniciales;
let solicitudes = JSON.parse(localStorage.getItem('motortec_solicitudes')) || solicitudesIniciales;

function guardarDatos() {
  localStorage.setItem('motortec_usuarios', JSON.stringify(usuarios));
  localStorage.setItem('motortec_solicitudes', JSON.stringify(solicitudes));
}

guardarDatos();

// genera el siguiente id buscando el mayor
function nuevoId(lista) {
  let mayor = 0;
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].id > mayor) {
      mayor = lista[i].id;
    }
  }
  return mayor + 1;
}

// ---------------- SESION ----------------

function obtenerSesion() {
  const id = localStorage.getItem('motortec_sesion');
  if (id == null) return null;
  return usuarios.find(u => u.id == id);
}

function cerrarSesion() {
  Swal.fire({
    title: '¿Cerrar sesión?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar'
  }).then(resultado => {
    if (resultado.isConfirmed) {
      localStorage.removeItem('motortec_sesion');
      window.location.href = 'index.html';
    }
  });
}

// revisa si hay sesion y si el usuario tiene permiso para la pagina
function protegerPagina(soloAdmin) {
  const usuario = obtenerSesion();

  if (!usuario) {
    Swal.fire('Debes iniciar sesión', 'Primero ingresa con tu usuario y contraseña.', 'warning')
      .then(() => window.location.href = 'login.html');
    return null;
  }

  if (soloAdmin && usuario.rol != 'admin') {
    Swal.fire('Acceso denegado', 'Esta sección es solo para el administrador.', 'error')
      .then(() => window.location.href = 'perfil.html');
    return null;
  }

  return usuario;
}

// pone en el menu el nombre del usuario o el boton de login
function cargarMenu() {
  const menu = document.getElementById('menuUsuario');
  if (!menu) return;

  const usuario = obtenerSesion();

  if (usuario) {
    let html = `<li class="nav-item"><a class="nav-link" href="perfil.html">Mi perfil</a></li>`;
    if (usuario.rol == 'admin') {
      html += `<li class="nav-item"><a class="nav-link" href="admin.html">Administración</a></li>`;
    }
    html += `<li class="nav-item"><button class="btn btn-outline-light btn-sm ms-lg-2 mt-2 mt-lg-0" onclick="cerrarSesion()">Salir (${usuario.usuario})</button></li>`;
    menu.innerHTML = html;
  } else {
    menu.innerHTML = `<li class="nav-item"><a class="btn btn-warning btn-sm ms-lg-2" href="login.html">Iniciar sesión</a></li>`;
  }
}

// ---------------- AYUDAS ----------------

function badgeEstado(estado) {
  return `<span class="badge ${estados[estado]}">${estado}</span>`;
}

function nombreServicio(clave) {
  if (servicios[clave]) return servicios[clave].nombre;
  return clave;
}

// fecha de hoy en formato yyyy-mm-dd (hora local)
function fechaHoy() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// muestra el detalle de una solicitud en un SweetAlert
function verSolicitud(id) {
  const s = solicitudes.find(x => x.id == id);
  if (!s) return;

  let extras = 'Ninguno';
  if (s.extras.length > 0) extras = s.extras.join(', ');

  Swal.fire({
    title: `Solicitud #${s.id}`,
    html: `
      <div class="text-start small">
        <p><b>Cliente:</b> ${s.nombre}<br><b>Email:</b> ${s.email}<br><b>Teléfono:</b> ${s.telefono}</p>
        <p><b>Vehículo:</b> ${s.marca} ${s.modelo} (${s.anio})<br><b>Placa:</b> ${s.placa}<br><b>Kilometraje:</b> ${s.kilometraje.toLocaleString('es-EC')} km</p>
        <p><b>Servicio:</b> ${nombreServicio(s.servicio)}<br><b>Prioridad:</b> ${s.prioridad}<br><b>Extras:</b> ${extras}</p>
        <p><b>Fecha y hora:</b> ${s.fecha} a las ${s.hora}<br><b>Estado:</b> ${badgeEstado(s.estado)}</p>
        <p><b>Observaciones:</b> ${s.observaciones || '-'}</p>
      </div>`,
    confirmButtonText: 'Cerrar'
  });
}

document.addEventListener('DOMContentLoaded', cargarMenu);
