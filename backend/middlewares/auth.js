import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  console.log("=== MIDDLEWARE AUTH USER ===");
  console.log("Headers recebidos:", req.headers);
  
  const { token } = req.headers;
  console.log("Token extraído:", token ? "Token presente" : "Token ausente");

  if (!token) {
    console.log("❌ Token não fornecido");
    return res.json({
      success: false,
      message: "Não Autorizado - Token ausente",
    });
  }

  try {
    console.log("Tentando verificar token com JWT_SECRET...");
    console.log("JWT_SECRET existe:", process.env.JWT_SECRET ? "Sim" : "Não");
    
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decodificado com sucesso:", tokenDecode);
    
    req.body.userId = tokenDecode.id;
    console.log("UserId adicionado ao req.body:", tokenDecode.id);
    
    next();
  } catch (error) {
    console.log("❌ Erro na verificação do token:", error.message);
    console.log("Tipo do erro:", error.name);
    
    res.json({
      success: false,
      message: `Falha na validação do token: ${error.message}`,
    });
  }
};

export default authUser;
