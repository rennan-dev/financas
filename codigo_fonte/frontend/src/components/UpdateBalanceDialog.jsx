import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

function UpdateBalanceDialog({
  open,
  onOpenChange,
  currentBalance,
  selectedMethodId,
  onUpdateBalance,
  paymentMethods,
}) {
  // <-- sem <string> aqui
  const [method, setMethod] = useState(
    selectedMethodId ? selectedMethodId.toString() : ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!method) return; // só continua se escolheu algo

    // e.currentTarget é o <form>
    const formData = new FormData(e.currentTarget);
    const balanceValue = formData.get("balance");
    const newBalance = parseFloat(balanceValue || "0");
    const paymentMethodId = parseInt(method, 10);

    onUpdateBalance(paymentMethodId, newBalance);
    onOpenChange(false);
  };

  const debitMethods = paymentMethods.filter((m) => m.type !== "credit");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atualizar Saldo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="method">Instituição</Label>
            <Select
              id="method"
              name="method"
              value={method}
              onValueChange={setMethod}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {debitMethods.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.name}
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

          <Button type="submit" className="w-full" disabled={!method}>
            Atualizar Saldo
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateBalanceDialog;
