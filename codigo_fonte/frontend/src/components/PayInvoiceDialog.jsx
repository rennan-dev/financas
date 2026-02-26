import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function PayInvoiceDialog({ open, onOpenChange, paymentMethods, onConfirmPayment }) {
  const [targetCardId, setTargetCardId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payingMethodId, setPayingMethodId] = useState("");
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Busca o valor da fatura sempre que cartão, mês ou ano mudam
  useEffect(() => {
    if (open && targetCardId) {
      fetchInvoiceTotal();
    } else {
        setInvoiceTotal(0);
    }
  }, [targetCardId, selectedMonth, selectedYear, open]);

  const fetchInvoiceTotal = async () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost/api_financas/getInvoiceTotal.php?user_id=${user.id}&card_id=${targetCardId}&month=${selectedMonth}&year=${selectedYear}`,
        { credentials: "include" }
      );
      const data = await response.json();
      if (data.status === "success") {
        setInvoiceTotal(data.total);
      }
    } catch (error) {
      console.error("Erro ao buscar fatura:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (!payingMethodId || invoiceTotal <= 0) return;

    // Encontra o nome do cartão para a descrição
    const cardName = paymentMethods.find(p => p.id.toString() === targetCardId.toString())?.name || "Cartão";
    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('pt-BR', { month: 'long' });

    const payload = {
      description: `Fatura ${cardName} - ${monthName}/${selectedYear}`,
      amount: invoiceTotal,
      date: new Date().toISOString().split('T')[0], // Paga hoje
      payment_method_id: payingMethodId, // Quem paga
      payment_type: 'invoice_payment',
      invoice_card_id: targetCardId,
      invoice_month: selectedMonth,
      invoice_year: selectedYear
    };

    onConfirmPayment(payload);
    onOpenChange(false);
    setInvoiceTotal(0);
    setTargetCardId("");
  };

  const months = [
    { value: 1, label: "Janeiro" }, { value: 2, label: "Fevereiro" }, { value: 3, label: "Março" },
    { value: 4, label: "Abril" }, { value: 5, label: "Maio" }, { value: 6, label: "Junho" },
    { value: 7, label: "Julho" }, { value: 8, label: "Agosto" }, { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" }, { value: 11, label: "Novembro" }, { value: 12, label: "Dezembro" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pagar Fatura de Cartão</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          
          {/* Selecionar Cartão da Fatura */}
          <div className="grid gap-2">
            <Label>Cartão da Fatura</Label>
            <Select value={targetCardId} onValueChange={setTargetCardId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cartão..." />
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

          {/* Selecionar Mês de Referência */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label>Mês</Label>
                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label>Ano</Label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
                </Select>
            </div>
          </div>

          {/* Exibir Total */}
          <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
             <span className="text-sm font-medium">Total da Fatura:</span>
             {loading ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
             ) : (
                 <span className="text-xl font-bold text-primary">R$ {invoiceTotal.toFixed(2)}</span>
             )}
          </div>

          {/* Conta para Pagamento */}
          <div className="grid gap-2">
            <Label>Pagar usando saldo de:</Label>
            <Select value={payingMethodId} onValueChange={setPayingMethodId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta..." />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id.toString()}>
                    {method.name} (R$ {parseFloat(method.balance).toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handlePayment} disabled={invoiceTotal <= 0 || !payingMethodId}>
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}