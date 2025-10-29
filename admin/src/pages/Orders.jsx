import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/admin_assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });

  const statusOptions = [
    { value: "Order Placed", label: "Pedido Realizado", color: "bg-blue-100 text-blue-800" },
    { value: "Packing", label: "Embalando", color: "bg-yellow-100 text-yellow-800" },
    { value: "Shipped", label: "Enviado", color: "bg-purple-100 text-purple-800" },
    { value: "Out For Delivery", label: "Saiu para Entrega", color: "bg-orange-100 text-orange-800" },
    { value: "Delivered", label: "Entregue", color: "bg-green-100 text-green-800" },
    { value: "Cancelled", label: "Cancelado", color: "bg-red-100 text-red-800" }
  ];

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
        setFilteredOrders(response.data.orders);
        setPagination(prev => ({
          ...prev,
          totalItems: response.data.orders.length
        }));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );

      if (response.data.success) {
        await fetchAllOrders();
        toast.success("Status atualizado com sucesso!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar status");
    }
  };

  // Função para filtrar pedidos
  const applyFilters = () => {
    let filtered = [...orders];

    // Filtro por status
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Filtro por status de pagamento
    if (filters.paymentStatus) {
      const isPaid = filters.paymentStatus === 'paid';
      filtered = filtered.filter(order => order.payment === isPaid);
    }

    // Filtro por data
    if (filters.dateFrom) {
      filtered = filtered.filter(order => 
        new Date(order.date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(order => 
        new Date(order.date) <= new Date(filters.dateTo)
      );
    }

    // Filtro por busca (nome do cliente, ID do pedido, etc.)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm) ||
        `${order.address.firstName} ${order.address.lastName}`.toLowerCase().includes(searchTerm) ||
        order.address.phone.includes(searchTerm) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm))
      );
    }

    setFilteredOrders(filtered);
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalItems: filtered.length
    }));
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
    setFilteredOrders(orders);
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalItems: orders.length
    }));
  };

  // Função para selecionar/deselecionar pedidos
  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Função para selecionar todos os pedidos
  const toggleSelectAll = () => {
    const currentPageOrders = getCurrentPageOrders();
    const allSelected = currentPageOrders.every(order => selectedOrders.includes(order._id));
    
    if (allSelected) {
      setSelectedOrders(prev => prev.filter(id => !currentPageOrders.map(o => o._id).includes(id)));
    } else {
      setSelectedOrders(prev => [...new Set([...prev, ...currentPageOrders.map(o => o._id)])]);
    }
  };

  // Função para ações em lote
  const bulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0) {
      toast.error("Selecione pelo menos um pedido");
      return;
    }

    try {
      const promises = selectedOrders.map(orderId =>
        axios.post(
          backendUrl + "/api/order/status",
          { orderId, status: newStatus },
          { headers: { token } }
        )
      );

      await Promise.all(promises);
      await fetchAllOrders();
      setSelectedOrders([]);
      toast.success(`${selectedOrders.length} pedidos atualizados com sucesso!`);
    } catch (error) {
      console.log(error);
      toast.error("Erro ao atualizar pedidos em lote");
    }
  };

  // Função para obter pedidos da página atual
  const getCurrentPageOrders = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  };

  // Função para calcular total de páginas
  const getTotalPages = () => {
    return Math.ceil(pagination.totalItems / pagination.itemsPerPage);
  };

  // Função para mostrar detalhes do pedido
  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Função para obter a cor do status
  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-800";
  };

  // Função para obter o label do status
  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, orders]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Pedidos</h1>
        <p className="text-gray-600">Visualize e gerencie todos os pedidos da loja</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="ID, cliente, telefone..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pagamento
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="paid">Pago</option>
              <option value="pending">Pendente</option>
            </select>
          </div>

          {/* Data De */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data De
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Data Até */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Até
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Ações em Lote */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedOrders.length} pedido(s) selecionado(s)
            </span>
            <div className="flex gap-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => bulkStatusUpdate(option.value)}
                  className={`px-3 py-1 text-xs rounded-full ${option.color} hover:opacity-80`}
                >
                  Marcar como {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm font-medium text-gray-500">Total de Pedidos</h3>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm font-medium text-gray-500">Pedidos Filtrados</h3>
          <p className="text-2xl font-bold text-blue-600">{filteredOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm font-medium text-gray-500">Pendentes</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => !o.payment).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm font-medium text-gray-500">Entregues</h3>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'Delivered').length}
          </p>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lista de Pedidos</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de {pagination.totalItems}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={getCurrentPageOrders().length > 0 && getCurrentPageOrders().every(order => selectedOrders.includes(order._id))}
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
                  Itens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentPageOrders().map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => toggleOrderSelection(order._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="w-8 h-8 mr-3" src={assets.parcel_icon} alt="pedido" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order._id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.paymentMethod}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.address.firstName} {order.address.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.address.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.items.length} item(s)
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items.slice(0, 2).map(item => item.name).join(', ')}
                      {order.items.length > 2 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {currency}{order.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.payment 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.payment ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => showOrderDetails(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver Detalhes
                      </button>
                      <select
                        onChange={(e) => statusHandler(e, order._id)}
                        value={order.status}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {getTotalPages() > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Itens por página:</span>
                <select
                  value={pagination.itemsPerPage}
                  onChange={(e) => setPagination(prev => ({ 
                    ...prev, 
                    itemsPerPage: parseInt(e.target.value),
                    currentPage: 1 
                  }))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                <span className="text-sm text-gray-700">
                  Página {pagination.currentPage} de {getTotalPages()}
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === getTotalPages()}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Pedido */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Detalhes do Pedido #{selectedOrder._id.slice(-8)}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações do Cliente */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Informações do Cliente</h3>
                  <div className="space-y-2">
                    <p><strong>Nome:</strong> {selectedOrder.address.firstName} {selectedOrder.address.lastName}</p>
                    <p><strong>Email:</strong> {selectedOrder.address.email}</p>
                    <p><strong>Telefone:</strong> {selectedOrder.address.phone}</p>
                    <p><strong>Endereço:</strong> {selectedOrder.address.street}</p>
                    <p><strong>Cidade:</strong> {selectedOrder.address.city}</p>
                    <p><strong>Estado:</strong> {selectedOrder.address.state}</p>
                    <p><strong>CEP:</strong> {selectedOrder.address.zipcode}</p>
                    <p><strong>País:</strong> {selectedOrder.address.country}</p>
                  </div>
                </div>

                {/* Informações do Pedido */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Informações do Pedido</h3>
                  <div className="space-y-2">
                    <p><strong>Data:</strong> {new Date(selectedOrder.date).toLocaleString('pt-BR')}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </p>
                    <p><strong>Método de Pagamento:</strong> {selectedOrder.paymentMethod}</p>
                    <p><strong>Status do Pagamento:</strong> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedOrder.payment 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.payment ? 'Pago' : 'Pendente'}
                      </span>
                    </p>
                    <p><strong>Valor Total:</strong> {currency}{selectedOrder.amount}</p>
                  </div>
                </div>
              </div>

              {/* Itens do Pedido */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Itens do Pedido</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamanho</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.size}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{currency}{item.price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {currency}{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
