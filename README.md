<div align="center">
  <img src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" alt="Cuts & Wash Barbershop Banner" width="100%" style="border-radius: 20px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />

  # ✂️ Cuts & Wash Barbershop

  **La experiencia definitiva y premium para la gestión de tu barbería o salón de belleza.**

  [![React](https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![Express](https://img.shields.io/badge/Express-4.22-000000.svg?style=for-the-badge&logo=express)](https://expressjs.com/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=for-the-badge&logo=docker)](https://www.docker.com/)
  [![Google GenAI](https://img.shields.io/badge/AI-Google_GenAI-FF6F00.svg?style=for-the-badge&logo=google)](https://ai.google.dev/)

  [Explorar Demo](#) • [Reportar un Bug](#) • [Solicitar Feature](#)
</div>

---

Bienvenido a **Cuts & Wash Barbershop**, una aplicación Full-Stack de última generación diseñada para ofrecer a tus clientes una experiencia de reserva fluida y moderna, mientras te proporciona las herramientas necesarias para administrar tu negocio de manera eficiente. Construida con un enfoque en el rendimiento, la estética premium y la Inteligencia Artificial.

---

## ✨ Características Estrella

- 📅 **Sistema de Reservas Avanzado:** Flujo intuitivo paso a paso con vista de calendario para selección de fechas y horas disponibles en tiempo real.
- 🤖 **Virtual Try-On con Inteligencia Artificial:** ¿Tus clientes no saben qué corte elegir? Nuestra integración con *Google GenAI* les permite probar cortes virtualmente antes de sentarse en la silla.
- 🔐 **Autenticación Moderna:** Sistema de inicio de sesión y registro ultraseguro utilizando Supabase, JWT y cifrado BcryptJS.
- ⚙️ **Panel de Administración Completo:** Dashboard dedicado para gestionar citas, cancelar reservas y visualizar los servicios.
- 🎨 **UI/UX Premium:** Interfaz de usuario exquisitamente diseñada con **Tailwind CSS 4** y animaciones de alta calidad gracias a **Framer Motion**.
- 🐳 **Docker Ready:** Despliegue en producción simplificado y garantizado gracias a su configuración de contenedores lista para usar.

---

## 🛠️ Stack Tecnológico

<div style="display: flex; justify-content: space-between; gap: 20px;">

| Frontend | Backend | Base de Datos & IA | Herramientas |
|----------|---------|-------------------|--------------|
| **React 19** | **Node.js (v22)** | **Better SQLite3** | **Vite 6** |
| **React Router v7** | **Express.js** | **Supabase JS** | **Docker** |
| **Tailwind CSS 4** | **JWT & Bcrypt** | **Google GenAI** | **TypeScript** |
| **Framer Motion** | **Cookie Parser** | | **pnpm** |

</div>

---

## 🚀 Despliegue con Docker (Recomendado)

La forma más rápida y segura de ejecutar la aplicación en entornos de producción o pruebas es utilizando **Docker**.

### 1. Construir la imagen
Asegúrate de estar en la raíz del proyecto y ejecuta:
```bash
docker build -t cuts-and-wash-app .
```

### 2. Ejecutar el contenedor
Una vez construida la imagen, levanta el contenedor exponiendo el puerto `3000`:
```bash
docker run -d -p 3000:3000 --name barbershop -e GEMINI_API_KEY="tu_api_key_aqui" cuts-and-wash-app
```
*💡 Nota: El servidor Express en producción servirá tanto la API backend como los archivos estáticos del frontend en el puerto 3000.*

---

## 💻 Instalación y Uso Local (Desarrollo)

Si prefieres ejecutar el código directamente en tu máquina local para realizar modificaciones:

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/cuts-and-wash-barbershop.git
cd cuts-and-wash-barbershop
```

### 2. Instalar dependencias
Recomendamos el uso de `pnpm` por su velocidad y eficiencia de espacio:
```bash
pnpm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz copiando el `.env.example` y configura tus credenciales:
```env
GEMINI_API_KEY=tu_api_key_de_google_genai
# Añade cualquier otra variable de Supabase o Base de Datos si es necesario.
```

### 4. Ejecutar la aplicación
Inicia el entorno de desarrollo concurrente (Frontend en Vite y Backend en Express):
```bash
npm run dev
```
La interfaz estará disponible en `http://localhost:5173` y la API en `http://localhost:3000`.

---

## 📂 Arquitectura del Proyecto

```text
📦 cuts-&-wash-barbershop
 ┣ 📂 public         # Archivos estáticos públicos (Imágenes, Logos, Favicon)
 ┣ 📂 src            # Código fuente del Frontend (React)
 ┃ ┣ 📂 components   # Componentes modulares de UI (Navbar, Footer, Modales)
 ┃ ┣ 📂 context      # Estados globales y Context API (Autenticación)
 ┃ ┣ 📂 lib          # Utilidades y configuración de librerías externas
 ┃ ┣ 📂 pages        # Vistas de la aplicación (Home, Booking, Try-On, Profile)
 ┃ ┗ 📜 App.tsx      # Enrutador principal y Layout
 ┣ 📂 server         # Código fuente del Backend (Express.js)
 ┃ ┣ 📂 middleware   # Interceptores (Auth, Validaciones)
 ┃ ┣ 📂 routes       # Controladores de la API (Appointments, Auth, Users)
 ┃ ┗ 📜 database.ts  # Configuración y conexión SQLite
 ┣ 📜 server.ts      # Entrypoint del Backend
 ┣ 📜 Dockerfile     # Configuración de contenerización
 ┣ 📜 index.html     # Plantilla HTML base (Optimizada para SEO)
 ┗ 📜 package.json   # Gestión de dependencias y scripts
```

---

## 🤝 Contribuciones

Este es un proyecto en crecimiento. Si tienes ideas para mejorarlo, sigue estos pasos:

1. Haz un **Fork** del proyecto.
2. Crea tu rama para la nueva funcionalidad (`git checkout -b feature/NuevaCaracteristica`).
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva característica increíble'`).
4. Sube la rama (`git push origin feature/NuevaCaracteristica`).
5. Abre un **Pull Request** para revisión.

---

<div align="center">
  <p>Construido con ❤️ y mucho estilo por desarrolladores apasionados.</p>
</div>
