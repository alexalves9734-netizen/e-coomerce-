import mongoose from 'mongoose';
import FreightRegion from './models/freightRegionModel.js';
import dotenv from 'dotenv';

dotenv.config();

const createCuritibaFreeShipping = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Verificar se já existe uma região para Curitiba
    const existingRegion = await FreightRegion.findOne({
      name: { $regex: /curitiba/i }
    });

    if (existingRegion) {
      console.log('⚠️ Já existe uma região para Curitiba:', existingRegion.name);
      
      // Atualizar para frete grátis se não for
      if (!existingRegion.isFreeShipping) {
        existingRegion.isFreeShipping = true;
        existingRegion.basePrice = 0;
        existingRegion.pricePerKg = 0;
        existingRegion.freeShippingThreshold = 0;
        existingRegion.name = 'Curitiba e Região - Frete Grátis';
        await existingRegion.save();
        console.log('✅ Região atualizada para frete grátis!');
      } else {
        console.log('✅ Região já configurada como frete grátis!');
      }
    } else {
      // Criar nova região de frete grátis para Curitiba
      const curitibaRegion = new FreightRegion({
        name: 'Curitiba e Região - Frete Grátis',
        states: ['PR'], // Paraná
        basePrice: 0,
        pricePerKg: 0,
        freeShippingThreshold: 0,
        deliveryTime: {
          min: 1,
          max: 3
        },
        active: true,
        isFreeShipping: true
      });

      await curitibaRegion.save();
      console.log('✅ Região de frete grátis para Curitiba criada com sucesso!');
      console.log('📍 Estados atendidos: Paraná (PR)');
      console.log('🎉 Frete sempre grátis para esta região');
    }

    // Listar todas as regiões para verificação
    const allRegions = await FreightRegion.find({});
    console.log('\n📋 Todas as regiões cadastradas:');
    allRegions.forEach(region => {
      console.log(`- ${region.name} (${region.states.join(', ')}) - ${region.isFreeShipping ? '🎉 FRETE GRÁTIS' : `R$ ${region.basePrice}`}`);
    });

  } catch (error) {
    console.error('❌ Erro ao criar região de frete grátis:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

// Executar o script
createCuritibaFreeShipping();