import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function UpdateBalanceDialog({ open, onOpenChange, currentBalance, methodName, selectedMethodId, onUpdateBalance, paymentMethods }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newBalance = parseFloat(formData.get("balance"));
    const paymentMethodId = parseInt(formData.get("method"), 10);
    onUpdateBalance(paymentMethodId, newBalance);
    onOpenChange(false);
  };

  const debitMethods = paymentMethods.filter(m => m.type !== 'credit');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atualizar Saldo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="method">Instituição</Label>
            <Select name="method" required defaultValue={selectedMethodId ? selectedMethodId.toString() : ""}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {debitMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id.toString()}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="balance">Novo Saldo</Label>
            <Input
              id="balance"
              name="balance"
              type="number"
              step="0.01"
              defaultValue={currentBalance}
              required
              placeholder="0.00"
            />
          </div>
          <Button type="submit" className="w-full">
            Atualizar Saldo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateBalanceDialog;