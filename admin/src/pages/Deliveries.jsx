import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Deliveries = ({ token }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    deliveryType: '',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);
  const [newDelivery, setNewDelivery] = useState({
    orderId: '',
    deliveryType: 'regional',
    carrier: '',
    trackingCode: '',
    shippingCost: '',
    estimatedDelivery: '',
    notes: ''
  });
  const [editDelivery, setEditDelivery] = useState({
    _id: '',
    deliveryType: 'regional',
    carrier: '',
    trackingCode: '',
    shippingCost: '',
    estimatedDelivery: '',
    notes: ''
  });
  const [orders, setOrders] = useState([]);

  // Buscar entregas
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/delivery/list`, {
        headers: { token },
        params: filters
      });

      if (response.data.success) {
        setDeliveries(response.data.deliveries);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao buscar entregas:', error);
      toast.error('Erro ao carregar entregas');
    } finally {
      setLoading(false);
    }
  };

  // Buscar pedidos para o dropdown
  const fetchOrders = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/order/list`, {}, {
        headers: { token }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  };

  // Criar nova entrega
  const createDelivery = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/delivery/create`,
        newDelivery,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Entrega criada com sucesso!');
        setShowCreateModal(false);
        setNewDelivery({
          orderId: '',
          deliveryType: 'regional',
          carrier: '',
          trackingCode: '',
          shippingCost: '',
          estimatedDelivery: '',
          notes: ''
        });
        fetchDeliveries();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao criar entrega:', error);
      toast.error('Erro ao criar entrega');
    }
  };

  // Editar entrega
  const updateDelivery = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/delivery/update/${editDelivery._id}`,
        editDelivery,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Entrega atualizada com sucesso!');
        setShowEditModal(false);
        setEditDelivery({
          _id: '',
          deliveryType: 'regional',
          carrier: '',
          trackingCode: '',
          shippingCost: '',
          estimatedDelivery: '',
          notes: ''
        });
        fetchDeliveries();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar entrega:', error);
      toast.error('Erro ao atualizar entrega');
    }
  };

  // Excluir entrega
  const deleteDelivery = async (deliveryId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta entrega?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${backendUrl}/api/delivery/delete/${deliveryId}`,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Entrega excluída com sucesso!');
        fetchDeliveries();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao excluir entrega:', error);
      toast.error('Erro ao excluir entrega');
    }
  };

  // Excluir entregas em lote
  const bulkDeleteDeliveries = async () => {
    if (selectedDeliveries.length === 0) {
      toast.error('Selecione pelo menos uma entrega');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir ${selectedDeliveries.length} entrega(s)?`)) {
      return;
    }

    try {
      const promises = selectedDeliveries.map(deliveryId =>
        axios.delete(`${backendUrl}/api/delivery/delete/${deliveryId}`, {
          headers: { token }
        })
      );

      await Promise.all(promises);
      toast.success(`${selectedDeliveries.length} entrega(s) excluída(s) com sucesso!`);
      setSelectedDeliveries([]);
      fetchDeliveries();
    } catch (error) {
      console.error('Erro ao excluir entregas:', error);
      toast.error('Erro ao excluir entregas em lote');
    }
  };

  // Atualizar status em lote
  const bulkStatusUpdate = async (newStatus) => {
    if (selectedDeliveries.length === 0) {
      toast.error('Selecione pelo menos uma entrega');
      return;
    }

    try {
      const promises = selectedDeliveries.map(deliveryId =>
        axios.put(
          `${backendUrl}/api/delivery/status`,
          { deliveryId, status: newStatus },
          { headers: { token } }
        )
      );

      await Promise.all(promises);
      toast.success(`${selectedDeliveries.length} entrega(s) atualizada(s) com sucesso!`);
      setSelectedDeliveries([]);
      fetchDeliveries();
    } catch (error) {
      console.error('Erro ao atualizar entregas:', error);
      toast.error('Erro ao atualizar entregas em lote');
    }
  };

  // Selecionar/deselecionar entrega
  const toggleDeliverySelection = (deliveryId) => {
    setSelectedDeliveries(prev =>
      prev.includes(deliveryId)
        ? prev.filter(id => id !== deliveryId)
        : [...prev, deliveryId]
    );
  };

  // Selecionar todas as entregas
  const toggleSelectAll = () => {
    if (selectedDeliveries.length === deliveries.length) {
      setSelectedDeliveries([]);
    } else {
      setSelectedDeliveries(deliveries.map(delivery => delivery._id));
    }
  };

  // Abrir modal de edição
  const openEditModal = (delivery) => {
    setEditDelivery({
      _id: delivery._id,
      deliveryType: delivery.deliveryType,
      carrier: delivery.carrier,
      trackingCode: delivery.trackingCode,
      shippingCost: delivery.shippingCost,
      estimatedDelivery: delivery.estimatedDelivery ? delivery.estimatedDelivery.split('T')[0] : '',
      notes: delivery.notes || ''
    });
    setShowEditModal(true);
  };

  useEffect(() => {
    if (token) {
      fetchDeliveries();
      fetchOrders();
    }
  }, [token, filters]);

  // Atualizar status da entrega
  const updateDeliveryStatus = async () => {
    if (!selectedDelivery || !statusUpdate) return;

    try {
      const response = await axios.put(
        `${backendUrl}/api/delivery/status`,
        {
          deliveryId: selectedDelivery._id,
          status: statusUpdate,
          notes: notes
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Status atualizado com sucesso!');
        setShowModal(false);
        setSelectedDelivery(null);
        setStatusUpdate('');
        setNotes('');
        fetchDeliveries();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  // Enviar email de confirmação
  const sendConfirmationEmail = async (deliveryId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/delivery/send-email/${deliveryId}`,
        {
          deliveryId,
          emailType: 'confirmation'
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Email enviado com sucesso!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      toast.error('Erro ao enviar email');
    }
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'in_transit': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Obter texto do status
  const getStatusText = (status) => {
    const texts = {
      'pending': 'Pendente',
      'processing': 'Processando',
      'shipped': 'Enviado',
      'in_transit': 'Em Trânsito',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return texts[status] || status;
  };

  const openStatusModal = (delivery) => {
    setSelectedDelivery(delivery);
    setStatusUpdate(delivery.status);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Entregas</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nova Entrega
        </button>
      </div>

      {/* Filtros e Ações em Lote */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="processing">Processando</option>
              <option value="shipped">Enviado</option>
              <option value="in_transit">Em Trânsito</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Entrega</label>
            <select
              value={filters.deliveryType}
              onChange={(e) => setFilters(prev => ({ ...prev, deliveryType: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os Tipos</option>
              <option value="regional">Regional</option>
              <option value="national">Nacional</option>
              <option value="express">Expressa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Buscar por pedido, cliente..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', deliveryType: '', search: '', page: 1 })}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Ações em Lote */}
        {selectedDeliveries.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">
              {selectedDeliveries.length} entrega(s) selecionada(s)
            </span>
            <div className="flex gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    bulkStatusUpdate(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="text-sm p-2 border border-blue-300 rounded-md"
              >
                <option value="">Alterar Status</option>
                <option value="pending">Pendente</option>
                <option value="processing">Processando</option>
                <option value="shipped">Enviado</option>
                <option value="in_transit">Em Trânsito</option>
                <option value="delivered">Entregue</option>
                <option value="cancelled">Cancelado</option>
              </select>
              <button
                onClick={bulkDeleteDeliveries}
                className="text-sm bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Excluir Selecionadas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Entregas */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Carregando entregas...</p>
        </div>
      ) : deliveries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhuma entrega encontrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDeliveries.length === deliveries.length && deliveries.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo/Transportadora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rastreamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveries.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedDeliveries.includes(delivery._id)}
                        onChange={() => toggleDeliverySelection(delivery._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{delivery.orderId?.orderNumber || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(delivery.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.orderId?.userId?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.orderId?.userId?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.deliveryType === 'regional' ? 'Regional' : 
                           delivery.deliveryType === 'national' ? 'Nacional' : 
                           delivery.deliveryType === 'express' ? 'Expressa' : delivery.deliveryType}
                        </div>
                        <div className="text-sm text-gray-500">
                          {delivery.carrier}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {delivery.trackingCode || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                        {getStatusText(delivery.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          R$ {delivery.orderId?.amount?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Frete: R$ {delivery.shippingCost?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(delivery)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openStatusModal(delivery)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Status
                        </button>
                        <button
                          onClick={() => deleteDelivery(delivery._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </div>
                      <button
                        onClick={() => sendConfirmationEmail(delivery._id)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginação */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
              disabled={filters.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="px-3 py-2 text-gray-700">
              Página {pagination.current} de {pagination.pages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
              disabled={filters.page === pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Modal de Atualização de Status */}
      {showModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Atualizar Status da Entrega
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pedido: #{selectedDelivery.orderId?.orderNumber}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código: {selectedDelivery.trackingCode}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Novo Status
                </label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pendente</option>
                  <option value="processing">Processando</option>
                  <option value="shipped">Enviado</option>
                  <option value="in_transit">Em Trânsito</option>
                  <option value="delivered">Entregue</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre a atualização..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDelivery(null);
                  setStatusUpdate('');
                  setNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={updateDeliveryStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Atualizar Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação de Entrega */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nova Entrega</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pedido *
                </label>
                <select
                  value={newDelivery.orderId}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, orderId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um pedido</option>
                  {orders.map(order => (
                    <option key={order._id} value={order._id}>
                      #{order.orderNumber} - {order.userId?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Entrega *
                </label>
                <select
                  value={newDelivery.deliveryType}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, deliveryType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="regional">Regional</option>
                  <option value="national">Nacional</option>
                  <option value="express">Expressa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transportadora *
                </label>
                <input
                  type="text"
                  value={newDelivery.carrier}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, carrier: e.target.value }))}
                  placeholder="Ex: Correios, Transportadora XYZ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Rastreamento
                </label>
                <input
                  type="text"
                  value={newDelivery.trackingCode}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, trackingCode: e.target.value }))}
                  placeholder="Ex: BR123456789BR"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custo do Frete (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newDelivery.shippingCost}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, shippingCost: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previsão de Entrega
                </label>
                <input
                  type="date"
                  value={newDelivery.estimatedDelivery}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={newDelivery.notes}
                  onChange={(e) => setNewDelivery(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações sobre a entrega..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={createDelivery}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Criar Entrega
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Entrega */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Editar Entrega</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Entrega *
                </label>
                <select
                  value={editDelivery.deliveryType}
                  onChange={(e) => setEditDelivery(prev => ({ ...prev, deliveryType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="regional">Regional</option>
                  <option value="national">Nacional</option>
                  <option value="express">Expressa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transportadora *
                </label>
                <input
                  type="text"
                  value={editDelivery.carrier}
                  onChange={(e) => setEditDelivery(prev => ({ ...prev, carrier: e.target.value }))}
                  placeholder="Ex: Correios, Transportadora XYZ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Rastreamento
                </label>
                <input
                  type="text"
                  value={editDelivery.trackingCode}
                  onChange={(e) => setEditDelivery(prev => ({ ...prev, trackingCode: e.target.value }))}
                  placeholder="Ex: BR123456789BR"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custo do Frete (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editDelivery.shippingCost}
                  onChange={(e) => setEditDelivery(prev => ({ ...prev, shippingCost: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previsão de Entrega
                </label>
                <input
                  type="date"
                  value={editDelivery.estimatedDelivery}
                  onChange={(e) => setEditDelivery(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={editDelivery.notes}
                  onChange={(e) => setEditDelivery(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações sobre a entrega..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={updateDelivery}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;