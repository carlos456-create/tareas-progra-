// solicitud.js
// formulario para registrar (y editar si es admin) una solicitud de mantenimiento

const usuarioActual = protegerPagina(false);
const esAdmin = usuarioActual && usuarioActual.rol == 'admin';

// si el admin viene desde el panel a editar, aqui llega el id
let idEditar = localStorage.getItem('motortec_editar');
localStorage.removeItem('motortec_editar');
if (!esAdmin) idEditar = null; // el cliente no puede editar

// ---------- llenar selects, radios y checkboxes ----------
function cargarOpciones() {
  const selMarca = document.getElementById('marca');
  selMarca.innerHTML = '<option value="">-- Seleccione --</option>';
  for (const marca of marcas) {
    selMarca.innerHTML += `<option>${marca}</option>`;
  }

  const selServicio = document.getElementById('servicio');
  selServicio.innerHTML = '<option value="">-- Seleccione --</option>';
  for (const clave in servicios) {
    selServicio.innerHTML += `<option value="${clave}">${servicios[clave].nombre} ($${servicios[clave].precio})</option>`;
  }

  let htmlExtras = '';
  extrasDisponibles.forEach((extra, i) => {
    htmlExtras += `
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="checkbox" name="extras" id="extra${i}" value="${extra}">
        <label class="form-check-label" for="extra${i}">${extra}</label>
      </div>`;
  });
  document.getElementById('listaExtras').innerHTML = htmlExtras;

  const selEstado = document.getElementById('estado');
  Object.keys(estados).forEach(e => selEstado.innerHTML += `<option>${e}</option>`);

  document.getElementById('fecha').min = fechaHoy();
}

// el admin elige a que cliente le registra la solicitud
function cargarClientes() {
  const clientes = usuarios.filter(u => u.rol == 'cliente' && u.activo);
  const select = document.getElementById('cliente');

  select.innerHTML = `<option value="${usuarioActual.id}">${usuarioActual.nombre} (yo)</option>`;
  clientes.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${c.nombre} - ${c.cedula}</option>`;
  });

  // al cambiar de cliente se llenan sus datos
  select.addEventListener('change', () => {
    const c = usuarios.find(u => u.id == select.value);
    llenarDatosCliente(c);
  });

  document.getElementById('filaCliente').classList.remove('d-none');
}

function llenarDatosCliente(u) {
  document.getElementById('nombre').value = u.nombre;
  document.getElementById('email').value = u.email;
  document.getElementById('telefono').value = u.telefono;
}

// ---------- cargar una solicitud para editar ----------
function cargarParaEditar(id) {
  const s = solicitudes.find(x => x.id == id);
  if (!s) return;

  document.getElementById('tituloFormulario').textContent = `Editar solicitud #${s.id}`;
  document.getElementById('btnGuardar').textContent = 'Guardar cambios';
  document.getElementById('filaEstado').classList.remove('d-none');

  // si el cliente no esta en la lista (ej: deshabilitado) lo agrego
  const selCliente = document.getElementById('cliente');
  if (!selCliente.querySelector(`option[value="${s.clienteId}"]`)) {
    selCliente.innerHTML += `<option value="${s.clienteId}">${s.nombre}</option>`;
  }
  selCliente.value = s.clienteId;

  document.getElementById('nombre').value = s.nombre;
  document.getElementById('email').value = s.email;
  document.getElementById('telefono').value = s.telefono;
  document.getElementById('placa').value = s.placa;
  document.getElementById('marca').value = s.marca;
  document.getElementById('modelo').value = s.modelo;
  document.getElementById('anio').value = s.anio;
  document.getElementById('kilometraje').value = s.kilometraje;
  document.getElementById('servicio').value = s.servicio;
  document.querySelector(`input[name="prioridad"][value="${s.prioridad}"]`).checked = true;
  document.querySelectorAll('input[name="extras"]').forEach(chk => {
    chk.checked = s.extras.includes(chk.value);
  });
  document.getElementById('fecha').value = s.fecha;
  document.getElementById('fecha').removeAttribute('min');
  document.getElementById('hora').value = s.hora;
  document.getElementById('observaciones').value = s.observaciones;
  document.getElementById('estado').value = s.estado;
}

// ---------- validaciones ----------
function marcarCampo(id, mensaje) {
  const campo = document.getElementById(id);
  if (mensaje) {
    campo.classList.add('is-invalid');
    campo.nextElementSibling.textContent = mensaje;
  } else {
    campo.classList.remove('is-invalid');
    campo.classList.add('is-valid');
  }
}

function validarFormulario(d) {
  const errores = [];
  const anioActual = new Date().getFullYear();

  // cada validacion: [id del campo, mensaje de error o '' si esta bien]
  const reglas = [
    ['nombre', d.nombre.length < 3 ? 'Ingresa el nombre completo.' : ''],
    ['email', !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(d.email) ? 'El correo no es válido.' : ''],
    ['telefono', !/^09\d{8}$/.test(d.telefono) ? 'El teléfono debe tener 10 dígitos y empezar con 09.' : ''],
    ['placa', !/^[A-Z]{3}-\d{3,4}$/.test(d.placa) ? 'Formato de placa inválido. Ejemplo: ABC-1234 o ABC-123.' : ''],
    ['marca', d.marca == '' ? 'Selecciona la marca.' : ''],
    ['modelo', d.modelo == '' ? 'Ingresa el modelo.' : ''],
    ['anio', isNaN(d.anio) || d.anio < 1980 || d.anio > anioActual + 1 ? `El año debe estar entre 1980 y ${anioActual + 1}.` : ''],
    ['kilometraje', isNaN(d.kilometraje) || d.kilometraje < 0 || d.kilometraje > 1000000 || !Number.isInteger(d.kilometraje) ? 'El kilometraje debe ser un número entero entre 0 y 1.000.000.' : ''],
    ['servicio', d.servicio == '' ? 'Selecciona el tipo de servicio.' : ''],
    ['fecha', validarFecha(d.fecha)],
    ['hora', validarHora(d.fecha, d.hora)]
  ];

  for (const [id, mensaje] of reglas) {
    marcarCampo(id, mensaje);
    if (mensaje) errores.push(mensaje);
  }

  // radio de prioridad
  const errorPrioridad = document.getElementById('errorPrioridad');
  if (d.prioridad == '') {
    errorPrioridad.textContent = 'Selecciona la prioridad.';
    errores.push('Selecciona la prioridad.');
  } else {
    errorPrioridad.textContent = '';
  }

  return errores;
}

function validarFecha(fecha) {
  if (fecha == '') return 'Selecciona la fecha.';
  // al editar se permite una fecha que ya paso
  if (!idEditar && fecha < fechaHoy()) return 'La fecha no puede ser anterior a hoy.';
  const dia = new Date(fecha + 'T00:00').getDay();
  if (dia == 0) return 'Los domingos el taller no atiende.';
  return '';
}

function validarHora(fecha, hora) {
  if (hora == '') return 'Selecciona la hora.';
  let cierre = '17:00';
  if (fecha != '' && new Date(fecha + 'T00:00').getDay() == 6) {
    cierre = '13:00'; // sabado
  }
  if (hora < '08:00' || hora > cierre) return `La hora debe estar entre 08:00 y ${cierre}.`;
  return '';
}

// ---------- guardar ----------
function leerFormulario() {
  const prioridad = document.querySelector('input[name="prioridad"]:checked');
  const extras = [];
  document.querySelectorAll('input[name="extras"]:checked').forEach(chk => extras.push(chk.value));

  return {
    nombre: document.getElementById('nombre').value.trim(),
    email: document.getElementById('email').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    placa: document.getElementById('placa').value.trim().toUpperCase(),
    marca: document.getElementById('marca').value,
    modelo: document.getElementById('modelo').value.trim(),
    anio: parseInt(document.getElementById('anio').value),
    kilometraje: Number(document.getElementById('kilometraje').value === '' ? NaN : document.getElementById('kilometraje').value),
    servicio: document.getElementById('servicio').value,
    prioridad: prioridad ? prioridad.value : '',
    extras: extras,
    fecha: document.getElementById('fecha').value,
    hora: document.getElementById('hora').value,
    observaciones: document.getElementById('observaciones').value.trim()
  };
}

document.getElementById('formSolicitud').addEventListener('submit', function (e) {
  e.preventDefault();

  const datos = leerFormulario();
  const errores = validarFormulario(datos);

  if (errores.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'No se guardó la solicitud',
      html: '<ul class="text-start">' + errores.map(err => `<li>${err}</li>`).join('') + '</ul>'
    });
    return;
  }

  // a quien pertenece la solicitud
  let clienteId = usuarioActual.id;
  if (esAdmin) {
    clienteId = Number(document.getElementById('cliente').value);
  }

  if (idEditar) {
    // editar (solo admin)
    const s = solicitudes.find(x => x.id == idEditar);
    Object.assign(s, datos);
    s.clienteId = clienteId;
    s.estado = document.getElementById('estado').value;
    guardarDatos();
    Swal.fire('Solicitud actualizada', `Se guardaron los cambios de la solicitud #${s.id}.`, 'success')
      .then(() => window.location.href = 'admin.html');
  } else {
    // nueva solicitud
    const nueva = {
      id: nuevoId(solicitudes),
      clienteId: clienteId,
      ...datos,
      estado: 'Pendiente'
    };
    solicitudes.push(nueva);
    guardarDatos();
    Swal.fire('Solicitud registrada', `Tu solicitud #${nueva.id} quedó en estado Pendiente.`, 'success')
      .then(() => window.location.href = esAdmin ? 'admin.html' : 'perfil.html');
  }
});

document.getElementById('btnCancelar').addEventListener('click', () => {
  window.location.href = esAdmin ? 'admin.html' : 'perfil.html';
});

// solo numeros en el telefono
document.getElementById('telefono').addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '');
});

// placa en mayusculas mientras escribe
document.getElementById('placa').addEventListener('input', function () {
  this.value = this.value.toUpperCase();
});

// ---------- inicio ----------
if (usuarioActual) {
  cargarOpciones();
  llenarDatosCliente(usuarioActual);
  if (esAdmin) cargarClientes();
  if (idEditar) cargarParaEditar(idEditar);
}
