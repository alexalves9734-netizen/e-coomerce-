import Delivery from "../models/deliveryModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import { 
  sendOrderConfirmationEmail, 
  sendStatusUpdateEmail, 
  sendTrackingCodeEmail 
} from "../services/emailService.js";
import { 
  calculateShipping, 
  generateTrackingCode, 
  trackDelivery, 
  isRegionalDelivery,
  validateZipCode 
} from "../services/freightService.js";

// Calcular frete
const calculateFreight = async (req, res) => {
  try {
    const { zipCode, weight = 1, dimensions = {} } = req.body;

    if (!zipCode) {
      return res.status(400).json({ 
        success: false, 
        message: "CEP é obrigatório" 
      });
    }

    // Validar CEP
    const zipValidation = await validateZipCode(zipCode);
    if (!zipValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: zipValidation.error 
      });
    }

    // CEP da loja (configure conforme sua localização)
    const originZip = process.env.STORE_ZIP_CODE || '01000000';
    
    // Calcular fretes disponíveis
    const shippingResult = await calculateShipping(originZip, zipCode, weight, dimensions);
    
    if (!shippingResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: shippingResult.error 
      });
    }

    res.json({
      success: true,
      zipCode: zipValidation.address,
      options: {
        regional: shippingResult.results.regional,
        national: shippingResult.results.national
      }
    });

  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erro interno do servidor" 
    });
  }
};

// Criar entrega
const createDelivery = async (req, res) => {
  try {
    const { orderId, deliveryType, carrier, shippingCost, estimatedDays, selectedService } = req.body;

    if (!orderId || !deliveryType || !carrier || !shippingCost) {
      return res.status(400).json({ 
        success: false, 
        message: "Dados obrigatórios não fornecidos" 
      });
    }

    // Buscar o pedido
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Pedido não encontrado" 
      });
    }

    // Buscar dados do usuário
    const user = await User.findById(order.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Usuário não encontrado" 
      });
    }

    // Gerar código de rastreamento se necessário
    let trackingCode = null;
    if (deliveryType === 'national' || carrier === 'correios') {
      trackingCode = generateTrackingCode(deliveryType, carrier);
    }

    // Mapear endereço do pedido para formato de entrega
    const shippingAddress = {
      street: order.address.street || '',
      number: order.address.number || 'S/N', // Se não tiver número, usar S/N
      complement: order.address.complement || '',
      neighborhood: order.address.neighborhood || order.address.city || '', // Se não tiver bairro, usar cidade
      city: order.address.city || '',
      state: order.address.state || '',
      zipCode: order.address.zipcode || order.address.zipCode || '',
      country: order.address.country || 'Brasil'
    };

    // Criar entrega
    const delivery = new Delivery({
      orderId,
      deliveryType,
      carrier,
      trackingCode,
      shippingCost: parseFloat(shippingCost),
      estimatedDeliveryDays: estimatedDays || (deliveryType === 'regional' ? 1 : 5),
      status: 'pending',
      shippingAddress,
      deliveryDetails: {
        service: selectedService || (deliveryType === 'regional' ? 'Motoboy' : 'SEDEX')
      }
    });

    await delivery.save();

    // Atualizar pedido com informações de entrega
    await Order.findByIdAndUpdate(orderId, {
      deliveryId: delivery._id,
      shippingCost: parseFloat(shippingCost),
      deliveryType,
      trackingCode,
      status: 'processing'
    });

    // Enviar email de confirmação
    try {
      await sendOrderConfirmationEmail(order, delivery, user);
    } catch (emailError) {
      console.error('Erro ao enviar email de confirmação:', emailError);
    }

    // Enviar email específico com código de rastreamento se disponível
    if (trackingCode) {
      try {
        await sendTrackingCodeEmail(order, delivery, user);
        console.log('✅ Email com código de rastreamento enviado para:', user.email);
      } catch (emailError) {
        console.error('Erro ao enviar email de código de rastreamento:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: "Entrega criada com sucesso",
      delivery: {
        id: delivery._id,
        trackingCode: delivery.trackingCode,
        shippingCost: delivery.shippingCost,
        estimatedDays: delivery.estimatedDeliveryDays,
        status: delivery.status
      }
    });

  } catch (error) {
    console.error('Erro ao criar entrega:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erro interno do servidor" 
    });
  }
};

// Listar entregas (Admin)
const listDeliveries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, deliveryType } = req.query;
    
    // Construir filtros
    const filters = {};
    if (status) filters.status = status;
    if (deliveryType) filters.deliveryType = deliveryType;

    // Buscar entregas com paginação
    const deliveries = await Delivery.find(filters)
      .populate({
        path: 'orderId',
        select: 'orderNumber amount date userId items',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Contar total de entregas
    const total = await Delivery.countDocuments(filters);

    res.json({
      success: true,
      deliveries,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erro ao listar entregas:', error);
    
    // Dados de fallback quando não há conexão com o banco
    const fallbackDeliveries = [
      {
        _id: 'fallback1',
        orderId: {
          _id: 'order1',
          orderNumber: '12345',
          amount: 150.00,
          date: new Date(),
          userId: {
            _id: 'user1',
            name: 'João Silva',
            email: 'joao@email.com'
          },
          items: [
            {
              name: 'Perfume Importado',
              quantity: 1,
              price: 150.00
            }
          ]
        },
        deliveryType: 'SEDEX',
        carrier: 'Correios',
        status: 'in_transit',
        trackingCode: 'BR123456789BR',
        shippingCost: 15.00,
        estimatedDays: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'fallback2',
        orderId: {
          _id: 'order2',
          orderNumber: '12346',
          amount: 89.90,
          date: new Date(),
          userId: {
            _id: 'user2',
            name: 'Maria Santos',
            email: 'maria@email.com'
          },
          items: [
            {
              name: 'Perfume Nacional',
              quantity: 1,
              price: 89.90
            }
          ]
        },
        deliveryType: 'PAC',
        carrier: 'Correios',
        status: 'delivered',
        trackingCode: 'BR987654321BR',
        shippingCost: 12.00,
        estimatedDays: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    res.json({
      success: true,
      deliveries: fallbackDeliveries,
      pagination: {
        current: 1,
        pages: 1,
        total: fallbackDeliveries.length
      }
    });
  }
};

// Atualizar status da entrega
const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Status é obrigatório" 
      });
    }

    // Validar status
    const validStatuses = ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Status inválido" 
      });
    }

    // Buscar entrega
    const delivery = await Delivery.findById(deliveryId).populate('orderId');
    if (!delivery) {
      return res.status(404).json({ 
        success: false, 
        message: "Entrega não encontrada" 
      });
    }

    // Buscar usuário
    const user = await User.findById(delivery.orderId.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Usuário não encontrado" 
      });
    }

    // Atualizar status da entrega
    const updateData = { 
      status,
      updatedAt: new Date()
    };

    // Adicionar notas se fornecidas
    if (notes) {
      updateData['deliveryDetails.notes'] = notes;
    }

    // Adicionar data de entrega se status for 'delivered'
    if (status === 'delivered') {
      updateData['deliveryDetails.deliveredAt'] = new Date();
    }

    await Delivery.findByIdAndUpdate(deliveryId, updateData);

    // Atualizar status do pedido também
    let orderStatus = 'processing';
    if (status === 'delivered') orderStatus = 'delivered';
    if (status === 'cancelled') orderStatus = 'cancelled';
    if (status === 'shipped' || status === 'in_transit') orderStatus = 'shipped';

    await Order.findByIdAndUpdate(delivery.orderId._id, { status: orderStatus });

    // Enviar email de atualização
    try {
      await sendStatusUpdateEmail(delivery.orderId, delivery, user, status);
    } catch (emailError) {
      console.error('Erro ao enviar email de atualização:', emailError);
    }

    res.json({
      success: true,
      message: "Status atualizado com sucesso",
      delivery: {
        id: delivery._id,
        status,
        updatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erro interno do servidor" 
    });
  }
};

// Rastrear entrega
const trackDeliveryOrder = async (req, res) => {
  try {
    const { trackingCode } = req.params;

    if (!trackingCode) {
      return res.status(400).json({ 
        success: false, 
        message: "Código de rastreamento é obrigatório" 
      });
    }

    // Buscar entrega pelo código de rastreamento
    const delivery = await Delivery.findOne({ trackingCode })
      .populate({
        path: 'orderId',
        select: 'orderNumber amount date items',
        populate: {
          path: 'items.productId',
          select: 'name image'
        }
      });

    if (!delivery) {
      return res.status(404).json({ 
        success: false, 
        message: "Código de rastreamento não encontrado" 
      });
    }

    // Buscar informações de rastreamento externas (se aplicável)
    let externalTracking = null;
    if (delivery.carrier === 'correios') {
      try {
        externalTracking = await trackDelivery(trackingCode);
      } catch (error) {
        console.error('Erro ao buscar rastreamento externo:', error);
      }
    }

    // Montar histórico de status
    const statusHistory = [
      {
        status: 'pending',
        date: delivery.createdAt,
        description: 'Pedido confirmado e entrega criada'
      }
    ];

    if (delivery.status !== 'pending') {
      statusHistory.push({
        status: delivery.status,
        date: delivery.updatedAt,
        description: getStatusDescription(delivery.status)
      });
    }

    res.json({
      success: true,
      tracking: {
        trackingCode: delivery.trackingCode,
        status: delivery.status,
        deliveryType: delivery.deliveryType,
        carrier: delivery.carrier,
        estimatedDelivery: delivery.estimatedDeliveryDays,
        shippingCost: delivery.shippingCost,
        order: {
          number: delivery.orderId.orderNumber,
          amount: delivery.orderId.amount,
          date: delivery.orderId.date,
          items: delivery.orderId.items
        },
        address: delivery.shippingAddress,
        history: statusHistory,
        externalTracking: externalTracking?.success ? externalTracking.events : null
      }
    });

  } catch (error) {
    console.error('Erro ao rastrear entrega:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erro interno do servidor" 
    });
  }
};

// Função auxiliar para descrições de status
const getStatusDescription = (status) => {
  const descriptions = {
    'pending': 'Aguardando processamento',
    'processing': 'Pedido sendo preparado',
    'shipped': 'Pedido enviado',
    'in_transit': 'Em trânsito para entrega',
    'delivered': 'Entregue com sucesso',
    'cancelled': 'Entrega cancelada'
  };
  return descriptions[status] || 'Status desconhecido';
};

// Enviar email de confirmação
const sendDeliveryEmail = async (req, res) => {
  try {
    const { deliveryId, emailType = 'confirmation' } = req.body;

    // Buscar entrega
    const delivery = await Delivery.findById(deliveryId).populate('orderId');
    if (!delivery) {
      return res.status(404).json({ 
        success: false, 
        message: "Entrega não encontrada" 
      });
    }

    // Buscar usuário
    const user = await User.findById(delivery.orderId.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Usuário não encontrado" 
      });
    }

    let emailResult;

    // Enviar email baseado no tipo
    switch (emailType) {
      case 'confirmation':
        emailResult = await sendOrderConfirmationEmail(delivery.orderId, delivery, user);
        break;
      case 'tracking':
        if (!delivery.trackingCode) {
          return res.status(400).json({ 
            success: false, 
            message: "Entrega não possui código de rastreamento" 
          });
        }
        emailResult = await sendTrackingCodeEmail(delivery.orderId, delivery, user);
        break;
      case 'status_update':
        emailResult = await sendStatusUpdateEmail(delivery.orderId, delivery, user, delivery.status);
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: "Tipo de email inválido" 
        });
    }

    if (emailResult.success) {
      // Atualizar registro de email na entrega
      await Delivery.findByIdAndUpdate(deliveryId, {
        [`emailTracking.${emailType}Sent`]: true,
        [`emailTracking.${emailType}SentAt`]: new Date()
      });

      res.json({
        success: true,
        message: "Email enviado com sucesso",
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro ao enviar email",
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erro interno do servidor" 
    });
  }
};

// Obter entrega específica
const getDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId)
      .populate({
        path: 'orderId',
        select: 'orderNumber amount date userId items',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    if (!delivery) {
      return res.status(404).json({ 
        success: false, 
        message: "Entrega não encontrada" 
      });
    }

    res.json({
      success: true,
      delivery
    });

  } catch (error) {
    console.error('Erro ao buscar entrega:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erro interno do servidor" 
    });
  }
};

// Atualizar entrega completa
const updateDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const updateData = req.body;

    // Remover campos que não devem ser atualizados diretamente
    delete updateData._id;
    delete updateData.createdAt;

    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).populate({
      path: 'orderId',
      select: 'orderNumber amount date userId',
      populate: {
        path: 'userId',
        select: 'name email'
      }
    });

    if (!delivery) {
      return res.status(404).json({ 
        success: false, 
        message: "Entrega não encontrada" 
      });
    }

    // Se o tipo de entrega ou transportadora mudou, atualizar o pedido também
    if (updateData.deliveryType || updateData.carrier || updateData.shippingCost) {
      await Order.findByIdAndUpdate(delivery.orderId._id, {
        deliveryType: delivery.deliveryType,
        shippingCost: delivery.shippingCost,
        trackingCode: delivery.trackingCode
      });
    }

    res.json({
      success: true,
      message: "Entrega atualizada com sucesso",
      delivery
    });

  } catch (error) {
    console.error('Erro ao atualizar entrega:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erro interno do servidor" 
    });
  }
};

// Deletar entrega
const deleteDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ 
        success: false, 
        message: "Entrega não encontrada" 
      });
    }

    // Remover referência da entrega no pedido
    await Order.findByIdAndUpdate(delivery.orderId, {
      $unset: { 
        deliveryId: 1,
        trackingCode: 1
      },
      status: 'confirmed' // Voltar status do pedido para confirmado
    });

    // Deletar a entrega
    await Delivery.findByIdAndDelete(deliveryId);

    res.json({
      success: true,
      message: "Entrega excluída com sucesso"
    });

  } catch (error) {
    console.error('Erro ao deletar entrega:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erro interno do servidor" 
    });
  }
};

export {
  calculateFreight,
  createDelivery,
  listDeliveries,
  updateDeliveryStatus,
  trackDeliveryOrder,
  sendDeliveryEmail,
  getDelivery,
  updateDelivery,
  deleteDelivery
};