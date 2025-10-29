import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/admin_assets/assets";

const Tracking = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [trackings, setTrackings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [servico, setServico] = useState("SEDEX");
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  const servicoOptions = [
    { value: "SEDEX", label: "SEDEX" },
    { value: "PAC", label: "PAC" },
    { value: "SEDEX 10", label: "SEDEX 10" },
    { value: "SEDEX 12", label: "SEDEX 12" },
    { value: "SEDEX Hoje", label: "SEDEX Hoje" }
  ];

  const statusOptions = [
    { value: "pending", label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
    { value: "in_transit", label: "Em Trânsito", color: "bg-blue-100 text-blue-800" },
    { value: "out_for_delivery", label: "Saiu para Entrega", color: "bg-orange-100 text-orange-800" },
    { value: "delivered", label: "Entregue", color: "bg-green-100 text-green-800" },
    { value: "exception", label: "Exceção", color: "bg-red-100 text-red-800" }
  ];

  // Buscar pedidos sem rastreamento
  const fetchOrdersWithoutTracking = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        // Filtrar apenas pedidos que foram enviados mas não têm rastreamento
        const ordersNeedingTracking = response.data.orders.filter(
          order => order.status === "Shipped" && !order.trackingCode
        );
        setOrders(ordersNeedingTracking);
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao buscar pedidos");
    }
  };

  // Buscar todos os rastreamentos
  const fetchAllTrackings = async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        backendUrl + "/api/tracking/admin/all",
        { headers: { token } }
      );

      if (response.data.success) {
        setTrackings(response.data.data.trackings);
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao buscar rastreamentos");
    } finally {
      setLoading(false);
    }
  };

  // Adicionar código de rastreamento
  const handleAddTracking = async (e) => {
    e.preventDefault();
    
    if (!selectedOrder || !trackingCode.trim()) {
      toast.error("Selecione um pedido e insira o código de rastreamento");
      return;
    }

    try {
      // Criar rastreamento
      const trackingResponse = await axios.post(
        backendUrl + "/api/tracking/create",
        {
          orderId: selectedOrder._id,
          trackingCode: trackingCode.trim(),
          servico: servico
        },
        { headers: { token } }
      );

      if (trackingResponse.data.success) {
        // Atualizar o pedido com o código de rastreamento
        const orderResponse = await axios.post(
          backendUrl + "/api/order/status",
          { 
            orderId: selectedOrder._id, 
            status: "Shipped",
            trackingCode: trackingCode.trim()
          },
          { headers: { token } }
        );

        if (orderResponse.data.success) {
          toast.success("Código de rastreamento adicionado com sucesso!");
          setShowModal(false);
          setSelectedOrder(null);
          setTrackingCode("");
          setServico("SEDEX");
          await fetchOrdersWithoutTracking();
          await fetchAllTrackings();
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao adicionar código de rastreamento");
    }
  };

  // Atualizar rastreamento manualmente
  const handleUpdateTracking = async (trackingIdOrCode) => {
    try {
      const response = await axios.put(
        backendUrl + `/api/tracking/update/${trackingIdOrCode}`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Rastreamento atualizado com sucesso!");
        await fetchAllTrackings();
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar rastreamento");
    }
  };

  // Atualizar todos os rastreamentos
  const handleUpdateAllTrackings = async () => {
    try {
      const response = await axios.post(
        backendUrl + "/api/tracking/update-all",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Todos os rastreamentos foram atualizados!");
        await fetchAllTrackings();
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar rastreamentos");
    }
  };

  // Filtrar rastreamentos
  const getFilteredTrackings = () => {
    let filtered = [...trackings];

    if (filters.status) {
      filtered = filtered.filter(tracking => tracking.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(tracking => 
        tracking.trackingCode.toLowerCase().includes(filters.search.toLowerCase()) ||
        tracking.orderId?.orderNumber?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption : { label: status, color: "bg-gray-100 text-gray-800" };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchOrdersWithoutTracking();
    fetchAllTrackings();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Rastreamentos</h1>
        <div className="flex gap-2">
          <button
            onClick={handleUpdateAllTrackings}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Atualizar Todos
          </button>
        </div>
      </div>

      {/* Pedidos sem rastreamento */}
      {orders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Pedidos Enviados sem Rastreamento</h2>
            <p className="text-sm text-gray-600">
              {orders.length} pedido(s) precisam de código de rastreamento
            </p>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Pedido #{order.orderNumber || order._id.slice(-6)}</p>
                    <p className="text-sm text-gray-600">
                      {order.address.firstName} {order.address.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.date)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Adicionar Rastreamento
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Código de rastreamento ou número do pedido"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', search: '' })}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de rastreamentos */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Rastreamentos Ativos</h2>
          <p className="text-sm text-gray-600">
            {getFilteredTrackings().length} rastreamento(s) encontrado(s)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Atualização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredTrackings().map((tracking) => {
                const statusBadge = getStatusBadge(tracking.status);
                return (
                  <tr key={tracking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {tracking.trackingCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        #{tracking.orderId?.orderNumber || tracking.orderId?._id?.slice(-6) || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tracking.servico}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tracking.lastUpdate ? formatDate(tracking.lastUpdate) : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleUpdateTracking(tracking.trackingCode)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Atualizar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {getFilteredTrackings().length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum rastreamento encontrado</p>
          </div>
        )}
      </div>

      {/* Modal para adicionar rastreamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Adicionar Código de Rastreamento</h3>
            
            {selectedOrder && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm"><strong>Pedido:</strong> #{selectedOrder.orderNumber || selectedOrder._id.slice(-6)}</p>
                <p className="text-sm"><strong>Cliente:</strong> {selectedOrder.address.firstName} {selectedOrder.address.lastName}</p>
              </div>
            )}

            <form onSubmit={handleAddTracking}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Rastreamento
                </label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Ex: BR123456789BR"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serviço
                </label>
                <select
                  value={servico}
                  onChange={(e) => setServico(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {servicoOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedOrder(null);
                    setTrackingCode("");
                    setServico("SEDEX");
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;