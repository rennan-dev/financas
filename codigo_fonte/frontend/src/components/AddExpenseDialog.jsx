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
      date: formData.get("date"),
      paymentMethod: formData.get("paymentMethod"),
      //determina o tipo a partir do método selecionado, comparando pelo id
      paymentType: paymentMethods.find(
        (m) => m.id === parseInt(formData.get("paymentMethod"))
      ).type,
      installments: isCredit ? parseInt(formData.get("installments")) : 1
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
            <Label htmlFor="amount">Valor Total</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
            />
          </div>
          {isCredit && (
  <div className="space-y-2">
    <Label htmlFor="installments">Número de Parcelas</Label>
    <Input
      id="installments"
      name="installments"
      type="number"
      min="1"
      step="1"
      required
      placeholder="Ex: 1"
      className="text-black"
    />
  </div>
)}

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
            {isCredit ? "Adicionar Compra Parcelada" : "Adicionar Compra"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddExpenseDialog;