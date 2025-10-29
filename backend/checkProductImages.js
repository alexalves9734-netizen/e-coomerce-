import mongoose from 'mongoose';
import productModel from './models/productModel.js';

// Conectar ao banco de dados
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://ifparfum:345BtSxrKnyS8LLb@cluster0.vevbpum.mongodb.net/ecom?retryWrites=true&w=majority&appName=Cluster0');
        console.log("DB Connected");
    } catch (error) {
        console.log("DB Connection Error:", error);
    }
}

// Verificar produtos sem imagens
const checkProductImages = async () => {
    try {
        await connectDB();
        
        // Buscar todos os produtos
        const allProducts = await productModel.find({});
        console.log(`Total de produtos encontrados: ${allProducts.length}`);
        
        // Verificar produtos sem imagem ou com imagem vazia
        const productsWithoutImages = allProducts.filter(product => 
            !product.image || 
            product.image.length === 0 || 
            product.image.includes('placeholder') ||
            product.image.includes('via.placeholder')
        );
        
        console.log(`\nProdutos sem imagens adequadas: ${productsWithoutImages.length}`);
        
        if (productsWithoutImages.length > 0) {
            console.log('\nProdutos que precisam de imagens:');
            productsWithoutImages.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name} - Imagem atual: ${product.image}`);
            });
        } else {
            console.log('\nTodos os produtos têm imagens adequadas!');
        }
        
        // Verificar tamanhos das imagens
        console.log('\n--- Verificando URLs das imagens ---');
        const imageUrls = allProducts.map(product => product.image).filter(img => img);
        const uniqueImages = [...new Set(imageUrls)];
        
        console.log(`Total de URLs de imagens únicas: ${uniqueImages.length}`);
        uniqueImages.forEach((url, index) => {
            console.log(`${index + 1}. ${url}`);
        });
        
        mongoose.connection.close();
        
    } catch (error) {
        console.error('Erro ao verificar produtos:', error);
        mongoose.connection.close();
    }
}

checkProductImages();