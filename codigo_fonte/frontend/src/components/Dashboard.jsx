import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import { Button } from "@/components/ui/button";
import ExpenseList from "@/components/ExpenseList";
import MonthSelector from "@/components/MonthSelector";
import UpdateBalanceDialog from "@/components/UpdateBalanceDialog";

function Dashboard({ expenses, paymentMethods, totalBalance, onUpdateBalance, onPayCreditExpense }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showUpdateBalance, setShowUpdateBalance] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const filteredExpenses = expenses.filter(expense => {
    const dateStr = expense.installment_id ? expense.due_date : expense.expense_date;
    const expenseDate = new Date(dateStr);
    return (
      expenseDate.getMonth() === selectedMonth.getMonth() &&
      expenseDate.getFullYear() === selectedMonth.getFullYear()
    );
  });
  

  const totalExpenses = filteredExpenses.reduce((acc, expense) => {
    //verifica se é uma parcela; se sim, usa installment_amount, senão, total_amount
    const valueStr = expense.installment_id ? expense.installment_amount : expense.total_amount;
    
    //caso haja possibilidade de valores com vírgula (por exemplo, "260,00")
    const normalizedValueStr = typeof valueStr === "string" ? valueStr.replace(",", ".") : valueStr;
    
    const amount = parseFloat(normalizedValueStr);
    
    //se a conversão falhar, soma 0
    return acc + (isNaN(amount) ? 0 : amount);
  }, 0);
  
  

  const expensesByType = filteredExpenses.reduce((acc, expense) => {
    //usa installment_amount se for parcela, senão usa total_amount
    const expenseValue = expense.installment_id 
      ? parseFloat(expense.installment_amount)
      : parseFloat(expense.total_amount);
    
    //determina o tipo com base no campo payment_type (observe o underline)
    const type = expense.payment_type === 'credit' ? 'Crédito' : 
                 expense.payment_type === 'debit'  ? 'Débito'  : 'Dinheiro';
    
    if(!acc[type]) acc[type] = 0;
    acc[type] += isNaN(expenseValue) ? 0 : expenseValue;
    return acc;
  }, {});
  
  

  const chartData = Object.entries(expensesByType).map(([name, value]) => ({
    name,
    value
  }));

  const debitMethods = paymentMethods
    .filter(m => m.type !== 'credit')
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 3);

  const colorMapping = {
    "Crédito": "#00C49F", //verde
    "Débito": "#0088FE",  //azul
    "Dinheiro": "#FFA500" //laranja
  };

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* CARD SALDO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-6 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Saldo Total</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedMethod(null);
                  setShowUpdateBalance(true);
                }}
              >
                Atualizar
              </Button>
            </div>
            <div className="text-4xl font-bold text-primary mb-6">
              R$ {totalBalance.toFixed(2)}
            </div>
            <div className="space-y-4">
              {debitMethods.map((method) => (
                <div key={method.id} className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="font-medium">{method.name}</span>
                  <span className="text-lg">R$ {method.balance.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-muted-foreground">
              Total de despesas no mês: R$ {totalExpenses.toFixed(2)}
            </div>
          </motion.div>
  
          {/* CARD GRÁFICO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full p-6 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-6">Distribuição de Gastos</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colorMapping[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
  
          {/* CARD DESPESAS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-1 lg:col-span-2 w-full p-6 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-md"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-semibold">Lista de Despesas</h2>
              <MonthSelector
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </div>
            <ExpenseList
              expenses={filteredExpenses}
              onPayCreditExpense={onPayCreditExpense}
              debitMethods={paymentMethods.filter((m) => m.type !== "credit")}
            />
          </motion.div>
        </div>
  
        <UpdateBalanceDialog
          open={showUpdateBalance}
          onOpenChange={setShowUpdateBalance}
          currentBalance={selectedMethod?.balance || 0}
          methodName={selectedMethod?.name || ''}
          selectedMethodId={selectedMethod?.id || ""}
          onUpdateBalance={onUpdateBalance}
          paymentMethods={paymentMethods}
        />
      </div>
    </div>
  );
  
}

export default Dashboard;