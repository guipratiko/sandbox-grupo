# Grupo-Flow (v2)

Microserviço Node/Express do OnlyFlow para operações de grupos WhatsApp via **Evolution GO**.

## Desenvolvimento

```bash
cp .env.example .env
npm install
npm run dev
```

- Saúde: `GET http://localhost:4334/`
- API (via proxy do Backend): prefixo **`/api/grupo-flow`**
  - Grupos: `GET http://localhost:4334/api/grupo-flow/groups?instanceName=NOME_INTERNO`
  - Interno: `GET http://localhost:4334/api/grupo-flow/internal/ping` + header `x-internal-key`

## Variáveis

| Variável | Descrição |
|----------|-----------|
| `EVOLUTION_HOST` | Host da Evolution GO (ex.: `evogo.clerky.com.br`) |
| `EVOLUTION_APIKEY` | Chave global admin (opcional) |
| `GRUPO_FLOW_INTERNAL_KEY` | Igual ao Backend / `JWT_SECRET` |
| `CORS_ORIGINS` | Origens permitidas (opcional) |

## Integração com o Backend OnlyFlow

No `.env` do Backend:

```env
GRUPO_FLOW_SERVICE_URL=http://localhost:4334
GRUPO_FLOW_INTERNAL_KEY=<mesmo JWT_SECRET>
EVOLUTION_HOST=evogo.clerky.com.br
```

O Backend expõe `GET/POST /api/grupo-flow/...` (autenticado) e faz proxy para este serviço, resolvendo `instanceName` → token da instância (`x-evolution-instance-token`).

## Build

```bash
npm run build
npm start
```

## Evolution GO — endpoints usados

- `GET /group/list` — listar grupos
- `POST /group/info`, `/group/create`, `/group/name`, `/group/description`, `/group/photo`
- `POST /group/participant`, `/group/settings`, `/group/invitelink`, `/group/leave`
- `POST /send/text`, `/send/media`, `/send/location`, `/send/poll`, `/send/contact`

Respostas GO usam campos PascalCase (`JID`, `Name`, `Topic`); o serviço normaliza para `id`, `subject`, `description` no payload ao Frontend.
