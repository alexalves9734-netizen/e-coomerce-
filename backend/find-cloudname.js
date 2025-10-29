import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const findCorrectCloudName = async () => {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log("Tentando descobrir o cloud_name correto...");
  console.log("API Key:", apiKey);
  console.log("API Secret:", apiSecret ? "***" + apiSecret.slice(-4) : "undefined");

  // Lista de possíveis cloud names baseados nas informações fornecidas
  const possibleCloudNames = [
    "ifparfum",
    "if-parfum", 
    "ifparfum-store",
    "ifparfum-ecommerce",
    "ecommerce",
    "e-commerce",
    "ECommerce",
    "E-Commerce",
    "parfum",
    "parfum-store",
    "store",
    "loja",
    "perfume",
    "perfumes"
  ];

  for (const cloudName of possibleCloudNames) {
    try {
      console.log(`\nTestando cloud_name: "${cloudName}"`);
      
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      const result = await cloudinary.api.ping();
      console.log(`✓ SUCESSO! Cloud name correto encontrado: "${cloudName}"`);
      console.log("Resultado do ping:", result);
      return cloudName;
      
    } catch (error) {
      if (error.error && error.error.message) {
        console.log(`✗ Falhou: ${error.error.message}`);
      } else {
        console.log(`✗ Falhou: ${error.message || 'Erro desconhecido'}`);
      }
    }
  }

  console.log("\n❌ Nenhum cloud_name válido encontrado com essas credenciais.");
  console.log("Verifique se as credenciais API Key e API Secret estão corretas.");
};

findCorrectCloudName().catch(console.error);