import express, { Router } from 'express';
import { SERVER_CONFIG, EVOLUTION_CONFIG } from './config/constants';
import { grupoFlowCors } from './middleware/cors';
import healthRoutes from './routes/health';
import groupsRoutes from './controllers/groups/router';
import internalRoutes from './routes/internal';
import { getCapabilities } from './controllers/capabilities';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(grupoFlowCors);

const grupoFlowApi = Router();
grupoFlowApi.get('/capabilities', getCapabilities);
grupoFlowApi.use('/groups', groupsRoutes);
grupoFlowApi.use('/internal', internalRoutes);

const apiRouter = Router();
apiRouter.use('/grupo-flow', grupoFlowApi);

app.use('/api', apiRouter);
app.use('/', healthRoutes);
app.use(errorHandler);

app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`[Grupo-Flow] listening on port ${SERVER_CONFIG.PORT} (${SERVER_CONFIG.NODE_ENV})`);
  if (!EVOLUTION_CONFIG.BASE_URL) {
    console.warn('[Grupo-Flow] EVOLUTION_API_BASE_URL / EVOLUTION_HOST ausente — chamadas à GO falharão.');
  }
});

export default app;
