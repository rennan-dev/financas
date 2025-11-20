import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function EditExpenseDialog({ open, onOpenChange, onSave, paymentMethods, expense }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  useEffect(() => {
    if (expense) {
      setDescription(expense.description || "");
      
      setAmount(expense.total_amount || expense.amount || "");

      if (expense.expense_date) {
        try {
          const dateObj = typeof expense.expense_date === 'string' 
            ? new Date(expense.expense_date) 
            : expense.expense_date;
            
          const formattedDate = dateObj.toISOString().split("T")[0];
          setDate(formattedDate);
        } catch (e) {
          console.error("Erro ao formatar data", e);
          setDate("");
        }
      }

      if (expense.payment_method_id) {
        setSelectedPaymentMethod(expense.payment_method_id.toString());
      }
    }
  }, [expense]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedExpense = {
      ...expense,
      description,
      amount: parseFloat(amount),
      date: date,
      payment_method_id: selectedPaymentMethod
    };

    onSave(updatedExpense);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Compra</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Valor</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-date">Data</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-paymentMethod">Método de Pagamento</Label>
            <Select
              value={selectedPaymentMethod}
              onValueChange={setSelectedPaymentMethod}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um método" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id.toString()}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Salvar Alterações
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditExpenseDialog;