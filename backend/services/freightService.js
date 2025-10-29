import axios from 'axios';

// Configurações de frete regional (motoboy)
const REGIONAL_CONFIG = {
  baseCost: 8.00, // Custo base para entrega regional
  costPerKm: 1.50, // Custo por quilômetro
  maxDistance: 30, // Distância máxima em km
  estimatedDays: 1, // Prazo estimado em dias
  // CEPs atendidos na região (exemplo para uma cidade)
  allowedZipCodes: [
    // Adicione os CEPs da sua região aqui
    '01000', '01001', '01002', '01003', '01004', '01005',
    '02000', '02001', '02002', '02003', '02004', '02005',
    '03000', '03001', '03002', '03003', '03004', '03005',
    '04000', '04001', '04002', '04003', '04004', '04005',
    '05000', '05001', '05002', '05003', '05004', '05005'
  ]
};

// Configurações dos Correios
const CORREIOS_CONFIG = {
  baseUrl: 'https://viacep.com.br/ws', // Para validação de CEP
  // Para cálculo real, você precisará integrar com a API oficial dos Correios
  // ou usar um serviço como Melhor Envio, Kangu, etc.
  sedexCode: '40010',
  pacCode: '41106'
};

// Simular cálculo de distância (em produção, use Google Maps API ou similar)
const calculateDistance = (originZip, destinyZip) => {
  // Simulação simples baseada na diferença de CEPs
  const origin = parseInt(originZip.replace(/\D/g, ''));
  const destiny = parseInt(destinyZip.replace(/\D/g, ''));
  const diff = Math.abs(origin - destiny);
  
  // Fórmula simples para simular distância
  return Math.min(diff / 1000 + 5, REGIONAL_CONFIG.maxDistance);
};

// Verificar se o CEP está na região atendida
export const isRegionalDelivery = (zipCode) => {
  const cleanZip = zipCode.replace(/\D/g, '').substring(0, 5);
  return REGIONAL_CONFIG.allowedZipCodes.some(allowedZip => 
    cleanZip.startsWith(allowedZip)
  );
};

// Validar CEP usando ViaCEP
export const validateZipCode = async (zipCode) => {
  try {
    const cleanZip = zipCode.replace(/\D/g, '');
    if (cleanZip.length !== 8) {
      return { valid: false, error: 'CEP deve ter 8 dígitos' };
    }

    const response = await axios.get(`${CORREIOS_CONFIG.baseUrl}/${cleanZip}/json/`);
    
    if (response.data.erro) {
      return { valid: false, error: 'CEP não encontrado' };
    }

    return {
      valid: true,
      address: {
        zipCode: cleanZip,
        street: response.data.logradouro,
        neighborhood: response.data.bairro,
        city: response.data.localidade,
        state: response.data.uf
      }
    };
  } catch (error) {
    console.error('Erro ao validar CEP:', error);
    return { valid: false, error: 'Erro ao validar CEP' };
  }
};

// Calcular frete regional (motoboy)
export const calculateRegionalFreight = async (destinyZip, weight = 1) => {
  try {
    // Verificar se atende a região
    if (!isRegionalDelivery(destinyZip)) {
      return {
        success: false,
        error: 'CEP não atendido para entrega regional'
      };
    }

    // Simular cálculo de distância (em produção, use uma API real)
    const distance = calculateDistance('01000000', destinyZip); // CEP base da loja
    
    // Calcular custo
    let cost = REGIONAL_CONFIG.baseCost + (distance * REGIONAL_CONFIG.costPerKm);
    
    // Adicionar custo por peso (se necessário)
    if (weight > 2) {
      cost += (weight - 2) * 2.00; // R$ 2,00 por kg adicional
    }

    return {
      success: true,
      deliveryType: 'regional',
      carrier: 'motoboy',
      cost: Math.round(cost * 100) / 100, // Arredondar para 2 casas decimais
      estimatedDays: REGIONAL_CONFIG.estimatedDays,
      distance: Math.round(distance * 100) / 100,
      details: {
        baseCost: REGIONAL_CONFIG.baseCost,
        distanceCost: distance * REGIONAL_CONFIG.costPerKm,
        weightCost: weight > 2 ? (weight - 2) * 2.00 : 0
      }
    };
  } catch (error) {
    console.error('Erro ao calcular frete regional:', error);
    return {
      success: false,
      error: 'Erro ao calcular frete regional'
    };
  }
};

// Calcular frete nacional (Correios)
export const calculateNationalFreight = async (originZip, destinyZip, weight = 1, dimensions = {}) => {
  try {
    // Validar CEP de destino
    const zipValidation = await validateZipCode(destinyZip);
    if (!zipValidation.valid) {
      return {
        success: false,
        error: zipValidation.error
      };
    }

    // Simular cálculo dos Correios (em produção, use a API oficial)
    // Aqui você integraria com Melhor Envio, Kangu ou API dos Correios
    const baseCost = 15.00;
    const weightCost = weight * 3.50;
    const distanceFactor = calculateDistanceFactor(originZip, destinyZip);
    
    const sedexCost = (baseCost + weightCost) * distanceFactor * 1.5;
    const pacCost = (baseCost + weightCost) * distanceFactor;

    return {
      success: true,
      deliveryType: 'national',
      options: [
        {
          carrier: 'correios',
          service: 'SEDEX',
          cost: Math.round(sedexCost * 100) / 100,
          estimatedDays: 2,
          code: CORREIOS_CONFIG.sedexCode
        },
        {
          carrier: 'correios',
          service: 'PAC',
          cost: Math.round(pacCost * 100) / 100,
          estimatedDays: 5,
          code: CORREIOS_CONFIG.pacCode
        }
      ],
      destination: zipValidation.address
    };
  } catch (error) {
    console.error('Erro ao calcular frete nacional:', error);
    return {
      success: false,
      error: 'Erro ao calcular frete nacional'
    };
  }
};

// Calcular fator de distância para frete nacional
const calculateDistanceFactor = (originZip, destinyZip) => {
  const origin = parseInt(originZip.replace(/\D/g, '').substring(0, 2));
  const destiny = parseInt(destinyZip.replace(/\D/g, '').substring(0, 2));
  const diff = Math.abs(origin - destiny);
  
  // Fator baseado na diferença dos dois primeiros dígitos do CEP
  if (diff <= 5) return 1.0;      // Mesma região
  if (diff <= 15) return 1.3;     // Regiões próximas
  if (diff <= 30) return 1.6;     // Regiões distantes
  return 2.0;                     // Regiões muito distantes
};

// Função principal para calcular frete
export const calculateShipping = async (originZip, destinyZip, weight = 1, dimensions = {}) => {
  try {
    const results = {
      regional: null,
      national: null
    };

    // Tentar calcular frete regional
    if (isRegionalDelivery(destinyZip)) {
      results.regional = await calculateRegionalFreight(destinyZip, weight);
    }

    // Calcular frete nacional
    results.national = await calculateNationalFreight(originZip, destinyZip, weight, dimensions);

    return {
      success: true,
      zipCode: destinyZip,
      weight,
      results
    };
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    return {
      success: false,
      error: 'Erro ao calcular frete'
    };
  }
};

// Gerar código de rastreamento
export const generateTrackingCode = (deliveryType, carrier) => {
  const prefix = deliveryType === 'regional' ? 'MB' : 'BR';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${prefix}${timestamp}${random}`;
};

// Simular rastreamento (em produção, integre com APIs reais)
export const trackDelivery = async (trackingCode) => {
  try {
    // Simular dados de rastreamento
    const mockEvents = [
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'Objeto postado',
        location: 'Centro de Distribuição - São Paulo/SP'
      },
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'Objeto em trânsito',
        location: 'Centro de Distribuição - Rio de Janeiro/RJ'
      },
      {
        date: new Date(),
        status: 'Objeto saiu para entrega',
        location: 'Agência dos Correios - Rio de Janeiro/RJ'
      }
    ];

    return {
      success: true,
      trackingCode,
      status: 'in_transit',
      events: mockEvents,
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    };
  } catch (error) {
    console.error('Erro ao rastrear entrega:', error);
    return {
      success: false,
      error: 'Erro ao rastrear entrega'
    };
  }
};