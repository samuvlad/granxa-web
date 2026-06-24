# Granxa Maps Web

Frontend en Next.js para xestión de parcelas e gando. Inclúe vista de mapa
(Leaflet + Geoman), xestión de lotes, ovellas, parcelas e rotacións de
pastoreo.

## Arranque rápido con Docker (recomendado)

A app inclúe unha configuración Docker de **desenvolvemento** con HMR: o
código móntase como volume e os cambios reflíctense en vivo no navegador.

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
docker compose restart app        # reiniciar (útil se HMR non recolle cambios)
docker compose exec app sh        # abrir unha shell no contedor
```

> Como o código está montado como volume, **non** necesitas facer rebuild
> tras editar ficheiros. Rebuild só é necesario se cambias
> `package.json`/`package-lock.json` (para reinstalar dependencias) ou o
> propio `Dockerfile`.

## Arranque en desenvolvemento (sen Docker)

```bash
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

A aplicación estará dispoñible en `http://localhost:3000`. **Require un
backend FastAPI accesible** en `NEXT_PUBLIC_API_URL`; sen el, as peticións
fallarán.

## Build de produción (sen Docker)

```bash
NEXT_PUBLIC_API_URL=https://api.example.com npm run build
npm start
```

## Variables de entorno

| Variable                | Descrición                                                                              | Por defecto              |
| ----------------------- | --------------------------------------------------------------------------------------- | ------------------------ |
| `NEXT_PUBLIC_API_URL`   | URL base do backend FastAPI empregada polo **navegador**. Debe ser alcanzable dende o PC do usuario. | _(baleira)_              |
| `API_URL`               | URL base do backend FastAPI empregada polo **servidor** (Server Components). Útil en Docker para apuntar ao contedor da API pola rede interna. | _(baleira)_              |

Se só se define `NEXT_PUBLIC_API_URL`, o servidor e o cliente empregan a
mesma URL. O `lib/api.ts` escolle automaticamente:

- No servidor (`window` indefinido) → `API_URL` se existe, senón `NEXT_PUBLIC_API_URL`
- No cliente (`window` definido) → `NEXT_PUBLIC_API_URL`

### Con Docker (recomendado)

`docker-compose.yml` define ambas:

- `NEXT_PUBLIC_API_URL=http://localhost:8000` → o navegador do host
  golpea a API directamente en `localhost:8000`
- `API_URL=http://<nome-do-contedor-api>:8000` → o servidor dentro do
  contedor da web fala co contedor da API pola rede Docker

A rede externa `granxa-net` debe existir e o servizo da API debe estar
unido a ela:

```bash
docker network create granxa-net
```

### Conectar a un backend real

```bash
NEXT_PUBLIC_API_URL=https://api.example.com npm run dev
```

O cliente HTTP apunta a `${NEXT_PUBLIC_API_URL}/api/...` por defecto, así
que a URL debe incluír o prefixo se o backend o require.

## Arquitectura

- **Next.js 16** con App Router e `output: "standalone"` (build optimizado para Docker)
- **React 19**
- **Server Components** por defecto: cada páxina chama directamente ao
  backend FastAPI no servidor mediante `lib/api.ts` e pasa o resultado
  como `initialData` a unha *client island* con TanStack Query
- **Mapa**: Leaflet + Geoman cargados en client side mediante
  `import()` dinámico
- **Confirmacións**: substituíuse `window.confirm()` por un `ConfirmDialog`
  accesible (`components/ui/confirm-dialog.tsx`)

## Estrutura

```
app/
  (app)/
    page.tsx                   ← Server Component (Dashboard)
    layout.tsx                 ← Layout con sidebar
    loading.tsx                ← Spinner para o segmento
    error.tsx                  ← Boundary de erro
    not-found.tsx              ← 404
    parcelas/
      page.tsx                 ← Server Component
      _components/             ← Client islands
      _hooks/                  ← Custom hooks específicos
    rebanho/
      [id]/page.tsx            ← generateMetadata dinámico
components/
  map/        ← MapView, PlotSidebar
  lotes/      ← LoteList, LoteFormDialog
  sheep/      ← SheepTable, SheepFormDialog, SheepStatusBadge
  grazing/    ← RotationList, RotationFormDialog
  dashboard/  ← KPICard, ActivityFeed, QuickActions, RotationsSummary
  layout/     ← AppSidebar, PageHeader, SectionPlaceholder
  ui/         ← Button, Dialog, Select, ConfirmDialog, Textarea, …
lib/
  api.ts                      ← Cliente fetch con API agrupada
  queries.ts                  ← Hooks de TanStack Query
  utils.ts                    ← cn, indexBy, uniqueBy
types/
  index.ts                    ← Tipos do dominio
```

## Detalles técnicos

- `useConfirm` (`components/ui/confirm-dialog.tsx`): hook que devolve unha
  promesa ao estilo de `window.confirm()` pero renderizando un Dialog
  accesible. Non usa estado global; cada quenda monta o seu propio Dialog
  dentro do compoñente que o chama
- O **cliente HTTP** (`lib/api.ts`) lanza `ApiError` con `status` e
  `detail` cando o backend devolve unha resposta non-OK; o frontend
  traduce estes erros a mensaxes mediante `getApiErrorMessage`
- As páxinas con `[id]` usan `generateMetadata` para que o título da
  pestaña reflicta a entidade (p.ex. "Margarita · Granxa Maps"). Se o
  backend devolve 404, a páxina chama a `notFound()`
