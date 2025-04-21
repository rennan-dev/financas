import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    if (email && password) {
      try {
        const response = await fetch("http://localhost/api_financas/login.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.status === "success") {
          sessionStorage.setItem("user", JSON.stringify(data.user));
          navigate("/home");
        } else {
          window.alert("Erro: " + data.message);
        }
      } catch (error) {
        window.alert("Erro: Ocorreu um erro ao criar a conta.");
      }
    } else {
      window.alert("Por favor, preencha todos os campos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-muted px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 rounded-2xl bg-card/90 shadow-xl backdrop-blur-md border border-border space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo de volta 👋</h1>
          <p className="text-muted-foreground text-sm">Entre na sua conta para continuar</p>
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
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button
            type="submit"
            className="w-full transition-transform hover:scale-105"
          >
            Entrar
          </Button>
        </form>
        <div className="text-center space-y-2">
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Esqueceu sua senha?
          </Link>
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link
              to="/create-account"
              className="text-primary hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
