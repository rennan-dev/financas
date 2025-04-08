import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

function SendRecoveryEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg text-center"
      >
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Email Enviado</h1>
          <p className="text-muted-foreground">
            Enviamos um link para você redefinir sua senha. Por favor, verifique seu email.
          </p>
        </div>

        <Link to="/login">
          <Button className="w-full">
            Voltar para o login
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

export default SendRecoveryEmail;