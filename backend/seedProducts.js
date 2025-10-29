import mongoose from "mongoose";
import productModel from "./models/productModel.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connected");
  } catch (error) {
    console.log("DB Connection Error:", error);
  }
};

const sampleProducts = [
  {
    name: "Oud Royal",
    description: "Um perfume luxuoso com notas de oud, âmbar e especiarias orientais. Perfeito para ocasiões especiais e noites elegantes.",
    price: 299,
    image: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&crop=center"],
    category: "Masculino",
    subCategory: "Oriental",
    sizes: ["50ml", "100ml"],
    bestseller: true,
    date: Date.now()
  },
  {
    name: "Rose Garden",
    description: "Delicada fragrância floral com pétalas de rosa búlgara, jasmim e um toque de baunilha. Ideal para o dia a dia.",
    price: 189,
    image: ["https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=400&h=400&fit=crop&crop=center"],
    category: "Feminino",
    subCategory: "Floral",
    sizes: ["30ml", "50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Citrus Fresh",
    description: "Explosão cítrica com bergamota, limão siciliano e laranja doce. Refrescante e energizante para qualquer momento.",
    price: 149,
    image: ["https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=center"],
    category: "Unissex",
    subCategory: "Cítrico",
    sizes: ["50ml", "100ml"],
    bestseller: true,
    date: Date.now()
  },
  {
    name: "Musk Sensual",
    description: "Fragrância envolvente com almíscar branco, sândalo e notas amadeiradas. Sedutora e marcante.",
    price: 259,
    image: ["https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&h=400&fit=crop&crop=center"],
    category: "Feminino",
    subCategory: "Oriental",
    sizes: ["50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Lavender Dreams",
    description: "Relaxante blend de lavanda francesa, camomila e cedro. Perfeito para momentos de tranquilidade.",
    price: 169,
    image: ["https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop&crop=center"],
    category: "Unissex",
    subCategory: "Aromático",
    sizes: ["30ml", "50ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Amber Nights",
    description: "Sofisticada composição com âmbar, patchouli e especiarias. Ideal para noites especiais e encontros românticos.",
    price: 329,
    image: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop&crop=center"],
    category: "Masculino",
    subCategory: "Oriental",
    sizes: ["50ml", "100ml"],
    bestseller: true,
    date: Date.now()
  },
  {
    name: "Vanilla Orchid",
    description: "Doce e elegante com baunilha de Madagascar, orquídea e um toque de caramelo. Feminina e envolvente.",
    price: 219,
    image: ["https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=400&fit=crop&crop=center"],
    category: "Feminino",
    subCategory: "Doce",
    sizes: ["30ml", "50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Ocean Breeze",
    description: "Fresco como a brisa marinha com notas aquáticas, sal marinho e algas. Revigorante e limpo.",
    price: 179,
    image: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center"],
    category: "Masculino",
    subCategory: "Aquático",
    sizes: ["50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Spice Market",
    description: "Exótica mistura de canela, cardamomo, noz-moscada e pimenta rosa. Quente e envolvente.",
    price: 239,
    image: ["https://images.unsplash.com/photo-1610465299996-30f240ac2b1c?w=400&h=400&fit=crop&crop=center"],
    category: "Unissex",
    subCategory: "Especiado",
    sizes: ["50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "White Tea",
    description: "Delicada e zen com chá branco, flor de lótus e bambu. Minimalista e sofisticada.",
    price: 199,
    image: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop&crop=center"],
    category: "Unissex",
    subCategory: "Aromático",
    sizes: ["30ml", "50ml"],
    bestseller: true,
    date: Date.now()
  },
  {
    name: "Black Pepper",
    description: "Intenso e masculino com pimenta preta, gengibre e madeira de cedro. Para homens decididos.",
    price: 279,
    image: ["https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=center"],
    category: "Masculino",
    subCategory: "Especiado",
    sizes: ["50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Cherry Blossom",
    description: "Romântica e delicada com flores de cerejeira, peônia e almíscar suave. Primaveril e feminina.",
    price: 189,
    image: ["https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop&crop=center"],
    category: "Feminino",
    subCategory: "Floral",
    sizes: ["30ml", "50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Tobacco Leather",
    description: "Robusto e elegante com tabaco, couro e rum. Masculinidade refinada em cada borrifo.",
    price: 349,
    image: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&crop=center"],
    category: "Masculino",
    subCategory: "Amadeirado",
    sizes: ["50ml", "100ml"],
    bestseller: true,
    date: Date.now()
  },
  {
    name: "Jasmine Night",
    description: "Intoxicante e sensual com jasmim sambac, tuberosa e sândalo. Para noites inesquecíveis.",
    price: 269,
    image: ["https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&h=400&fit=crop&crop=center"],
    category: "Feminino",
    subCategory: "Floral",
    sizes: ["50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Green Apple",
    description: "Jovem e vibrante com maçã verde, folhas de violeta e almíscar branco. Fresco e moderno.",
    price: 159,
    image: ["https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=center"],
    category: "Unissex",
    subCategory: "Frutal",
    sizes: ["30ml", "50ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Sandalwood Mystic",
    description: "Espiritual e calmante com sândalo indiano, incenso e mirra. Meditativo e profundo.",
    price: 309,
    image: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop&crop=center"],
    category: "Unissex",
    subCategory: "Amadeirado",
    sizes: ["50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Pink Grapefruit",
    description: "Energizante e alegre com toranja rosa, bergamota e folhas de groselha preta. Vitalidade pura.",
    price: 169,
    image: ["https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=400&h=400&fit=crop&crop=center"],
    category: "Feminino",
    subCategory: "Cítrico",
    sizes: ["30ml", "50ml", "100ml"],
    bestseller: true,
    date: Date.now()
  },
  {
    name: "Vetiver Earth",
    description: "Terroso e sofisticado com vetiver haitiano, musgo de carvalho e patchouli. Natureza em estado puro.",
    price: 289,
    image: ["https://images.unsplash.com/photo-1610465299996-30f240ac2b1c?w=400&h=400&fit=crop&crop=center"],
    category: "Masculino",
    subCategory: "Amadeirado",
    sizes: ["50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Coconut Paradise",
    description: "Tropical e cremoso com coco, monoí e flores de tiaré. Escape para o paraíso.",
    price: 199,
    image: ["https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=400&fit=crop&crop=center"],
    category: "Feminino",
    subCategory: "Tropical",
    sizes: ["50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Mint Mojito",
    description: "Refrescante e vivificante com hortelã, lima e rum branco. Verão em cada aplicação.",
    price: 149,
    image: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop&crop=center"],
    category: "Unissex",
    subCategory: "Aromático",
    sizes: ["30ml", "50ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Golden Honey",
    description: "Doce e reconfortante com mel de acácia, propólis e cera de abelha. Aconchegante e nutritivo.",
    price: 229,
    image: ["https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=400&h=400&fit=crop&crop=center"],
    category: "Feminino",
    subCategory: "Doce",
    sizes: ["30ml", "50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Storm Cloud",
    description: "Dramático e intenso com ozônio, chuva e madeiras molhadas. Força da natureza.",
    price: 259,
    image: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center"],
    category: "Masculino",
    subCategory: "Aquático",
    sizes: ["50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Peach Velvet",
    description: "Suave e aveludado com pêssego, damasco e almíscar rosado. Delicadeza feminina.",
    price: 179,
    image: ["https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=400&fit=crop&crop=center"],
    category: "Feminino",
    subCategory: "Frutal",
    sizes: ["30ml", "50ml", "100ml"],
    bestseller: true,
    date: Date.now()
  },
  {
    name: "Cedar Forest",
    description: "Robusto e natural com cedro do Atlas, pinho e resinas. Caminhada pela floresta.",
    price: 249,
    image: ["https://images.unsplash.com/photo-1610465299996-30f240ac2b1c?w=400&h=400&fit=crop&crop=center"],
    category: "Masculino",
    subCategory: "Amadeirado",
    sizes: ["50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Iris Powder",
    description: "Elegante e sofisticado com íris florentina, violeta e pó de arroz. Clássico atemporal.",
    price: 319,
    image: ["https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&h=400&fit=crop&crop=center"],
    category: "Feminino",
    subCategory: "Floral",
    sizes: ["50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Coffee Bean",
    description: "Energizante e viciante com grãos de café torrados, chocolate amargo e baunilha. Despertar dos sentidos.",
    price: 209,
    image: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop&crop=center"],
    category: "Unissex",
    subCategory: "Gourmand",
    sizes: ["30ml", "50ml"],
    bestseller: true,
    date: Date.now()
  },
  {
    name: "Moonlight Musk",
    description: "Misterioso e sedutor com almíscar lunar, lírio branco e madeira de lua. Magia noturna.",
    price: 279,
    image: ["https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop&crop=center"],
    category: "Feminino",
    subCategory: "Oriental",
    sizes: ["50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Bergamot Sunrise",
    description: "Radiante e otimista com bergamota da Calábria, neroli e madeira clara. Novo amanhecer.",
    price: 189,
    image: ["https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=center"],
    category: "Unissex",
    subCategory: "Cítrico",
    sizes: ["30ml", "50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  },
  {
    name: "Wild Rose",
    description: "Selvagem e apaixonante com rosa damascena, espinhos e terra úmida. Amor em estado bruto.",
    price: 299,
    image: ["https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=400&h=400&fit=crop&crop=center"],
    category: "Feminino",
    subCategory: "Floral",
    sizes: ["50ml", "100ml"],
    bestseller: true,
    date: Date.now()
  },
  {
    name: "Sage Wisdom",
    description: "Sábio e contemplativo com sálvia, tomilho e madeiras ancestrais. Conhecimento ancestral.",
    price: 239,
    image: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop&crop=center"],
    category: "Unissex",
    subCategory: "Aromático",
    sizes: ["50ml", "100ml"],
    bestseller: false,
    date: Date.now()
  }
];

const seedProducts = async () => {
  try {
    await connectDB();
    
    // Limpar produtos existentes (opcional)
    // await productModel.deleteMany({});
    // console.log("Produtos existentes removidos");
    
    // Inserir novos produtos
    await productModel.insertMany(sampleProducts);
    console.log("30 produtos de teste inseridos com sucesso!");
    
    process.exit(0);
  } catch (error) {
    console.error("Erro ao inserir produtos:", error);
    process.exit(1);
  }
};

seedProducts();