import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../contexts/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const onSumbitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });
        if (response.data.success) {
          toast.success(response.data.message);
          setIsVerifying(true);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const onVerifyHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(backendUrl + "/api/user/verify-email", {
        email,
        code: verificationCode,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setIsVerifying(false);
        setCurrentState("Login");
        setVerificationCode("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const onResendCode = async () => {
    try {
      const response = await axios.post(
        backendUrl + "/api/user/resend-verification",
        { email }
      );
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const onForgotPasswordHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(backendUrl + "/api/user/forgot-password", {
        email,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setIsResetting(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const onResetPasswordHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(backendUrl + "/api/user/reset-password", {
        email,
        code: resetCode,
        newPassword,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setIsResetting(false);
        setCurrentState("Login");
        setResetCode("");
        setNewPassword("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  // Tela de verificação de email
  if (isVerifying) {
    return (
      <form
        onSubmit={onVerifyHandler}
        className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
      >
        <div className="inline-flex items-center gap-2 mb-2 mt-10">
          <p className="prata-regular text-3xl">Verificar Email</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>
        <p className="text-sm text-center text-gray-600 mb-4">
          Enviamos um código de verificação para <strong>{email}</strong>
        </p>
        <input
          onChange={(e) => setVerificationCode(e.target.value)}
          value={verificationCode}
          className="w-full px-3 py-2 border border-gray-800"
          type="text"
          placeholder="Digite o código de 6 dígitos"
          required
        />
        <button className="bg-black text-white font-light px-8 py-2 mt-4">
          Verificar
        </button>
        <div className="w-full flex justify-between text-sm mt-[-8px]">
          <p
            onClick={onResendCode}
            className="cursor-pointer text-blue-600 hover:underline"
          >
            Reenviar código
          </p>
          <p
            onClick={() => {
              setIsVerifying(false);
              setCurrentState("Login");
            }}
            className="cursor-pointer text-gray-600 hover:underline"
          >
            Voltar ao login
          </p>
        </div>
      </form>
    );
  }

  // Tela de recuperação de senha
  if (isResetting) {
    return (
      <form
        onSubmit={onResetPasswordHandler}
        className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
      >
        <div className="inline-flex items-center gap-2 mb-2 mt-10">
          <p className="prata-regular text-3xl">Redefinir Senha</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>
        <p className="text-sm text-center text-gray-600 mb-4">
          Enviamos um código de recuperação para <strong>{email}</strong>
        </p>
        <input
          onChange={(e) => setResetCode(e.target.value)}
          value={resetCode}
          className="w-full px-3 py-2 border border-gray-800"
          type="text"
          placeholder="Digite o código de 6 dígitos"
          required
        />
        <input
          onChange={(e) => setNewPassword(e.target.value)}
          value={newPassword}
          className="w-full px-3 py-2 border border-gray-800"
          type="password"
          placeholder="Nova senha (mín. 8 caracteres)"
          required
        />
        <button className="bg-black text-white font-light px-8 py-2 mt-4">
          Redefinir Senha
        </button>
        <div className="w-full flex justify-between text-sm mt-[-8px]">
          <p
            onClick={onForgotPasswordHandler}
            className="cursor-pointer text-blue-600 hover:underline"
          >
            Reenviar código
          </p>
          <p
            onClick={() => {
              setIsResetting(false);
              setCurrentState("Login");
            }}
            className="cursor-pointer text-gray-600 hover:underline"
          >
            Voltar ao login
          </p>
        </div>
      </form>
    );
  }

  // Tela principal de login/cadastro

  return (
    <form
      onSubmit={currentState === "Forgot Password" ? onForgotPasswordHandler : onSumbitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">
          {currentState === "Forgot Password" ? "Esqueci a Senha" : currentState}
        </p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === "Forgot Password" ? (
        <>
          <p className="text-sm text-center text-gray-600 mb-4">
            Digite seu email para receber um código de recuperação
          </p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="w-full px-3 py-2 border border-gray-800"
            type="email"
            placeholder="Email"
            required
          />
        </>
      ) : (
        <>
          {currentState === "Login" ? (
            ""
          ) : (
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              className="w-full px-3 py-2 border border-gray-800"
              type="text"
              placeholder="Name"
              required
            />
          )}
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="w-full px-3 py-2 border border-gray-800"
            type="email"
            placeholder="Email"
            required
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="w-full px-3 py-2 border border-gray-800"
            type="password"
            placeholder="Password"
            required
          />
        </>
      )}

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        {currentState === "Forgot Password" ? (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer"
          >
            Voltar ao Login
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Forgot Password")}
            className="cursor-pointer"
          >
            Esqueci a senha
          </p>
        )}
        {currentState === "Login" ? (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer"
          >
            Criar conta
          </p>
        ) : currentState === "Sign Up" ? (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer"
          >
            Fazer Login
          </p>
        ) : null}
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Login" ? "Entrar" : 
         currentState === "Sign Up" ? "Criar Conta" : 
         "Enviar Código"}
      </button>
    </form>
  );
};

export default Login;
