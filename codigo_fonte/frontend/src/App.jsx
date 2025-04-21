import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/Login";
import CreateAccount from "@/pages/CreateAccount";
import ForgotPassword from "@/pages/ForgotPassword";
import SendRecoveryEmail from "@/pages/SendRecoveryEmail";
import ResetPassword from "@/pages/ResetPassword";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Cards from "@/pages/Cards";
import { RequireAuth } from "@/components/RequireAuth"; 

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/recovery-email-sent" element={<SendRecoveryEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Rotas protegidas */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        <Route
          path="/cards"
          element={
            <RequireAuth>
              <Cards />
            </RequireAuth>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;