import express, { Router } from 'express';
import cors from 'cors';
import { env } from './config/env';
import healthRoutes from './routes/health';
import groupsRoutes from './routes/groups';
import internalRoutes from './routes/internal';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json({ limit: '10mb' }));

function isAllowedOnlyflowOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    return (
      u.hostname === 'localhost' ||
      u.hostname === '127.0.0.1' ||
      u.hostname.endsWith('.onlyflow.com.br') ||
      u.hostname === 'onlyflow.com.br'
    );
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true);
        return;
      }
      if (env.corsOrigins.length > 0) {
        cb(null, env.corsOrigins.includes(origin));
        return;
      }
      if (isAllowedOnlyflowOrigin(origin)) {
        cb(null, true);
        return;
      }
      if (env.NODE_ENV !== 'production') {
        cb(null, true);
        return;
      }
      cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-key', 'x-grupo-flow-internal-key'],
  })
);

/** Rotas consumidas pelo proxy do Backend OnlyFlow: /api/grupo-flow/* */
const grupoFlowApi = Router();
grupoFlowApi.use('/groups', groupsRoutes);
grupoFlowApi.use('/internal', internalRoutes);

const apiRouter = Router();
apiRouter.use('/grupo-flow', grupoFlowApi);

app.use('/api', apiRouter);
app.use('/', healthRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[Grupo-Flow] v2 listening on port ${env.PORT} (${env.NODE_ENV})`);
});
