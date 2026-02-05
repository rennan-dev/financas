import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function AddPaymentMethodDialog({ open, onOpenChange, onAddPaymentMethod }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");

    // Captura o ID do usuário do sessionStorage
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (!user.id) {
      window.alert("Erro: Usuário não autenticado.");
      return;
    }

    const user_id = user.id;
    const methodData = { user_id, name };

    try {
      const response = await fetch("http://localhost/api_financas/addPaymentMethod.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(methodData),
      });

      const data = await response.json();

      if (data.status === "success") {
        window.alert(data.message);
        onAddPaymentMethod(data.paymentMethod);
        onOpenChange(false);
      } else {
        window.alert("Erro: " + data.message);
      }
    } catch (error) {
      console.error("Erro ao adicionar método de pagamento:", error);
      window.alert("Erro: Ocorreu um erro ao adicionar o método de pagamento.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="add-payment-method-description">
        <DialogHeader>
          <DialogTitle>Adicionar Método de Pagamento</DialogTitle>
        </DialogHeader>
        <p id="add-payment-method-description" className="text-sm text-muted-foreground">
          Insira o nome do método de pagamento.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Método</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Ex: Conta Nubank"
            />
          </div>

          <Button type="submit" className="w-full">
            Adicionar Método
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddPaymentMethodDialog;