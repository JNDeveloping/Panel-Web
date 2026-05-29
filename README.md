# Panel Web Sobres Safe

Panel web moderno tipo fintech/ERP para administrar un bot de WhatsApp de control de sobres físicos, dinero total, efectivo en caja y faltante. Incluye backend Node.js + Express, frontend React + Vite, SQLite, Socket.io, autenticación JWT, migraciones, logs, backups y exportación PDF/Excel.

## Lógica de negocio implementada

| Comando | Efecto |
| --- | --- |
| `entra` | Agrega sobres, dinero total y efectivo. |
| `sale` | No descuenta sobres; descuenta efectivo y aumenta faltante. |
| `parcial` | Descuenta efectivo y aumenta faltante. |
| `ingreso` | Aumenta efectivo y disminuye faltante. |
| `vacio` | Aumenta sobres físicos; no cambia dinero. |
| `maco` | Reinicia/cierra el período activo y abre uno nuevo. |

Fórmula central: **dinero total = efectivo + faltante**.

## Estructura

```text
frontend/        React + Vite + TailwindCSS
backend/         Express + Socket.io + SQLite
backend/src/api  Rutas REST organizadas por módulo
database/        Migraciones y archivo SQLite
api/             Documentación de API
websocket/       Notas de eventos Socket.io
auth/            Notas de autenticación
```

## Instalación en Ubuntu 22.04

```bash
sudo apt update
sudo apt install -y build-essential python3 make g++ curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## Arranque rápido

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm install
npm run migrate
npm run seed
npm run dev
```

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:4000>
- Usuario inicial: `admin`
- Contraseña inicial: `admin123` (cambiar en producción)

## Scripts principales

```bash
npm run dev          # backend y frontend en modo desarrollo
npm run dev:backend  # solo API
npm run dev:frontend # solo Vite
npm run migrate      # aplica migraciones SQLite
npm run seed         # crea usuario admin y período inicial
npm run build        # build del frontend
npm run start        # inicia backend para producción
```

## Variables de entorno

Backend (`backend/.env`):

```env
PORT=4000
DATABASE_PATH=../database/panel.sqlite
JWT_SECRET=cambia_este_secreto_en_produccion
CORS_ORIGIN=http://localhost:5173
ADMIN_USER=admin
ADMIN_PASSWORD=admin123
MOVIMIENTOS_JSON_PATH=../movimientos.json
BACKUP_CRON=0 3 * * *
```

Frontend (`frontend/.env`):

```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

## Conectar con el bot Baileys actual

El panel y el bot deben usar la misma base SQLite (`database/panel.sqlite`). Para registrar comandos desde WhatsApp, el bot puede hacer un `POST` al endpoint de sincronización:

```js
await fetch('http://localhost:4000/api/bot/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    external_id: message.key.id,
    type: 'entra',
    responsible: pushName || 'WhatsApp',
    amount: 1000,
    envelopes: 2,
    note: 'Comando recibido por Baileys',
    created_at: new Date().toISOString()
  })
});
```

Cada alta emite `movement:created` por Socket.io para refrescar el dashboard en tiempo real.

## Migrar movimientos.json

```bash
npm run import:json --workspace backend -- ../movimientos.json
```

El importador reconoce campos comunes como `tipo`, `monto`, `sobres`, `responsable`, `usuario`, `fecha` y los convierte a movimientos SQLite.

## Endpoints principales

- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET /api/movements`
- `POST /api/movements`
- `GET /api/periods`
- `GET /api/periods/:id/export.pdf`
- `GET /api/periods/:id/export.xlsx`
- `POST /api/bot/sync`
- `GET /api/admin/logs`
- `POST /api/admin/backup`

## Producción

1. Cambiar `JWT_SECRET`, `ADMIN_PASSWORD` y `CORS_ORIGIN`.
2. Ejecutar `npm run build`.
3. Servir `frontend/dist` con Nginx.
4. Ejecutar backend con PM2 o systemd:

```bash
npm install -g pm2
pm2 start backend/src/server.js --name sobres-api
pm2 save
pm2 startup
```

Ejemplo Nginx: proxy `/api` y Socket.io al backend, y servir `frontend/dist` como SPA.

## Seguridad básica incluida

- Helmet
- CORS configurable
- Rate limiting
- JWT
- Hash bcryptjs para contraseñas
- Logs de auditoría
- Validación Zod
- Backups automáticos programables
