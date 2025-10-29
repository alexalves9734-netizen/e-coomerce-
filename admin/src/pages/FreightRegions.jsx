import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const FreightRegions = ({ token }) => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    active: '',
    state: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    states: [],
    cities: [],
    basePrice: '',
    pricePerKg: '',
    freeShippingThreshold: '',
    isFreeShipping: false,
    deliveryTime: { min: '', max: '' },
    active: true
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  useEffect(() => {
    fetchRegions();
  }, [filters]);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/freight/regions`, {
        headers: { token },
        params: filters
      });

      if (response.data.success) {
        setRegions(response.data.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar regiões');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        basePrice: formData.isFreeShipping ? 0 : parseFloat(formData.basePrice),
        pricePerKg: formData.isFreeShipping ? 0 : parseFloat(formData.pricePerKg),
        freeShippingThreshold: formData.isFreeShipping ? 0 : (parseFloat(formData.freeShippingThreshold) || 0),
        deliveryTime: {
          min: parseInt(formData.deliveryTime.min),
          max: parseInt(formData.deliveryTime.max)
        }
      };

      let response;
      if (editingRegion) {
        response = await axios.put(
          `${backendUrl}/api/freight/regions/${editingRegion._id}`,
          submitData,
          { headers: { token } }
        );
      } else {
        response = await axios.post(
          `${backendUrl}/api/freight/regions`,
          submitData,
          { headers: { token } }
        );
      }

      if (response.data.success) {
        toast.success(editingRegion ? 'Região atualizada!' : 'Região criada!');
        fetchRegions();
        closeModal();
      }
    } catch (error) {
      toast.error('Erro ao salvar região');
    }
  };

  const bulkDeleteRegions = async () => {
    if (selectedRegions.length === 0) {
      toast.error('Selecione pelo menos uma região');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir ${selectedRegions.length} região(ões)?`)) {
      return;
    }

    try {
      await Promise.all(selectedRegions.map(regionId =>
        axios.delete(`${backendUrl}/api/freight/regions/${regionId}`, {
          headers: { token }
        })
      ));

      toast.success(`${selectedRegions.length} região(ões) excluída(s) com sucesso!`);
      setSelectedRegions([]);
      fetchRegions();
    } catch (error) {
      toast.error('Erro ao excluir regiões');
    }
  };

  const bulkToggleActive = async (active) => {
    if (selectedRegions.length === 0) {
      toast.error('Selecione pelo menos uma região');
      return;
    }

    try {
      // Apenas alternar o status das regiões que não estão no estado desejado
      const regionsToToggle = selectedRegions
        .map(id => regions.find(r => r._id === id))
        .filter(r => r && r.active !== active)
        .map(r => r._id);

      if (regionsToToggle.length === 0) {
        toast.info('As regiões selecionadas já estão no status desejado.');
        return;
      }

      await Promise.all(regionsToToggle.map(regionId =>
        axios.patch(
          `${backendUrl}/api/freight/regions/${regionId}/toggle`,
          {},
          { headers: { token } }
        )
      ));

      toast.success(`${regionsToToggle.length} região(ões) ${active ? 'ativada(s)' : 'desativada(s)'} com sucesso!`);
      setSelectedRegions([]);
      fetchRegions();
    } catch (error) {
      toast.error('Erro ao atualizar regiões');
    }
  };

  const toggleRegionSelection = (regionId) => {
    setSelectedRegions(prev =>
      prev.includes(regionId)
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRegions.length === regions.length) {
      setSelectedRegions([]);
    } else {
      setSelectedRegions(regions.map(region => region._id));
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      active: '',
      state: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta região?')) return;
    
    try {
      const response = await axios.delete(`${backendUrl}/api/freight/regions/${id}`, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success('Região excluída com sucesso!');
        fetchRegions();
      }
    } catch (error) {
      toast.error('Erro ao excluir região');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const response = await axios.patch(
        `${backendUrl}/api/freight/regions/${id}/toggle`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Status da região atualizado!');
        fetchRegions();
      }
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const openModal = (region = null) => {
    if (region) {
      setEditingRegion(region);
      setFormData({
        name: region.name,
        states: region.states,
        cities: region.cities || [],
        basePrice: region.basePrice.toString(),
        pricePerKg: region.pricePerKg.toString(),
        freeShippingThreshold: region.freeShippingThreshold.toString(),
        isFreeShipping: region.isFreeShipping || false,
        deliveryTime: {
          min: region.deliveryTime.min.toString(),
          max: region.deliveryTime.max.toString()
        },
        active: region.active
      });
    } else {
      setEditingRegion(null);
      setFormData({
        name: '',
        states: [],
        cities: [],
        basePrice: '',
        pricePerKg: '',
        freeShippingThreshold: '',
        isFreeShipping: false,
        deliveryTime: { min: '', max: '' },
        active: true
      });
    }
    setShowModal(true);
  };

  // Abre modal já com configuração de frete grátis
  const openFreeShippingModal = () => {
    setEditingRegion(null);
    setFormData({
      name: '',
      states: [],
      cities: [],
      basePrice: '',
      pricePerKg: '',
      freeShippingThreshold: '',
      isFreeShipping: true,
      deliveryTime: { min: '2', max: '5' },
      active: true
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRegion(null);
  };

  const handleStateChange = (state) => {
    const newStates = formData.states.includes(state)
      ? formData.states.filter(s => s !== state)
      : [...formData.states, state];
    
    setFormData({ ...formData, states: newStates });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Regiões de Frete</h1>
        <div className="flex gap-2">
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Nova Região
          </button>
          <button
            onClick={() => openFreeShippingModal()}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            title="Criar região com frete sempre grátis"
          >
            Nova Região Grátis
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Nome da região..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.active}
              onChange={(e) => setFilters({ ...filters, active: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="true">Ativas</option>
              <option value="false">Inativas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Todos os Estados</option>
              {brazilianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Ações em lote */}
      {selectedRegions.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedRegions.length} região(ões) selecionada(s)
            </span>
            <div className="space-x-2">
              <button
                onClick={() => bulkToggleActive(true)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Ativar
              </button>
              <button
                onClick={() => bulkToggleActive(false)}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
              >
                Desativar
              </button>
              <button
                onClick={bulkDeleteRegions}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRegions.length === regions.length && regions.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estados
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço Base
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frete Grátis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prazo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {regions.map((region) => (
              <tr key={region._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRegions.includes(region._id)}
                    onChange={() => toggleRegionSelection(region._id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {region.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {region.states.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {region.basePrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {region.isFreeShipping 
                    ? 'Sempre grátis' 
                    : region.freeShippingThreshold > 0
                      ? `R$ ${region.freeShippingThreshold.toFixed(2)}`
                      : 'Não disponível'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {region.deliveryTime.min}-{region.deliveryTime.max} dias
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    region.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {region.active ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => openModal(region)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleActive(region._id)}
                    className={`${
                      region.active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {region.active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleDelete(region._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingRegion ? 'Editar Região' : 'Nova Região'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome da Região</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estados Atendidos</label>
                  <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {brazilianStates.map(state => (
                      <label key={state} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.states.includes(state)}
                          onChange={() => handleStateChange(state)}
                          className="mr-1"
                        />
                        <span className="text-sm">{state}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preço Base (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formData.isFreeShipping ? 'bg-gray-100 border-gray-200 text-gray-500' : 'border-gray-300'}`}
                      required={!formData.isFreeShipping}
                      disabled={formData.isFreeShipping}
                    />
                    {formData.isFreeShipping && (
                      <p className="text-xs text-gray-500 mt-1">Desabilitado porque frete é sempre grátis</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preço por Kg (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pricePerKg}
                      onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 ${formData.isFreeShipping ? 'bg-gray-100 border-gray-200 text-gray-500' : 'border-gray-300'}`}
                      required={!formData.isFreeShipping}
                      disabled={formData.isFreeShipping}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor para Frete Grátis (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.freeShippingThreshold}
                    onChange={(e) => setFormData({ ...formData, freeShippingThreshold: e.target.value })}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 ${formData.isFreeShipping ? 'bg-gray-100 border-gray-200 text-gray-500' : 'border-gray-300'}`}
                    disabled={formData.isFreeShipping}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.isFreeShipping ? 'Desabilitado porque frete é sempre grátis' : 'Deixe vazio para não oferecer frete grátis por valor'}
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFreeShipping}
                    onChange={(e) => setFormData({ ...formData, isFreeShipping: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Frete sempre grátis nesta região</label>
                  <p className="text-xs text-gray-500 ml-2">(Quando ativo, não cobra frete independente do valor)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prazo Mínimo (dias)</label>
                    <input
                      type="number"
                      value={formData.deliveryTime.min}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        deliveryTime: { ...formData.deliveryTime, min: e.target.value }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prazo Máximo (dias)</label>
                    <input
                      type="number"
                      value={formData.deliveryTime.max}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        deliveryTime: { ...formData.deliveryTime, max: e.target.value }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Região Ativa</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingRegion ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreightRegions;