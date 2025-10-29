import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/resend-verification", resendVerificationCode);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

export default userRouter;