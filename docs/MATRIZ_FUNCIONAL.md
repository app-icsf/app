# Matriz funcional — prototipo ICSF (17 pantallas)

Columnas: **Sección / ubicación** · **Funcionalidad encontrada** · **Qué debería hacer** · **Dudas** (si las hay) · **Mejora propuesta** (cuando no hay dudas).
Rutas = las del prototipo en `localhost:3000`. `[D#]` = duda numerada, consolidadas al final para responderlas de un tirón.

## A. Estructura global (todas las pantallas)

| # | Sección / ubicación | Funcionalidad encontrada | Qué debería hacer | Dudas | Mejora propuesta |
|---|---|---|---|---|---|
| A1 | Barra inferior (5 tabs) | Inicio · Comunidad · Mapa · Descubrir · Yo | Navegación principal persistente; el tab activo se resalta. | [D1] Eventos, Mensajes y Academy no están en la barra: ¿se llega desde Inicio / Yo / campana? | — |
| A2 | Cabecera superior | Logo ICSF, lupa, campana, avatar | Lupa = búsqueda global; campana = centro de notificaciones; avatar = Yo. | [D2] ¿La búsqueda es global (personas, eventos, hilos, lecciones) o por pantalla? ¿La campana tiene pantalla propia? (no existe en el prototipo) | — |
| A3 | Botón flotante "+" (Crear o compartir) | FAB en pantallas raíz | Menú de creación rápida: pregunta, publicación, evento, registro de viaje. | [D3] ¿Qué opciones exactamente y con qué permiso cada una? | — |
| A4 | Insignias de credencial | Chips Fellow / Master / Certified / MCC | Nivel de acreditación visible en toda tarjeta de persona. | [D4] ¿Catálogo cerrado de niveles? ¿Quién los asigna (Academy, comité, admin)? | — |
| A5 | Código de ética | Textos "código ético y estándares ICSF" | Reglas de conducta para todo contenido publicado. | [D5] ¿Hay moderación humana, quién, y cómo se sanciona? | — |

## B. Inicio (`/`)

| # | Sección / ubicación | Funcionalidad encontrada | Qué debería hacer | Dudas | Mejora propuesta |
|---|---|---|---|---|---|
| B1 | Inicio · saludo | "Edición Diaria" + "Buenos días, {nombre}" | Resumen personalizado del día. | — | Ajustar saludo por hora/zona y añadir racha de actividad diaria. |
| B2 | Inicio · Hoy en ICSF | Carrusel: cumpleaños (Felicitar), nuevo miembro (Dar bienvenida), publicación (Ver publicación) | Eventos sociales de la red del usuario; el botón envía un saludo y se marca como hecho. | [D6] ¿Solo mi red/capítulo o toda la federación? ¿El cumpleaños es opt-in? | — |
| B3 | Inicio · Conversaciones | Hilos destacados con nº de respuestas y última respuesta | Lista de hilos populares de comunidades del usuario; abre el hilo. | — | Orden por relevancia personal (mis temas y capítulos), no solo por actividad. |
| B4 | Inicio · Próximo para ti | Tarjeta de evento con "Me interesa" y asistentes conocidos | Evento recomendado; marca interés (RSVP) y muestra conocidos que asisten. | — | Recordatorio automático y "añadir al calendario" tras marcar interés. |
| B5 | Inicio · Alguien que quizá deberías conocer | Sugerencia de persona con razón de coincidencia | Recomendación con motivo explícito; "Conocer perfil". | [D7] ¿Con qué señales se calcula la coincidencia (temas, ciudad, eventos)? | — |

## C. Comunidad (`/comunidad`, `/comunidad/capitulo-mexico`)

| # | Sección / ubicación | Funcionalidad encontrada | Qué debería hacer | Dudas | Mejora propuesta |
|---|---|---|---|---|---|
| C1 | Comunidad · consulta rápida | Tarjeta "¿Tienes una consulta rápida?" → Preguntar | Atajo a Preguntar a ICSF (dudas de membresía/eventos/credenciales). | [D8] ¿La responde la comunidad o la Secretaría? El texto sugiere soporte oficial, la pantalla Preguntar sugiere comunidad. | — |
| C2 | Comunidad · Mis comunidades | Lista con último mensaje, hora, no leídos, "hilos activos" | Espacios a los que pertenezco, ordenados por actividad. | — | Silenciar por comunidad y fijar favoritas. |
| C3 | Comunidad · Descubrir comunidades | Capítulos oficiales y grupos temáticos (Costa Rica, IA en Formación, Liderazgo) con "Unirse" | Explorar y unirse. | [D9] ¿Unirse es libre o requiere aprobación/nivel? ¿Quién crea grupos temáticos? | — |
| C4 | Capítulo México · cabecera | Bandera, estado "Activo", nº de miembros, opciones | Ficha del capítulo con menú (miembros, reglas, salir). | — | Pestañas: Muro · Miembros · Eventos · Archivos. |
| C5 | Capítulo México · muro | Mensajes tipo canal con cargo (Presidenta, Fellow MCC), reacciones con emoji, hilos agrupados | Muro/canal con anuncios oficiales, reacciones y respuestas en hilo. | [D10] ¿Cualquiera publica o solo ciertos roles? ¿Se permiten editar/borrar? | — |
| C6 | Capítulo México · compositor | Adjuntar, emoji, enviar | Publicar texto y archivos en el canal. | [D11] Tipos y límites de archivo; ¿menciones (@) y hashtags? | — |

## D. Mapa (`/mapa`)

| # | Sección / ubicación | Funcionalidad encontrada | Qué debería hacer | Dudas | Mejora propuesta |
|---|---|---|---|---|---|
| D1 | Mapa · lienzo | Marcadores por país con nº de miembros; selección de ciudad | Mapa interactivo con clústeres por capítulo/ciudad. | — | Mapa real (MapLibre) con clustering dinámico al hacer zoom. |
| D2 | Mapa · búsqueda y filtros | Buscar ciudad/país/miembro; Filtros | Filtrar por nivel, especialidad, "de viaje", con evento. | [D12] ¿Qué filtros? ¿Se ve la ubicación exacta o solo ciudad? (privacidad) | — |
| D3 | Mapa · controles | Mi ubicación, zoom | Centrar en el usuario (pide permiso de ubicación). | — | Recordar última vista. |
| D4 | Mapa · hoja de ciudad | Miembros activos, eventos próximos, "N de viaje aquí esta semana", Ver miembros / Ver eventos | Resumen de la ciudad con acceso al directorio y agenda filtrados. | [D13] "De viaje aquí" sale de los registros de viaje: ¿es visible por defecto o el miembro debe compartirlo? | — |

## E. Descubrir y Perfil (`/descubrir`, `/miembros/[slug]`)

| # | Sección / ubicación | Funcionalidad encontrada | Qué debería hacer | Dudas | Mejora propuesta |
|---|---|---|---|---|---|
| E1 | Descubrir · búsqueda | Nombre, ciudad, especialidad, tema | Búsqueda de directorio. | — | Búsqueda semántica ("alguien que trabaje storytelling para directivos"). |
| E2 | Descubrir · chips | Todos · Cerca de mí · Mi país · Especialidad · Viajan pronto | Filtros rápidos. | [D14] "Cerca de mí" ¿por GPS o por ciudad del perfil? | — |
| E3 | Descubrir · tarjeta | Foto, nivel, ciudad, título, cita, hashtags, Conectar, Ver perfil | Tarjeta de persona con acción de conexión. | — | Mostrar "amigos en común" y motivo de sugerencia. |
| E4 | Descubrir · contador | "+420 miembros activos esta semana" | Indicador de vitalidad de la red. | — | Convertirlo en filtro "activos esta semana". |
| E5 | Perfil · cabecera | Foto, ubicación, nivel, título, frase | Identidad pública del miembro. | — | Enlaces sociales verificados (LinkedIn). |
| E6 | Perfil · Conectar / Mensaje | Dos CTAs | Conectar = solicitud que el otro acepta; Mensaje abre chat. | [D15] ¿Se puede escribir sin estar conectados? ¿Solicitud con mensaje? | — |
| E7 | Perfil · Sobre mí / Temas | Bio y etiquetas de especialidad | Contenido editable por el dueño. | — | Sugerir etiquetas desde bio y actividad. |
| E8 | Perfil · "Conecta conmigo si…" / "Estoy abierto a…" | Intención de contacto y disponibilidad (podcasts, cafés en viaje, mentoría) | Señales que habilitan coincidencias y filtros. | — | Usarlas como base del algoritmo de sugerencias. |
| E9 | Perfil · "Ver huella y trayectoria" | Enlace a trayectoria/logros | Muestra logros y credencial del miembro. | [D16] ¿Qué es público de un logro/credencial ajeno? | — |

## F. Mensajes y chat (`/mensajes`, `/mensajes/[id]`)

| # | Sección / ubicación | Funcionalidad encontrada | Qué debería hacer | Dudas | Mejora propuesta |
|---|---|---|---|---|---|
| F1 | Mensajes · lista | Conversaciones con avatar, último mensaje, hora, no leídos | Bandeja de chats directos, del comité y de Secretaría. | — | Fijar, archivar y silenciar. |
| F2 | Mensajes · filtros y fila de destacados | Todos/No leídos; Fellows, Mentorías, Conexiones destacadas | Segmentos y accesos rápidos a personas frecuentes. | [D17] ¿Cómo se define "destacada": manual o por frecuencia? | — |
| F3 | Mensajes · Secretaría Concierge | Hilo oficial con avisos (credencial renovada) | Canal de notificaciones institucionales, posiblemente solo lectura. | [D18] ¿Es conversación bidireccional con personas reales o buzón de avisos? | — |
| F4 | Mensajes · Salón de Mentores | Tarjeta "Conecta con un colega acreditado" → Explorar | Emparejamiento con mentores. | [D19] ¿Mentoría formal (con solicitud, sesiones) o solo directorio? | — |
| F5 | Chat · encabezado | Estado en línea, ciudad, llamada de audio | Presencia y llamada. | [D20] ¿La llamada es nativa de la app o abre WhatsApp/Meet? ¿Hay videollamada? | — |
| F6 | Chat · mensajes | Texto, nota de voz (0:48, "Escuchado"), PDF adjunto, reacciones, "leído" | Chat completo con multimedia y acuses. | [D21] Retención de mensajes, borrado y reportes. | — |
| F7 | Chat · compositor | Adjuntar, emoji, grabar voz, enviar | Envío multimedia. | — | Transcripción de notas de voz. |

## G. Eventos (`/eventos`)

| # | Sección / ubicación | Funcionalidad encontrada | Qué debería hacer | Dudas | Mejora propuesta |
|---|---|---|---|---|---|
| G1 | Eventos · pestañas | Próximos · Cerca de mí · Mis eventos | Agenda global, por cercanía, y los míos. | — | Vista calendario mensual. |
| G2 | Eventos · categorías | Todos, Keynotes, Masterclasses, Cumbres, Mentorías | Filtro por tipo. | — | Filtros por idioma, precio y créditos. |
| G3 | Eventos · tarjeta | Fecha, tipo (híbrido/presencial), lugar, organizador, descripción, asistentes conocidos, cupo, CCEUs | Ficha resumida del evento. | [D22] ¿Los eventos tienen costo y pago en la app? ¿Aforo con lista de espera? | — |
| G4 | Eventos · Asistiré / Me interesa | Dos niveles de RSVP | "Me interesa" = seguimiento; "Asistiré" = confirmación con cupo. | — | Recordatorios y check-in con QR al llegar. |
| G5 | Eventos · guardar / compartir | Iconos | Guardar en mis eventos; compartir enlace. | — | Compartir por mensaje interno. |
| G6 | Eventos · sincronizar calendario | Icono | Exportar a Google/Apple Calendar (ICS). | [D23] ¿Sincronización bidireccional o solo exportar? | — |
| G7 | Eventos · CCEUs | Créditos de educación continua | Sumar créditos al asistir para renovar credencial. | [D24] ¿Las horas CCEU alimentan la vigencia de la credencial? ¿Quién valida asistencia? | — |
| G8 | Eventos · "Iniciar propuesta de evento" | CTA para Fellows y Master Coaches | Formulario de propuesta con flujo de aprobación. | [D25] ¿Flujo de aprobación y quién autoriza? (afecta permisos admin) | — |

## H. Preguntar a ICSF (`/preguntar`)

| # | Sección / ubicación | Funcionalidad encontrada | Qué debería hacer | Dudas | Mejora propuesta |
|---|---|---|---|---|---|
| H1 | Preguntar · consulta | Texto 0/280 | Publicar una pregunta breve. | — | Detectar duplicados antes de publicar. |
| H2 | Preguntar · temas sugeridos | Tecnología, Conferencias, Coaching | Etiquetar para enrutar a expertos. | — | Etiquetado automático a partir del texto. |
| H3 | Preguntar · alcance territorial | Mundo, España/Iberoamérica, México/Centroamérica, Andina, Cono Sur, EE. UU. | Limita quién ve la pregunta. | — | Sugerir alcance según el tema. |
| H4 | Preguntar · "Ponentes certificados conectados / respuesta media 45 min" | Indicador de disponibilidad | Estimación de tiempo de respuesta. | [D26] ¿Es dato real calculado o texto informativo? | — |
| H5 | Preguntar · Publicar | Botón + aviso de ética | Crea el hilo, notifica a expertos elegibles. | — | Notificar a los 3 miembros más aptos. |

## I. Academy y certificación (`/academy`, `/academy/ruta`, `/academy/leccion`)

| # | Sección / ubicación | Funcionalidad encontrada | Qué debería hacer | Dudas | Mejora propuesta |
|---|---|---|---|---|---|
| I1 | Academy · Continuar aprendiendo | Programa activo (Master Speaker), cohorte, % avance, próximo módulo | Retomar donde quedó. | — | Meta semanal y aviso si se atrasa frente a la cohorte. |
| I2 | Academy · Próxima actividad | Sesión en vivo, ponente, hora local, Ver detalles, Añadir a calendario | Agenda sincrónica del programa. | [D27] ¿Streaming dentro de la app, Zoom/Meet, o solo enlace? ¿Se graba? | — |
| I3 | Academy · Descubrir certificaciones | Programas abiertos (duración, modalidad, nivel, validez multirregional) | Catálogo y solicitud de ingreso. | [D28] ¿Inscripción con pago, con aprobación o por invitación? ¿Convocatorias con cupo? | — |
| I4 | Ruta · progreso | 68 %, módulos completados, evidencia pendiente de rúbrica | Tablero del programa. | — | Predicción de fecha de finalización. |
| I5 | Ruta · trayectoria por módulo | Estados: Finalizado / En curso / Próximo / Bloqueado (requisito) | Desbloqueo secuencial por prerrequisitos y fechas. | [D29] ¿Estrictamente secuencial o se pueden adelantar módulos? | — |
| I6 | Ruta · evidencia audiovisual | Grabación evaluada con rúbrica | Subir video de práctica; el tutor/comité califica. | [D30] Límites de tamaño, quién evalúa, escala de rúbrica, reintentos. | — |
| I7 | Ruta · tutor | Tutor designado + "Consultar dudas" | Contacto directo con el tutor (chat). | — | Agendar tutoría con calendario del tutor. |
| I8 | Ruta · reglamento y ID | Documento y matrícula | Descarga del reglamento. | — | Aceptación versionada del reglamento. |
| I9 | Ruta · dictamen final | Evaluación del comité y emisión de credencial | Cierra el programa y emite la credencial. | [D31] Criterios de aprobación y apelación. | — |
| I10 | Lección · video | Reproductor con velocidad, pantalla completa, calidad | Video con progreso guardado. | — | Subtítulos y capítulos por tema. |
| I11 | Lección · síntesis y actos | Texto + tres actos | Resumen pedagógico. | — | Resumen y quiz de repaso. |
| I12 | Lección · material | Descargables PDF | Recursos por lección. | — | Descarga offline. |
| I13 | Lección · "Marcar como completada y siguiente" | Botón | Registra avance y abre la siguiente lección. | [D32] ¿Requiere ver el X % del video o solo pulsar? | — |
| I14 | Lección · debate de la cohorte | Enlace (14 aportes) | Hilo de discusión por lección. | — | Preguntas destacadas y respuestas del tutor fijadas. |

## J. Yo: logros y credencial (`/yo`, `/yo/logros/*`, `/yo/credencial`)

| # | Sección / ubicación | Funcionalidad encontrada | Qué debería hacer | Dudas | Mejora propuesta |
|---|---|---|---|---|---|
| J1 | Yo · resumen | Estado "Acreditado", 12 obtenidos / 3 en curso / 6 familias | Panel de identidad y gamificación. | [D33] En Yo faltan datos personales: ¿editar perfil, ajustes, privacidad, notificaciones, idioma, cerrar sesión viven aquí? | — |
| J2 | Yo · familias de acreditación | Explorador, Speaker, Conector, Mentor, Comunidad, Colaborador, con progreso y último logro | Logros por familia con niveles. | [D34] Reglas de cada logro: ¿automáticas por actividad o validadas por el comité? | — |
| J3 | Familia Explorador · progreso | Próximo hito, ciudades completadas | Seguimiento del siguiente hito. | — | Sugerir eventos que lo completen. |
| J4 | Familia Explorador · registrar viaje | Formulario: ciudad/país, tipo de actividad, fecha → Enviar a verificación | Alta de actividad con evidencia; el comité verifica. | [D35] ¿Qué evidencia se adjunta (foto, constancia)? Tiempos de verificación. | — |
| J5 | Familia Explorador · logros obtenidos / por descubrir | Lista con condición de desbloqueo | Muestra requisitos faltantes. | — | Barra "te faltan 2 países" enlazada a eventos. |
| J6 | Logro desbloqueado | Pantalla de celebración, Ver trayectoria, Compartir, Volver | Reconocimiento con opción de compartir. | — | Tarjeta compartible en imagen (LinkedIn/Instagram). |
| J7 | Credencial digital | Certificado con QR, registro, vigencia trianual, firma, competencias avaladas | Documento verificable y vigente. | [D36] Vigencia y renovación: ¿condiciones (CCEUs, cuota)? ¿Se revoca? | — |
| J8 | Credencial · verificación | "Verificar en Blockchain / ICSF Registry", sello SHA-256 | Página pública de validación por código/QR. | [D37] ¿Blockchain real es requisito? Un registro firmado propio suele bastar y cuesta menos. | — |
| J9 | Credencial · agregar a LinkedIn / PDF | Acciones de compartir/descargar | Añadir certificación a LinkedIn y generar PDF. | — | Botón nativo "Add to profile" de LinkedIn. |

## Dudas consolidadas (para responder)

1. **D1/D2** Navegación: ¿cómo se llega a Eventos, Mensajes, Academy y Notificaciones? ¿Alcance de la búsqueda?
2. **D3** Opciones del "+" y sus permisos.
3. **D4/D5** Niveles de acreditación (quién los otorga) y modelo de moderación/sanciones.
4. **D6–D7** Alcance social de Inicio (red vs federación), opt-in de cumpleaños y señales de coincidencia.
5. **D8–D11** Preguntar: ¿comunidad o Secretaría? Reglas de unirse a grupos, publicar y adjuntar en canales.
6. **D12–D14** Privacidad de ubicación (ciudad vs exacta, "de viaje", GPS vs ciudad del perfil).
7. **D15–D21** Reglas de conexión, chat (Secretaría bidireccional, mentoría formal, llamadas, retención).
8. **D22–D25** Eventos: costo/pago, aforo, calendario, CCEUs y flujo de propuesta.
9. **D26–D32** Academy: streaming, inscripción/pago, secuencia de módulos, evidencias y rúbricas, criterios del dictamen.
10. **D33–D37** Yo/logros: ajustes, reglas de logros, evidencias de viajes, renovación y "blockchain".

## Concentrado: funcionalidades que se pueden integrar con IA

Ordenadas por valor / esfuerzo (⭐ = recomendada para arrancar).

| Prioridad | Función con IA | Dónde aplica | Cómo funcionaría | Datos necesarios |
|---|---|---|---|---|
| ⭐ 1 | **Recomendación de personas con motivo explicado** | Inicio B5, Descubrir E3 | Embeddings de bio/temas/"conecta si…"/"abierto a…" + ciudad y eventos comunes; el LLM redacta el porqué ("ambos darán conferencias en Bogotá"). | Perfil, temas, RSVP |
| ⭐ 2 | **Búsqueda semántica global** | Lupa A2, Descubrir E1, Mapa D2 | Búsqueda en lenguaje natural sobre personas, hilos, eventos, lecciones (pgvector en Supabase). | Embeddings de todo el contenido |
| ⭐ 3 | **Asistente "Pregunta a ICSF" con respuesta inmediata** | Preguntar H, Comunidad C1 | RAG sobre reglamento, FAQ, membresía, eventos; si no hay respuesta confiable, publica a la comunidad/Secretaría. Detecta duplicados. | Reglamento, FAQ, hilos previos |
| ⭐ 4 | **Enrutamiento y etiquetado de preguntas** | Preguntar H2–H5 | Clasifica tema y alcance y notifica a los 3 expertos más aptos. | Especialidades, actividad |
| 5 | **Moderación asistida por el código ético** | Muro C5, hilos B3, chat F6 | Pre-filtro de contenido que marca casos al moderador (no sanciona solo). | Código de ética |
| 6 | **Resumen de hilos y chats largos** | Capítulo C5, debate I14, chat F | "Resumen de lo que te perdiste" y digest diario en "Edición Diaria". | Mensajes/hilos |
| 7 | **Edición Diaria personalizada** | Inicio B1–B4 | Ordena y redacta el resumen del día según intereses y capítulo. | Actividad, intereses |
| 8 | **Transcripción y traducción** | Notas de voz F6/F7, lecciones I10 | Transcribe voz, subtitula video y traduce entre español/inglés/portugués para una red de 18 países. | Audio/video |
| 9 | **Coach de práctica oratoria (evidencia audiovisual)** | Ruta I6, Lección I10 | Feedback previo a la rúbrica humana: ritmo, muletillas, pausas, estructura de arco narrativo. El comité mantiene la calificación oficial. | Videos de práctica |
| 10 | **Tutor virtual por lección** | Lección I11–I14 | Chat que responde dudas sobre el material, genera quiz de repaso y sugiere qué repasar. | Contenido de la lección |
| 11 | **Ruta de aprendizaje y alerta de rezago** | Academy I1, I4 | Predice finalización, avisa si se atrasa y sugiere el siguiente paso. | Progreso de cohorte |
| 12 | **Ayuda para postular eventos y redactar bio** | Eventos G8, Perfil E7 | Borrador de propuesta, título y descripción; sugiere etiquetas para el perfil. | Perfil, histórico |
| 13 | **Sugerencia de eventos para completar logros** | Explorador J3–J5 | "Con este evento en Lima completas Speaker Viajero II". | Logros, agenda |
| 14 | **Presentaciones de mentoría (matching)** | Salón de Mentores F4 | Empareja mentor–mentee por objetivos y disponibilidad. | Perfil, "abierto a…" |
| 15 | **Verificación asistida de evidencias de viaje** | Registrar viaje J4 | Lee constancias/fotos y pre-valida; el comité aprueba. | Adjuntos |
| 16 | **Tarjeta compartible de logros** | J6, J9 | Genera imagen y texto para LinkedIn/redes. | Logro, perfil |

**Riesgos de IA a decidir antes de construir:** datos personales enviados a un proveedor (contrato/regiones), privacidad de ubicación en el matching, sesgo en recomendaciones, y que la evaluación oficial y la moderación final sigan siendo humanas.
