import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Repeat, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ExpenseList({ expenses, onEdit, onDelete }) { 
  const getPaymentTypeLabel = (type) => {
    if (type === "credit") return "Crédito";
    if (type === "debit") return "Débito";
    if (type === "deposit") return "Depósito";
    return "Dinheiro";
  };

  // Função auxiliar para renderizar a Badge (etiqueta) com a cor correta
  const renderPaymentBadge = (type) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (type) {
      case "credit":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Crédito
          </span>
        );
      case "debit":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            Débito
          </span>
        );
      case "deposit":
        return (
          <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
            Depósito
          </span>
        );
      default:
        // Fallback para 'money' ou outros
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            Dinheiro
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {expenses.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Nenhuma transação registrada neste mês
        </div>
      ) : (
        expenses.map((expense, index) => {
          const isInstallment = expense.installment_id != null;
          const totalAmount = parseFloat(expense.total_amount || "0");
          const installmentAmount = parseFloat(expense.installment_amount || "0");
          const displayAmount = isInstallment ? installmentAmount : totalAmount;
          const fullAmount = isInstallment ? totalAmount : null;
          const isRecurring = Number(expense.is_recurring) === 1;

          const displayDate = isInstallment ? expense.due_date : expense.expense_date;
          const paymentMethodName = expense.payment_method_name || "";
          
          const uniqueKey = isInstallment ? `inst-${expense.installment_id}` : `exp-${expense.expense_id}`;

          return (
            <motion.div
              key={uniqueKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-card border relative"
            >
              {/* Informações da Esquerda */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{expense.description}</h3>
                  {isRecurring && (
                    <Repeat className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(displayDate), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
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

              {/* Informações da Direita (Valor e Badge) */}
              <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
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

                {renderPaymentBadge(expense.payment_type)}

                {/* MENU DE AÇÕES */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    
                    {/* Botão Editar */}
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        onEdit(expense);
                      }}
                      className="cursor-pointer"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>

                    {/* Botão Excluir */}
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        onDelete(expense);
                      }}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Excluir</span>
                    </DropdownMenuItem>

                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

export default ExpenseList;