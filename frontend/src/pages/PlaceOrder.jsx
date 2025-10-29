import React, { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import ShippingCalculator from "../components/ShippingCalculator";
import { ShopContext } from "../contexts/ShopContext";
import { initMercadoPago, Payment, CardPayment } from '@mercadopago/sdk-react';
import { toast } from "react-toastify";
import axios from "axios";

const PlaceOrder = () => {
    const { navigate, cartItems, getCartAmount, deliveryFee, products, token, backendUrl, setCartItems } = useContext(ShopContext);
    const [isPaymentReady, setIsPaymentReady] = useState(false);
    const [preferenceId, setPreferenceId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMode, setPaymentMode] = useState('payment'); // 'payment' ou 'card'

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: "",
    });

    // Inicializar MercadoPago
    useEffect(() => {
        const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
        if (publicKey && publicKey !== 'TEST-your-public-key-here') {
            try {
                initMercadoPago(publicKey, { locale: 'pt-BR' });
                setIsPaymentReady(true);
                console.log('MercadoPago SDK inicializado com sucesso');
            } catch (error) {
                console.error('Erro ao inicializar MercadoPago:', error);
                toast.error('Erro ao carregar sistema de pagamento');
            }
        } else {
            console.error('Chave pública do MercadoPago não configurada');
            toast.error('Sistema de pagamento não configurado');
        }
    }, []);

    // Criar preferência automaticamente quando condições estiverem atendidas
    useEffect(() => {
        const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];
        const isFormComplete = requiredFields.every((field) => String(formData[field] || '').trim().length > 0);

        // Condições: SDK pronto, carrinho com itens, formulário completo, sem preferenceId e modo payment
        if (isPaymentReady && getCartAmount() > 0 && isFormComplete && !preferenceId && !isLoading && paymentMode === 'payment') {
            console.log('Condições atendidas. Criando preferência automaticamente...');
            createPaymentPreference();
        }
    }, [isPaymentReady, formData, preferenceId, isLoading, paymentMode, cartItems]);

    // Criar preferência de pagamento
    const createPaymentPreference = async () => {
        if (getCartAmount() === 0) {
            toast.error('Carrinho vazio');
            return;
        }

        setIsLoading(true);
        try {
            // Preparar itens do carrinho
            let orderItems = [];
            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = structuredClone(products.find(product => product._id === items));
                        if (itemInfo) {
                            itemInfo.size = item;
                            itemInfo.quantity = cartItems[items][item];
                            orderItems.push(itemInfo);
                        }
                    }
                }
            }

            const orderData = {
                address: formData,
                items: orderItems.map(item => ({
                    title: item.name,
                    quantity: item.quantity,
                    unit_price: item.price,
                    currency_id: "BRL"
                })),
                back_urls: {
                    success: `${window.location.origin}/orders`,
                    failure: `${window.location.origin}/cart`,
                    pending: `${window.location.origin}/orders`
                },
                auto_return: "approved"
            };

            console.log('=== DEBUG PAYMENT PREFERENCE ===');
            console.log('CartAmount:', getCartAmount());
            console.log('DeliveryFee:', deliveryFee);
            console.log('Total:', getCartAmount() + deliveryFee);
            console.log('OrderData:', orderData);

            const response = await axios.post(backendUrl + "/api/mercadopago/create-preference", orderData);
            
            console.log('Preference Response:', response.data);
            
            if (response.data.success) {
                const newPreferenceId = response.data.preferenceId;
                console.log('PreferenceId recebido:', newPreferenceId);
                console.log('PreferenceId tipo:', typeof newPreferenceId);
                console.log('PreferenceId válido:', !!newPreferenceId);
                
                setPreferenceId(newPreferenceId);
                toast.success('Opções de pagamento carregadas!');
            } else {
                throw new Error(response.data.message || 'Erro ao criar preferência');
            }
        } catch (error) {
            console.error('Erro ao criar preferência:', error);
            toast.error('Erro ao carregar opções de pagamento: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        // Validar formulário
        const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];
        const missingFields = requiredFields.filter(field => !formData[field].trim());
        
        if (missingFields.length > 0) {
            toast.error('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Criar preferência de pagamento
        await createPaymentPreference();
    };

    return (
        <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
            {/* Left Side */}
            <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
                <div className="text-xl sm:text-2xl my-3">
                    <Title text1="INFORMAÇÕES" text2="DE ENTREGA" />
                </div>
                <div className="flex gap-3">
                    <input 
                        required 
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full" 
                        type="text" 
                        placeholder="Nome" 
                        onChange={onChangeHandler} 
                        name="firstName" 
                        value={formData.firstName} 
                    />
                    <input 
                        required 
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full" 
                        type="text" 
                        placeholder="Sobrenome" 
                        onChange={onChangeHandler} 
                        name="lastName" 
                        value={formData.lastName} 
                    />
                </div>
                <input 
                    required 
                    className="border border-gray-300 rounded py-1.5 px-3.5 w-full" 
                    type="email" 
                    placeholder="Endereço de E-mail" 
                    onChange={onChangeHandler} 
                    name="email" 
                    value={formData.email} 
                />
                <input 
                    required 
                    className="border border-gray-300 rounded py-1.5 px-3.5 w-full" 
                    type="text" 
                    placeholder="Rua" 
                    onChange={onChangeHandler} 
                    name="street" 
                    value={formData.street} 
                />
                <div className="flex gap-3">
                    <input 
                        required 
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full" 
                        type="text" 
                        placeholder="Número" 
                        onChange={onChangeHandler} 
                        name="number" 
                        value={formData.number} 
                    />
                    <input 
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full" 
                        type="text" 
                        placeholder="Complemento" 
                        onChange={onChangeHandler} 
                        name="complement" 
                        value={formData.complement} 
                    />
                </div>
                <input 
                    required 
                    className="border border-gray-300 rounded py-1.5 px-3.5 w-full" 
                    type="text" 
                    placeholder="Bairro" 
                    onChange={onChangeHandler} 
                    name="neighborhood" 
                    value={formData.neighborhood} 
                />
                <div className="flex gap-3">
                    <input 
                        required 
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full" 
                        type="text" 
                        placeholder="Cidade" 
                        onChange={onChangeHandler} 
                        name="city" 
                        value={formData.city} 
                    />
                    <input 
                        required 
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full" 
                        type="text" 
                        placeholder="Estado" 
                        onChange={onChangeHandler} 
                        name="state" 
                        value={formData.state} 
                    />
                </div>
                <div className="flex gap-3">
                    <input 
                        required 
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full" 
                        type="text" 
                        placeholder="CEP" 
                        onChange={onChangeHandler} 
                        name="zipcode" 
                        value={formData.zipcode} 
                    />
                    <input 
                        required 
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full" 
                        type="text" 
                        placeholder="País" 
                        onChange={onChangeHandler} 
                        name="country" 
                        value={formData.country} 
                    />
                </div>
                <input 
                    required 
                    className="border border-gray-300 rounded py-1.5 px-3.5 w-full" 
                    type="text" 
                    placeholder="Telefone" 
                    onChange={onChangeHandler} 
                    name="phone" 
                    value={formData.phone} 
                />
            </div>

            {/* Right Side */}
            <div className="mt-8">
                <div className="mt-8 min-w-80">
                    <CartTotal />
                </div>
                
                {/* Calculadora de Frete */}
                <div className="mt-8">
                    <ShippingCalculator />
                </div>
                
                <div className="mt-12">
                    <Title text1="MÉTODO" text2="DE PAGAMENTO" />
                    
                    {/* Status do sistema de pagamento */}
                    {!isPaymentReady && (
                        <div className="mt-6 p-4 border border-red-300 rounded-lg bg-red-50 text-center">
                            <p className="text-red-700">Sistema de pagamento não disponível</p>
                            <p className="text-sm text-red-500 mt-1">Verifique a configuração da chave pública</p>
                        </div>
                    )}

                    {/* Carrinho vazio */}
                    {getCartAmount() === 0 && (
                        <div className="mt-6 p-4 border border-yellow-300 rounded-lg bg-yellow-50 text-center">
                            <p className="text-yellow-700">Adicione produtos ao carrinho para continuar</p>
                        </div>
                    )}

                    {/* Formulário não preenchido */}
                    {isPaymentReady && getCartAmount() > 0 && !preferenceId && (
                        <div className="mt-6 p-4 border border-blue-300 rounded-lg bg-blue-50">
                            <p className="text-blue-700 mb-3 text-center">Preencha seus dados e clique em "Finalizar Pedido" para ver as opções de pagamento</p>
                            
                            {/* Seletor de modo de pagamento */}
                            <div className="mb-4">
                                <p className="text-sm font-medium text-blue-800 mb-2">Escolha o tipo de checkout:</p>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMode"
                                            value="payment"
                                            checked={paymentMode === 'payment'}
                                            onChange={(e) => setPaymentMode(e.target.value)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-blue-700">Checkout Completo (PIX, Cartão, Boleto)</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMode"
                                            value="card"
                                            checked={paymentMode === 'card'}
                                            onChange={(e) => setPaymentMode(e.target.value)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-blue-700">Apenas Cartão</span>
                                    </label>
                                </div>
                            </div>
                            
                            <p className="text-sm text-blue-600 text-center">
                                {paymentMode === 'payment' 
                                    ? 'Métodos disponíveis: Cartão de Crédito/Débito, PIX, Boleto'
                                    : 'Checkout focado apenas em pagamentos com cartão'
                                }
                            </p>
                        </div>
                    )}

                    {/* Loading */}
                    {isLoading && (
                        <div className="mt-6 p-6 border rounded-lg bg-gray-50 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
                            <p className="text-gray-600">Carregando opções de pagamento...</p>
                        </div>
                    )}

                    {/* Payment Brick do MercadoPago */}
                    {(() => {
                        console.log('=== DEBUG CONDIÇÕES DE RENDERIZAÇÃO ===');
                        console.log('isPaymentReady:', isPaymentReady);
                        console.log('preferenceId:', preferenceId);
                        console.log('preferenceId válido:', !!preferenceId);
                        console.log('isLoading:', isLoading);
                        console.log('paymentMode:', paymentMode);
                        console.log('Condição completa:', isPaymentReady && preferenceId && !isLoading && paymentMode === 'payment');
                        return null;
                    })()}
                    {isPaymentReady && preferenceId && !isLoading && paymentMode === 'payment' && (
                        <div className="mt-6 p-4 border rounded-lg bg-white shadow-sm">
                            <h3 className="text-lg font-medium mb-4 text-center">Escolha sua forma de pagamento</h3>
                            {(() => {
                                console.log('=== DEBUG PAYMENT BRICK ===');
                                console.log('PreferenceId:', preferenceId);
                                console.log('PreferenceId é válido:', !!preferenceId && preferenceId !== 'undefined' && preferenceId !== 'null');
                                console.log('CartAmount:', getCartAmount());
                                console.log('DeliveryFee:', deliveryFee);
                                console.log('Total:', Number(getCartAmount() || 0) + Number(deliveryFee || 0));
                                console.log('Payment Brick usa preferenceId E amount (ambos obrigatórios)');
                                return null;
                            })()}
                            <Payment
                                initialization={{
                                    amount: Number(getCartAmount() || 0) + Number(deliveryFee || 0),
                                    preferenceId: preferenceId,
                                    payer: {
                                        email: formData.email || "cliente@example.com"
                                    }
                                }}
                                customization={{
                                    paymentMethods: {
                                        creditCard: "all",
                                        debitCard: "all", 
                                        ticket: "all",
                                        bankTransfer: "all",
                                        atm: "all"
                                    },
                                    visual: {
                                        style: {
                                            theme: "default"
                                        }
                                    }
                                }}
                                onSubmit={async ({ selectedPaymentMethod, formData: paymentFormData }) => {
                                    console.log("=== PAYMENT BRICK ONSUBMIT EXECUTADO ===");
                                    console.log("Método de pagamento:", selectedPaymentMethod);
                                    console.log("Dados do pagamento:", paymentFormData);
                                    
                                    try {
                                        console.log("Iniciando processamento do pagamento...");
                                        
                                        // Verificar se o carrinho não está vazio
                                        const cartAmount = getCartAmount();
                                        console.log("CartAmount calculado:", cartAmount);
                                        
                                        if (cartAmount === 0) {
                                            toast.error('Carrinho vazio. Adicione produtos antes de finalizar o pedido.');
                                            return;
                                        }
                                        
                                        // Verificar se o token está presente
                                        if (!token) {
                                            toast.error('Você precisa estar logado para finalizar o pedido.');
                                            navigate('/login');
                                            return;
                                        }
                                        
                                        // Preparar items do carrinho
                                        const orderItems = [];
                                        for (const items in cartItems) {
                                            for (const item in cartItems[items]) {
                                                if (cartItems[items][item] > 0) {
                                                    const itemInfo = products.find((product) => product._id === items);
                                                    if (itemInfo) {
                                                        orderItems.push({
                                                            _id: items,
                                                            name: itemInfo.name,
                                                            price: itemInfo.price,
                                                            quantity: cartItems[items][item],
                                                            size: item
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                        
                                        if (orderItems.length === 0) {
                                            toast.error('Nenhum item válido encontrado no carrinho.');
                                            return;
                                        }
                                        
                                        // Calcular valor total
                                        const totalAmount = cartAmount + deliveryFee;
                                        
                                        // Processar o pagamento
                                        const orderData = {
                                            items: orderItems,
                                            amount: totalAmount,
                                            address: formData,
                                            paymentData: {
                                                ...paymentFormData,
                                                selectedPaymentMethod: selectedPaymentMethod,
                                                preferenceId: preferenceId
                                            },
                                            paymentMethod: 'mercadopago'
                                        };

                                        console.log("=== DEBUG DADOS DO PEDIDO ===");
                                        console.log("CartAmount:", cartAmount);
                                        console.log("DeliveryFee:", deliveryFee);
                                        console.log("TotalAmount:", totalAmount);
                                        console.log("OrderItems count:", orderItems.length);
                                        console.log("OrderData completo:", orderData);
                                        console.log("Token presente:", !!token);

                                        const response = await axios.post(backendUrl + "/api/order/place", orderData, {
                                            headers: { token }
                                        });

                                        console.log("Resposta do backend:", response.data);

                                        if (response.data.success) {
                                            console.log("Pagamento processado com sucesso!");
                                            setCartItems({});
                                            navigate('/orders');
                                            toast.success('Pedido realizado com sucesso!');
                                        } else {
                                            console.error("Erro na resposta do backend:", response.data);
                                            toast.error('Erro ao processar pedido: ' + (response.data.message || 'Erro desconhecido'));
                                        }
                                    } catch (error) {
                                        console.error('Erro ao processar pedido:', error);
                                        console.error('Detalhes do erro:', error.response?.data);
                                        toast.error('Erro ao processar pedido: ' + (error.response?.data?.message || error.message));
                                    }
                                }}
                                onError={(error) => {
                                    console.error("Erro no Payment Brick:", error);
                                    toast.error("Erro no pagamento: " + (error.message || "Erro desconhecido"));
                                }}
                                onReady={() => {
                                    console.log("Payment Brick carregado com sucesso");
                                }}
                            />
                        </div>
                    )}

                    {/* Card Payment Brick do MercadoPago */}
                    {isPaymentReady && !isLoading && paymentMode === 'card' && getCartAmount() > 0 && (
                        <div className="mt-6 p-4 border rounded-lg bg-white shadow-sm">
                            <h3 className="text-lg font-medium mb-4 text-center">Pagamento com Cartão</h3>
                            {(() => {
                                const cartAmount = Number(getCartAmount() || 0);
                                const delivery = Number(deliveryFee || 0);
                                const totalAmount = cartAmount + delivery;
                                
                                console.log('=== DEBUG CARDPAYMENT AMOUNT ===');
                                console.log('CartAmount original:', getCartAmount());
                                console.log('CartAmount convertido:', cartAmount);
                                console.log('DeliveryFee original:', deliveryFee);
                                console.log('DeliveryFee convertido:', delivery);
                                console.log('Total Amount:', totalAmount);
                                console.log('Total Amount é número válido:', !isNaN(totalAmount) && totalAmount > 0);
                                console.log('CardPayment Brick EXIGE amount como número');
                                
                                return null;
                            })()}
                            <CardPayment
                                initialization={{
                                    amount: Number(getCartAmount() || 0) + Number(deliveryFee || 0)
                                }}
                                customization={{
                                    visual: {
                                        style: {
                                            theme: "default"
                                        }
                                    }
                                }}
                                onSubmit={async (param) => {
                                    console.log("Dados do cartão:", param);
                                    
                                    try {
                                        // Processar pagamento direto com cartão
                                        const paymentData = {
                                            token: param.token,
                                            issuer_id: param.issuer_id,
                                            payment_method_id: param.payment_method_id,
                                            transaction_amount: Number(getCartAmount() || 0) + Number(deliveryFee || 0),
                                            installments: param.installments,
                                            payer: {
                                                email: formData.email,
                                                identification: {
                                                    type: param.payer.identification.type,
                                                    number: param.payer.identification.number,
                                                },
                                            },
                                        };

                                        const response = await axios.post(backendUrl + "/api/mercadopago/process-payment", paymentData);

                                        if (response.data.success) {
                                            // Preparar itens do carrinho
                                            const orderItems = [];
                                            for (const itemId in cartItems) {
                                                for (const size in cartItems[itemId]) {
                                                    if (cartItems[itemId][size] > 0) {
                                                        const itemInfo = products.find(product => product._id === itemId);
                                                        if (itemInfo) {
                                                            orderItems.push({
                                                                ...itemInfo,
                                                                size,
                                                                quantity: cartItems[itemId][size]
                                                            });
                                                        }
                                                    }
                                                }
                                            }

                                            // Criar pedido após pagamento aprovado
                                            const orderData = {
                                                items: orderItems,
                                                amount: Number(getCartAmount() || 0) + Number(deliveryFee || 0),
                                                address: formData,
                                                paymentMethod: 'mercadopago',
                                                paymentData: {
                                                    paymentId: response.data.id,
                                                    status: response.data.status,
                                                    paymentMethod: 'card'
                                                },
                                            };

                                            console.log("=== DEBUG CARDPAYMENT ORDER DATA ===");
                                            console.log("OrderItems count:", orderItems.length);
                                            console.log("OrderData completo:", orderData);

                                            const orderResponse = await axios.post(backendUrl + "/api/order/place", orderData, {
                                                headers: { token }
                                            });

                                            if (orderResponse.data.success) {
                                                setCartItems({});
                                                navigate('/orders');
                                                toast.success('Pagamento aprovado e pedido criado!');
                                            } else {
                                                toast.error('Pagamento aprovado, mas erro ao criar pedido');
                                            }
                                        } else {
                                            toast.error('Pagamento rejeitado');
                                        }
                                    } catch (error) {
                                        console.error('Erro no pagamento:', error);
                                        toast.error('Erro ao processar pagamento');
                                    }
                                }}
                                onError={(error) => {
                                    console.error("Erro no CardPayment:", error);
                                    toast.error("Erro no pagamento com cartão");
                                }}
                                onReady={() => {
                                    console.log("CardPayment Brick carregado com sucesso");
                                }}
                            />
                        </div>
                    )}

                    {/* Botão para formulário não preenchido ou carrinho vazio */}
                    {(!preferenceId && !isLoading) && (
                        <div className="w-full text-end mt-8">
                            <button 
                                type="submit" 
                                disabled={!isPaymentReady || getCartAmount() === 0}
                                className={`px-16 py-3 text-sm transition-colors ${
                                    !isPaymentReady || getCartAmount() === 0
                                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                        : 'bg-black text-white hover:bg-gray-800'
                                }`}
                            >
                                FINALIZAR PEDIDO
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;
