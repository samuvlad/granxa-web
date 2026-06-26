# AGENTS.md — Granxa Maps Web

Notas operativas concisas para sesións de OpenCode neste frontend Next.js 16 / React 19.

## Entorno de desenvolvemento: Docker por defecto

Esta app lánzase normalmente con Docker, non con `npm run dev` en bruto.
O `docker-compose.yml` monta o repo como volume, executa `npm run dev`
dentro do contedor no porto `3000` e usa *file watching* baseado en
polling (`CHOKIDAR_USEPOLLING`, `WATCHPACK_POLLING`).

```bash
docker compose up --build           # primeira execución / tras cambiar deps ou Dockerfile
docker compose up -d                # en segundo plano
docker compose logs -f app          # seguir logs
docker compose restart app          # se o HMR non colle un cambio
docker compose exec app sh          # shell dentro do contedor
docker compose down
```

Como o código vai montado como volume, **as edicións en
`.ts`/`.tsx`/`.css` recóllense en vivo** — non fai falta rebuild para
esas. Rebuild só cando cambian `package.json`, `package-lock.json` ou o
`Dockerfile`.

### Rede externa `granxa-net`

`docker-compose.yml` únese á rede externa `granxa-net`. O contedor da
web fala co backend FastAPI polo nome do servizo
(`http://granxa-maps-api:8000`) dentro desa rede, mentres que o
navegador no host chega a `http://localhost:8000`. Antes do primeiro
`up`:

```bash
docker network create granxa-net
```

Se as peticións dende o servidor dan erros de conexión, o contedor da
API ou non está en execución, ou non está en `granxa-net`, ou non se
chama `granxa-maps-api`.

### Fallback sen Docker

```bash
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

As páxinas que fan fetch ao backend (na práctica todas as de
`app/(app)/`) **fallan se non hai un FastAPI accesible**. Non hai capa
de datos *mock*.

## Variables de entorno

| Var | Usada por | Por defecto |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | navegador (inline no build) e *fallback* servidor | baleiro |
| `API_URL` | só Server Components (`lib/api.ts` escolle esta cando `window` é `undefined`) | baleiro |

`lib/api.ts:16` escolle `API_URL` no servidor, se non
`NEXT_PUBLIC_API_URL`. Recórtase a barra final. Todos os paths levan
prefixo `/api/...`, polo que se o backend require un prefixo, hai que
incluílo na URL.

## Verificar cambios

O `package.json` só trae `dev`, `build`, `start`, `lint`. **Non hai
test runner nin script de typecheck** no repo.

- Typecheck: `npx tsc --noEmit` (usa `tsconfig.json`).
- Lint: `npm run lint` (ESLint flat config, `eslint-config-next` core-web-vitals + typescript).
- Compilar: `npm run build` (tamén confirma o build *standalone* que
  emprega a imaxe de produción).

Prefire `npm run build` para validar cambios que tocan Server
Components, routing ou tratamento de env — a ferramenta perde tempo e
tokens con dev servers de longa duración. Só arranca un servidor cando
de verdade precises inspeccionar saída en tempo de execución.

Se o porto xa está ocupado, mata o proceso antigo antes:

```bash
lsof -i :3000          # ou: fuser 3000/tcp
kill <PID>             # evita `pkill -f next` en hosts que tamén corren Docker — pode matar o proceso equivocado
```

Dentro de Docker, o contedor é dono do porto 3000; se colisiona,
reinicia o contedor.

## Notas de arquitectura

- **Server Components por defecto**; as páxinas de `app/(app)/` chaman
  a `lib/api.ts` directamente e pasan o resultado como `initialData` a
  unha *client island* (p.ex. `app/(app)/parcelas/page.tsx` →
  `ParcelasClient`). Mira `app/(app)/page.tsx` e
  `app/(app)/parcelas/page.tsx` para o patrón canónico.
- **Client islands** usan TanStack Query (`lib/queries.ts`) para
  *mutations* e *refetches*; `Providers` en `app/providers.tsx` cablea
  o `QueryClientProvider`.
- **Mapas** (`components/map/MapView.tsx`, `PlotSidebar.tsx`) son
  Leaflet + Geoman cargados cun `import()` dinámico para quedar
  client-only.
- **Erros**: `lib/api.ts` lanza `ApiError(status, detail)` en respostas
  non-OK. Usa `getApiErrorMessage(err)` para obter unha mensaxe para o
  usuario.
- **Confirmacións**: nunca uses `window.confirm()`. Usa o hook
  `useConfirm()` de `components/ui/confirm-dialog.tsx` — resolve unha
  promesa desde un Dialog de shadcn.
- **404 nas páxinas `[id]`** (p.ex. `app/(app)/rebanho/[id]/page.tsx`):
  chama a `notFound()` de `next/navigation` cando o backend devolve
  404. Estas páxinas tamén exportan `generateMetadata` para poñer o
  título da lapela a partir da entidade.
- **Next config**: `output: "standalone"` (a imaxe de produción
  depende disto) e `allowedDevOrigins` na lista branca para
  `192.168.1.11` e `localhost` — engade a IP da LAN aí se accedes ao
  dev server desde outro dispositivo.

### Trampa de layout do mapa

`MapView` debe ir dentro dun contenedor cun ancho e alto explícitos
distintos de cero. O layout da app (`app/(app)/layout.tsx`) usa CSS
Grid `grid-cols-[16rem_1fr]` cunha fila única `100vh`, e as páxinas
que acollen o mapa dimensionan a súa columna con `h-full w-full`.

**Non** deixes o *wrapper* do mapa só con `flex-1 h-full` — nalgúns
entornos o ítem flex colapsa a `0 × 0` e Leaflet inicializa pero non
renderiza teselas. Ao depurar un mapa en branco, inspecciona o
elemento `.leaflet-container`: se o seu tamaño computado é `0px`, o
bug é de CSS, non de Leaflet nin do provedor de teselas.

Tras tocar código de mapa no cliente ou CSS de layout, reinicia o dev
server (`docker compose restart app`); o HMR/Turbopack non sempre
reaplica cambios que afectan á inicialización do compoñente ou ao
dimensionamento.

## Convencións de UI

- Estilo shadcn `base-nova` con `iconLibrary: "lucide"` e
  `baseColor: "neutral"` (`components.json`). Xera novas primitivas
  con `npx shadcn add ...` para que coincidan.
- Tailwind v4 (`@tailwindcss/postcss`), variables CSS en
  `app/globals.css`.
- Alias de paths `@/*` → raíz do repo (ver `tsconfig.json`).
- Textos e identificadores de dominio van en **galego** (parcelas,
  rebanho, lotes, rotacións, pastoreo, ovellas, femias, etc.). Mantén
  as novas cadeas consistentes.

## Organización do código

- `app/(app)/` — segmento do App Router co layout de sidebar. Un
  cartafol por funcionalidade: `parcelas`, `rebanho/`, `lotes`,
  `pastoreo`, `alimentacion`, `sanidade`, `reproducion`, `produccion`,
  `finanzas`, `inventario`. Cada un posúe `_components/` e `_hooks/`.
- `app/(app)/page.tsx` — dashboard (Server Component).
- `app/layout.tsx` — html raíz, fontes, `Providers`.
- `components/{map,lotes,sheep,grazing,dashboard,layout,ui}/` — UI por
  funcionalidade. As novas primitivas compartidas van en
  `components/ui/`.
- `lib/api.ts` — cliente *fetch* tipado agrupado por recurso
  (`plots`, `sheep`, `lotes`, `rotations`).
- `lib/queries.ts` — hooks de TanStack Query.
- `lib/utils.ts` — `cn`, `indexBy`, `uniqueBy`.
- `types/index.ts` — tipos de dominio compartidos por servidor e
  cliente.

## Fóra de alcance / non está no repo

- Non hai workflows de CI, non hai *hooks* de pre-commit, non hai
  `.github/`.
- Non hai suite de tests, non hai cartafoles `__tests__/`, non hai
  config de Jest/Vitest.
- Non hai `opencode.json` / `.opencode/` máis alá deste ficheiro.
