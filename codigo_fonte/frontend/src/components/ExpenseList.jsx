import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { 
  Repeat, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Filter, 
  CreditCard, 
  Banknote, 
  TrendingUp,
  Settings,
  Barcode,
  ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ExpenseList({ expenses, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const getPaymentTypeLabel = (type) => {
    if (type === "credit") return "Crédito";
    if (type === "debit") return "Débito";
    if (type === "deposit") return "Depósito";
    if (type === "transfer") return "Transferência";
    if (type === "invoice_payment") return "Pagamento Fatura";
    if (type === "boleto") return "Boleto";
    return "Dinheiro";
  };

  const filteredExpenses = expenses.filter((expense) => {
    if (filter === "all") return true;
    return expense.payment_type === filter;
  });

  const renderPaymentBadge = (type) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (type) {
      case "credit":
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Crédito</span>;
      case "debit":
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Débito</span>;
      case "deposit":
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>Depósito</span>;
      case "invoice_payment":
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Fatura</span>;
      case "boleto":
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Boleto</span>;
      case "transfer":
        return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>Transferência</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Dinheiro</span>;
    }
  };

  const isHomeView = !!onEdit; 

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Tudo
          </Button>
          <Button
            variant={filter === "debit" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("debit")}
            className="gap-2"
          >
            <Banknote className="h-4 w-4" />
            Débito
          </Button>
          <Button
            variant={filter === "credit" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("credit")}
            className="gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Crédito
          </Button>
          <Button
            variant={filter === "deposit" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("deposit")}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Depósito
          </Button>
          <Button
            variant={filter === "transfer" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("transfer")}
            className="gap-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Transferência
          </Button>
          <Button
            variant={filter === "boleto" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("boleto")}
            className="gap-2"
          >
            <Barcode className="h-4 w-4" />
            Boleto
          </Button>
        </div>

        {isHomeView && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/cards")}
            className="text-muted-foreground hover:text-primary gap-2"
          >
            <Settings className="h-4 w-4" />
            Gerenciar Cartões
          </Button>
        )}
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
          {filter === "all" 
            ? "Nenhuma transação registrada neste mês." 
            : `Nenhum registro de ${getPaymentTypeLabel(filter).toLowerCase()} encontrado.`}
        </div>
      ) : (
        filteredExpenses.map((expense, index) => {
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
              transition={{ delay: index * 0.05 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-card border relative hover:shadow-sm transition-shadow"
            >
              {/*informações da Esquerda */}
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
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {paymentMethodName}
                  {isInstallment && Number(expense.total_installments) > 1 && (
                    <span className="ml-1">
                      (Parcela {expense.installment_number}/{expense.total_installments})
                    </span>
                  )}
                  {expense.paidWith && (
                    <span className="ml-2 text-green-600 text-xs font-semibold bg-green-50 px-1 rounded">
                      Pago: {expense.paidWith}
                    </span>
                  )}
                </p>
              </div>

              {/*informações da Direita (Valor e Badge) */}
              <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                <div className="text-right">
                  <span className="font-semibold text-foreground">
                    R$ {displayAmount.toFixed(2)}
                  </span>
                  
                  {isInstallment && Number(expense.total_installments) > 1 && fullAmount && (
                    <p className="text-xs text-muted-foreground">
                      Total: R$ {fullAmount.toFixed(2)}
                    </p>
                  )}
                </div>

                {renderPaymentBadge(expense.payment_type)}

                {/* Menu de Ações (MoreVertical) */}
                {isHomeView && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem 
                          onSelect={(e) => { e.preventDefault(); onEdit(expense); }}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onSelect={(e) => { e.preventDefault(); onDelete(expense); }}
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
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