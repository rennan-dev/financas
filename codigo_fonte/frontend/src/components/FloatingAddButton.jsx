import React from "react";
import { 
  Plus, 
  TrendingUp, 
  Banknote, 
  CreditCard, 
  ArrowRightLeft, 
  FileText, 
  Barcode, 
  Wallet 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function FloatingAddButton({ onAddDeposit, onAddExpense, onAddCreditExpense, onAddTransfer, onPayInvoice, onAddBoleto, onAddPaymentMethod }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 ease-in-out z-50 sm:hidden">
          <Plus className="h-6 w-6 mx-auto" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onAddDeposit} className="cursor-pointer gap-2 p-3">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span>Novo Depósito (Entrada)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onAddExpense} className="cursor-pointer gap-2 p-3">
          <Banknote className="h-4 w-4 text-green-500" />
          <span>Novo Débito</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onAddCreditExpense} className="cursor-pointer gap-2 p-3">
          <CreditCard className="h-4 w-4 text-blue-500" />
          <span>Novo Crédito</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onAddTransfer} className="cursor-pointer gap-2 p-3">
          <ArrowRightLeft className="h-4 w-4 text-orange-500" />
          <span>Transferência</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onPayInvoice} className="cursor-pointer gap-2 p-3">
          <FileText className="h-4 w-4 text-purple-500" />
          <span>Pagamento de Fatura</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onAddBoleto} className="cursor-pointer gap-2 p-3">
          <Barcode className="h-4 w-4 text-red-500" />
          <span>Pagar Boleto</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onAddPaymentMethod} className="cursor-pointer gap-2 p-3 border-t">
          <Wallet className="h-4 w-4 text-orange-500" />
          <span>Novo Cartão/Conta</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default FloatingAddButton;