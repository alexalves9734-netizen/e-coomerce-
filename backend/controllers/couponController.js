import couponModel from "../models/couponModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

// Criar novo cupom (Admin)
const createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            minimumOrderValue,
            maximumDiscount,
            expirationDate,
            usageLimit,
            applicableProducts,
            applicableCategories
        } = req.body;

        // Validações básicas
        if (!code || !description || !discountType || !discountValue || !expirationDate) {
            return res.json({ success: false, message: "Dados obrigatórios não fornecidos" });
        }

        // Verificar se o código já existe
        const existingCoupon = await couponModel.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.json({ success: false, message: "Código de cupom já existe" });
        }

        // Validar data de expiração
        const expDate = new Date(expirationDate);
        if (expDate <= new Date()) {
            return res.json({ success: false, message: "Data de expiração deve ser futura" });
        }

        // Validar valor do desconto
        if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
            return res.json({ success: false, message: "Desconto percentual deve ser entre 1 e 100" });
        }

        if (discountType === 'fixed' && discountValue <= 0) {
            return res.json({ success: false, message: "Valor fixo deve ser maior que zero" });
        }

        const couponData = {
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue,
            minimumOrderValue: minimumOrderValue || 0,
            maximumDiscount,
            expirationDate: expDate,
            usageLimit,
            applicableProducts: applicableProducts || [],
            applicableCategories: applicableCategories || [],
            createdBy: req.body.userId
        };

        const coupon = new couponModel(couponData);
        await coupon.save();

        res.json({ success: true, message: "Cupom criado com sucesso", coupon });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Listar todos os cupons (Admin)
const listCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({})
            .populate('createdBy', 'name email')
            .populate('applicableProducts', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, coupons });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Obter cupom por ID (Admin)
const getCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;

        const coupon = await couponModel.findById(couponId)
            .populate('createdBy', 'name email')
            .populate('applicableProducts', 'name price')
            .populate('usedBy.userId', 'name email');

        if (!coupon) {
            return res.json({ success: false, message: "Cupom não encontrado" });
        }

        res.json({ success: true, coupon });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Validar cupom (Frontend)
const validateCoupon = async (req, res) => {
    try {
        const { code, orderValue, products } = req.body;
        const userId = req.body.userId;

        if (!code || !orderValue) {
            return res.json({ success: false, message: "Código do cupom e valor do pedido são obrigatórios" });
        }

        const coupon = await couponModel.findOne({ 
            code: code.toUpperCase() 
        }).populate('applicableProducts');

        if (!coupon) {
            return res.json({ success: false, message: "Cupom não encontrado" });
        }

        // Verificar se o usuário já usou este cupom (se houver limite por usuário)
        const userUsage = coupon.usedBy.filter(usage => 
            usage.userId.toString() === userId
        );

        // Por enquanto, permitir apenas um uso por usuário
        if (userUsage.length > 0) {
            return res.json({ success: false, message: "Você já utilizou este cupom" });
        }

        // Validar cupom
        const validation = coupon.isValid();
        if (!validation.valid) {
            return res.json({ success: false, message: validation.message });
        }

        // Calcular desconto
        const discountResult = coupon.calculateDiscount(orderValue, products || []);
        
        if (discountResult.discount === 0) {
            return res.json({ success: false, message: discountResult.message });
        }

        res.json({ 
            success: true, 
            message: "Cupom válido",
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            },
            discount: discountResult.discount,
            finalValue: orderValue - discountResult.discount
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Aplicar cupom (usado durante o checkout)
const applyCoupon = async (req, res) => {
    try {
        const { couponId, orderId, orderValue } = req.body;
        const userId = req.body.userId;

        const coupon = await couponModel.findById(couponId);
        if (!coupon) {
            return res.json({ success: false, message: "Cupom não encontrado" });
        }

        // Validar cupom novamente
        const validation = coupon.isValid();
        if (!validation.valid) {
            return res.json({ success: false, message: validation.message });
        }

        // Registrar uso do cupom
        coupon.usedBy.push({
            userId: userId,
            orderId: orderId,
            usedAt: new Date()
        });

        coupon.usedCount += 1;
        await coupon.save();

        const discountResult = coupon.calculateDiscount(orderValue);

        res.json({ 
            success: true, 
            message: "Cupom aplicado com sucesso",
            discount: discountResult.discount
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Atualizar cupom (Admin)
const updateCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        const updateData = req.body;

        // Remover campos que não devem ser atualizados
        delete updateData.usedCount;
        delete updateData.usedBy;
        delete updateData.createdBy;

        // Se estiver atualizando o código, verificar se já existe
        if (updateData.code) {
            const existingCoupon = await couponModel.findOne({ 
                code: updateData.code.toUpperCase(),
                _id: { $ne: couponId }
            });
            if (existingCoupon) {
                return res.json({ success: false, message: "Código de cupom já existe" });
            }
            updateData.code = updateData.code.toUpperCase();
        }

        // Validar data de expiração se fornecida
        if (updateData.expirationDate) {
            const expDate = new Date(updateData.expirationDate);
            if (expDate <= new Date()) {
                return res.json({ success: false, message: "Data de expiração deve ser futura" });
            }
            updateData.expirationDate = expDate;
        }

        const coupon = await couponModel.findByIdAndUpdate(
            couponId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!coupon) {
            return res.json({ success: false, message: "Cupom não encontrado" });
        }

        res.json({ success: true, message: "Cupom atualizado com sucesso", coupon });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Deletar cupom (Admin)
const deleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;

        const coupon = await couponModel.findByIdAndDelete(couponId);
        if (!coupon) {
            return res.json({ success: false, message: "Cupom não encontrado" });
        }

        res.json({ success: true, message: "Cupom deletado com sucesso" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Obter cupons ativos (Frontend)
const getActiveCoupons = async (req, res) => {
    try {
        const now = new Date();
        
        const coupons = await couponModel.find({
            isActive: true,
            expirationDate: { $gt: now },
            $or: [
                { usageLimit: null },
                { $expr: { $lt: ["$usedCount", "$usageLimit"] } }
            ]
        }).select('code description discountType discountValue minimumOrderValue expirationDate');

        res.json({ success: true, coupons });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    createCoupon, 
    listCoupons, 
    getCoupon, 
    validateCoupon, 
    applyCoupon, 
    updateCoupon, 
    deleteCoupon,
    getActiveCoupons 
};