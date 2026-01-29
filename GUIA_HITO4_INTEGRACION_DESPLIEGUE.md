# Hito 4 - Integración y Despliegue

Guía paso a paso para cumplir los requisitos del Hito 4: desplegar cliente, backend, base de datos e integrarlos en producción.

---

## Requisitos y puntaje

| # | Requisito | Puntos |
|---|-----------|--------|
| 1 | Deploy de la aplicación cliente | 2 |
| 2 | Deploy de la aplicación backend | 2 |
| 3 | Deploy de la base de datos | 2 |
| 4 | Integrar cliente con backend en producción | 4 |
|   | **Total** | **10** |

---

## Resumen de lo que ya está hecho en el repo

- **Frontend**: usa `VITE_API_URL` para apuntar al backend; en desarrollo el proxy de Vite usa `localhost:3000`.
- **Backend**: CORS configurado con `FRONTEND_URL` para aceptar peticiones del cliente en producción.
- **Login / Registro / Publicaciones**: ya llaman a la API real (auth y publicaciones integrados).

Solo falta desplegar cada pieza y configurar las variables de entorno.

---

## 1. Desplegar la base de datos (2 puntos)

Opciones recomendadas: **Render** (PostgreSQL gratis) o **Supabase**.

### Opción A: Render (PostgreSQL)

1. Entra a [render.com](https://render.com) e inicia sesión.
2. **Dashboard** → **New** → **PostgreSQL**.
3. Nombre: `marketplace-cripto-db` (o el que quieras).
4. Región: la más cercana (ej. Oregon).
5. Plan: **Free**.
6. Clic en **Create Database**.
7. Cuando esté listo, entra al servicio y en **Info** copia:
   - **Internal Database URL** (solo si backend también está en Render).
   - **External Database URL** (para conectarte desde fuera de Render; usa esta si el backend está en otro proveedor).

Ejemplo de URL externa:

```text
postgres://usuario:password@host/database?sslmode=require
```

8. Ejecuta el script de tablas en esa base:
   - En Render: **Connect** → **PSQL Command** (o usa un cliente como DBeaver/TablePlus con la External URL).
   - Crea las tablas con el contenido de `database/create_tables.sql` (adaptando si tu script usa otra BD; el script suele crear tablas en la BD actual).

Guarda la **External Database URL** y las credenciales; las usarás en el backend.

### Opción B: Supabase

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto.
2. En **Settings** → **Database** copia la **Connection string** (URI).
3. En el **SQL Editor** pega y ejecuta el contenido de `database/create_tables.sql` (ajustando nombres de BD si hace falta).

Usa esa connection string como URL de PostgreSQL en el backend.

---

## 2. Desplegar el backend (2 puntos)

Recomendado: **Render** (Web Service).

1. Sube el backend a GitHub (solo la carpeta `backend` o el repo que tenga el backend).
2. En Render: **New** → **Web Service**.
3. Conecta el repositorio y selecciona el que contiene el backend.
4. Configuración:
   - **Root Directory**: `backend` (si el backend está en una subcarpeta).
   - **Runtime**: Node.
   - **Build Command**: `npm install`.
   - **Start Command**: `npm start` (debe ejecutar `node src/index.js` o equivalente).
5. En **Environment** agrega:

   | Key | Value |
   |-----|--------|
   | `NODE_ENV` | production |
   | `PORT` | 10000 (o el que Render asigne) |
   | `DB_HOST` | *(host de la URL de la BD)* |
   | `DB_PORT` | 5432 |
   | `DB_NAME` | *(nombre de la BD)* |
   | `DB_USER` | *(usuario)* |
   | `DB_PASSWORD` | *(contraseña)* |
   | `JWT_SECRET` | Una clave larga y aleatoria solo para producción |
   | `FRONTEND_URL` | URL del frontend en producción (ej. `https://tu-app.netlify.app`) |

   Si usas **External Database URL** completa en lugar de variables sueltas, muchos proyectos usan una sola variable `DATABASE_URL` y el código lee esa URL. En tu caso el backend usa `DB_*`; si prefieres usar `DATABASE_URL`, habría que ajustar `backend/src/database/db.js` para leerla. Con solo `DB_*` basta.

6. Crear el servicio. Cuando esté desplegado, copia la URL del backend (ej. `https://marketplace-api.onrender.com`). Esa será la **API base** para el frontend.

---

## 3. Desplegar la aplicación cliente (2 puntos)

Recomendado: **Netlify**.

1. Build local del frontend (para comprobar que funciona):
   - Crea un `.env` en `frontend` con:
     ```env
     VITE_API_URL=https://tu-backend.onrender.com
     ```
   - En la carpeta `frontend`: `npm run build`.
2. Sube el frontend a GitHub (carpeta `frontend` o repo del proyecto completo).
3. En [Netlify](https://netlify.com): **Add new site** → **Import an existing project** → GitHub → elige el repo.
4. Configuración:
   - **Base directory**: `frontend`.
   - **Build command**: `npm run build`.
   - **Publish directory**: `frontend/dist`.
5. En **Site settings** → **Environment variables** agrega:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://tu-backend.onrender.com` (sin barra final)
6. Guarda y haz **Deploy**. Tras el deploy, Netlify te da la URL del sitio (ej. `https://nombre.netlify.app`).

---

## 4. Integrar cliente con backend en producción (4 puntos)

### 4.1 CORS en el backend

En el backend (Render) ya está configurado CORS usando `FRONTEND_URL`. Asegúrate de que en las variables de entorno del backend tengas:

```env
FRONTEND_URL=https://tu-app.netlify.app
```

Si tienes varios orígenes (por ejemplo otro dominio), puedes poner:

```env
FRONTEND_URL=https://tu-app.netlify.app,https://otro-dominio.com
```

(En el código actual se hace `split(',')` para permitir varios orígenes.)

### 4.2 Variable en el frontend

En Netlify, la variable debe ser exactamente:

- **Key**: `VITE_API_URL`
- **Value**: `https://tu-backend.onrender.com` (la URL pública del backend, sin `/api` al final)

El cliente ya usa esa variable en `frontend/src/api/config.js` y en `frontend/src/api/client.js` para llamar a `/api/auth/login`, `/api/publicaciones`, etc.

### 4.3 Comprobar integración

1. Abre la URL del frontend en producción.
2. Regístrate con un usuario nuevo.
3. Inicia sesión.
4. Crea una publicación.
5. Lista publicaciones y abre el detalle.
6. Verifica en el panel de la base de datos (Render o Supabase) que existan registros en las tablas (usuarios, publicaciones, etc.).

Si algo falla:

- Revisa la consola del navegador (errores de red o CORS).
- Revisa los logs del backend en Render.
- Confirma que `VITE_API_URL` y `FRONTEND_URL` estén bien y que el backend use la BD desplegada.

---

## Checklist de entrega

- [ ] Base de datos desplegada (Render o Supabase) y tablas creadas.
- [ ] Backend desplegado en Render con variables de entorno (BD, JWT, FRONTEND_URL).
- [ ] Frontend desplegado en Netlify con `VITE_API_URL` apuntando al backend.
- [ ] Registro, login, listado y detalle de publicaciones funcionando en producción.
- [ ] Datos visibles en el servicio de la base de datos online.
- [ ] Link en producción de la aplicación cliente listo para entregar.

---

## Estructura de URLs de ejemplo

| Componente | Ejemplo |
|------------|---------|
| Cliente (Netlify) | `https://marketplace-cripto.netlify.app` |
| Backend (Render) | `https://marketplace-api.onrender.com` |
| Base de datos | URL interna/externa de Render o Supabase |

El **link de entrega** del Hito 4 es la URL del **cliente** (Netlify).

---

## Notas adicionales

- **Render (free)**: el backend puede tardar unos segundos en “despertar” si no recibe tráfico; la primera petición puede ser lenta.
- **Netlify**: si cambias `VITE_API_URL`, haz un nuevo deploy para que el build tome la nueva variable.
- Mantén `JWT_SECRET` y las contraseñas de la BD solo en variables de entorno, nunca en el código ni en el repo.

Si quieres, en el siguiente paso podemos revisar juntos las variables de tu backend (`db.js` y `index.js`) para dejarlas 100% listas para Render o para usar `DATABASE_URL`.  

**Desarrollado para Desafío Latam - Hito 4**
