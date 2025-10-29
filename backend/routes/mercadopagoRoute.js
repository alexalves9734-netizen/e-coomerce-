import express from 'express';
import { createPreference, processPayment, webhook } from '../controllers/mercadopagoController.js';
import { validateSignature } from '../middlewares/validateSignature.js';

const mercadopagoRouter = express.Router();

// Rota para criar preference (não precisa de autenticação)
mercadopagoRouter.post('/create-preference', createPreference);

// Rota para processar pagamento direto (sem autenticação para facilitar checkout)
mercadopagoRouter.post('/process-payment', processPayment);

// Rota para webhook (com validação de signature)
mercadopagoRouter.post('/webhook', validateSignature, webhook);

export default mercadopagoRouter;