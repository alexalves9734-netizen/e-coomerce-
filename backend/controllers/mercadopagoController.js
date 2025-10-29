import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const preference = new Preference(client);
const payment = new Payment(client);

// Criar preference para pagamento
const createPreference = async (req, res) => {
  try {
    console.log('=== CRIANDO PREFERÊNCIA MERCADO PAGO ===');
    console.log('Access Token configurado:', process.env.MERCADOPAGO_ACCESS_TOKEN ? 'SIM' : 'NÃO');
    console.log('Dados recebidos completos:', JSON.stringify(req.body, null, 2));
    
    const { items, payer } = req.body;
    
    // Debug detalhado dos tipos de dados
    console.log('=== DEBUG TIPOS DE DADOS ===');
    console.log('Items array:', items);
    console.log('Items length:', items ? items.length : 'undefined');
    
    if (items && Array.isArray(items)) {
      items.forEach((item, index) => {
        console.log(`Item ${index}:`);
        console.log(`  title: "${item.title}" (tipo: ${typeof item.title})`);
        console.log(`  unit_price: ${item.unit_price} (tipo: ${typeof item.unit_price})`);
        console.log(`  quantity: ${item.quantity} (tipo: ${typeof item.quantity})`);
        console.log(`  currency_id: ${item.currency_id} (tipo: ${typeof item.currency_id})`);
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items são obrigatórios'
      });
    }

    // Mapear items para o formato do MercadoPago
    const preferenceItems = items.map((item, index) => {
      console.log(`\n=== PROCESSANDO ITEM ${index} ===`);
      
      // O frontend envia unit_price, não price
      const price = item.unit_price || item.price;
      const quantity = item.quantity;
      
      console.log(`Item: ${item.title || item.name}`);
      console.log(`Price original: ${price} (tipo: ${typeof price})`);
      console.log(`Quantity original: ${quantity} (tipo: ${typeof quantity})`);
      
      // Garantir que o preço seja um número válido
      let parsedPrice;
      if (typeof price === 'string') {
        parsedPrice = parseFloat(price.replace(',', '.'));
      } else if (typeof price === 'number') {
        parsedPrice = price;
      } else {
        parsedPrice = Number(price);
      }
      
      // Garantir que a quantidade seja um número válido
      let parsedQuantity;
      if (typeof quantity === 'string') {
        parsedQuantity = parseInt(quantity, 10);
      } else if (typeof quantity === 'number') {
        parsedQuantity = quantity;
      } else {
        parsedQuantity = Number(quantity);
      }
      
      console.log(`Price parsed: ${parsedPrice} (tipo: ${typeof parsedPrice})`);
      console.log(`Quantity parsed: ${parsedQuantity} (tipo: ${typeof parsedQuantity})`);
      
      // Validações rigorosas
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        throw new Error(`Preço inválido para o item "${item.title || item.name}": ${price} -> ${parsedPrice}`);
      }
      
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        throw new Error(`Quantidade inválida para o item "${item.title || item.name}": ${quantity} -> ${parsedQuantity}`);
      }
      
      // Criar item limpo sem campos extras
      const cleanItem = {
        title: String(item.title || item.name),
        quantity: parsedQuantity,
        unit_price: parsedPrice
      };
      
      console.log(`Item limpo:`, cleanItem);
      return cleanItem;
    });

    console.log('Items mapeados:', preferenceItems);

    const preferenceData = {
      items: preferenceItems,
      payer: payer ? {
        email: payer.email,
      } : undefined,
      back_urls: {
        success: `${process.env.FRONTEND_URL}/orders`,
        failure: `${process.env.FRONTEND_URL}/place-order`,
        pending: `${process.env.FRONTEND_URL}/place-order`,
      },
      auto_return: "approved",
      notification_url: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/mercadopago/webhook` : undefined,
      statement_descriptor: "E-commerce",
      external_reference: JSON.stringify({
        userId: req.body.userId, // Adicionando userId
        items: req.body.items, // Adicionando items
        address: req.body.address, // Adicionando address
        amount: req.body.amount, // Adicionando amount
      }),
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      }
    };

    console.log('Dados da preferência:', preferenceData);

    const result = await preference.create({ body: preferenceData });
    
    console.log('Preferência criada com sucesso:', result.id);
    
    res.json({
      success: true,
      preferenceId: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    });

  } catch (error) {
    console.error('=== ERRO AO CRIAR PREFERÊNCIA ===');
    console.error('Erro completo:', error);
    console.error('Mensagem:', error.message);
    console.error('Status:', error.status);
    console.error('Cause:', error.cause);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao criar preferência'
    });
  }
};

// Processar pagamento direto (para dados do Card Payment Brick)
const processPayment = async (req, res) => {
  try {
    console.log('=== PROCESSANDO PAGAMENTO DIRETO ===');
    console.log('Dados recebidos:', req.body);
    
    const { 
      token, 
      issuer_id, 
      payment_method_id, 
      transaction_amount, 
      installments, 
      payer 
    } = req.body;

    // Validar dados obrigatórios
    if (!token || !payment_method_id || !transaction_amount || !payer) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios não fornecidos'
      });
    }

    const paymentData = {
      transaction_amount: Number(transaction_amount),
      token: token,
      description: "Compra no E-commerce",
      installments: Number(installments) || 1,
      payment_method_id: payment_method_id,
      issuer_id: issuer_id,
      payer: {
        email: payer.email,
        identification: {
          type: payer.identification.type,
          number: payer.identification.number,
        },
      },
      external_reference: `card_payment_${Date.now()}`,
      notification_url: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/mercadopago/webhook` : undefined,
    };

    console.log('Dados do pagamento:', paymentData);

    const result = await payment.create({ body: paymentData });
    
    console.log('Resultado do pagamento:', {
      id: result.id,
      status: result.status,
      status_detail: result.status_detail
    });
    
    res.json({
      success: result.status === 'approved',
      payment: result,
      status: result.status,
      status_detail: result.status_detail,
      id: result.id,
      message: result.status === 'approved' ? 'Pagamento aprovado' : 'Pagamento não aprovado'
    });

  } catch (error) {
    console.error('=== ERRO AO PROCESSAR PAGAMENTO ===');
    console.error('Erro completo:', error);
    console.error('Mensagem:', error.message);
    console.error('Status:', error.status);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao processar pagamento',
      error: error.message
    });
  }
};

// Webhook para receber notificações do MercadoPago
const webhook = async (req, res) => {
  try {
    console.log('=== WEBHOOK MERCADOPAGO RECEBIDO ===');
    console.log('Headers:', req.headers);
    console.log('Body completo:', JSON.stringify(req.body, null, 2));
    
    const { type, data, action } = req.body;
    
    console.log('Tipo de notificação:', type);
    console.log('Ação:', action);
    console.log('Dados:', data);
    
    if (type === 'payment') {
      console.log('=== PROCESSANDO NOTIFICAÇÃO DE PAGAMENTO ===');
      console.log('Payment ID:', data.id);
      
      try {
        let paymentDetails;
        
        // Para testes locais, simular dados de pagamento
        if (data.id.toString().startsWith('test_payment_')) {
          console.log("🧪 Modo de teste detectado - simulando pagamento aprovado");
          paymentDetails = {
            id: data.id,
            status: 'approved',
            status_detail: 'accredited',
            external_reference: JSON.stringify({
              userId: "68de3ad4af2d21afd226df6a", // ID do usuário de teste
              items: [
                {
                  name: "Produto Teste Webhook",
                  price: 100,
                  quantity: 1,
                  image: "test-image.jpg"
                }
              ],
              amount: 100,
              address: {
                street: "Rua Teste Webhook",
                city: "Cidade Teste",
                state: "Estado Teste",
                zipcode: "12345-678"
              }
            }),
            transaction_amount: 100,
            payment_method_id: 'pix',
            payer: {
              email: 'teste@webhook.com'
            }
          };
        } else {
          // Para pagamentos reais, buscar usando o SDK
          paymentDetails = await payment.get({ id: data.id });
        }
        
        console.log('Detalhes do pagamento:', {
          id: paymentDetails.id,
          status: paymentDetails.status,
          status_detail: paymentDetails.status_detail,
          external_reference: paymentDetails.external_reference,
          transaction_amount: paymentDetails.transaction_amount,
          payment_method_id: paymentDetails.payment_method_id,
          payer_email: paymentDetails.payer?.email
        });
        
        // Aqui você pode atualizar o status do pedido no seu banco de dados
        // baseado no external_reference e status do pagamento
        
        // Verificar se external_reference existe
        if (!paymentDetails.external_reference) {
          console.error("❌ external_reference não encontrado no pagamento");
          return;
        }

        // Extrair dados do pedido da external_reference
        let orderDataFromRef;
        try {
          orderDataFromRef = JSON.parse(paymentDetails.external_reference);
          console.log("📦 Dados do pedido extraídos da external_reference:", orderDataFromRef);
        } catch (parseError) {
          console.error("❌ Erro ao fazer parse da external_reference:", parseError);
          console.error("external_reference recebida:", paymentDetails.external_reference);
          return;
        }

        if (paymentDetails.status === 'approved') {
          console.log("✅ Pagamento APROVADO. Criando a ordem no banco de dados...");

          // Validar dados obrigatórios
          if (!orderDataFromRef.userId || !orderDataFromRef.items || !orderDataFromRef.amount || !orderDataFromRef.address) {
            console.error("❌ Dados obrigatórios faltando na external_reference:", {
              userId: !!orderDataFromRef.userId,
              items: !!orderDataFromRef.items,
              amount: !!orderDataFromRef.amount,
              address: !!orderDataFromRef.address
            });
            return;
          }

          try {
            const orderData = {
              userId: orderDataFromRef.userId,
              items: orderDataFromRef.items,
              amount: orderDataFromRef.amount,
              address: orderDataFromRef.address,
              paymentMethod: "mercadopago",
              payment: true,
              status: "Processando Pedido", // Status inicial após pagamento
              date: Date.now(),
              paymentData: { // Dados do pagamento para referência
                paymentId: paymentDetails.id,
                status: paymentDetails.status,
                paymentType: paymentDetails.payment_type_id,
                processedAt: new Date()
              }
            };

            console.log("📝 Dados da ordem a ser criada:", JSON.stringify(orderData, null, 2));

            const newOrder = new orderModel(orderData);
            await newOrder.save();

            console.log("✅ Ordem criada com sucesso, ID:", newOrder._id);

            // Limpar o carrinho do usuário
            try {
              await userModel.findByIdAndUpdate(orderDataFromRef.userId, { cartData: {} });
              console.log("✅ Carrinho do usuário limpo");
            } catch (cartError) {
              console.error("⚠️ Erro ao limpar carrinho do usuário:", cartError);
              // Não falhar o processo por causa disso
            }

            // Enviar email de confirmação de pedido
            try {
              const user = await userModel.findById(orderDataFromRef.userId);
              if (user) {
                // Importar o serviço de email
                const { sendOrderConfirmationEmail } = await import('../services/emailService.js');
                
                // Criar dados de entrega simulados para o email
                const deliveryData = {
                  deliveryType: 'nacional',
                  shippingCost: 0, // Será calculado posteriormente
                  estimatedDeliveryDays: 7,
                  status: 'processing',
                  trackingCode: null // Será adicionado posteriormente
                };

                const emailResult = await sendOrderConfirmationEmail(newOrder, deliveryData, user);
                
                if (emailResult.success) {
                  console.log("✅ Email de confirmação de pedido enviado");
                } else {
                  console.error("⚠️ Erro ao enviar email de confirmação:", emailResult.error);
                }
              }
            } catch (emailError) {
              console.error("⚠️ Erro ao enviar email de confirmação:", emailError);
              // Não falhar o processo por causa disso
            }

          } catch (orderError) {
            console.error("❌ Erro ao criar ordem no banco de dados:", orderError);
            console.error("Stack trace:", orderError.stack);
          }

        } else {
          console.log(`🟡 Status do pagamento: ${paymentDetails.status}. A ordem não será criada.`);
          // TODO: Lidar com outros status (rejeitado, pendente, etc.)
          // Por exemplo, notificar o usuário sobre a falha no pagamento.
        }
        
      } catch (paymentError) {
        console.error('Erro ao buscar detalhes do pagamento:', paymentError);
      }
    }
    
    // Sempre responder com 200 para confirmar recebimento
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('=== ERRO NO WEBHOOK ===');
    console.error('Erro completo:', error);
    console.error('Stack:', error.stack);
    
    // Mesmo com erro, responder 200 para evitar reenvios desnecessários
    res.status(200).json({ error: 'Erro processado' });
  }
};

export { createPreference, processPayment, webhook };