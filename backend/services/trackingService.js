import axios from 'axios';
import mongoose from 'mongoose';
import trackingModel from '../models/trackingModel.js';
import orderModel from '../models/orderModel.js';
import { readTrackings, upsertTracking, getByTrackingCode, listToUpdate } from '../utils/trackingFallbackStore.js';
import userModel from '../models/userModel.js';

class TrackingService {
  isDBReady() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  mapEventsToFrontend(events = []) {
    return events.map(ev => ({
      status: ev.status || ev.subStatus || '',
      description: ev.observacao || ev.status || ev.subStatus || '',
      location: ev.local || '',
      date: ev.data && ev.hora ? `${ev.data} ${ev.hora}` : ev.data || '',
    }));
  }
  constructor() {
    // Configurações da API dos Correios
    this.baseURL = 'https://cws.correios.com.br';
    this.homologationURL = 'https://cwshom.correios.com.br';
    
    // Credenciais - devem ser configuradas no .env
    this.username = process.env.CORREIOS_USERNAME;
    this.password = process.env.CORREIOS_PASSWORD;
    this.token = process.env.CORREIOS_TOKEN;
    
    // Usar ambiente de homologação se não estiver em produção
    this.apiURL = process.env.NODE_ENV === 'production' ? this.baseURL : this.homologationURL;
  }

  /**
   * Buscar informações de rastreamento na API dos Correios
   * @param {string} trackingCode - Código de rastreamento
   * @returns {Object} - Dados de rastreamento
   */
  async fetchTrackingData(trackingCode) {
    try {
      console.log(`Buscando rastreamento para: ${trackingCode}`);
      
      // Verificar se as credenciais estão configuradas
      if (!this.username || !this.password) {
        throw new Error('Credenciais dos Correios não configuradas');
      }

      // Configurar headers para autenticação
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        'User-Agent': 'E-commerce-Tracking-System/1.0'
      };

      // Fazer requisição para a API Rastro dos Correios
      const response = await axios.get(
        `${this.apiURL}/rastro-json/consulta/objetos/${trackingCode}`,
        { 
          headers,
          timeout: 10000 // 10 segundos de timeout
        }
      );

      if (response.data && response.data.objetos && response.data.objetos.length > 0) {
        return response.data.objetos[0];
      } else {
        throw new Error('Nenhum dado de rastreamento encontrado');
      }

    } catch (error) {
      console.error('Erro ao buscar rastreamento:', error.message);
      
      // Se não tiver credenciais, usar API alternativa para demonstração
      if (error.message.includes('Credenciais')) {
        return this.fetchTrackingDataAlternative(trackingCode);
      }
      
      throw error;
    }
  }

  /**
   * API alternativa para demonstração (quando não há credenciais dos Correios)
   * @param {string} trackingCode - Código de rastreamento
   * @returns {Object} - Dados simulados de rastreamento
   */
  async fetchTrackingDataAlternative(trackingCode) {
    console.log('Usando API alternativa para demonstração');
    
    // Simular dados de rastreamento para demonstração
    const mockData = {
      codigo: trackingCode,
      servico: "SEDEX - Encomenda Expressa",
      host: "demo",
      quantidade: Math.floor(Math.random() * 5) + 1,
      eventos: [
        {
          data: new Date().toLocaleDateString('pt-BR'),
          hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          local: "CENTRO DE DISTRIBUIÇÃO - SÃO PAULO/SP",
          status: "Objeto postado",
          subStatus: ["Registrado por AGÊNCIA DOS CORREIOS - SÃO PAULO/SP"]
        },
        {
          data: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
          hora: "14:30",
          local: "CENTRO DE TRIAGEM - SÃO PAULO/SP",
          status: "Objeto em trânsito",
          subStatus: ["Encaminhado para CENTRO DE DISTRIBUIÇÃO"]
        }
      ]
    };

    return mockData;
  }

  /**
   * Criar ou atualizar registro de rastreamento
   * @param {string} orderId - ID do pedido
   * @param {string} trackingCode - Código de rastreamento
   * @returns {Object} - Registro de rastreamento criado/atualizado
   */
  async createOrUpdateTracking(orderId, trackingCode) {
    try {
      if (this.isDBReady()) {
        // Verificar se já existe um registro de rastreamento
        let tracking = await trackingModel.findOne({ orderId });
        
        if (tracking) {
          tracking.trackingCode = trackingCode;
          tracking.lastChecked = new Date();
        } else {
          tracking = new trackingModel({
            orderId,
            trackingCode,
            status: 'pending',
            eventos: [],
            lastChecked: new Date()
          });
        }

        await tracking.save();
        
        // Atualizar o pedido com o código de rastreamento
        try {
          await orderModel.findByIdAndUpdate(orderId, {
            trackingCode,
            trackingStatus: 'pending',
            lastTrackingUpdate: new Date()
          });
        } catch (_) {}

        console.log(`Rastreamento criado/atualizado para pedido ${orderId}`);
        return tracking;
      }

      // Offline fallback
      const fallback = { orderId, trackingCode, status: 'pending', eventos: [], lastChecked: new Date() };
      upsertTracking(fallback);
      return fallback;

    } catch (error) {
      console.error('Erro ao criar/atualizar rastreamento:', error);
      throw error;
    }
  }

  /**
   * Atualizar informações de rastreamento
   * @param {string} trackingCode - Código de rastreamento
   * @returns {Object} - Dados atualizados
   */
  async updateTrackingInfo(trackingCode) {
    try {
      if (this.isDBReady()) {
        // Buscar registro de rastreamento
        const tracking = await trackingModel.findOne({ trackingCode });
        if (!tracking) {
          throw new Error('Registro de rastreamento não encontrado');
        }

        // Buscar dados atualizados da API
        const trackingData = await this.fetchTrackingData(trackingCode);
        
        // Verificar se há novos eventos
        const newEvents = [];
        if (trackingData.eventos && trackingData.eventos.length > 0) {
          for (const event of trackingData.eventos) {
            const existingEvent = tracking.eventos.find(e => 
              e.data === event.data && 
              e.hora === event.hora && 
              e.status === event.status
            );
            
            if (!existingEvent) {
              newEvents.push(event);
              tracking.addEvent(event);
            }
          }
        }

        // Atualizar informações gerais
        tracking.servico = trackingData.servico || tracking.servico;
        tracking.quantidade = trackingData.quantidade || tracking.quantidade;
        tracking.host = trackingData.host || tracking.host;
        tracking.lastChecked = new Date();
        tracking.errorCount = 0; // Reset error count on successful update
        tracking.lastError = null;

        await tracking.save();

        // Atualizar status no pedido
        await orderModel.findByIdAndUpdate(tracking.orderId, {
          trackingStatus: tracking.status,
          lastTrackingUpdate: new Date()
        });

        console.log(`Rastreamento atualizado: ${trackingCode} - ${newEvents.length} novos eventos`);
        
        return {
          tracking,
          newEvents,
          hasUpdates: newEvents.length > 0
        };
      }

      // Offline fallback
      const current = getByTrackingCode(trackingCode) || { trackingCode, eventos: [], status: 'in_transit' };
      const trackingData = await this.fetchTrackingData(trackingCode).catch(() => ({ eventos: [] }));
      const newEvents = [];
      if (trackingData.eventos && trackingData.eventos.length > 0) {
        for (const event of trackingData.eventos) {
          const existingEvent = (current.eventos || []).find(e => 
            e.data === event.data && e.hora === event.hora && e.status === event.status
          );
          if (!existingEvent) newEvents.push(event);
        }
      }
      const merged = {
        ...current,
        servico: trackingData.servico || current.servico,
        eventos: [...(current.eventos || []), ...newEvents],
        lastChecked: new Date(),
        status: trackingData.status || current.status,
        errorCount: 0,
        lastError: null
      };
      upsertTracking(merged);
      return { tracking: merged, newEvents, hasUpdates: newEvents.length > 0 };

    } catch (error) {
      console.error(`Erro ao atualizar rastreamento ${trackingCode}:`, error);
      
      if (this.isDBReady()) {
        // Incrementar contador de erros somente quando DB ativo
        const tracking = await trackingModel.findOne({ trackingCode });
        if (tracking) {
          tracking.errorCount += 1;
          tracking.lastError = error.message;
          tracking.lastChecked = new Date();
          await tracking.save();
        }
      }
      throw error;
    }
  }

  /**
   * Buscar todos os rastreamentos que precisam ser atualizados
   * @returns {Array} - Lista de rastreamentos para atualizar
   */
  async getTrackingsToUpdate() {
    try {
      if (this.isDBReady()) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const trackings = await trackingModel.find({
          status: { $nin: ['delivered', 'returned'] },
          lastChecked: { $lt: oneHourAgo },
          errorCount: { $lt: 5 }
        }).populate('orderId');
        return trackings;
      }
      return listToUpdate();
    } catch (error) {
      console.error('Erro ao buscar rastreamentos para atualizar:', error);
      return [];
    }
  }

  /**
   * Buscar informações de rastreamento por código
   * @param {string} trackingCode - Código de rastreamento
   * @returns {Object} - Informações de rastreamento
   */
  async getTrackingInfo(trackingCode) {
    try {
      if (this.isDBReady()) {
        const tracking = await trackingModel.findOne({ trackingCode })
          .populate('orderId');
        if (!tracking) {
          throw new Error('Rastreamento não encontrado');
        }
        return tracking;
      }
      const tracking = getByTrackingCode(trackingCode);
      if (!tracking) throw new Error('Rastreamento não encontrado');
      return tracking;
    } catch (error) {
      console.error('Erro ao buscar informações de rastreamento:', error);
      throw error;
    }
  }

  /**
   * Buscar rastreamentos por usuário
   * @param {string} userId - ID do usuário
   * @returns {Array} - Lista de rastreamentos do usuário
   */
  async getUserTrackings(userId) {
    try {
      if (this.isDBReady()) {
        const orders = await orderModel.find({ 
          userId: userId,
          status: { $in: ['shipped', 'delivered'] }
        });
  
        const trackings = [];
        for (const order of orders) {
          const tracking = await trackingModel.findOne({ orderId: order._id });
          if (tracking) {
            trackings.push({
              ...tracking.toObject(),
              order: order
            });
          }
        }
        return trackings;
      }
      // Offline: não é possível correlacionar por usuário com segurança
      return [];
    } catch (error) {
      console.error('Erro ao buscar rastreamentos do usuário:', error);
      throw error;
    }
  }

  /**
   * Atualizar todos os rastreamentos pendentes
   * @returns {Object} - Resultado da atualização
   */
  async updateAllTrackings() {
    try {
      console.log('Iniciando atualização automática de rastreamentos...');
      const trackingsToUpdate = await this.getTrackingsToUpdate();
      console.log(`Encontrados ${trackingsToUpdate.length} rastreamentos para atualizar`);

      let updated = 0;
      let errors = 0;

      for (const tracking of trackingsToUpdate) {
        try {
          const code = tracking.trackingCode || tracking?.trackingCode;
          if (!code) continue;
          await this.updateTrackingInfo(code);
          updated++;
          console.log(`Rastreamento ${code} atualizado com sucesso`);
        } catch (error) {
          errors++;
          console.error(`Erro ao atualizar rastreamento ${tracking.trackingCode}:`, error.message);
        }
      }

      const result = {
        total: trackingsToUpdate.length,
        updated,
        errors,
        timestamp: new Date()
      };

      console.log('Atualização automática concluída:', result);
      return result;

    } catch (error) {
      console.error('Erro na atualização automática de rastreamentos:', error);
      throw error;
    }
  }
}

export default new TrackingService();