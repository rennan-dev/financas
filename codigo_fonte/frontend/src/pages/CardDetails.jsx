import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ExpenseList from "@/components/ExpenseList";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CreditCard,
  Banknote,
  TrendingUp
} from "lucide-react";
import { format, addMonths, subMonths, isSameMonth, isSameYear } from "date-fns";
import { ptBR } from "date-fns/locale";

function CardDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [cardName, setCardName] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const methodsRes = await fetch(`http://localhost/api_financas/getPaymentMethods.php?user_id=${user.id}`);
      const methodsData = await methodsRes.json();
      
      if (methodsData.status === "success") {
        const currentMethod = methodsData.paymentMethods.find(m => m.id === parseInt(id));
        if (currentMethod) {
          setCardName(currentMethod.name);
        }
      }

      const expensesRes = await fetch(`http://localhost/api_financas/getExpenses.php?user_id=${user.id}`);
      const expensesData = await expensesRes.json();

      const expensesParsed = expensesData.map(expense => {
        const [year, month, day] = expense.expense_date.split("-");
        const correctedDate = new Date(year, month - 1, day);
        
        let correctedDueDate = null;
        if (expense.due_date) {
            const [dY, dM, dD] = expense.due_date.split("-");
            correctedDueDate = new Date(dY, dM - 1, dD);
        }

        return {
          ...expense,
          amount: parseFloat(expense.amount),
          expense_date: correctedDate,
          due_date: correctedDueDate ?? expense.due_date,
          payment_method_id: parseInt(expense.payment_method_id) 
        };
      });

      setExpenses(expensesParsed);
      setLoading(false);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLoading(false);
    }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const filteredExpenses = expenses.filter(expense => {
    if (expense.payment_method_id !== parseInt(id)) return false;

    const dateToCheck = expense.due_date ? new Date(expense.due_date) : expense.expense_date;
    return isSameMonth(dateToCheck, currentDate) && isSameYear(dateToCheck, currentDate);
  });

  // 1. CRÉDITO
  const creditList = filteredExpenses.filter(e => e.payment_type === 'credit');
  const totalCredit = creditList.reduce((acc, curr) => {
      const val = curr.installment_amount ? parseFloat(curr.installment_amount) : parseFloat(curr.total_amount);
      return acc + val;
  }, 0);
  const countCredit = creditList.length;

  // 2. DÉBITO
  const debitList = filteredExpenses.filter(e => e.payment_type === 'debit');
  const totalDebit = debitList.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0);
  const countDebit = debitList.length;

  // 3. DEPÓSITOS
  const depositList = filteredExpenses.filter(e => e.payment_type === 'deposit');
  const totalDeposit = depositList.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0);
  const countDeposit = depositList.length;

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-primary/20 to-muted px-4 py-8">
        <div className="w-full max-w-6xl space-y-6">
          
          <div className="flex items-center">
            <Button 
                variant="ghost" 
                onClick={() => navigate("/cards")}
                className="gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-lg font-medium">Voltar para Cartões</span>
            </Button>
          </div>

          <div className="bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-md p-6 space-y-6">
            
            {/*header: Título + Seletor de Mês */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{cardName || "Carregando..."}</h1>
                    <p className="text-muted-foreground">Extrato detalhado mensal</p>
                </div>

                <div className="flex items-center bg-background/50 rounded-lg border p-1 shadow-sm">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="w-40 text-center font-semibold capitalize text-foreground">
                        {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">                
                <div className="bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Crédito</p>
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                            R$ {totalCredit.toFixed(2)}
                        </p>
                        <p className="text-xs text-emerald-500/80 mt-1 font-medium">
                           {countCredit} {countCredit === 1 ? 'transação' : 'transações'}
                        </p>
                    </div>
                    <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-emerald-600" />
                    </div>
                </div>

                <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Débito</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                            R$ {totalDebit.toFixed(2)}
                        </p>
                        <p className="text-xs text-blue-500/80 mt-1 font-medium">
                           {countDebit} {countDebit === 1 ? 'transação' : 'transações'}
                        </p>
                    </div>
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <Banknote className="h-5 w-5 text-blue-600" />
                    </div>
                </div>

                <div className="bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Entradas / Depósitos</p>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                            R$ {totalDeposit.toFixed(2)}
                        </p>
                        <p className="text-xs text-purple-500/80 mt-1 font-medium">
                           {countDeposit} {countDeposit === 1 ? 'transação' : 'transações'}
                        </p>
                    </div>
                    <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                </div>
            </div>

            {/*lista de Despesas */}
            <div className="pt-2">
                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">Carregando transações...</div>
                ) : (
                    <ExpenseList 
                        expenses={filteredExpenses} 
                    />
                )}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CardDetails;