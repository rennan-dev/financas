import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
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

function ExpenseList({ expenses, onEdit, onDelete, selectedMonth }) {
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

  const downloadExpensesPDF = () => {
    const doc = new jsPDF();
    const monthName = selectedMonth 
      ? format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })
      : format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

    // Título
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Despesas", 14, 20);

    // Subtítulo com mês
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Mês: ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`, 14, 30);

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(14, 33, 196, 33);

    // Cabeçalho da tabela
    let yPosition = 42;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Descrição", 14, yPosition);
    doc.text("Data", 75, yPosition);
    doc.text("Tipo", 105, yPosition);
    doc.text("Conta/Cartão", 135, yPosition);
    doc.text("Valor", 180, yPosition);

    // Linha separadora
    doc.setLineWidth(0.3);
    doc.line(14, yPosition + 2, 196, yPosition + 2);

    // Dados das despesas
    yPosition += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    expenses.forEach((expense) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      const displayDate = expense.due_date || expense.expense_date;
      const formattedDate = format(new Date(displayDate), "dd/MM/yyyy");
      const value = `R$ ${parseFloat(expense.total_amount || expense.amount || 0).toFixed(2)}`;
      
      const typeLabel = getPaymentTypeLabel(expense.payment_type);

      doc.text(expense.description || "-", 14, yPosition);
      doc.text(formattedDate, 75, yPosition);
      doc.text(typeLabel, 105, yPosition);
      doc.text(expense.payment_method_name || "-", 135, yPosition);
      doc.text(value, 180, yPosition);

      yPosition += 7;
    });

    // Total
    const total = expenses.reduce((acc, e) => acc + parseFloat(e.total_amount || e.amount || 0), 0);
    yPosition += 5;
    doc.setLineWidth(0.5);
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Movimentações: R$ ${total.toFixed(2)}`, 14, yPosition);

    doc.save(`despesas_${monthName.replace(" ", "_")}.pdf`);
  };

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
            onClick={() => downloadExpensesPDF()}
            className="text-muted-foreground hover:text-primary gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Baixar PDF
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