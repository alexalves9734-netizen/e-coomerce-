import FreightRegion from '../models/freightRegionModel.js';
import mongoose from 'mongoose';
import { readRegions, writeRegions, generateId } from '../utils/freightFallbackStore.js';
import CEPService from '../services/cepService.js';
import { calculateShipping } from '../services/freightService.js';

// Calcular frete por CEP
const calculateFreightByCEP = async (req, res) => {
  try {
    const { cep, weight = 1, orderValue = 0 } = req.body;

    if (!cep) {
      return res.status(400).json({
        success: false,
        message: "CEP é obrigatório"
      });
    }

    const result = await CEPService.calculateFreight(cep, weight, orderValue);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro ao calcular frete:', error);

    // Quando não há região atendida ou erro de CEP, evitar 400 e oferecer fallback
    try {
      const originZip = process.env.STORE_ZIP_CODE || '01000000';
      const destinyZip = String(req.body?.cep || '').replace(/\D/g, '');
      const weightSafe = Number(req.body?.weight || 1);

      const fb = await calculateShipping(originZip, destinyZip, weightSafe, {});

      // Responder 200 com sucesso=false para que o frontend trate com fallback
      return res.status(200).json({
        success: false,
        message: error.message || 'Falha no cálculo regional, usando opções nacionais',
        fallback: fb
      });
    } catch (fbError) {
      console.error('Erro ao executar fallback de frete:', fbError);
      return res.status(400).json({
        success: false,
        message: error.message || 'Erro ao calcular frete'
      });
    }
  }
};

// Consultar informações do CEP
const getCEPInfo = async (req, res) => {
  try {
    const { cep } = req.params;

    if (!cep) {
      return res.status(400).json({
        success: false,
        message: "CEP é obrigatório"
      });
    }

    const cepInfo = await CEPService.getCEPInfo(cep);

    res.json({
      success: true,
      data: cepInfo
    });

  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Listar regiões de frete
const listFreightRegions = async (req, res) => {
  try {
    const { active, search, state } = req.query;

    const filter = {};
    // Filtrar por ativo apenas se o valor for fornecido e não vazio
    if (typeof active === 'string' && active !== '') {
      filter.active = active === 'true';
    }
    // Filtrar por estado atendido
    if (typeof state === 'string' && state !== '') {
      filter.states = state;
    }
    // Buscar por nome (case-insensitive)
    if (typeof search === 'string' && search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    const regions = await FreightRegion.find(filter).sort({ name: 1 });

    res.json({
      success: true,
      data: regions
    });

  } catch (error) {
    console.error('Erro ao listar regiões:', error);

    // Fallback: preferir regiões salvas em JSON pelo admin;
    // se vazio, usar conjunto padrão.
    let fallbackRegions = readRegions();
    if (!Array.isArray(fallbackRegions) || fallbackRegions.length === 0) {
      fallbackRegions = [
      {
        _id: 'fallback1',
        name: 'Sudeste',
        states: ['SP', 'RJ', 'MG', 'ES'],
        cities: [
          { name: 'São Paulo', state: 'SP', customPrice: 8.9 },
          { name: 'Rio de Janeiro', state: 'RJ', customPrice: 12.9 },
          { name: 'Belo Horizonte', state: 'MG', customPrice: 15.9 }
        ],
        basePrice: 18.9,
        pricePerKg: 2.5,
        freeShippingThreshold: 150.0,
        deliveryTime: { min: 2, max: 5 },
        isFreeShipping: false,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'fallback2',
        name: 'Sul',
        states: ['RS', 'SC', 'PR'],
        cities: [
          { name: 'Porto Alegre', state: 'RS', customPrice: 16.9 },
          { name: 'Florianópolis', state: 'SC', customPrice: 18.9 },
          { name: 'Curitiba', state: 'PR', customPrice: 14.9 }
        ],
        basePrice: 22.9,
        pricePerKg: 3.0,
        freeShippingThreshold: 200.0,
        deliveryTime: { min: 3, max: 7 },
        isFreeShipping: false,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'fallback3',
        name: 'Nordeste',
        states: ['BA', 'PE', 'CE', 'RN', 'PB', 'AL', 'SE', 'MA', 'PI'],
        cities: [
          { name: 'Salvador', state: 'BA', customPrice: 25.9 },
          { name: 'Recife', state: 'PE', customPrice: 28.9 },
          { name: 'Fortaleza', state: 'CE', customPrice: 32.9 }
        ],
        basePrice: 35.9,
        pricePerKg: 4.5,
        freeShippingThreshold: 300.0,
        deliveryTime: { min: 5, max: 10 },
        isFreeShipping: false,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    }

    // Aplicar filtros sobre os dados de fallback
    const { active: fActive, search: fSearch, state: fState } = req.query;
    if (typeof fActive === 'string' && fActive !== '') {
      const wantActive = fActive === 'true';
      fallbackRegions = fallbackRegions.filter(r => r.active === wantActive);
    }
    if (typeof fState === 'string' && fState !== '') {
      fallbackRegions = fallbackRegions.filter(r => r.states.includes(fState));
    }
    if (typeof fSearch === 'string' && fSearch.trim() !== '') {
      const re = new RegExp(fSearch.trim(), 'i');
      fallbackRegions = fallbackRegions.filter(r => re.test(r.name));
    }

    return res.json({
      success: true,
      data: fallbackRegions
    });
  }
};

// Criar região de frete
const createFreightRegion = async (req, res) => {
  try {
    const {
      name,
      states,
      cities = [],
      basePrice,
      pricePerKg = 0,
      freeShippingThreshold = 0,
      deliveryTime,
      isFreeShipping = false
    } = req.body;

    // Validações
    if (!name || !states || !Array.isArray(states) || states.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nome e estados são obrigatórios"
      });
    }

    // Se não for frete grátis, validar preço base
    if (!isFreeShipping && (!basePrice || basePrice < 0)) {
      return res.status(400).json({
        success: false,
        message: "Preço base deve ser maior ou igual a zero"
      });
    }

    if (!deliveryTime || !deliveryTime.min || !deliveryTime.max) {
      return res.status(400).json({
        success: false,
        message: "Tempo de entrega (mín e máx) é obrigatório"
      });
    }

    // Se DB conectado, usar Mongo
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const region = new FreightRegion({
        name,
        states,
        cities,
        basePrice: isFreeShipping ? 0 : basePrice,
        pricePerKg: isFreeShipping ? 0 : pricePerKg,
        freeShippingThreshold: isFreeShipping ? 0 : freeShippingThreshold,
        deliveryTime,
        isFreeShipping
      });

      await region.save();

      return res.status(201).json({
        success: true,
        data: region,
        message: "Região de frete criada com sucesso"
      });
    }

    // Fallback JSON
    const regions = readRegions();
    const payload = {
      _id: generateId(),
      name,
      states,
      cities,
      basePrice: isFreeShipping ? 0 : basePrice,
      pricePerKg: isFreeShipping ? 0 : pricePerKg,
      freeShippingThreshold: isFreeShipping ? 0 : freeShippingThreshold,
      deliveryTime,
      isFreeShipping,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    regions.push(payload);
    writeRegions(regions);
    return res.status(201).json({ success: true, data: payload, message: "Região criada (fallback)" });

  } catch (error) {
    console.error('Erro ao criar região:', error);
    
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Já existe uma região com este nome"
      });
    }

    // Fallback ao criar em JSON já tratado acima, retornar erro genérico
    return res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
};

// Atualizar região de frete
const updateFreightRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Se for frete grátis, zerar os preços
    if (updateData.isFreeShipping) {
      updateData.basePrice = 0;
      updateData.pricePerKg = 0;
      updateData.freeShippingThreshold = 0;
    }

    if (mongoose.connection.readyState === 1) {
      const region = await FreightRegion.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!region) {
        return res.status(404).json({ success: false, message: "Região não encontrada" });
      }
      return res.json({ success: true, data: region, message: "Região atualizada com sucesso" });
    }

    // Fallback JSON
    const regions = readRegions();
    const idx = regions.findIndex(r => String(r._id) === String(id));
    if (idx === -1) return res.status(404).json({ success: false, message: "Região não encontrada" });
    const prev = regions[idx];
    const next = { ...prev, ...updateData, updatedAt: new Date() };
    regions[idx] = next;
    writeRegions(regions);
    return res.json({ success: true, data: next, message: "Região atualizada (fallback)" });

  } catch (error) {
    console.error('Erro ao atualizar região:', error);
    return res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
};

// Deletar região de frete
const deleteFreightRegion = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const region = await FreightRegion.findByIdAndDelete(id);
      if (!region) return res.status(404).json({ success: false, message: "Região não encontrada" });
      return res.json({ success: true, message: "Região deletada com sucesso" });
    }

    // Fallback JSON
    const regions = readRegions();
    const filtered = regions.filter(r => String(r._id) !== String(id));
    if (filtered.length === regions.length) {
      return res.status(404).json({ success: false, message: "Região não encontrada" });
    }
    writeRegions(filtered);
    return res.json({ success: true, message: "Região deletada (fallback)" });

  } catch (error) {
    console.error('Erro ao deletar região:', error);
    return res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
};

// Obter região específica
const getFreightRegion = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const region = await FreightRegion.findById(id);
      if (!region) return res.status(404).json({ success: false, message: "Região não encontrada" });
      return res.json({ success: true, data: region });
    }

    // Fallback JSON
    const regions = readRegions();
    const region = regions.find(r => String(r._id) === String(id));
    if (!region) return res.status(404).json({ success: false, message: "Região não encontrada" });
    return res.json({ success: true, data: region });

  } catch (error) {
    console.error('Erro ao buscar região:', error);
    return res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
};

// Ativar/Desativar região
const toggleFreightRegion = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const region = await FreightRegion.findById(id);
      if (!region) return res.status(404).json({ success: false, message: "Região não encontrada" });
      region.active = !region.active;
      await region.save();
      return res.json({ success: true, data: region, message: `Região ${region.active ? 'ativada' : 'desativada'} com sucesso` });
    }

    // Fallback JSON
    const regions = readRegions();
    const idx = regions.findIndex(r => String(r._id) === String(id));
    if (idx === -1) return res.status(404).json({ success: false, message: "Região não encontrada" });
    regions[idx].active = !regions[idx].active;
    regions[idx].updatedAt = new Date();
    writeRegions(regions);
    return res.json({ success: true, data: regions[idx], message: `Região ${regions[idx].active ? 'ativada' : 'desativada'} (fallback)` });

  } catch (error) {
    console.error('Erro ao alterar status da região:', error);
    return res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
};

export {
  calculateFreightByCEP,
  getCEPInfo,
  listFreightRegions,
  createFreightRegion,
  updateFreightRegion,
  deleteFreightRegion,
  getFreightRegion,
  toggleFreightRegion
};