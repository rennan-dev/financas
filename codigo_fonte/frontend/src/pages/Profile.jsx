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
        if(data.status === "success") {
          setProfileInfo(data.user);
        }else {
          window.alert("Erro ao carregar perfil: " + data.message);
        }
      }catch(error) {
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

    if(newPassword !== confirmPassword) {
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
      if(data.status === "success") {
        window.alert("Senha alterada: " + data.message);
        e.target.reset();
      }else {
        window.alert("Erro: " + data.message);
      }
    }catch(error) {
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
      if(data.status === "success") {
        window.alert("Conta excluída: " + data.message);
        // Limpa os dados locais e redireciona para o login
        localStorage.clear();
        navigate("/login");
      }else {
        window.alert("Erro ao excluir conta: " + data.message);
      }
    }catch(error) {
      console.error("Erro ao excluir conta:", error);
      window.alert("Erro: Ocorreu um erro ao excluir a conta.");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto space-y-8"
        >
          <div>
            <h2 className="text-2xl font-bold">Perfil</h2>
            <p className="text-muted-foreground">Gerencie suas informações</p>
          </div>

          <div className="space-y-4">
            {profileInfo ? (
              <div className="space-y-2">
                <div>
                  <Label>Nome</Label>
                  <p className="text-muted-foreground">{profileInfo.name || "Sem nome"}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-muted-foreground">{profileInfo.email}</p>
                </div>
                <div>
                  <Label>Data de Criação</Label>
                  <p className="text-muted-foreground">{profileInfo.created_at}</p>
                </div>
              </div>
            ) : (
              <p>Carregando perfil...</p>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                />
              </div>
              <Button type="submit">Alterar Senha</Button>
            </form>

            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Zona Perigosa
              </h3>
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                Excluir Conta
              </Button>
            </div>
          </div>
        </motion.div>

        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Conta</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
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