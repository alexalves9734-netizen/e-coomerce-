import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { sendVerificationCodeEmail, sendPasswordResetEmail } from "../services/emailService.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Registrar usuário
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    // Validação de campos obrigatórios
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Todos os campos são obrigatórios" });
    }

    // Normalizar email (lowercase e trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Validação de email
    if (!validator.isEmail(normalizedEmail)) {
      return res.json({ success: false, message: "Digite um e-mail válido" });
    }

    // Validação de senha
    if (password.length < 8) {
      return res.json({ success: false, message: "A senha deve ter pelo menos 8 caracteres" });
    }

    // Verificar se usuário já existe (case-insensitive)
    const exists = await userModel.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
    });
    
    if (exists) {
      return res.json({ success: false, message: "Usuário já existe" });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar novo usuário
    const newUser = new userModel({
      name: name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Gerar código de verificação
    const verificationCode = newUser.generateVerificationCode();

    // Salvar usuário
    const user = await newUser.save();

    // Enviar email de verificação
    const emailResult = await sendVerificationCodeEmail(
      { name: user.name, email: user.email }, 
      verificationCode
    );

    if (!emailResult.success) {
      console.error('Erro ao enviar email de verificação:', emailResult.error);
      // Não falhar o registro se o email não for enviado
    }

    // Criar token JWT
    const token = createToken(user._id);

    res.json({ 
      success: true, 
      token,
      message: "Usuário registrado com sucesso! Verifique seu email para ativar a conta.",
      requiresVerification: true
    });

  } catch (error) {
    console.log(error);
    
    // Tratamento específico para erro de duplicação do MongoDB
    if (error.code === 11000) {
      return res.json({ success: false, message: "Usuário já existe" });
    }
    
    // Tratamento para erros de validação do Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.json({ success: false, message: messages.join(', ') });
    }
    
    res.json({ success: false, message: "Erro interno do servidor" });
  }
};

// Verificar código de verificação
const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  
  try {
    // Validação de campos obrigatórios
    if (!email || !code) {
      return res.json({ success: false, message: "Email e código são obrigatórios" });
    }

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();

    // Buscar usuário
    const user = await userModel.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
    });

    if (!user) {
      return res.json({ success: false, message: "Usuário não encontrado" });
    }

    // Verificar código
    const verificationResult = user.verifyCode(code);
    
    if (!verificationResult.success) {
      await user.save(); // Salvar tentativas de verificação
      return res.json(verificationResult);
    }

    // Salvar usuário verificado
    await user.save();

    res.json({ 
      success: true, 
      message: "Email verificado com sucesso! Sua conta está ativa." 
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Erro interno do servidor" });
  }
};

// Reenviar código de verificação
const resendVerificationCode = async (req, res) => {
  const { email } = req.body;
  
  try {
    // Validação de campo obrigatório
    if (!email) {
      return res.json({ success: false, message: "Email é obrigatório" });
    }

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();

    // Buscar usuário
    const user = await userModel.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
    });

    if (!user) {
      return res.json({ success: false, message: "Usuário não encontrado" });
    }

    if (user.isVerified) {
      return res.json({ success: false, message: "Email já verificado" });
    }

    // Gerar novo código
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // Enviar email
    const emailResult = await sendVerificationCodeEmail(
      { name: user.name, email: user.email }, 
      verificationCode
    );

    if (!emailResult.success) {
      return res.json({ success: false, message: "Erro ao enviar email" });
    }

    res.json({ 
      success: true, 
      message: "Novo código de verificação enviado para seu email" 
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Erro interno do servidor" });
  }
};

// Login do usuário
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validação de campos obrigatórios
    if (!email || !password) {
      return res.json({ success: false, message: "Email e senha são obrigatórios" });
    }

    // Normalizar email (lowercase e trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Buscar usuário (case-insensitive)
    const user = await userModel.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
    });
    
    if (!user) {
      return res.json({ success: false, message: "Usuário não existe" });
    }

    // Verificar se o email foi verificado
    if (!user.isVerified) {
      return res.json({ 
        success: false, 
        message: "Email não verificado. Verifique seu email antes de fazer login.",
        requiresVerification: true 
      });
    }

    // Verificar senha
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Credenciais inválidas" });
    }

    // Criar token JWT
    const token = createToken(user._id);
    res.json({ success: true, token });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Erro interno do servidor" });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);

      res.json({ success: true, token });
    } else {
      res.json({
        success: false,
        message: "Credenciais inválidas",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Solicitar recuperação de senha
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Validação de email
    if (!email) {
      return res.json({ success: false, message: "Email é obrigatório" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!validator.isEmail(normalizedEmail)) {
      return res.json({ success: false, message: "Digite um e-mail válido" });
    }

    // Verificar se usuário existe
    const user = await userModel.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
    });

    if (!user) {
      return res.json({ success: false, message: "Usuário não encontrado" });
    }

    // Gerar código de recuperação (6 dígitos)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Salvar código no usuário
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpiry = resetCodeExpiry;
    await user.save();

    // Enviar email com código
    await sendPasswordResetEmail(user.email, user.name, resetCode);

    res.json({ 
      success: true, 
      message: "Código de recuperação enviado para seu email" 
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Redefinir senha com código
const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    // Validações
    if (!email || !code || !newPassword) {
      return res.json({ success: false, message: "Todos os campos são obrigatórios" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!validator.isEmail(normalizedEmail)) {
      return res.json({ success: false, message: "Digite um e-mail válido" });
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: "A nova senha deve ter pelo menos 8 caracteres" });
    }

    // Verificar usuário e código
    const user = await userModel.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') },
      resetPasswordCode: code,
      resetPasswordExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.json({ 
        success: false, 
        message: "Código inválido ou expirado" 
      });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Atualizar senha e limpar código
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ 
      success: true, 
      message: "Senha redefinida com sucesso" 
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export { loginUser, registerUser, verifyEmail, resendVerificationCode, adminLogin, forgotPassword, resetPassword };
