import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,  // Força o email a ser salvo em lowercase
      trim: true        // Remove espaços em branco
    },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    wishlist: { type: Array, default: [] },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    verificationCodeAttempts: { type: Number, default: 0 },
    resetPasswordCode: { type: String },
    resetPasswordExpiry: { type: Date }
  },
  { minimize: false }
);

// Índice único case-insensitive para email
userSchema.index({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

// Método para gerar código de verificação
userSchema.methods.generateVerificationCode = function() {
  // Gera código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = code;
  this.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
  this.verificationCodeAttempts = 0;
  return code;
};

// Método para verificar código
userSchema.methods.verifyCode = function(inputCode) {
  if (!this.verificationCode || !this.verificationCodeExpires) {
    return { success: false, message: 'Código de verificação não encontrado' };
  }

  if (new Date() > this.verificationCodeExpires) {
    return { success: false, message: 'Código de verificação expirado' };
  }

  if (this.verificationCodeAttempts >= 3) {
    return { success: false, message: 'Muitas tentativas. Solicite um novo código' };
  }

  if (this.verificationCode !== inputCode) {
    this.verificationCodeAttempts += 1;
    return { success: false, message: 'Código inválido' };
  }

  // Código válido
  this.isVerified = true;
  this.verificationCode = undefined;
  this.verificationCodeExpires = undefined;
  this.verificationCodeAttempts = 0;
  
  return { success: true, message: 'Email verificado com sucesso' };
};

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
