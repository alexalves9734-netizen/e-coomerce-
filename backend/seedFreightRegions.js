import mongoose from 'mongoose';
import FreightRegion from './models/freightRegionModel.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("Database Connected Successfully");
  });

  await mongoose.connect(`${process.env.MONGODB_URI}`);
};

const seedFreightRegions = async () => {
  try {
    await connectDB();
    
    // Limpar dados existentes
    await FreightRegion.deleteMany({});
    
    const regions = [
      {
        name: "Sudeste",
        states: ["SP", "RJ", "MG", "ES"],
        cities: [
          { name: "São Paulo", state: "SP", customPrice: 8.90 },
          { name: "Rio de Janeiro", state: "RJ", customPrice: 12.90 },
          { name: "Belo Horizonte", state: "MG", customPrice: 15.90 }
        ],
        basePrice: 18.90,
        pricePerKg: 2.50,
        freeShippingThreshold: 150.00,
        deliveryTime: { min: 2, max: 5 },
        active: true
      },
      {
        name: "Sul",
        states: ["RS", "SC", "PR"],
        cities: [
          { name: "Porto Alegre", state: "RS", customPrice: 16.90 },
          { name: "Florianópolis", state: "SC", customPrice: 18.90 },
          { name: "Curitiba", state: "PR", customPrice: 14.90 }
        ],
        basePrice: 22.90,
        pricePerKg: 3.00,
        freeShippingThreshold: 200.00,
        deliveryTime: { min: 3, max: 7 },
        active: true
      },
      {
        name: "Nordeste",
        states: ["BA", "PE", "CE", "RN", "PB", "AL", "SE", "MA", "PI"],
        cities: [
          { name: "Salvador", state: "BA", customPrice: 25.90 },
          { name: "Recife", state: "PE", customPrice: 28.90 },
          { name: "Fortaleza", state: "CE", customPrice: 32.90 }
        ],
        basePrice: 35.90,
        pricePerKg: 4.50,
        freeShippingThreshold: 250.00,
        deliveryTime: { min: 5, max: 10 },
        active: true
      },
      {
        name: "Centro-Oeste",
        states: ["GO", "MT", "MS", "DF"],
        cities: [
          { name: "Brasília", state: "DF", customPrice: 22.90 },
          { name: "Goiânia", state: "GO", customPrice: 26.90 },
          { name: "Campo Grande", state: "MS", customPrice: 29.90 }
        ],
        basePrice: 28.90,
        pricePerKg: 3.80,
        freeShippingThreshold: 200.00,
        deliveryTime: { min: 4, max: 8 },
        active: true
      },
      {
        name: "Norte",
        states: ["AM", "PA", "AC", "RO", "RR", "AP", "TO"],
        cities: [
          { name: "Manaus", state: "AM", customPrice: 45.90 },
          { name: "Belém", state: "PA", customPrice: 42.90 }
        ],
        basePrice: 48.90,
        pricePerKg: 6.00,
        freeShippingThreshold: 300.00,
        deliveryTime: { min: 7, max: 15 },
        active: true
      }
    ];

    // Inserir regiões
    const insertedRegions = await FreightRegion.insertMany(regions);
    
    console.log(`✅ ${insertedRegions.length} regiões de frete inseridas com sucesso!`);
    
    // Mostrar resumo
    for (const region of insertedRegions) {
      console.log(`📍 ${region.name}: R$ ${region.basePrice} (${region.states.join(', ')})`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro ao inserir regiões de frete:', error);
    process.exit(1);
  }
};

seedFreightRegions();