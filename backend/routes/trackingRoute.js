import express from 'express';
import {
  createTracking,
  updateTracking,
  getTracking,
  getUserTrackings,
  updateAllTrackings,
  getAllTrackings,
  deleteTracking
} from '../controllers/trackingController.js';

const trackingRouter = express.Router();

// Criar ou atualizar rastreamento
trackingRouter.post('/create', createTracking);

// Atualizar informações de rastreamento específico
trackingRouter.put('/update/:trackingCode', updateTracking);

// Buscar informações de rastreamento por código
trackingRouter.get('/:trackingCode', getTracking);

// Rota alternativa para o frontend
trackingRouter.get('/code/:trackingCode', getTracking);

// Buscar rastreamentos de um usuário
trackingRouter.get('/user/:userId', getUserTrackings);

// Atualizar todos os rastreamentos (para cron job)
trackingRouter.post('/update-all', updateAllTrackings);

// Buscar todos os rastreamentos (admin)
trackingRouter.get('/admin/all', getAllTrackings);

// Deletar rastreamento
trackingRouter.delete('/:trackingCode', deleteTracking);

export default trackingRouter;