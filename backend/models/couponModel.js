import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    description: {
        type: String,
        required: true,
        maxlength: 200
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minimumOrderValue: {
        type: Number,
        default: 0,
        min: 0
    },
    maximumDiscount: {
        type: Number,
        default: null // Para cupons percentuais, limite máximo de desconto
    },
    expirationDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null // null = ilimitado
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }], // Se vazio, aplica a todos os produtos
    applicableCategories: [{
        type: String
    }], // Se vazio, aplica a todas as categorias
    usedBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        usedAt: {
            type: Date,
            default: Date.now
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'order'
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
});

// Índices para melhor performance
couponSchema.index({ code: 1 });
couponSchema.index({ expirationDate: 1 });
couponSchema.index({ isActive: 1 });

// Método para verificar se o cupom é válido
couponSchema.methods.isValid = function() {
    const now = new Date();
    
    // Verificar se está ativo
    if (!this.isActive) {
        return { valid: false, message: 'Cupom inativo' };
    }
    
    // Verificar se não expirou
    if (this.expirationDate < now) {
        return { valid: false, message: 'Cupom expirado' };
    }
    
    // Verificar limite de uso
    if (this.usageLimit && this.usedCount >= this.usageLimit) {
        return { valid: false, message: 'Limite de uso do cupom atingido' };
    }
    
    return { valid: true, message: 'Cupom válido' };
};

// Método para calcular desconto
couponSchema.methods.calculateDiscount = function(orderValue, products = []) {
    const validation = this.isValid();
    if (!validation.valid) {
        return { discount: 0, message: validation.message };
    }
    
    // Verificar valor mínimo do pedido
    if (orderValue < this.minimumOrderValue) {
        return { 
            discount: 0, 
            message: `Valor mínimo do pedido deve ser R$ ${this.minimumOrderValue.toFixed(2)}` 
        };
    }
    
    // Verificar produtos aplicáveis (se especificado)
    if (this.applicableProducts.length > 0) {
        const hasApplicableProduct = products.some(product => 
            this.applicableProducts.includes(product._id || product.productId)
        );
        if (!hasApplicableProduct) {
            return { 
                discount: 0, 
                message: 'Cupom não aplicável aos produtos do carrinho' 
            };
        }
    }
    
    // Verificar categorias aplicáveis (se especificado)
    if (this.applicableCategories.length > 0) {
        const hasApplicableCategory = products.some(product => 
            this.applicableCategories.includes(product.category)
        );
        if (!hasApplicableCategory) {
            return { 
                discount: 0, 
                message: 'Cupom não aplicável às categorias dos produtos' 
            };
        }
    }
    
    let discount = 0;
    
    if (this.discountType === 'percentage') {
        discount = (orderValue * this.discountValue) / 100;
        
        // Aplicar limite máximo se especificado
        if (this.maximumDiscount && discount > this.maximumDiscount) {
            discount = this.maximumDiscount;
        }
    } else if (this.discountType === 'fixed') {
        discount = Math.min(this.discountValue, orderValue);
    }
    
    return { 
        discount: Math.round(discount * 100) / 100, 
        message: 'Desconto aplicado com sucesso' 
    };
};

const couponModel = mongoose.models.coupon || mongoose.model('coupon', couponSchema);

export default couponModel;