MVP Ordenado

1. Inicializar proyecto con pnpm
   Categoría: Fundamentos de CLI

2. Configurar TypeScript estricto, scripts y estructura mínima de carpetas
   Categoría: Fundamentos de CLI

3. Configurar .gitignore, .env.example y reglas básicas de secretos
   Categoría: Gestión de configuración

4. Crear el binario mr-dock-mind y comprobar mr-dock-mind --help
   Categoría: Fundamentos de CLI

5. Crear comando mr-dock-mind ask "hola" con respuesta local temporal
   Categoría: Fundamentos de CLI

6. Cargar variables desde .env con dotenv y validar OPENAI_API_KEY
   Categoría: Gestión de configuración

7. Crear un cliente mínimo de OpenAI sin hacer todavía RAG completo
   Categoría: Gestión de configuración, Generación de respuesta

8. Crear comando mr-dock-mind add <url> con validación básica de URL
   Categoría: Fundamentos de CLI

9. Descargar HTML desde una URL
   Categoría: Descarga y limpieza de HTML

10. Extraer texto útil con Cheerio
    Categoría: Descarga y limpieza de HTML

11. Crear SQLite con better-sqlite3 y una primera tabla de documentos
    Categoría: Persistencia SQLite

12. Guardar una página añadida: URL, título, texto y fecha
    Categoría: Persistencia SQLite

13. Crear comando mr-dock-mind list para ver páginas guardadas
    Categoría: Persistencia SQLite, Testing manual

14. Dividir el texto de una página en chunks simples
    Categoría: Chunking

15. Guardar chunks asociados a cada documento
    Categoría: Chunking, Persistencia SQLite

16. Generar embeddings para los chunks con OpenAI
    Categoría: Embeddings

17. Guardar embeddings en SQLite como JSON o blob simple para el MVP
    Categoría: Embeddings, Persistencia SQLite

18. Crear embedding de la pregunta en ask
    Categoría: Búsqueda semántica

19. Buscar chunks similares con similitud coseno en memoria
    Categoría: Búsqueda semántica

20. Construir contexto usando los chunks más relevantes
    Categoría: Generación de respuesta

21. Responder con OpenAI usando solo el contexto recuperado
    Categoría: Generación de respuesta

22. Mostrar URLs fuente junto a la respuesta
    Categoría: Generación de respuesta, Testing manual

23. Mejorar errores y mensajes de terminal
    Categoría: Fundamentos de CLI, Gestión de configuración, Testing manual

24. Probar flujo completo con una sola página real de documentación
    Categoría: Testing manual

25: Crear interfaz interactiva en terminal
    Categoría: Fundamentos de CLI / Testing manual
        Subtareas pequeñas:
        Instalar ink y react.
        Crear comando por defecto interactivo cuando ejecutas mr-dock-mind sin argumentos.
        Mostrar cabecera Mr Dock_mind.
        Crear input de texto.
        Soportar /help, /list, /exit.
        Permitir preguntas normales usando el flujo actual de ask.
        Permitir /add <url> desde la interfaz.
        Pulir estados y mensajes.
        Mantener funcionando los comandos clásicos add, ask, list.

26. Escribir README con instalación, uso, arquitectura y límites del MVP
    Categoría: README
