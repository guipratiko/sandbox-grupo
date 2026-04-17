import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'grupo-flow',
    version: '2.0.0',
    message: 'Grupo-Flow está no ar',
    timestamp: new Date().toISOString(),
  });
});

export default router;
