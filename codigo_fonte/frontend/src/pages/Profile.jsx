import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Profile() {
  const navigate = useNavigate();
  const [profileInfo, setProfileInfo] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost/api_financas/accounts/profile.php", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await response.json();
        if (data.status === "success") {
          setProfileInfo(data.user);
        } else {
          window.alert("Erro ao carregar perfil: " + data.message);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        window.alert("Erro: Não foi possível carregar os dados do perfil.");
      }
    };
    fetchProfile();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (newPassword !== confirmPassword) {
      window.alert("Erro: As novas senhas não coincidem");
      return;
    }

    try {
      const response = await fetch("http://localhost/api_financas/accounts/update_password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await response.json();
      if (data.status === "success") {
        window.alert("Senha alterada: " + data.message);
        e.target.reset();
      } else {
        window.alert("Erro: " + data.message);
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      window.alert("Erro: Ocorreu um erro ao alterar a senha.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("http://localhost/api_financas/accounts/delete_account.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (data.status === "success") {
        window.alert("Conta excluída: " + data.message);
        localStorage.clear();
        navigate("/login");
      } else {
        window.alert("Erro ao excluir conta: " + data.message);
      }
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      window.alert("Erro: Ocorreu um erro ao excluir a conta.");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-muted px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl bg-card/90 backdrop-blur-md border border-border rounded-2xl shadow-xl p-8 space-y-10"
        >
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Seu Perfil 👤</h2>
            <p className="text-muted-foreground text-sm">
              Visualize seus dados e gerencie sua senha
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Informações do usuário */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações Pessoais</h3>
              {profileInfo ? (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <Label className="text-foreground">Nome</Label>
                    <p>{profileInfo.name || "Sem nome"}</p>
                  </div>
                  <div>
                    <Label className="text-foreground">Email</Label>
                    <p>{profileInfo.email}</p>
                  </div>
                  <div>
                    <Label className="text-foreground">Data de Criação</Label>
                    <p>{profileInfo.created_at}</p>
                  </div>
                </div>
              ) : (
                <p>Carregando perfil...</p>
              )}
            </div>

            {/* Alteração de senha */}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <h3 className="font-semibold text-lg">Alterar Senha</h3>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input id="currentPassword" name="currentPassword" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input id="newPassword" name="newPassword" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required />
              </div>
              <Button type="submit" className="w-full transition-transform hover:scale-105">
                Atualizar Senha
              </Button>
            </form>
          </div>

          {/* Zona Perigosa */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-destructive mb-4">Zona Perigosa ⚠️</h3>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full"
            >
              Excluir Conta
            </Button>
          </div>
        </motion.div>

        {/* Modal de confirmação */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Conta</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir sua conta? Esta ação é irreversível.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default Profile;