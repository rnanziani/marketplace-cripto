# Cómo subir el proyecto a GitHub

Sigue estos pasos en orden. Puedes usar la terminal de Cursor (Ctrl + `) o PowerShell.

---

## Paso 1: Crear el repositorio en GitHub

1. Entra en [github.com](https://github.com) e inicia sesión.
2. Haz clic en el **+** (arriba a la derecha) → **New repository**.
3. Configura:
   - **Repository name:** por ejemplo `latamProyecto` o `marketplace-cripto`.
   - **Description:** (opcional) "Marketplace P2P de criptomonedas - React + Express".
   - **Visibility:** Public o Private, lo que prefieras.
   - **No** marques "Add a README file" (ya tienes uno en el proyecto).
4. Haz clic en **Create repository**.
5. Copia la URL del repositorio. Será algo como:
   - HTTPS: `https://github.com/TU_USUARIO/latamProyecto.git`
   - SSH: `git@github.com:TU_USUARIO/latamProyecto.git`

Guarda esa URL para el Paso 4.

---

## Paso 2: Abrir la terminal en la carpeta del proyecto

Abre la terminal (Cursor o PowerShell) y ve a la raíz del proyecto:

```bash
cd c:\latamProyecto
```

---

## Paso 3: Inicializar Git y hacer el primer commit

Si **aún no** tienes Git inicializado en la carpeta, ejecuta:

```bash
git init
git add .
git status
```

Revisa que `git status` no muestre archivos que no quieras subir (por ejemplo `.env` o `node_modules`; el `.gitignore` ya los excluye).

Luego haz el primer commit:

```bash
git commit -m "Initial commit: Marketplace cripto - Frontend React + Backend Express"
```

Si **ya** tenías `git init` y solo quieres actualizar:

```bash
git add .
git status
git commit -m "Actualización: preparar proyecto para GitHub"
```

---

## Paso 4: Conectar con GitHub y subir

Sustituye `TU_USUARIO` y `latamProyecto` por tu usuario de GitHub y el nombre del repo que creaste.

**Opción A – Usar HTTPS:**

```bash
git remote add origin https://github.com/TU_USUARIO/latamProyecto.git
git branch -M main
git push -u origin main
```

**Opción B – Usar SSH (si ya tienes llave SSH configurada en GitHub):**

```bash
git remote add origin git@github.com:TU_USUARIO/latamProyecto.git
git branch -M main
git push -u origin main
```

La primera vez que hagas `git push` con HTTPS, GitHub puede pedirte usuario y contraseña. Como contraseña debes usar un **Personal Access Token** (no la contraseña de la cuenta). Puedes crearlo en: GitHub → Settings → Developer settings → Personal access tokens.

---

## Paso 5: Comprobar en GitHub

Entra en la URL de tu repositorio en el navegador. Deberías ver:

- Carpetas: `frontend`, `backend`, `database`
- Archivo `README.md`
- Archivo `.gitignore` (no verás `node_modules` ni archivos ignorados)

---

## Resumen de comandos (copiar y pegar)

Ajusta la URL del `remote` y el mensaje del commit si quieres.

```bash
cd c:\latamProyecto

git init
git add .
git commit -m "Initial commit: Marketplace cripto - Frontend React + Backend Express"

git remote add origin https://github.com/TU_USUARIO/latamProyecto.git
git branch -M main
git push -u origin main
```

---

## Errores frecuentes

**"remote origin already exists"**  
Si ya añadiste un `origin` antes:

```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/latamProyecto.git
```

**"failed to push" / permisos**  
- Con HTTPS: usa Personal Access Token como contraseña.  
- Con SSH: revisa que tu llave SSH esté asociada a tu cuenta en GitHub.

**"branch 'main' does not exist"**  
Algunos equipos usan `master`:

```bash
git branch -M main
git push -u origin main
```

---

## Siguientes veces que quieras subir cambios

```bash
cd c:\latamProyecto
git add .
git commit -m "Descripción de los cambios"
git push
```

Cuando el repo ya esté creado y enlazado, con estos tres comandos bastará para actualizar GitHub.
