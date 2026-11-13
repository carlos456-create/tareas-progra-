# MotorTec - Sistema de Mantenimiento Automotriz

Práctica AD01 - Fundamentos de desarrollo Web
Programación Web 1 - Unidad 1 - ITSCO

## Descripción
Frontend de un sistema web para un taller automotriz. Los clientes pueden registrar solicitudes de mantenimiento de sus vehículos y revisar su estado. El administrador puede ver, crear, editar, eliminar y cambiar el estado de las solicitudes de todos los clientes.

No usa backend ni base de datos: las solicitudes se guardan en un array de objetos y se conservan en el navegador con `localStorage`.

## Tecnologías
- HTML5
- CSS3 y Bootstrap 5.3
- JavaScript
- SweetAlert2 para mensajes y confirmaciones

## Cómo ejecutar
1. Clonar o descargar el repositorio.
2. Abrir `index.html` en el navegador (o con Live Server en VS Code).

## Usuarios de prueba
| Usuario | Contraseña | Rol |
|---------|------------|-----|
| andres  | cliente123 | Cliente |
| daniela | cliente123 | Cliente |
| luis    | cliente123 | Cliente (cuenta deshabilitada) |
| admin   | admin123   | Administrador |

## Estructura
```
index.html         Módulo 1 - Página institucional (inicio, acerca de, servicios)
solicitud.html     Módulo 2 - Formulario de solicitud de mantenimiento
login.html         Módulo 3 - Login
perfil.html        Módulo 3 - Perfil y "Mis mantenimientos" del cliente
admin.html         Módulo 3 - Administración (CRUD general)
css/styles.css
js/script.js       Datos (arrays y diccionarios), sesión y funciones comunes
js/login.js
js/solicitud.js
js/perfil.js
js/admin.js
```

## Casos de prueba
| N.º | Prueba | Resultado |
|-----|--------|-----------|
| 1 | Iniciar sesión como cliente (andres) | Muestra el perfil y solo sus solicitudes |
| 2 | Clave incorrecta o usuario luis | No inicia sesión y muestra alerta |
| 3 | Placa `123ABC`, fecha pasada o kilometraje negativo | No guarda y muestra los errores |
| 4 | Registrar una solicitud correcta | Se agrega al array y aparece en Mis mantenimientos |
| 5 | Cliente entra a `admin.html` | Acceso denegado |
| 6 | Admin cambia el estado y elimina un registro | Se ve el cambio en el listado general |

Para reiniciar los datos: abrir la consola (F12) y ejecutar `localStorage.clear()` (o borrar las claves que empiezan con `motortec_`).
