import mongoose, { mongo } from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true }, // Preço base (para compatibilidade)
    image: { type: Array, required: true },
    brand: { type: String, default: "" },
    intensity: { type: String, default: "" },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    olfactiveFamily: { type: [String], default: [] },
    occasions: { type: [String], default: [] },
    notes: { type: [String], default: [] },
    sizes: { 
        type: Array, 
        required: true,
        default: []
        // Novo formato: [{ size: "5ML", price: 25 }, { size: "10ML", price: 45 }]
    },
    bestseller: { type: Boolean },
    date: { type: Number, required: true }
});

// Indexes to speed up common queries and sorts
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ bestseller: 1, date: -1 });
productSchema.index({ date: -1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', brand: 'text', subCategory: 'text', category: 'text' });

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
