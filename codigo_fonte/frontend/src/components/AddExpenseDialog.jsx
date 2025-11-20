import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function AddExpenseDialog({ open, onOpenChange, onAddExpense, paymentMethods, title, isCredit = false }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const expense = {
      description: formData.get("description"),
      amount: parseFloat(formData.get("amount")),
      date: new Date(formData.get("date") + "T00:00:00").toISOString().split("T")[0],
      paymentMethod: formData.get("paymentMethod"),
      // installments: isCredit ? parseInt(formData.get("installments")) : 1 // <-- ANTIGO
      installments: 1, // <-- MUDANÇA: Como o campo foi removido, enviamos 1
    };

    onAddExpense(expense);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="add-expense-description">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              required
              placeholder="Digite a descrição da despesa"
            />
          </div>
          <div className="space-y-2">
            {/* // <-- MUDANÇA: Label alterada */}
            <Label htmlFor="amount">Valor</Label> 
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
            />
          </div>

          {/* // <-- MUDANÇA: Bloco de parcelas removido */}
          {/* {isCredit && ( ... )} */}

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
            <Select
              id="paymentMethod"
              name="paymentMethod"
              value={selectedPaymentMethod}
              onValueChange={setSelectedPaymentMethod}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um método" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem
                    key={method.id}
                    value={method.id.toString()}
                  >
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            {/* // <-- MUDANÇA: Lógica do botão simplificada */}
            Adicionar Compra
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddExpenseDialog;