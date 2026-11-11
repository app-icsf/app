# Caché local de secciones

Cada pantalla lee su información una vez y la guarda en un archivo JSON dentro de `.cache/sections`. La siguiente visita de esa sección abre el archivo y no vuelve a consultar Postgres, hasta que el archivo vence o alguien escribe un dato.

La carpeta está en `.gitignore`. Si se borra, la app la vuelve a crear en la siguiente visita.

## Plazos

| Tipo | Duración | Qué cubre |
|---|---|---|
| Directorio | 6 horas | Listado de Descubrir, mapa, catálogo de temas, miembros activos de la semana |
| Sección | 10 minutos | Inicio, comunidad, perfil, eventos, Academy, logros, credencial, búsqueda, publicar |
| En vivo | 30 segundos | Mensajes, conversación abierta, notificaciones y los avisos del encabezado |
| Admin | 1 minuto | Portal de administración |

Mensajes y notificaciones quedan en 30 segundos porque la pantalla se refresca sola. El resto aguanta una visita de ida y vuelta sin pegarle a la base.

## Cuándo se borra

Cualquier acción que guarda algo (conectar, publicar, RSVP, editar perfil, decisiones de admin) borra `.cache/sections` completa. La siguiente apertura de una sección vuelve a consultar y escribe el archivo de nuevo.

Los archivos no incluyen `passwordHash`.

## Descubrir

`/descubrir` no pinta los 58 miembros de un jalón. La primera pantalla trae 8. Al llegar al final, el scroll pide los siguientes 8 a `/api/descubrir`. Esa página sale del archivo `directorio-publico`, no de una consulta nueva.

La búsqueda filtra ese mismo archivo (nombre, ciudad, país, cargo y temas) y también pagina.

## Dónde está el código

- `lib/local-cache.ts` — leer, escribir y borrar los archivos
- `lib/data.ts` — cada función de pantalla pasa por esa caché
- `components/DiscoverFeed.tsx` — scroll infinito
- `app/api/descubrir/route.ts` — la página siguiente del directorio
