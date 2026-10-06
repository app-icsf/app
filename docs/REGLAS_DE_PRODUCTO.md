# Reglas de producto ICSF (D1–D37)

Fuente: respuestas del 5 oct 2026. Donde pediste propuesta (D1, D3, D7, D24), queda la decisión recomendada abajo.

Nuevo rol: **Representante por país** — opera el capítulo/país (grupos, altas locales, aprobación de grupos de usuarios, eventos locales). El **Admin federación** no concentra todo.

---

## Navegación y creación

### D1 — Dónde viven Eventos, Mensajes y Academy
**Decisión propuesta (5 pestañas se quedan):** no meter 8 ítems en la barra; en móvil se vuelve inutilizable.

| Destino | Mejor lugar | Por qué |
|---|---|---|
| **Mensajes** | Icono de chat en la cabecera (junto a la campana) | Es una bandeja, no un “lugar” de la red. Igual que WhatsApp vs un feed. La campana sigue siendo avisos. |
| **Eventos** | Atajo en **Inicio** (ya hay “Próximo para ti”) + entrada en **Mapa** (ciudad) y **Yo** | La gente entra a eventos desde el día o desde un lugar, no como tab permanente. |
| **Academy** | Bloque fijo en **Yo** (“Continuar aprendiendo”) + atajo en Inicio si hay lección pendiente | Es trayectoria personal, no descubrimiento de la red. |

Campana = solo `/notificaciones`. No duplicar el chat ahí.

### D2 — Lupa y campana
La lupa **no es global**. Solo en pantallas que buscan: Descubrir, Mapa, Mensajes, Eventos, Admin. Quitar la lupa del `RootHeader` genérico.
La campana **sí tiene pantalla propia** (`/notificaciones`).

### D3 — El “+” (qué crea, no a dónde navega)
Hoy el FAB mezcla “ir a publicar” (no crea nada). El “+” solo dispara **altas de contenido**:

| Acción | Quién | Permiso / regla |
|---|---|---|
| Publicar en el muro (texto, foto, link, hashtag, @) | Cualquier miembro | `community.post` + premoderación IA |
| Preguntar a la comunidad | Cualquier miembro | `community.post` |
| Proponer evento (no oficial) | Cualquier miembro | todos; oficiales solo Federación (D25) |
| Check-in / aporte de viaje (ubicación + qué hago + foto o link) | Miembro, cuando el mapa detecta otra ciudad o a mano | actividad de perfil; no vacaciones (D35) |

No va en el “+”: unirse a grupo, RSVP, conectar, marcar lección.

### D4 — Niveles
Catálogo cerrado editable por **Admin**. Asignación: **Admin**. El **Representante por país** ejecuta tareas locales (usuarios, grupos, publicaciones del capítulo), no redefine el catálogo global de tiers.

### D5 — Moderación
1. **Premoderación IA** en todo lo publicado.
2. Si la IA pide **aclaración**, entra un humano (Representante del país o Admin).
3. Sanciones ya modeladas: aviso → `SUSPENDED` → `REVOKED`.

---

## Inicio

### D6
Carrusel “Hoy en ICSF” = **toda la red**. Cumpleaños: el miembro lo controla al editar perfil (campo opt-in).

### D7 — Sugerencia de persona (detalle)
No es magia: es una **tarjeta “podrías conocer a X porque…”**.

Hoy el código solo mira: mismo capítulo **y** al menos un tema en común. Eso es pobre.

Con tus reglas, las señales (en este orden) serían:

1. Temas / especialidades del perfil.
2. Misma ciudad o país, o “de viaje aquí” (estado D13).
3. Eventos en común (RSVP).
4. Textos “Conecta conmigo si…” / “Estoy abierto a…”.
5. Hashtags recientes del muro.

La tarjeta debe decir el motivo en una frase, p.ej. *“Ambos van a la Cumbre CDMX y etiquetan Storytelling”*. Sin IA todavía: coincidencias de datos. IA (fase posterior) solo redacta el “porque”.

---

## Comunidad y Preguntar

### D8
Preguntar a ICSF lo ve y responde la **comunidad completa**, no un ticket a Secretaría.

### D9
Grupos/capítulos los **crea el Representante del país**. Un usuario puede **proponer** un grupo; queda pendiente hasta Representante o Admin.

### D10
Cualquiera publica. Autor (y moderador humano) **edita y elimina**.

### D11
Hashtags sí. **@menciones** para notificar a esa persona. Adjuntos: foto y link (alineado a D13); tipos/límites finos en implementación.

---

## Mapa y descubrir

### D12
Zoom **de más a menos**: país → ciudad → cantidad de publicaciones. El detalle (comentario, foto, aporte) se abre al entrar, no coordenadas GPS exactas en el mapa público.

### D13
“De viaje” es un **estado**, no un dato automático silencioso. Si el mapa detecta **nueva ciudad**, propone: completar publicación (qué haces) + foto o link. Sin publicar, no cuenta como “de viaje aquí”.

### D14
“Cerca de mí” usa **GPS y ciudad del perfil** (si no hay GPS, cae a perfil).

---

## Perfil, conexiones y chat

### D15
Sí se puede escribir sin estar “conectados”. La solicitud vive en **Solicitudes** y puede llevar mensaje; sirve para empezar a seguir.

### D16
Por defecto, logros y credencial de otro se ven. Cada usuario marca **público/privado** por bloque (bio, logros, credencial, viajes, etc.).

### D17
Destacadas: el usuario puede marcarlas; el sistema **propone** por frecuencia.

### D18
Secretaría: **ambos** — avisos + chat humano en **horarios programados**.

### D19
Salón de Mentores = **directorio**. Herramienta de sesiones en el celular = **fase 4**.

### D20
No hay telefonía nativa. Se **programan** y se **comparten links** (Meet/Zoom/WhatsApp).

### D21
Retención mensual. En pantalla: **últimos 100**; scroll carga anteriores. Borrado y reportes: sí (autor / moderación).

---

## Eventos

### D22
Pueden tener costo. **No hay cobro in-app ni de tiendas.** La ficha muestra referencias de transferencia/depósito a **cuentas configuradas**. Lista de espera: sí, cuando se llena el cupo.

### D23
Sincronizar calendario **solo si el usuario lo pide**, avisando qué se va a escribir en Google/Apple. No sincronizar en silencio.

### D24 — Qué es un CCEU
En el diseño original, **CCEU** = créditos de educación continua (horas de formación que a veces piden las federaciones para **renovar** una credencial). Ejemplo: “esta masterclass suma 3 CCEU”.

**Regla ICSF ahora:** no es un requisito de renovación hasta que Admin/Federación lo configure. Si un evento oficial declara horas, se pueden guardar en el ledger; **no bloquean** vigencia por sí solas. Asistencia de eventos oficiales la valida Federación / Representante (listado o check-in), no un pago de tienda.

### D25
Cualquier miembro **propone** eventos. **Oficiales** solo los publica la Federación (Admin). Representante puede gestionar la agenda local no oficial.

---

## Academy

### D26
“Respuesta media 45 min” = **texto informativo**, no métrica.

### D27
Sesión en vivo = **enlace externo**. Quien imparte **graba** y luego se suben/pegan links para verla después. No hay streaming dentro de la app en esta fase.

### D28–D29
Inscripción (pago/aprobación/invitación/cupo) y si los módulos son secuenciales: **lo configura el creador del programa**.

### D30
Evidencia en video con rúbrica: **fuera de esta fase**.

### D31
Acreditación la otorga el **autor del programa** (no un comité genérico, salvo que el autor sea la Federación).

### D32
Completar lección = **ver el video entero + hacer las actividades** del contenido. No basta pulsar el botón.

---

## Yo, logros y credencial

### D33
En **Yo**: editar perfil, ajustes, privacidad (D16), notificaciones, idioma, cerrar sesión, Academy, credencial.

### D34
Logros por **actividad registrada** (no comité), con las reglas de viaje de D35.

### D35
Un viaje cuenta si: ubicación (pin) + **aporte a la comunidad** + motivo de **evento o trabajo de perfil**. Vacaciones no cuentan. El prompt del mapa (D13) es la puerta de entrada.

### D36
La credencial **se puede revocar**. Vigencia y renovación según **lineamientos de uso** (cuota/condiciones las define Admin/Federación).

### D37
**Sin blockchain.** Verificación = código/QR + página pública del registro ICSF.

---

## Roles (resumen)

| Rol | Hace |
|---|---|
| Miembro | Publica, pregunta, propone evento, viaja-con-aporte, RSVP, chat, Academy según programa |
| Representante por país | Grupos del país, autoriza grupos de usuarios, moderación humana post-IA, agenda local |
| Admin federación | Niveles, usuarios globales, eventos oficiales, credenciales, cuentas de depósito, lineamientos, revocar |
| Autor de programa | Configura inscripción/secuencia; otorga acreditación de ese programa |
