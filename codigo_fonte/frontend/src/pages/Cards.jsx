import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import UpdateBalanceDialog from "@/components/UpdateBalanceDialog";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatDate = (dateString) => {
  const dateObj = new Date(dateString.replace(" ", "T"));
  if (isNaN(dateObj)) return dateString;
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

function Cards() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Deletar
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Estados para Editar Saldo
  const [showUpdateBalance, setShowUpdateBalance] = useState(false);
  const [cardToEdit, setCardToEdit] = useState(null);

  const fetchPaymentMethods = () => {
    const user = sessionStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }
    const userObj = JSON.parse(user);
    fetch(`http://localhost/api_financas/getPaymentMethods.php?user_id=${userObj.id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          const methods = data.paymentMethods.map((method) => ({
            ...method,
            balance: parseFloat(method.balance),
          }));
          setCards(methods);
        } else {
          toast({
            title: "Erro ao buscar cartões",
            description: data.message,
            variant: "destructive",
          });
        }
        setLoading(false);
      })
      .catch(() => {
        toast({
          title: "Erro ao buscar cartões",
          description: "Ocorreu um erro ao buscar os cartões.",
          variant: "destructive",
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [navigate]);

  const promptDelete = (card) => {
    setSelectedCard(card);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedCard) return;
    fetch(`http://localhost/api_financas/deletePaymentMethod.php?id=${selectedCard.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ _method: "DELETE" }),
    })
      .then((response) => response.text())
      .then((text) => JSON.parse(text))
      .then((data) => {
        if (data.status === "success") {
          toast({
            title: "Cartão deletado",
            description: data.message,
          });
          setCards((prev) => prev.filter((c) => c.id !== selectedCard.id));
        } else {
          toast({
            title: "Erro ao deletar cartão",
            description: data.message,
            variant: "destructive",
          });
        }
      })
      .catch(() => {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao deletar o cartão.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setOpenDeleteDialog(false);
        setSelectedCard(null);
      });
  };

  // --- Lógica de Editar Saldo ---
  const handleOpenEdit = (card) => {
    setCardToEdit(card);
    setShowUpdateBalance(true);
  };

  const handleUpdateBalance = async (paymentMethodId, newBalance) => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) return;

    try {
      const response = await fetch("http://localhost/api_financas/updateBalance.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
            user_id: user.id, 
            payment_method_id: paymentMethodId, 
            newBalance 
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Erro na requisição");

      if (data.status === "success") {
        toast({ title: "Saldo atualizado", description: data.message });
        
        setCards((prevMethods) =>
            prevMethods.map((method) =>
              method.id === paymentMethodId
                ? { ...method, balance: newBalance }
                : method
            )
        );
        setShowUpdateBalance(false);
      } else {
        toast({
          title: "Erro ao atualizar saldo",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar saldo:", error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível atualizar o saldo.",
        variant: "destructive",
      });
    }
  };


  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <p className="text-muted-foreground">Carregando cartões...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-start px-4 py-10 bg-gradient-to-br from-primary/20 to-muted">
        <div className="w-full max-w-5xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Seus Cartões 💳</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Veja seus métodos de pagamento cadastrados
            </p>
          </div>

          {cards.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum cartão encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-card/90 backdrop-blur-md border border-border p-6 rounded-xl shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-semibold text-foreground">Nome:</span> {card.name}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">Saldo: </span> 
                      <span className="text-muted-foreground text-sm mt-1">
                         R$ {card.balance.toFixed(2)}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">Criado em:</span>{" "}
                      {formatDate(card.created_at)}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {/* Botão de Editar Saldo */}
                    <Button
                        variant="outline"
                        onClick={() => handleOpenEdit(card)}
                        className="h-8 flex-1 gap-2"
                    >
                        <Pencil className="h-4 w-4" />
                        Editar
                    </Button>

                    {/* Botão de Deletar */}
                    <Button
                        variant="destructive"
                        onClick={() => promptDelete(card)}
                        className="h-8 flex-1 gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dialog de Exclusão */}
        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Cartão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o cartão{" "}
                {selectedCard && <strong>{selectedCard.name}</strong>}? Esta ação não pode ser
                desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Deletar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Atualizar Saldo */}
        {showUpdateBalance && (
            <UpdateBalanceDialog
                open={showUpdateBalance}
                onOpenChange={setShowUpdateBalance}
                currentBalance={cardToEdit?.balance}
                selectedMethodId={cardToEdit?.id}
                onUpdateBalance={handleUpdateBalance}
                paymentMethods={cards}
            />
        )}
      </div>
    </Layout>
  );
}

export default Cards;