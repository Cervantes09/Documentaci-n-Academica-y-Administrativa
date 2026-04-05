# Módulo de Documentación Ácadémica y Administrativa - UT Nayarit

## 📋Descripción de la App Web

Este sistema es una plataforma integral de grado institucional, diseñada específicamente para la automatización, resguardo y administración eficiente de documentos académicos y formatos oficiales de la Universidad Tecnológica de Nayarit. 
El objetivo principal es eliminar la dispersión de información y centralizar el flujo documental entre los diversos actores universitarios (Docentes, Administrativos y Directivos), tal como si de un repositorio oficial para la universidad.

### Desarrolladores (IDGS-81):

* Enrique Gael Zamora Partida
* Gabriel Alejandro García Serna

### 🎓 Supervisión Ácademica

* **Seguridad en Aplicaciones:** Ing. Oscar Arenas Gómez.
* **Administración de Base de Datos:** Ing. Juan Manuel Tovar.
* **Desarrollo Web Profesional:** Ing. Stephany López Lizárraga.


## 💻 Tecnologías Implementadas

| Tecnología | Propósito y Justificación Técnica |
| :---: | :--- |
| React.js (Vite) | Utilizado como núcleo por su arquitectura basada en componentes, facilitando la reutilización de código y una carga ultra rápida del DOM mediante Vite. |
| Tailwind CSS | Permite un diseño "Mobile First" y responsivo mediante utilidades CSS de bajo nivel, optimizando el peso final del CSS cargado por el cliente. |
| Supabase (PostgreSQL) | Actúa como nuestro Backend as a Service (BaaS). Provee una base de datos relacional robusta, gestión de autenticación mediante JWT y almacenamiento seguro de objetos. |
| React Router v6 | Implementado para crear una Single Page Application (SPA) con navegación protegida, gestionando redirecciones automáticas ante accesos no autorizados. |
| React Icons | Integración de iconografía semántica que mejora la experiencia de usuario (UX) al proporcionar señales visuales claras sobre las acciones disponibles. |

## 🚀 Instalación y Despliegue Local

Para desplegar este ecosistema en un entorno de desarrollo controlado, ejecute los siguientes comandos en su terminal:

1. Clonar el repositorio:

```git clone https://github.com/zamora1504/Documentaci-n-Academica-y-Administrativa.git```

2. Instalar dependencias:

``` ```

3. Configurar Variables de Entorno:
Crea un archivo .env en la raíz del proyecto. Este paso es crítico para la conexión con el backend:

```VITE_SUPABASE_URL=tu_url_de_supabase_aqui ```

```VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase_aqui```

4. Inicialización de Servidor Local:

``` npm run dev ```

## 🔒 Especificaciones de Seguridad y Entidades Participantes

Para cumplir con los estándares de la asignatura de Seguridad en Aplicaciones, se ha diseñado un modelo de Control de Acceso Basado en Roles. Este modelo no solo oculta elementos visuales, sino que desmantela las rutas del navegador y los permisos de API según el privilegio asignado:

* **Director De Carrera:** Posee la autoridad máxima sobre el sistema. Es el encargado de la Auditoría de Documentos y la gestión de la infraestructura. Sus facultades exclusivas incluyen la autorización de nuevos usuarios, la modificación de privilegios en tiempo real y la ejecución de protocolos de respaldo.

* **Personal Administrativo:** Actúa como el motor operativo. Su enfoque principal es la Validación y Gestión Documental, asegurando que los formatos institucionales cumplan con los estándares requeridos antes de su aprobación definitiva.

* **Personal Docente:** Rol enfocado en la operatividad académica. Su acceso está estrictamente limitado a su expediente personal, permitiendo la carga de evidencias y la consulta de formatos oficiales sin posibilidad de interferir con archivos de otros usuarios.

* **Estado Pendiente:** Los nuevos registros son tratados como "entidades no confiables". El sistema los mantiene en un aislamiento total, impidiendo cualquier interacción con la base de datos operativa hasta que un Director valide su identidad y rol.

## 🗄️ Gestión de Base de Datos

Para la administración de la Base de Datos, el enfoque se centró en la integridad referencial y la protección de datos en reposo:

* **Row Level Security (RLS):** Se configuraron políticas directamente en SupaBase que actúan como un cortafuegos interno. Esto asegura que, aunque un atacante obtuviera la API Key, el servidor rechazaría cualquier consulta que no pertenezca explícitamente al UID del usuario autenticado.

* **Persistencia y Hidratación de Sesión:** Mediante el uso de SessionProvider y React Context, el sistema mantiene una sesión segura y persistente. Esto evita la pérdida de estados críticos durante el refresco de pantalla y garantiza una navegación fluida.

* **Arquitectura Normalizada:** La base de datos sigue las formas normales para evitar la redundancia y anomalías de actualización, permitiendo que el sistema de expedientes crezca sin degradar el rendimiento de las consultas.

## 📂 Estructura Principal

### Lógica de roles y renderizado

La app posee una lógica integral que se basa en 3 archivos principales para la renderización del contenido

1. **App.jsx:** Este contiene la lógica para evaluar el tipo de usuario activo (si es docente, administrativo, director o pendiente) y en base a esto modificar el path de rutas que el archivo MenuLateral.jsx ajustará.

2. **MenuLateral.jsx**: El menú lateral es el encargado de mostrar los apartados de navegación apropiados para cada tipo de usuario, evaluando el tipo de rol extraido directo de la base de datos.

3. **Layout:** Este apartado funciona como lienzo, este renderiza el componente deseado en base a la ruta acordada por el usuario al interactuar con el menú lateral.

Como complemento, los demás componentes que constituyen al sitio se encuentran almacenados en la ruta src/components/vistas.

### Manejo de Sesión

Para que la app pueda controlar todos los aspectos de la sesión, se creó el archivo DataSesionUsuario.jsx, este contiene la sintaxis base de código javascript que manipula el entorno de supabase para controlar acciones como:

1. Extraer datos del usuario de la base de datos
2. Inicializar y obtener Sesión
3. Cerrar Sesión

Este archivo provee los fundamentospara que la lógica de roles y renderizado pueda funcionar de forma correcta

