# Grupo-Flow (v2)

Microserviço Node/Express do OnlyFlow para operações de grupos WhatsApp via **Evolution API**.

## Desenvolvimento

```bash
cp .env.example .env
npm install
npm run dev
```

- Saúde (raiz): `GET http://localhost:4334/`
- API (consumida pelo proxy do backend): prefixo **`/api/grupo-flow`**
  - Grupos (esqueleto): `GET http://localhost:4334/api/grupo-flow/groups?instanceName=NOME`
  - Interno: `GET http://localhost:4334/api/grupo-flow/internal/ping` com header `x-internal-key` igual a `GRUPO_FLOW_INTERNAL_KEY`.

## Build

```bash
npm run build
npm start
```

## Integração com o Backend OnlyFlow

No `.env` do Backend: `GRUPO_FLOW_SERVICE_URL=https://seu-host` (sem barra no fim) e `GRUPO_FLOW_INTERNAL_KEY` igual ao deste microserviço (ou use só `JWT_SECRET` nos dois lados). O OnlyFlow expõe `GET/POST /api/grupo-flow/...` autenticado e faz proxy para `GRUPO_FLOW_SERVICE_URL/api/grupo-flow/...`.
