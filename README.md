# Granxa Maps Web

Frontend en Next.js para xestión de parcelas e gando. Inclúe vista de mapa
(Leaflet + Geoman), xestión de lotes, ovellas, parcelas e rotacións de
pastoreo.

## Arranque rápido con Docker (recomendado)

A app inclúe unha configuración Docker autocontida con **mocks activados por
defecto**, polo que funciona sen backend.

```bash
docker compose up --build
```

A aplicación estará dispoñible en `http://localhost:3000` desde calquera
máquina da rede que acceda ao host de Docker.

Comandos útiles:

```bash
docker compose up --build -d      # arrancar en segundo plano
docker compose logs -f app        # seguir logs
docker compose down               # parar
docker compose up --build --force-recreate  # rebuild tras cambios
```

## Arranque en desenvolvemento (sen Docker)

```bash
npm install
npm run dev
```

A aplicación estará dispoñible en `http://localhost:3000`. Os mocks
actívanse por defecto; non necesitas backend.

## Build de produción (sen Docker)

```bash
npm run build
npm start
```

## Variables de entorno

| Variable                | Descrición                                                                              | Por defecto              |
| ----------------------- | --------------------------------------------------------------------------------------- | ------------------------ |
| `NEXT_PUBLIC_API_URL`   | URL base do backend FastAPI (só se usa cando os mocks están desactivados).              | `http://localhost:8000`  |
| `NEXT_PUBLIC_USE_MOCKS` | `false` ou `0` desactiva os mocks e conecta ao backend real. Calquera outro valor (ou non definida) deixa os mocks activos. | _(activado)_             |

### Conectar a un backend real

```bash
# Local
NEXT_PUBLIC_USE_MOCKS=false NEXT_PUBLIC_API_URL=https://api.example.com npm run dev

# Docker (editar docker-compose.yml)
#   args:
#     NEXT_PUBLIC_USE_MOCKS: "false"
#   environment:
#     NEXT_PUBLIC_API_URL: https://api.example.com
```

⚠️ `NEXT_PUBLIC_*` inlínase no bundle no build. Para cambiar o seu valor
en Docker hai que facer rebuild (`docker compose up --build`).

## Estrutura

- `app/` — páxinas e layout de Next.js (App Router)
- `components/map/` — compoñentes do mapa (Leaflet + Geoman)
- `components/lotes|sheep|grazing|...` — CRUD por dominio
- `components/ui/` — wrappers sobre `@base-ui/react` (Button, Dialog, etc.)
- `lib/api.ts` — cliente HTTP (axios) para o backend
- `lib/api-mock.ts` — mocks en memoria con seed data (lotes, ovellas, parcelas, rotacións)
- `lib/queries.ts` — hooks de TanStack Query
- `types/` — tipos compartidos

## Detalles técnicos

- **Next.js 16** con App Router e `output: "standalone"` (build optimizado para Docker)
- **React 19**
- **Mapa**: Leaflet + Geoman para debuxar/editar polígonos de parcelas
- **Mocks**: intercéptanse as chamadas de axios no cliente (`installApiMocks`).
  Os datos viven en memoria e persisten mentres a sesión estea aberta
  (lotes, ovellas, parcelas, rotacións).
