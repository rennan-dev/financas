import React from "react";
import { Navigate } from "react-router-dom";

export function RequireAuth({ children }) {
  const user = sessionStorage.getItem("user");

  if(!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}