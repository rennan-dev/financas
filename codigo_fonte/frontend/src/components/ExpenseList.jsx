import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ExpenseList({ expenses, onPayCreditExpense, debitMethods }) {
  //estado para armazenar o método selecionado para cada payId
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({});

  const getPaymentTypeLabel = (type) => {
    if(type === "credit") return "Crédito";
    if(type === "debit") return "Débito";
    return "Dinheiro";
  };

  return (
    <div className="space-y-4">
      {expenses.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Nenhuma despesa registrada neste mês
        </div>
      ) : (
        expenses.map((expense, index) => {
          //converte os campos numéricos e booleanos
          const isInstallment = expense.installment_id != null;
          const totalAmount = parseFloat(expense.total_amount || "0");
          const installmentAmount = parseFloat(expense.installment_amount || "0");
          const displayAmount = isInstallment ? installmentAmount : totalAmount;
          const fullAmount = isInstallment ? totalAmount : null;
          const isRecurring = Number(expense.is_recurring) === 1;
          const expensePaid = Number(expense.expense_paid) === 1;
          const installmentPaid = Number(expense.installment_paid) === 1;
          const isPaid = isInstallment ? installmentPaid : expensePaid;
  
          //define a data correta: se for parcela, usa due_date; senão, expense_date
          const displayDate = isInstallment ? expense.due_date : expense.expense_date;
          //nome do método vindo do JOIN
          const paymentMethodName = expense.payment_method_name || "";
          //identificador para ações de pagamento
          const payId = isInstallment ? expense.installment_id : expense.expense_id;
  
          return (
            <motion.div
              key={payId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg bg-card border"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{expense.description}</h3>
                  {isRecurring && (
                    <Repeat className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {/* Exibe a data */}
                <p className="text-sm text-muted-foreground">
                  {format(new Date(displayDate), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
                {/* Exibe o tipo de pagamento */}
                <p className="text-sm text-muted-foreground">
                  Pagamento: {getPaymentTypeLabel(expense.payment_type)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {paymentMethodName}
                  {isInstallment && Number(expense.total_installments) > 1 && (
                    <span className="ml-2">
                      (Parcela {expense.installment_number} de {expense.total_installments} - {getPaymentTypeLabel(expense.payment_type)})
                    </span>
                  )}
                  {expense.paidWith && (
                    <span className="ml-2 text-green-600">
                      Pago com: {expense.paidWith}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-semibold">
                    R$ {displayAmount.toFixed(2)}
                  </span>
                  {isInstallment && Number(expense.total_installments) > 1 && (
                    <p className="text-xs text-muted-foreground">
                      Total: R$ {fullAmount.toFixed(2)}
                    </p>
                  )}
                </div>
                {expense.payment_type === "credit" && !isPaid && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={
                        selectedPaymentMethod[payId]
                          ? selectedPaymentMethod[payId].id.toString()
                          : ""
                      }
                      onValueChange={(value) => {
                        // Procura o objeto de método pelo id (convertendo para string)
                        const method = debitMethods.find(
                          (m) => m.id.toString() === value
                        );
                        setSelectedPaymentMethod((prev) => ({
                          ...prev,
                          [payId]: method,
                        }));
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {debitMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id.toString()}>
                            {method.name} (R$ {parseFloat(method.balance).toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!selectedPaymentMethod[payId]}
                      onClick={() => {
                        if(selectedPaymentMethod[payId]) {
                          onPayCreditExpense(payId, selectedPaymentMethod[payId]);
                          // Limpa a seleção para este payId
                          setSelectedPaymentMethod((prev) => ({
                            ...prev,
                            [payId]: undefined,
                          }));
                        }
                      }}
                    >
                      Pagar
                    </Button>
                  </div>
                )}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    isPaid
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {isPaid ? "Pago" : "Pendente"}
                </span>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

export default ExpenseList;