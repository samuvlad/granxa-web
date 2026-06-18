# Granxa Maps Web

Frontend en Next.js para xestión de parcelas e gando.

## Variables de entorno

Copia `.env.local` (ou crea o teu propio) coas seguintes variables:

| Variable                    | Descrición                                                                          | Por defecto                |
| --------------------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| `NEXT_PUBLIC_API_URL`       | URL base do backend FastAPI.                                                        | `http://localhost:8000`    |
| `NEXT_PUBLIC_USE_MOCKS`     | Se é `true` ou `1`, instala mocks no cliente HTTP (útil para desenvolve-lo UI sen API). | _(desactivado)_            |

## Instalación

```bash
npm install
```

## Executar en desenvolvemento

```bash
npm run dev
```

A aplicación estará dispoñible en `http://localhost:3000`.

## Build de produción

```bash
npm run build
npm start
```

## Estrutura

- `app/` — páxinas e layout de Next.js
- `components/map/` — compoñentes do mapa (Leaflet + Geoman)
- `lib/api.ts` — cliente HTTP para o backend
- `lib/queries.ts` — hooks de TanStack Query
- `types/` — tipos compartidos
