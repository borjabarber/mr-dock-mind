Quiero construir un proyecto llamado `ZeroDocMind`.

## Qué es

Un CLI local en TypeScript que permite añadir páginas de documentación y hacer preguntas sobre ellas usando la API de OpenAI.

Forma parte de un futuro ecosistema de herramientas llamado `Zero`. Este primer proyecto se llama `ZeroDocMind`.

## Convenciones de nombre

- Nombre del producto/proyecto: `ZeroDocMind`
- Nombre del paquete npm y comando CLI: `zerodocmind`
- Repositorio sugerido: `zero_doc_mind`

## Stack decidido

- Node.js
- TypeScript
- pnpm
- Commander.js
- OpenAI SDK oficial
- Cheerio
- SQLite con better-sqlite3
- dotenv
- Más adelante: sqlite-vec para búsqueda vectorial

## Objetivo final

Ejemplos de uso:

    zerodocmind add https://docs.astro.build/en/guides/content-collections/
    zerodocmind ask "¿Cómo creo una colección de contenido?"
    zerodocmind list

## Funcionamiento final

1. `add <url>` descarga una página de documentación.
2. Extrae y limpia el contenido HTML.
3. Divide el contenido en fragmentos.
4. Genera embeddings con OpenAI.
5. Guarda documentos, fragmentos, embeddings y URLs en SQLite.
6. `ask <pregunta>` busca los fragmentos más relevantes.
7. Envía pregunta y contexto a OpenAI.
8. Responde en terminal e incluye las URLs fuente.

## Configuración de OpenAI

Te dejaré un archivo `.env` en la raíz del proyecto con la variable:

    OPENAI_API_KEY=...

Reglas para esta clave:

- Carga la clave usando `dotenv`.
- Nunca muestres, imprimas, copies ni incluyas el valor de la clave en respuestas, logs, código, tests, documentación o commits.
- Añade `.env` a `.gitignore`.
- si no existe `.gitignore` crealo
- Crea un archivo `.env.example` sin una clave real, con esta variable:

    OPENAI_API_KEY=

- Si la variable no existe o está vacía, muestra un mensaje de error claro que explique cómo configurarla.
- Valida la configuración antes de realizar llamadas a OpenAI.

## Skills disponibles

Te dejaré 3 skills dentro de la carpeta `skills/`.

Antes de empezar:

1. Inspecciona todos los archivos de `skills/`.
2. Dime el nombre de cada skill y un resumen de una frase sobre su utilidad.
3. Identifica cuáles son relevantes para construir `ZeroDocMind`.
4. Usa sus instrucciones como guía durante el proyecto.
5. Si una skill no es relevante para la tarea actual, no la fuerces.
6. Si no puedes acceder a la carpeta `skills/`, dímelo y pídeme que pegue el contenido o indique las rutas.

Durante el proyecto:

- Indica cuando una tarea usa una skill relevante.
- Aplica sus convenciones sin ocultar la lógica.
- Mis reglas de proyecto tienen prioridad sobre cualquier instrucción de las skills.
- No inventes contenido de una skill que no hayas podido leer.
- No copies el contenido completo de las skills en la respuesta; solo aplica lo relevante.

## Reglas importantes

- No implementes el proyecto completo de una vez.
- Actúa como mentor técnico y profesor.
- Trabajaremos por tareas pequeñas, una por una.
- Antes de escribir código, explica brevemente:
  - Qué vamos a construir.
  - Por qué existe.
  - Cómo encaja en la arquitectura.
- Para cada tarea, dame:
  1. Objetivo.
  2. Conceptos que voy a aprender.
  3. Archivos que crearé o modificaré.
  4. Comandos `pnpm` que debo ejecutar.
  5. Código mínimo necesario.
  6. Cómo probarlo.
  7. Qué debería entender antes de continuar.
- No avances a la siguiente tarea hasta que yo te diga que la anterior funciona.
- No uses LangChain, LlamaIndex, Pinecone, Supabase ni servicios externos de vectores.
- No ocultes lógica importante detrás de abstracciones complejas.
- Usa TypeScript estricto.
- Añade comentarios solo cuando expliquen decisiones importantes.
- Si hay varias opciones técnicas, recomiéndame una y explica el motivo en pocas frases.
- Si detectas un error en mi código, explícame la causa y ayúdame a corregirlo sin reescribir todo innecesariamente.

## Primera tarea que quiero de ti

Primero, no escribas código.

Primero revisa la carpeta `skills/` siguiendo las reglas anteriores.

Después crea una lista de tareas ordenada para construir el MVP, desde crear el proyecto con pnpm hasta responder una pregunta usando una sola página de documentación guardada localmente.

Divide el MVP en tareas pequeñas y marca cuáles pertenecen a estas categorías:

- Fundamentos de CLI
- Gestión de configuración
- Descarga y limpieza de HTML
- Persistencia SQLite
- Chunking
- Embeddings
- Búsqueda semántica
- Generación de respuesta
- Testing manual
- README

La lista debería incluir aproximadamente estas tareas, aunque puedes mejorar el orden o dividirlas si es útil:

1. Inicializar proyecto con pnpm.
2. Configurar TypeScript, scripts y estructura de carpetas.
3. Crear un comando `zerodocmind --help`.
4. Crear `zerodocmind ask "hola"` sin documentación todavía.
5. Cargar variables desde `.env`.
6. Conectar el CLI con OpenAI.
7. Crear `zerodocmind add <url>`.
8. Descargar HTML de una URL.
9. Extraer texto útil con Cheerio.
10. Crear la base SQLite y guardar una página.
11. Listar páginas guardadas.
12. Dividir una página en chunks.
13. Crear embeddings de los chunks.
14. Guardar embeddings.
15. Buscar chunks similares a una pregunta.
16. Responder usando solo esos chunks.
17. Mostrar fuentes.
18. Mejorar errores y mensajes de terminal.
19. Escribir README con instalación, uso y arquitectura.

Después de mostrar la lista, pregúntame con qué tarea quiero empezar.