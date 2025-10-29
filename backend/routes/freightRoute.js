import express from "express";
import {
  calculateFreightByCEP,
  getCEPInfo,
  listFreightRegions,
  createFreightRegion,
  updateFreightRegion,
  deleteFreightRegion,
  getFreightRegion,
  toggleFreightRegion
} from "../controllers/freightController.js";
import adminAuth from "../middlewares/adminAuth.js";

const freightRouter = express.Router();

// Rotas públicas
freightRouter.post('/calculate', calculateFreightByCEP); // Calcular frete por CEP
freightRouter.get('/cep/:cep', getCEPInfo); // Consultar informações do CEP

// Rotas administrativas
freightRouter.get('/regions', adminAuth, listFreightRegions); // Listar regiões
freightRouter.post('/regions', adminAuth, createFreightRegion); // Criar região
freightRouter.get('/regions/:id', adminAuth, getFreightRegion); // Obter região específica
freightRouter.put('/regions/:id', adminAuth, updateFreightRegion); // Atualizar região
freightRouter.delete('/regions/:id', adminAuth, deleteFreightRegion); // Deletar região
freightRouter.patch('/regions/:id/toggle', adminAuth, toggleFreightRegion); // Ativar/Desativar região

export default freightRouter;