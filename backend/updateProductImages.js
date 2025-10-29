import mongoose from "mongoose";
import productModel from "./models/productModel.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connected");
  } catch (error) {
    console.log(error);
  }
};

const imageUrls = [
  "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=400&h=400&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&h=400&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=400&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1610465299996-30f240ac2b1c?w=400&h=400&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop&crop=center"
];

const updateProductImages = async () => {
  try {
    await connectDB();
    
    const products = await productModel.find({});
    console.log(`Encontrados ${products.length} produtos para atualizar`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const imageIndex = i % imageUrls.length; // Cicla através das imagens disponíveis
      
      await productModel.findByIdAndUpdate(product._id, {
        image: [imageUrls[imageIndex]]
      });
      
      console.log(`Produto ${product.name} atualizado com nova imagem`);
    }
    
    console.log("Todas as imagens dos produtos foram atualizadas com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("Erro ao atualizar imagens:", error);
    process.exit(1);
  }
};

updateProductImages();