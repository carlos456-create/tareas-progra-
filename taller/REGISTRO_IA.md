# Registro de uso de IA y recursos externos

## Uso de IA
| Herramienta | Para qué la usé | Qué revisé o cambié yo |
|-------------|-----------------|------------------------|
| Claude (Anthropic) | Generar la estructura inicial de las páginas, las validaciones del formulario y las funciones del CRUD a partir de la consigna AD01. | _(completar: qué partes revisaste, modificaste o probaste tú)_ |

## Recursos externos
- Bootstrap 5.3 - https://getbootstrap.com/docs/5.3/
- SweetAlert2 - https://sweetalert2.github.io/
- MDN Web Docs (arrays, localStorage, eventos) - https://developer.mozilla.org/es/

## Explicación breve del funcionamiento
- `js/script.js` tiene los arrays `usuarios` y `solicitudes`, los diccionarios `servicios` y `estados`, y las funciones de sesión (`obtenerSesion`, `protegerPagina`, `cerrarSesion`).
- Los datos se guardan con `localStorage` en formato JSON (`guardarDatos`).
- `protegerPagina(true)` impide que un cliente entre a `admin.html`.
- En `solicitud.js`, `validarFormulario` revisa cada campo con expresiones regulares y condiciones; si hay errores no se hace el `push` al array.
- En `admin.js` se usan `filter`, `find` y `map` para listar, buscar, cambiar estado y eliminar solicitudes.
