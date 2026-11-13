// login.js

// si ya inicio sesion lo mando a su perfil
if (obtenerSesion()) {
  window.location.href = 'perfil.html';
}

const formLogin = document.getElementById('formLogin');

formLogin.addEventListener('submit', function (e) {
  e.preventDefault();

  const txtUsuario = document.getElementById('usuario');
  const txtClave = document.getElementById('clave');
  const usuario = txtUsuario.value.trim();
  const clave = txtClave.value.trim();

  // validar campos vacios
  txtUsuario.classList.toggle('is-invalid', usuario == '');
  txtClave.classList.toggle('is-invalid', clave == '');
  if (usuario == '' || clave == '') {
    return;
  }

  // buscar el usuario
  const encontrado = usuarios.find(u => u.usuario == usuario && u.clave == clave);

  if (!encontrado) {
    Swal.fire('Acceso inválido', 'El usuario o la contraseña son incorrectos.', 'error');
    return;
  }

  if (!encontrado.activo) {
    Swal.fire('Cuenta deshabilitada', 'Tu cuenta está deshabilitada. Comunícate con el taller.', 'warning');
    return;
  }

  localStorage.setItem('motortec_sesion', encontrado.id);

  Swal.fire({
    title: `Bienvenido, ${encontrado.nombre}`,
    icon: 'success',
    timer: 1300,
    showConfirmButton: false
  }).then(() => {
    if (encontrado.rol == 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'perfil.html';
    }
  });
});
