import nodemailer from "nodemailer";

// Configuração do transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Template base para emails
const getEmailTemplate = (content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>IF Parfum - Confirmação de Pedido</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .tracking-code { background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .tracking-code strong { font-size: 18px; color: #2d5a2d; }
        .verification-code { background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #2196f3; }
        .verification-code strong { font-size: 24px; color: #1976d2; letter-spacing: 3px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .status-badge { display: inline-block; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-processing { background: #d1ecf1; color: #0c5460; }
        .status-shipped { background: #d4edda; color: #155724; }
        .status-delivered { background: #d1ecf1; color: #0c5460; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌸 IF Parfum</h1>
          <p>Sua fragrância, nossa paixão</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© 2024 IF Parfum. Todos os direitos reservados.</p>
          <p>Este é um email automático, não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email de código de verificação
export const sendVerificationCodeEmail = async (userData, verificationCode) => {
  try {
    // Verificar se as credenciais de email estão configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Credenciais de email não configuradas. Email de verificação não será enviado.');
      console.log('📧 Código de verificação para', userData.email, ':', verificationCode);
      return { success: true, message: 'Código de verificação gerado (email não configurado)' };
    }

    const transporter = createTransporter();
    
    const content = `
      <h2>🔐 Código de Verificação</h2>
      <p>Olá <strong>${userData.name}</strong>,</p>
      <p>Bem-vindo(a) à IF Parfum! Para completar seu cadastro, use o código de verificação abaixo:</p>
      
      <div class="verification-code">
        <h3>Seu código de verificação:</h3>
        <strong>${verificationCode}</strong>
      </div>

      <div class="warning">
        <p><strong>⚠️ Importante:</strong></p>
        <ul>
          <li>Este código é válido por <strong>15 minutos</strong></li>
          <li>Não compartilhe este código com ninguém</li>
          <li>Se você não solicitou este cadastro, ignore este email</li>
        </ul>
      </div>

      <p>Após verificar seu email, você poderá fazer login e aproveitar nossas fragrâncias exclusivas!</p>
      <p>Obrigado por escolher a IF Parfum! 💜</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userData.email,
      subject: '🔐 Código de Verificação - IF Parfum',
      html: getEmailTemplate(content)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de verificação enviado:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Erro ao enviar email de verificação:', error);
    console.log('📧 Código de verificação para', userData.email, ':', verificationCode);
    return { success: false, error: error.message };
  }
};

// Email de confirmação de pedido
export const sendOrderConfirmationEmail = async (orderData, deliveryData, userData) => {
  try {
    const transporter = createTransporter();
    
    const itemsList = orderData.items.map(item => 
      `<li>${item.name} - Quantidade: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}</li>`
    ).join('');

    const trackingSection = deliveryData.trackingCode ? `
      <div class="tracking-code">
        <h3>📦 Código de Rastreamento</h3>
        <strong>${deliveryData.trackingCode}</strong>
        <p>Você pode acompanhar sua entrega usando este código.</p>
      </div>
    ` : '';

    const deliveryTypeText = deliveryData.deliveryType === 'regional' ? 
      'Regional (Motoboy)' : 'Nacional (Correios)';

    const content = `
      <h2>✅ Pedido Confirmado!</h2>
      <p>Olá <strong>${userData.name}</strong>,</p>
      <p>Seu pedido foi confirmado com sucesso! Aqui estão os detalhes:</p>
      
      <div class="order-info">
        <h3>📋 Detalhes do Pedido</h3>
        <p><strong>Número do Pedido:</strong> ${orderData.orderNumber}</p>
        <p><strong>Data:</strong> ${new Date(orderData.date).toLocaleDateString('pt-BR')}</p>
        <p><strong>Valor Total:</strong> R$ ${orderData.amount.toFixed(2)}</p>
        
        <h4>🛍️ Itens do Pedido:</h4>
        <ul>${itemsList}</ul>
      </div>

      <div class="order-info">
        <h3>📍 Endereço de Entrega</h3>
        <p>
          ${orderData.address.street}, ${orderData.address.number}<br>
          ${orderData.address.complement ? orderData.address.complement + '<br>' : ''}
          ${orderData.address.neighborhood}<br>
          ${orderData.address.city} - ${orderData.address.state}<br>
          CEP: ${orderData.address.zipCode}
        </p>
      </div>

      <div class="order-info">
        <h3>🚚 Informações de Entrega</h3>
        <p><strong>Tipo de Entrega:</strong> ${deliveryTypeText}</p>
        <p><strong>Valor do Frete:</strong> R$ ${deliveryData.shippingCost.toFixed(2)}</p>
        <p><strong>Prazo Estimado:</strong> ${deliveryData.estimatedDeliveryDays} dias úteis</p>
        <p><strong>Status:</strong> <span class="status-badge status-${deliveryData.status}">${getStatusText(deliveryData.status)}</span></p>
      </div>

      ${trackingSection}

      <p>Obrigado por escolher a IF Parfum! 💜</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userData.email,
      subject: `✅ Pedido Confirmado - ${orderData.orderNumber} - IF Parfum`,
      html: getEmailTemplate(content)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmação enviado:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Erro ao enviar email de confirmação:', error);
    return { success: false, error: error.message };
  }
};

// Email de atualização de status
export const sendStatusUpdateEmail = async (orderData, deliveryData, userData, newStatus) => {
  try {
    const transporter = createTransporter();
    
    const statusMessages = {
      'pending': 'Seu pedido está sendo preparado',
      'processing': 'Seu pedido está sendo processado',
      'shipped': 'Seu pedido foi enviado!',
      'in_transit': 'Seu pedido está a caminho',
      'delivered': 'Seu pedido foi entregue!',
      'cancelled': 'Seu pedido foi cancelado'
    };

    const statusEmojis = {
      'pending': '⏳',
      'processing': '📦',
      'shipped': '🚚',
      'in_transit': '🛣️',
      'delivered': '✅',
      'cancelled': '❌'
    };

    const trackingSection = deliveryData.trackingCode ? `
      <div class="tracking-code">
        <h3>📦 Código de Rastreamento</h3>
        <strong>${deliveryData.trackingCode}</strong>
        <p>Acompanhe sua entrega usando este código.</p>
      </div>
    ` : '';

    const content = `
      <h2>${statusEmojis[newStatus]} Atualização do Pedido</h2>
      <p>Olá <strong>${userData.name}</strong>,</p>
      <p>${statusMessages[newStatus]}</p>
      
      <div class="order-info">
        <h3>📋 Informações do Pedido</h3>
        <p><strong>Número do Pedido:</strong> ${orderData.orderNumber}</p>
        <p><strong>Status Atual:</strong> <span class="status-badge status-${newStatus}">${getStatusText(newStatus)}</span></p>
        <p><strong>Valor Total:</strong> R$ ${orderData.amount.toFixed(2)}</p>
      </div>

      ${trackingSection}

      ${newStatus === 'delivered' ? `
        <div class="order-info">
          <h3>🎉 Pedido Entregue!</h3>
          <p>Esperamos que você esteja satisfeito(a) com sua compra!</p>
          <p>Não se esqueça de deixar sua avaliação sobre os produtos.</p>
        </div>
      ` : ''}

      <p>Obrigado por escolher a IF Parfum! 💜</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userData.email,
      subject: `${statusEmojis[newStatus]} Atualização do Pedido ${orderData.orderNumber} - IF Parfum`,
      html: getEmailTemplate(content)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de atualização enviado:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Erro ao enviar email de atualização:', error);
    return { success: false, error: error.message };
  }
};

// Função auxiliar para converter status em texto legível
const getStatusText = (status) => {
  const statusTexts = {
    'pending': 'Pendente',
    'processing': 'Processando',
    'shipped': 'Enviado',
    'in_transit': 'Em Trânsito',
    'delivered': 'Entregue',
    'cancelled': 'Cancelado'
  };
  return statusTexts[status] || status;
};

// Email de código de rastreamento
export const sendTrackingCodeEmail = async (orderData, deliveryData, userData) => {
  try {
    const transporter = createTransporter();
    
    const content = `
      <h2>📦 Código de Rastreamento Disponível</h2>
      <p>Olá <strong>${userData.name}</strong>,</p>
      <p>Seu pedido já possui código de rastreamento!</p>
      
      <div class="tracking-code">
        <h3>📦 Código de Rastreamento</h3>
        <strong>${deliveryData.trackingCode}</strong>
        <p>Use este código para acompanhar sua entrega.</p>
      </div>

      <div class="order-info">
        <h3>📋 Informações do Pedido</h3>
        <p><strong>Número do Pedido:</strong> ${orderData.orderNumber}</p>
        <p><strong>Prazo Estimado:</strong> ${deliveryData.estimatedDeliveryDays} dias úteis</p>
      </div>

      <p>Obrigado por escolher a IF Parfum! 💜</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userData.email,
      subject: `📦 Código de Rastreamento - ${orderData.orderNumber} - IF Parfum`,
      html: getEmailTemplate(content)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de código de rastreamento enviado:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Erro ao enviar email de rastreamento:', error);
    return { success: false, error: error.message };
  }
};

// Email de atualização automática de rastreamento
export const sendTrackingUpdateEmail = async (tracking, order, user, newEvents) => {
  try {
    if (!user.email && !order.customerEmail) {
      console.log('Nenhum email encontrado para notificação');
      return { success: false, error: 'Email não encontrado' };
    }

    const transporter = createTransporter();
    const customerEmail = user.email || order.customerEmail;
    const latestEvent = newEvents[0] || tracking.eventos[tracking.eventos.length - 1];
    const orderNumber = order.orderNumber || order._id.toString().slice(-6);

    // Determinar cor do status
    const getTrackingStatusColor = (status) => {
      const statusColors = {
        'pending': '#f59e0b',
        'posted': '#3b82f6',
        'in_transit': '#3b82f6',
        'out_for_delivery': '#10b981',
        'delivered': '#059669',
        'returned': '#ef4444',
        'exception': '#f59e0b'
      };
      return statusColors[status] || '#6b7280';
    };

    const statusColor = getTrackingStatusColor(tracking.status);

    const content = `
      <h2>📦 Atualização de Rastreamento</h2>
      <p>Olá <strong>${user.name || 'Cliente'}</strong>,</p>
      <p>Temos uma atualização sobre seu pedido!</p>
      
      <div class="order-info">
        <h3>📋 Informações do Pedido</h3>
        <p><strong>Número do Pedido:</strong> ${orderNumber}</p>
        <p><strong>Código de Rastreamento:</strong> ${tracking.trackingCode}</p>
        <p><strong>Serviço:</strong> ${tracking.servico || 'SEDEX'}</p>
        <p><strong>Status Atual:</strong> 
          <span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
            ${getTrackingStatusText(tracking.status)}
          </span>
        </p>
      </div>

      ${latestEvent ? `
      <div class="order-info">
        <h3>📍 Última Atualização</h3>
        <div style="border-left: 3px solid ${statusColor}; padding-left: 15px;">
          <p style="margin: 0; font-weight: bold; color: ${statusColor};">${latestEvent.status}</p>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">
            ${latestEvent.data} às ${latestEvent.hora} - ${latestEvent.local}
          </p>
          ${latestEvent.subStatus && latestEvent.subStatus.length > 0 ? `
            <p style="margin: 10px 0 0 0; font-size: 14px;">${latestEvent.subStatus.join(', ')}</p>
          ` : ''}
          ${latestEvent.observacao ? `
            <p style="margin: 10px 0 0 0; font-style: italic; color: #666; font-size: 14px;">
              ${latestEvent.observacao}
            </p>
          ` : ''}
        </div>
      </div>
      ` : ''}

      ${tracking.eventos && tracking.eventos.length > 0 ? `
      <div class="order-info">
        <h3>📋 Histórico de Rastreamento</h3>
        <div style="position: relative;">
          ${tracking.eventos.slice(0, 5).map((event, index) => `
            <div style="position: relative; padding-left: 25px; margin-bottom: ${index === tracking.eventos.length - 1 ? '0' : '15px'};">
              <div style="position: absolute; left: 0; top: 5px; width: 10px; height: 10px; background: ${index === 0 ? statusColor : '#ddd'}; border-radius: 50%;"></div>
              ${index < tracking.eventos.length - 1 ? `<div style="position: absolute; left: 4px; top: 15px; width: 2px; height: 20px; background: #eee;"></div>` : ''}
              <div>
                <p style="margin: 0; font-weight: bold; font-size: 14px;">${event.status}</p>
                <p style="margin: 2px 0; color: #666; font-size: 12px;">
                  ${event.data} às ${event.hora} - ${event.local}
                </p>
                ${event.subStatus && event.subStatus.length > 0 ? `
                  <p style="margin: 5px 0 0 0; font-size: 12px; color: #555;">${event.subStatus.join(', ')}</p>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tracking/${tracking.trackingCode}" 
           class="btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          🔍 Rastrear Pedido Completo
        </a>
      </div>

      <p>Obrigado por escolher a IF Parfum! 💜</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: `📦 Atualização do seu pedido #${orderNumber} - IF Parfum`,
      html: getEmailTemplate(content)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de atualização de rastreamento enviado para: ${customerEmail}`);
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Erro ao enviar email de atualização de rastreamento:', error);
    return { success: false, error: error.message };
  }
};

// Email de recuperação de senha
export const sendPasswordResetEmail = async (email, name, resetCode) => {
  try {
    // Verificar se as credenciais de email estão configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Credenciais de email não configuradas. Email de recuperação não será enviado.');
      console.log('🔑 Código de recuperação para', email, ':', resetCode);
      return { success: true, message: 'Código de recuperação gerado (email não configurado)' };
    }

    const transporter = createTransporter();
    
    const content = `
      <h2>🔑 Recuperação de Senha</h2>
      <p>Olá <strong>${name}</strong>,</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta na IF Parfum.</p>
      
      <div class="verification-code">
        <h3>Seu código de recuperação:</h3>
        <strong>${resetCode}</strong>
      </div>

      <div class="warning">
        <p><strong>⚠️ Importante:</strong></p>
        <ul>
          <li>Este código é válido por <strong>15 minutos</strong></li>
          <li>Não compartilhe este código com ninguém</li>
          <li>Se você não solicitou esta recuperação, ignore este email</li>
          <li>Use este código na página de recuperação de senha</li>
        </ul>
      </div>

      <p>Após inserir o código, você poderá definir uma nova senha para sua conta.</p>
      <p>Se você não solicitou esta recuperação, sua conta permanece segura e você pode ignorar este email.</p>
      <p>Equipe IF Parfum 💜</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🔑 Recuperação de Senha - IF Parfum',
      html: getEmailTemplate(content)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recuperação de senha enviado para: ${email}`);
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Erro ao enviar email de recuperação de senha:', error);
    return { success: false, error: error.message };
  }
};

// Função auxiliar para converter status de rastreamento em texto legível
const getTrackingStatusText = (status) => {
  const statusTexts = {
    'pending': 'Aguardando Postagem',
    'posted': 'Objeto Postado',
    'in_transit': 'Em Trânsito',
    'out_for_delivery': 'Saiu para Entrega',
    'delivered': 'Entregue',
    'returned': 'Devolvido',
    'exception': 'Ocorrência'
  };
  return statusTexts[status] || status;
};