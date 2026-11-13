// perfil.js
// el cliente ve sus datos y solo sus solicitudes

const usuarioActual = protegerPagina(false);

function mostrarPerfil() {
  document.getElementById('perfilNombre').textContent = usuarioActual.nombre;
  document.getElementById('perfilRol').textContent = usuarioActual.rol == 'admin' ? 'Administrador' : 'Cliente';

  document.getElementById('perfilDatos').innerHTML = `
    <li class="list-group-item px-0"><b>Usuario:</b> ${usuarioActual.usuario}</li>
    <li class="list-group-item px-0"><b>Cédula:</b> ${usuarioActual.cedula}</li>
    <li class="list-group-item px-0"><b>Email:</b> ${usuarioActual.email}</li>
    <li class="list-group-item px-0"><b>Teléfono:</b> ${usuarioActual.telefono}</li>`;

  if (usuarioActual.rol == 'admin') {
    document.getElementById('btnAdmin').classList.remove('d-none');
  }
}

function mostrarContadores(misSolicitudes) {
  const pendientes = misSolicitudes.filter(s => s.estado == 'Pendiente' || s.estado == 'En revisión').length;
  const enProceso = misSolicitudes.filter(s => s.estado == 'En proceso').length;
  const finalizadas = misSolicitudes.filter(s => s.estado == 'Finalizado').length;

  document.getElementById('contadores').innerHTML = `
    <div class="col-6 col-md-3"><div class="card contador p-3"><h3>${misSolicitudes.length}</h3><small>Total</small></div></div>
    <div class="col-6 col-md-3"><div class="card contador p-3"><h3>${pendientes}</h3><small>Por atender</small></div></div>
    <div class="col-6 col-md-3"><div class="card contador p-3"><h3>${enProceso}</h3><small>En proceso</small></div></div>
    <div class="col-6 col-md-3"><div class="card contador p-3"><h3>${finalizadas}</h3><small>Finalizadas</small></div></div>`;
}

function mostrarMisSolicitudes() {
  const filtro = document.getElementById('filtroEstado').value;

  // solo las solicitudes de este usuario
  const misSolicitudes = solicitudes.filter(s => s.clienteId == usuarioActual.id);
  mostrarContadores(misSolicitudes);

  let lista = misSolicitudes;
  if (filtro != '') {
    lista = lista.filter(s => s.estado == filtro);
  }

  const tabla = document.getElementById('tablaMisSolicitudes');

  if (lista.length == 0) {
    tabla.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No tienes solicitudes registradas.</td></tr>`;
    return;
  }

  tabla.innerHTML = lista.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.marca} ${s.modelo}<br><small class="text-muted">${s.placa}</small></td>
      <td>${nombreServicio(s.servicio)}</td>
      <td>${s.fecha}<br><small class="text-muted">${s.hora}</small></td>
      <td>${badgeEstado(s.estado)}</td>
      <td><button class="btn btn-sm btn-outline-dark" onclick="verSolicitud(${s.id})">Ver</button></td>
    </tr>`).join('');
}

// lleno el select del filtro con los estados
function cargarFiltro() {
  const select = document.getElementById('filtroEstado');
  Object.keys(estados).forEach(estado => {
    select.innerHTML += `<option value="${estado}">${estado}</option>`;
  });
  select.addEventListener('change', mostrarMisSolicitudes);
}

if (usuarioActual) {
  mostrarPerfil();
  cargarFiltro();
  mostrarMisSolicitudes();
}
