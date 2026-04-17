import { Router } from 'express';
import { requireInternalKey } from '../middleware/internalAuth';

const router = Router();

router.use(requireInternalKey);

/** Placeholder para agendamentos / callbacks internos */
router.get('/ping', (_req, res) => {
  res.json({ status: 'ok', scope: 'internal' });
});

export default router;
