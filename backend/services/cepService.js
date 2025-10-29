import axios from 'axios';
import FreightRegion from '../models/freightRegionModel.js';
import { readRegions } from '../utils/freightFallbackStore.js';

class CEPService {
  constructor() {
    this.viacepBaseUrl = 'https://viacep.com.br/ws';
    this.cache = new Map(); // Cache simples para CEPs consultados
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 horas
  }

  // Buscar informações do CEP via ViaCEP
  async getCEPInfo(cep) {
    try {
      // Limpar e validar CEP
      const cleanCEP = cep.replace(/\D/g, '');
      
      if (cleanCEP.length !== 8) {
        throw new Error('CEP deve conter 8 dígitos');
      }

      // Verificar cache
      const cacheKey = cleanCEP;
      const cached = this.cache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        return cached.data;
      }

      // Fazer requisição para ViaCEP
      const response = await axios.get(`${this.viacepBaseUrl}/${cleanCEP}/json/`, {
        timeout: 5000
      });

      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }

      const cepData = {
        cep: response.data.cep,
        logradouro: response.data.logradouro,
        complemento: response.data.complemento,
        bairro: response.data.bairro,
        localidade: response.data.localidade,
        uf: response.data.uf,
        ibge: response.data.ibge,
        gia: response.data.gia,
        ddd: response.data.ddd,
        siafi: response.data.siafi
      };

      // Salvar no cache
      this.cache.set(cacheKey, {
        data: cepData,
        timestamp: Date.now()
      });

      return cepData;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout na consulta do CEP');
      }
      throw new Error(`Erro ao consultar CEP: ${error.message}`);
    }
  }

  // Calcular frete baseado no CEP
  async calculateFreight(cep, weight = 1, orderValue = 0) {
    try {
      // Obter informações do CEP
      const cepInfo = await this.getCEPInfo(cep);
      
      // Buscar região de frete correspondente
      const freightRegion = await this.findFreightRegion(cepInfo.uf, cepInfo.localidade);
      
      if (!freightRegion) {
        throw new Error('Região não atendida para entrega');
      }

      // Verificar se a região tem frete grátis sempre ativo
      if (freightRegion.isFreeShipping === true) {
        return {
          price: 0,
          deliveryTime: freightRegion.deliveryTime,
          region: freightRegion.name,
          freeShipping: true,
          cepInfo
        };
      }

      // Verificar frete grátis por valor mínimo
      if (freightRegion.freeShippingThreshold > 0 && orderValue >= freightRegion.freeShippingThreshold) {
        return {
          price: 0,
          deliveryTime: freightRegion.deliveryTime,
          region: freightRegion.name,
          freeShipping: true,
          cepInfo
        };
      }

      // Calcular preço do frete
      let freightPrice = freightRegion.basePrice;
      
      // Adicionar custo por peso
      if (weight > 1) {
        freightPrice += (weight - 1) * freightRegion.pricePerKg;
      }

      // Verificar preço customizado para cidade específica
      const customCityPrice = freightRegion.cities.find(
        city => city.name.toLowerCase() === cepInfo.localidade.toLowerCase() && 
                city.state === cepInfo.uf
      );

      if (customCityPrice && customCityPrice.customPrice) {
        freightPrice = customCityPrice.customPrice;
        if (weight > 1) {
          freightPrice += (weight - 1) * freightRegion.pricePerKg;
        }
      }

      return {
        price: Math.round(freightPrice * 100) / 100, // Arredondar para 2 casas decimais
        deliveryTime: freightRegion.deliveryTime,
        region: freightRegion.name,
        freeShipping: false,
        cepInfo
      };

    } catch (error) {
      throw new Error(`Erro no cálculo do frete: ${error.message}`);
    }
  }

  // Encontrar região de frete baseada no estado e cidade
  async findFreightRegion(state, city) {
    try {
      // Primeiro, procurar por região que atende o estado (DB)
      const regions = await FreightRegion.find({
        active: true,
        states: state
      }).sort({
        isFreeShipping: -1,
        basePrice: 1
      });

      if (Array.isArray(regions) && regions.length > 0) {
        // Verificar se há preço customizado para a cidade
        for (const region of regions) {
          const customCity = region.cities.find(
            c => c.name.toLowerCase() === city.toLowerCase() && c.state === state
          );
          if (customCity) return region;
        }
        return regions[0];
      }
    } catch (error) {
      // continua para fallback
    }

    // Fallback sem banco: ler regiões do JSON, se disponível; senão usar padrão
    let fallbackRegions = readRegions();
    if (!Array.isArray(fallbackRegions) || fallbackRegions.length === 0) {
      fallbackRegions = [
      {
        name: 'Curitiba e Região - Frete Grátis',
        states: ['PR'],
        cities: [
          { name: 'Curitiba', state: 'PR', customPrice: 0 },
          { name: 'Pinhais', state: 'PR', customPrice: 0 },
          { name: 'São José dos Pinhais', state: 'PR', customPrice: 0 },
          { name: 'Colombo', state: 'PR', customPrice: 0 }
        ],
        basePrice: 0,
        pricePerKg: 0,
        freeShippingThreshold: 0,
        deliveryTime: { min: 1, max: 3 },
        isFreeShipping: true,
        active: true
      },
      {
        name: 'Sudeste',
        states: ['SP','RJ','MG','ES'],
        cities: [
          { name: 'São Paulo', state: 'SP', customPrice: 8.9 },
          { name: 'Rio de Janeiro', state: 'RJ', customPrice: 12.9 },
          { name: 'Belo Horizonte', state: 'MG', customPrice: 15.9 }
        ],
        basePrice: 18.9,
        pricePerKg: 2.5,
        freeShippingThreshold: 150,
        deliveryTime: { min: 2, max: 5 },
        isFreeShipping: false,
        active: true
      },
      {
        name: 'Sul',
        states: ['RS','SC','PR'],
        cities: [
          { name: 'Porto Alegre', state: 'RS', customPrice: 16.9 },
          { name: 'Florianópolis', state: 'SC', customPrice: 18.9 },
          { name: 'Curitiba', state: 'PR', customPrice: 14.9 }
        ],
        basePrice: 22.9,
        pricePerKg: 3.0,
        freeShippingThreshold: 200,
        deliveryTime: { min: 3, max: 7 },
        isFreeShipping: false,
        active: true
      },
      {
        name: 'Nordeste',
        states: ['BA','PE','CE','RN','PB','AL','SE','MA','PI'],
        cities: [
          { name: 'Salvador', state: 'BA', customPrice: 25.9 },
          { name: 'Recife', state: 'PE', customPrice: 28.9 },
          { name: 'Fortaleza', state: 'CE', customPrice: 32.9 }
        ],
        basePrice: 35.9,
        pricePerKg: 4.5,
        freeShippingThreshold: 300,
        deliveryTime: { min: 5, max: 10 },
        isFreeShipping: false,
        active: true
      }
    ];
    }

    // Escolher região por estado
    const candidate = fallbackRegions.find(r => r.active && r.states.includes(state));
    return candidate || null;
  }

  // Limpar cache
  clearCache() {
    this.cache.clear();
  }

  // Obter estatísticas do cache
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

export default new CEPService();