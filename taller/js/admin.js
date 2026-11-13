// admin.js
// CRUD general de solicitudes y control de clientes (solo administrador)

const admin = protegerPagina(true);

function mostrarContadores() {
  let html = '';
  // un contador por cada estado del diccionario
  for (const estado of Object.keys(estados)) {
    const cantidad = solicitudes.filter(s => s.estado == estado).length;
    html += `
      <div class="col-6 col-md">
        <div class="card contador p-3">
          <h3>${cantidad}</h3>
          <small>${badgeEstado(estado)}</small>
        </div>
      </div>`;
  }
  document.getElementById('contadoresAdmin').innerHTML = html;
}

function cargarFiltros() {
  const filtroEstado = document.getElementById('filtroEstado');
  Object.keys(estados).forEach(e => filtroEstado.innerHTML += `<option>${e}</option>`);

  const filtroCliente = document.getElementById('filtroCliente');
  usuarios.forEach(u => {
    filtroCliente.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
  });

  document.getElementById('buscar').addEventListener('input', mostrarSolicitudes);
  filtroEstado.addEventListener('change', mostrarSolicitudes);
  filtroCliente.addEventListener('change', mostrarSolicitudes);
}

// ---------- READ ----------
function mostrarSolicitudes() {
  const texto = document.getElementById('buscar').value.toLowerCase();
  const estado = document.getElementById('filtroEstado').value;
  const cliente = document.getElementById('filtroCliente').value;

  const lista = solicitudes.filter(s => {
    const coincideTexto = (s.placa + ' ' + s.nombre + ' ' + s.modelo + ' ' + s.marca).toLowerCase().includes(texto);
    const coincideEstado = estado == '' || s.estado == estado;
    const coincideCliente = cliente == '' || s.clienteId == cliente;
    return coincideTexto && coincideEstado && coincideCliente;
  });

  const tabla = document.getElementById('tablaSolicitudes');

  if (lista.length == 0) {
    tabla.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No hay solicitudes.</td></tr>`;
    return;
  }

  tabla.innerHTML = lista.map(s => {
    // opciones del select de estado
    let opciones = '';
    for (const e in estados) {
      opciones += `<option ${e == s.estado ? 'selected' : ''}>${e}</option>`;
    }

    return `
      <tr>
        <td>${s.id}</td>
        <td>${s.nombre}<br><small class="text-muted">${s.telefono}</small></td>
        <td>${s.marca} ${s.modelo}<br><small class="text-muted">${s.placa} · ${s.kilometraje.toLocaleString('es-EC')} km</small></td>
        <td>${nombreServicio(s.servicio)}${s.prioridad == 'Urgente' ? ' <span class="badge bg-danger">Urgente</span>' : ''}</td>
        <td>${s.fecha}<br><small class="text-muted">${s.hora}</small></td>
        <td>
          <select class="form-select form-select-sm" onchange="cambiarEstado(${s.id}, this.value)">${opciones}</select>
        </td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-dark" onclick="verSolicitud(${s.id})">Ver</button>
          <button class="btn btn-sm btn-primary" onclick="editarSolicitud(${s.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarSolicitud(${s.id})">Eliminar</button>
        </td>
      </tr>`;
  }).join('');
}

// ---------- UPDATE ----------
function cambiarEstado(id, nuevoEstado) {
  const s = solicitudes.find(x => x.id == id);
  s.estado = nuevoEstado;
  guardarDatos();
  mostrarContadores();

  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: `Solicitud #${id}: ${nuevoEstado}`,
    showConfirmButton: false,
    timer: 1800
  });
}

function editarSolicitud(id) {
  // guardo el id y abro el formulario
  localStorage.setItem('motortec_editar', id);
  window.location.href = 'solicitud.html';
}

// ---------- DELETE ----------
function eliminarSolicitud(id) {
  const s = solicitudes.find(x => x.id == id);

  Swal.fire({
    title: `¿Eliminar la solicitud #${id}?`,
    text: `${s.nombre} - ${s.marca} ${s.modelo} (${s.placa}). Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(resultado => {
    if (resultado.isConfirmed) {
      solicitudes = solicitudes.filter(x => x.id != id);
      guardarDatos();
      actualizarTodo();
      Swal.fire('Eliminada', 'La solicitud fue eliminada.', 'success');
    }
  });
}

// ---------- CONTROL DE CLIENTES ----------
function mostrarClientes() {
  const clientes = usuarios.filter(u => u.rol == 'cliente');
  let filas = '';

  for (let i = 0; i < clientes.length; i++) {
    const c = clientes[i];
    const total = solicitudes.filter(s => s.clienteId == c.id).length;
    filas += `
      <tr>
        <td>${c.nombre}</td>
        <td>${c.cedula}</td>
        <td>${c.usuario}</td>
        <td>${c.telefono}</td>
        <td>${total}</td>
        <td>${c.activo ? '<span class="badge bg-success">Activa</span>' : '<span class="badge bg-secondary">Deshabilitada</span>'}</td>
        <td>
          <button class="btn btn-sm ${c.activo ? 'btn-outline-danger' : 'btn-outline-success'}" onclick="cambiarCuenta(${c.id})">
            ${c.activo ? 'Deshabilitar' : 'Habilitar'}
          </button>
        </td>
      </tr>`;
  }

  document.getElementById('tablaClientes').innerHTML = filas;
}

function cambiarCuenta(id) {
  const c = usuarios.find(u => u.id == id);
  const accion = c.activo ? 'deshabilitar' : 'habilitar';

  Swal.fire({
    title: `¿Deseas ${accion} la cuenta de ${c.nombre}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar'
  }).then(r => {
    if (r.isConfirmed) {
      c.activo = !c.activo;
      guardarDatos();
      mostrarClientes();
    }
  });
}

function actualizarTodo() {
  mostrarContadores();
  mostrarSolicitudes();
  mostrarClientes();
}

if (admin) {
  document.getElementById('contenidoAdmin').classList.remove('d-none');
  cargarFiltros();
  actualizarTodo();
}
