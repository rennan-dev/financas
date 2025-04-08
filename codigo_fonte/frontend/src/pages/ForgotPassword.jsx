import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ForgotPassword() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/recovery-email-sent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Recuperar Senha</h1>
          <p className="text-muted-foreground">
            Digite seu email para receber o link de recuperação
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Enviar Link de Recuperação
          </Button>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-primary hover:underline"
          >
            Voltar para o login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;