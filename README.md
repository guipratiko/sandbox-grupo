# Grupo-Flow (v2)

Microserviço Node/Express do OnlyFlow para operações de grupos WhatsApp via **Evolution API**.

## Desenvolvimento

```bash
cp .env.example .env
npm install
npm run dev
```

- Saúde: `GET http://localhost:4334/`
- Grupos (esqueleto): `GET http://localhost:4334/groups?instanceName=NOME`
- Interno: `GET http://localhost:4334/internal/ping` com header `x-internal-key` igual a `GRUPO_FLOW_INTERNAL_KEY` (ou `JWT_SECRET`).

## Build

```bash
npm run build
npm start
```

## Integração com o Backend OnlyFlow

Configure no `.env` do Backend a URL deste serviço (ex.: `GROUP_SERVICE_URL` ou variável que o projeto usar ao reativar o proxy) e o mesmo segredo interno.
