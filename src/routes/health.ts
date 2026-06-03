import { Router } from 'express';
import packageJson from '../../package.json';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'grupo-flow',
    version: packageJson.version || '2.0.0',
    message: 'Grupo-Flow está no ar',
    timestamp: new Date().toISOString(),
  });
});

export default router;
