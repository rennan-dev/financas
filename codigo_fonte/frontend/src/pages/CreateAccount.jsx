import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function CreateAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if(password !== confirmPassword) {
      window.alert("Erro: As senhas não coincidem");
      return;
    }

    if(!name || !email || !password) {
      window.alert("Erro: Por favor, preencha todos os campos");
      return;
    }

    try {
      const response = await fetch("http://localhost/api_financas/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, confirm_password: confirmPassword }),
      });
      const data = await response.json();
      if(data.status === "success") {
        window.alert("Conta criada com sucesso!");
        sessionStorage.setItem("user", JSON.stringify(data.user));
        navigate("/home");
      }else {
        window.alert("Erro: " + data.message);
      }
    }catch(error) {
      console.error("Erro ao criar conta:", error);
      window.alert("Erro: Ocorreu um erro ao criar a conta.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Criar Conta</h1>
          <p className="text-muted-foreground">
            Crie sua conta para começar a gerenciar suas finanças
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              placeholder="Seu nome"
              required
            />
          </div>
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
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Criar Conta
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default CreateAccount;