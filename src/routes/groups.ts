import { Router } from 'express';
import { createEvolutionClient } from '../services/evolutionClient';

const router = Router();

/**
 * GET /groups?instanceName=...
 * Esqueleto: valida config Evolution; na próxima iteração lista grupos via Evolution/Baileys.
 */
router.get('/', async (req, res, next) => {
  try {
    const instanceName = String(req.query.instanceName || '').trim();
    if (!instanceName) {
      res.status(400).json({ status: 'error', message: 'instanceName é obrigatório' });
      return;
    }

    const client = createEvolutionClient();
    if (!client) {
      res.status(503).json({
        status: 'error',
        message: 'Evolution API não configurada (defina EVOLUTION_API_BASE_URL e EVOLUTION_API_KEY).',
      });
      return;
    }

    // TODO: substituir pelo endpoint real da Evolution usada no OnlyFlow (ex.: fetchInstances / groupChats).
    res.status(501).json({
      status: 'error',
      message:
        'Listagem de grupos ainda não implementada nesta versão. Configure Evolution e implemente o cliente em src/routes/groups.ts.',
      instanceName,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
