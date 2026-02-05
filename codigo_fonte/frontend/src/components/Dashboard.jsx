import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingDown, TrendingUp, Minus } from "lucide-react";
import ExpenseList from "@/components/ExpenseList";
import MonthSelector from "@/components/MonthSelector";
import UpdateBalanceDialog from "@/components/UpdateBalanceDialog";

// Tooltip personalizado do Gráfico de Pizza
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card text-card-foreground p-2 border border-border rounded-lg shadow-sm text-sm font-medium">
        <span style={{ color: payload[0].payload.fill, marginRight: "5px" }}>
          ●
        </span>
        {payload[0].name}: R$ {payload[0].value.toFixed(2)}
      </div>
    );
  }
  return null;
};

// Tooltip personalizado do Gráfico de Evolução (Multi-linhas)
const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card text-card-foreground p-3 border border-border rounded-lg shadow-xl text-xs sm:text-sm">
        <p className="font-bold mb-2 border-b border-border pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div 
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} 
              />
              <span className="text-muted-foreground">{entry.name}:</span>
            </div>
            <span className="font-bold">
              R$ {entry.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function Dashboard({ expenses, paymentMethods, totalBalance, onUpdateBalance, onEditExpense, onDeleteExpense }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showUpdateBalance, setShowUpdateBalance] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // --- LÓGICA 1: DESPESAS DO MÊS ATUAL (SELECIONADO) ---
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = expense.installment_id ? expense.due_date : expense.expense_date; 
      const dateObj = expenseDate instanceof Date ? expenseDate : new Date(expenseDate);
      return (
        dateObj.getMonth() === selectedMonth.getMonth() &&
        dateObj.getFullYear() === selectedMonth.getFullYear()
      );
    });
  }, [expenses, selectedMonth]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      const valueStr = expense.installment_id ? expense.installment_amount : expense.total_amount;
      const normalizedValueStr = typeof valueStr === "string" ? valueStr.replace(",", ".") : valueStr;
      const amount = parseFloat(normalizedValueStr);
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);
  }, [filteredExpenses]);

  // --- LÓGICA 2: DADOS PARA GRÁFICO DE EVOLUÇÃO ---
  const evolutionData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedMonth);
      d.setMonth(selectedMonth.getMonth() - i);
      
      const monthName = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      
      // Variáveis para somar cada tipo separadamente
      let credit = 0;
      let debit = 0;
      let deposit = 0;

      expenses.forEach(expense => {
        const expenseDate = expense.installment_id ? expense.due_date : expense.expense_date; 
        const dateObj = expenseDate instanceof Date ? expenseDate : new Date(expenseDate);
        
        // Verifica se a despesa pertence ao mês do loop
        if (dateObj.getMonth() === d.getMonth() && dateObj.getFullYear() === d.getFullYear()) {
          const valueStr = expense.installment_id ? expense.installment_amount : expense.total_amount;
          const normalizedValueStr = typeof valueStr === "string" ? valueStr.replace(",", ".") : valueStr;
          const amount = parseFloat(normalizedValueStr);
          const finalAmount = isNaN(amount) ? 0 : amount;

          // Separação por tipo
          if (expense.payment_type === 'credit') {
            credit += finalAmount;
          } else if (expense.payment_type === 'deposit') {
            deposit += finalAmount;
          } else {
            // Agrupa 'debit' e 'money' na linha de Débito
            debit += finalAmount;
          }
        }
      });

      data.push({ 
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1), 
        Crédito: credit,
        Débito: debit,
        Depósito: deposit
      });
    }
    return data;
  }, [expenses, selectedMonth]);

  // --- PREPARAÇÃO DO GRÁFICO DE PIZZA ---
  const expensesByType = filteredExpenses.reduce((acc, expense) => {
      const expenseValue = expense.installment_id 
        ? parseFloat(expense.installment_amount)
        : parseFloat(expense.total_amount);
      
      const type = expense.payment_type === 'credit' ? 'Crédito' : 
                  expense.payment_type === 'debit'  ? 'Débito'  : 
                  expense.payment_type === 'deposit' ? 'Depósito' : 'Dinheiro';
      
      if(!acc[type]) acc[type] = 0;
      acc[type] += isNaN(expenseValue) ? 0 : expenseValue;
      return acc;
  }, {});

  const chartData = Object.entries(expensesByType).map(([name, value]) => ({
    name,
    value
  }));

  const colorMapping = {
      "Crédito": "#00C49F",
      "Débito": "#0088FE",
      "Dinheiro": "#FFA500",
      "Depósito": "#8b5cf6"
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD DE SALDOS E CONTAS */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Container Saldo Total */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-md">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
                <h2 className="text-3xl sm:text-4xl font-bold mt-1 text-primary">
                  R$ {totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h2>
              </div>
            </div>

            {/* COMPARATIVO MÊS ANTERIOR */}
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center justify-between text-sm bg-secondary/50 p-2 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  <span>Gasto no mês:</span>
                </div>
                <span className="font-bold text-foreground">R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* LISTA DE CONTAS */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-4 tracking-widest">
              Minhas Contas
            </h3>
            
            <div className="space-y-3 max-h-none lg:max-h-[210px] lg:overflow-y-auto lg:pr-2">
              {paymentMethods
                .filter(m => m.type !== 'credit')
                .map((method) => (
                <div 
                  key={method.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer border border-transparent hover:border-border"
                  onClick={() => {
                    setSelectedMethod(method);
                    setShowUpdateBalance(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg shadow-sm">
                      <Wallet className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{method.name}</span>
                  </div>
                  <p className="font-bold text-sm">R$ {parseFloat(method.balance).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* GRÁFICO DE PIZZA (Responsivo) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 w-full p-4 rounded-2xl bg-card border border-border shadow-md flex flex-col"
        >
          <h2 className="text-sm font-medium text-muted-foreground">Distribuição de Gastos</h2>
          
          <div className="h-[220px] sm:h-[250px] w-full flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="80%" 
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  style={{ fontSize: '12px' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorMapping[entry.name] || "#ccc"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* GRÁFICO DE EVOLUÇÃO (LINHA) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full p-6 rounded-2xl bg-card border border-border shadow-md"
      >
        <h2 className="text-sm font-medium text-muted-foreground">Evolução de Gastos</h2>
          <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }} 
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }}/>
              
              {/* Linha de Depósito */}
              <Line 
                type="monotone" 
                dataKey="Depósito" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 0, fill: "#8b5cf6" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />

              {/* Linha de Crédito */}
              <Line 
                type="monotone" 
                dataKey="Crédito" 
                stroke="#00C49F" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 0, fill: "#00C49F" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />

              {/* Linha de Débito */}
              <Line 
                type="monotone" 
                dataKey="Débito" 
                stroke="#0088FE" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 0, fill: "#0088FE" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* LISTA DE DESPESAS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full p-4 sm:p-6 rounded-2xl bg-card border border-border shadow-md"
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h2 className="text-sm font-medium text-muted-foreground">Lista de Despesas</h2>
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>
        
        <div className="overflow-x-auto">
          <ExpenseList
            expenses={filteredExpenses}
            debitMethods={paymentMethods.filter((m) => m.type !== "credit")}
            onEdit={onEditExpense}
            onDelete={onDeleteExpense}
          />
        </div>
      </motion.div>

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
  );
}

export default Dashboard;