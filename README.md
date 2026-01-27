# Marketplace de Criptomonedas

Proyecto fullstack: frontend en React (Vite) y backend en Node.js/Express para un marketplace P2P de criptomonedas. Incluye autenticación, publicaciones, Context API y React Router.

## Tecnologías

- **Frontend:** React 18, Vite, React Router, Context API, Axios
- **Backend:** Node.js, Express, PostgreSQL, JWT, bcrypt
- **Base de datos:** PostgreSQL (ver `database/create_tables.sql`)

## Estructura del proyecto

```
latamProyecto/
├── frontend/     # React + Vite
├── backend/      # Express + API REST
├── database/     # Scripts SQL
└── README.md
```

## Cómo ejecutar

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/TU_USUARIO/latamProyecto.git
cd latamProyecto
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

### 3. Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` con las variables necesarias (ej. `PORT`, `DATABASE_URL`, `JWT_SECRET`) y luego:

```bash
npm run dev
```

### 4. Base de datos

Ejecuta el script SQL en tu instancia de PostgreSQL:

```bash
psql -U usuario -d marketplacecripto -f database/create_tables.sql
```

## Scripts disponibles

| Carpeta   | Comando      | Descripción              |
|-----------|-------------|--------------------------|
| frontend  | `npm run dev`   | Servidor de desarrollo   |
| frontend  | `npm run build` | Build para producción    |
| backend   | `npm run dev`   | Servidor con nodemon     |
| backend   | `npm start`     | Servidor en producción   |

## Rutas principales (frontend)

- `/` - Home
- `/login` - Iniciar sesión
- `/registro` - Registro
- `/publicaciones` - Galería de publicaciones
- `/publicaciones/crear` - Crear publicación (protegida)
- `/perfil` - Perfil de usuario (protegida)

## Licencia

Proyecto educativo - Desafío Latam.
