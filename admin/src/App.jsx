import React, { Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
const Add = lazy(() => import("./pages/Add"));
const List = lazy(() => import("./pages/List"));
const Orders = lazy(() => import("./pages/Orders"));
const Deliveries = lazy(() => import("./pages/Deliveries"));
const FreightRegions = lazy(() => import("./pages/FreightRegions"));
const Tracking = lazy(() => import("./pages/Tracking"));
import { useState } from "react";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "R$";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Suspense fallback={<div className="p-6">Carregando painel...</div>}>
                <Routes>
                  <Route path="/" element={<Navigate to="/add" replace />} />
                  <Route path="/add" element={<Add token={token} />} />
                  <Route path="/list" element={<List token={token} />} />
                  <Route path="/orders" element={<Orders token={token} />} />
                  <Route path="/deliveries" element={<Deliveries token={token} />} />
                  <Route path="/freight-regions" element={<FreightRegions token={token} />} />
                  <Route path="/tracking" element={<Tracking token={token} />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
