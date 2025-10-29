#!/bin/bash
cd /home/clp/htdocs/app/backend/controllers
cp userController.js userController.js.backup
cat > userController.js << "EOF"
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Usuário não existe" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      if (!user.emailVerified) {
        return res.json({
          success: false,
          message: "Por favor, verifique seu email antes de fazer login",
        });
      }

      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Credenciais inválidas" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // checking user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Usuário já existe" });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Por favor, insira um email válido",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Por favor, insira uma senha forte",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      emailVerified: false,
    });

    const user = await newUser.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res.json({
      success: true,
      message: "Usuário criado com sucesso! Verifique seu email.",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
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

export {
  loginUser,
  registerUser,
  adminLogin,
};
EOF
pm2 restart ecommerce-backend
