import crypto from "crypto";

export const validateSignature = (req, res, next) => {
  try {
    const signature = req.headers["x-signature"];
    const payload = JSON.stringify(req.body);

    // Se não há signature no header, pular validação (para desenvolvimento)
    if (!signature) {
      console.log("⚠️ Webhook sem signature - pulando validação");
      return next();
    }

    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    
    if (!webhookSecret || webhookSecret === "your_webhook_secret_here") {
      console.log("⚠️ MERCADOPAGO_WEBHOOK_SECRET não configurado - pulando validação");
      return next();
    }

    const hmac = crypto.createHmac("sha256", webhookSecret)
                      .update(payload)
                      .digest("hex");

    if (hmac !== signature) {
      console.log("❌ Invalid signature:", { expected: hmac, received: signature });
      return res.status(401).json({ success: false, message: "assinatura inválida" });
    }

    console.log("✅ Webhook signature válida");
    next();
  } catch (err) {
    console.error("❌ Erro na validação de signature:", err);
    return res.status(500).json({ success: false, message: "falha na validação da assinatura" });
  }
};