import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Repeat } from "lucide-react";
// Removidos 'Button' e 'Select' pois não são mais usados aqui
// import { Button } from "@/components/ui/button";
// import { ...Select... } from "@/components/ui/select";

// MUDANÇA: Removido 'onPayCreditExpense' e 'debitMethods' das props
function ExpenseList({ expenses }) {
  // Removido o estado 'selectedPaymentMethod' pois não é mais usado
  // const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({});

  const getPaymentTypeLabel = (type) => {
    if (type === "credit") return "Crédito";
    if (type === "debit") return "Débito";
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
          //... (lógica de variáveis permanece a mesma)
          const isInstallment = expense.installment_id != null;
          const totalAmount = parseFloat(expense.total_amount || "0");
          const installmentAmount = parseFloat(
            expense.installment_amount || "0"
          );
          const displayAmount = isInstallment ? installmentAmount : totalAmount;
          const fullAmount = isInstallment ? totalAmount : null;
          const isRecurring = Number(expense.is_recurring) === 1;
          // const expensePaid = Number(expense.expense_paid) === 1; // Não é mais usado
          // const installmentPaid = Number(expense.installment_paid) === 1; // Não é mais usado
          // const isPaid = isInstallment ? installmentPaid : expensePaid; // Não é mais usado

          const displayDate = isInstallment
            ? expense.due_date
            : expense.expense_date;
          const paymentMethodName = expense.payment_method_name || "";
          const payId = isInstallment
            ? expense.installment_id
            : expense.expense_id;

          return (
            <motion.div
              key={payId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-card border"
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
                
                {/* MUDANÇA: Bloco "Pagamento:" foi removido daqui */}

                <p className="text-sm text-muted-foreground">
                  {paymentMethodName}
                  {isInstallment && Number(expense.total_installments) > 1 && (
                    <span className="ml-2">
                      (Parcela {expense.installment_number} de{" "}
                      {expense.total_installments} -{" "}
                      {getPaymentTypeLabel(expense.payment_type)})
                    </span>
                  )}
                  {expense.paidWith && (
                    <span className="ml-2 text-green-600">
                      Pago com: {expense.paidWith}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 w-full sm:w-auto text-right sm:text-left">
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

                {/* MUDANÇA: Bloco de Pagar (Select + Button) foi totalmente removido */}
                {/* {expense.payment_type === "credit" && !isPaid && ( ... )} */}

                {/* MUDANÇA: Lógica de status trocada para Crédito/Débito */}
                {expense.payment_type === "credit" ? (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Crédito
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Débito
                  </span>
                )}
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

export default ExpenseList;