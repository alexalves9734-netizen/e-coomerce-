import cron from 'node-cron';
import trackingService from '../services/trackingService.js';

/**
 * Configurar jobs de cron para atualização automática de rastreamentos
 */
export function setupTrackingCron() {
  console.log('Configurando jobs de cron para rastreamento...');

  // Job para atualização regular a cada 30 minutos
  cron.schedule('*/30 * * * *', async () => {
    console.log('Executando atualização automática de rastreamentos (30min)...');
    try {
      await trackingService.updateAllTrackings();
    } catch (error) {
      console.error('Erro no job de atualização de rastreamentos:', error);
    }
  });

  // Job para verificação mais abrangente a cada 2 horas
  cron.schedule('0 */2 * * *', async () => {
    console.log('Executando verificação abrangente de rastreamentos (2h)...');
    try {
      await trackingService.updateAllTrackings();
    } catch (error) {
      console.error('Erro no job de verificação de rastreamentos:', error);
    }
  });

  console.log('Jobs de cron configurados com sucesso!');
}