import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import AddPaymentMethodDialog from "@/components/AddPaymentMethodDialog";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Wallet, Banknote, TrendingUp } from "lucide-react";
import EditExpenseDialog from "@/components/EditExpenseDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showAddCreditExpense, setShowAddCreditExpense] = useState(false);
  const [showAddDeposit, setShowAddDeposit] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  useEffect(() => {
    fetchExpenses();
    fetchPaymentMethods();
  }, [navigate]);

  const fetchExpenses = () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) {
      navigate("/login");
      return;
    }

    fetch(`http://financas.rennan-alves.com/api_financas/getExpenses.php?user_id=${user.id}`, {
      method: "GET",
      credentials: "include",
    })
      .then(response => response.json())
      .then(data => {
        const expensesParsed = data.map(expense => {
          const [year, month, day] = expense.expense_date.split("-");
          const correctedDate = new Date(year, month - 1, day);

          let correctedDueDate = null;
          if (expense.due_date) {
            const [dueYear, dueMonth, dueDay] = expense.due_date.split("-");
            correctedDueDate = new Date(dueYear, dueMonth - 1, dueDay);
          }

          return {
            ...expense,
            amount: parseFloat(expense.amount),
            expense_date: correctedDate,
            due_date: correctedDueDate ?? expense.due_date,
          };
        });
        setExpenses(expensesParsed);
      })
      .catch(error => console.error("Erro ao buscar despesas:", error));
  };

  const fetchPaymentMethods = () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) return;

    fetch(`http://financas.rennan-alves.com/api_financas/getPaymentMethods.php?user_id=${user.id}`, {
      method: "GET",
      credentials: "include",
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === "success") {
          const methods = data.paymentMethods.map(method => ({
            ...method,
            balance: parseFloat(method.balance || 0),
          }));
          setPaymentMethods(methods);
        } else {
          console.error("Erro:", data.message);
        }
      })
      .catch(error => console.error("Erro ao buscar métodos de pagamento:", error));
  };

  const handleAddDeposit = async (data) => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const body = {
      user_id: user.id,
      payment_method_id: data.paymentMethod,
      description: data.description,
      amount: data.amount,
      date: data.date,
      payment_type: 'deposit',
      installments: 1
    };

    try {
      const response = await fetch("http://financas.rennan-alves.com/api_financas/addExpense.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (result.status === "success") {
        fetchExpenses();
        fetchPaymentMethods();
        toast({ title: "Depósito realizado!", description: "Saldo atualizado com sucesso." });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddExpense = async (expense) => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) return;

    const body = {
      user_id: user.id,
      payment_method_id: expense.paymentMethod,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      installments: expense.installments,
      payment_type: 'debit',
    };

    try {
      const response = await fetch("http://financas.rennan-alves.com/api_financas/addExpense.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.status === "success") {
        fetchExpenses();
        fetchPaymentMethods();
        toast({
          title: "Compra registrada!",
          description: "A compra foi adicionada com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao registrar compra",
          description: data.message || "Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
      toast({
        title: "Erro no servidor",
        description: "Não foi possível registrar a compra.",
        variant: "destructive",
      });
    }
  };

  const handleAddRecurringExpense = async (expense) => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) return;

    const selectedMethod = paymentMethods.find(
      (m) => m.id === parseInt(expense.paymentMethod)
    );

    if (!selectedMethod) return;

    const payload = {
      user_id: user.id,
      payment_method_id: selectedMethod.id,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      is_recurring: false,
      installments: expense.installments,
      payment_type: 'credit',
    };

    try {
      const response = await fetch("http://financas.rennan-alves.com/api_financas/addExpense.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.status === "success") {
        fetchExpenses();
        fetchPaymentMethods();
        toast({
          title: "Despesa adicionada",
          description: "A despesa foi registrada com sucesso!",
        });
      } else {
        toast({
          title: "Erro ao registrar despesa",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
      toast({
        title: "Erro ao registrar despesa",
        description: "Ocorreu um erro ao adicionar a despesa.",
        variant: "destructive",
      });
    }
  };

  const handleAddPaymentMethod = () => {
    fetchPaymentMethods();
    toast({
      title: "Método de pagamento adicionado",
      description: "O método de pagamento foi registrado com sucesso!",
    });
  };

  const handleUpdateBalance = async (paymentMethodId, newBalance) => {
      const user = JSON.parse(sessionStorage.getItem("user"));
      if (!user) return;

      const success = await updateBalance(user.id, paymentMethodId, newBalance);

      if (success) {
        setPaymentMethods((prevMethods) =>
          prevMethods.map((method) =>
            method.id === paymentMethodId
              ? { ...method, balance: newBalance }
              : method
          )
        );
        fetchPaymentMethods();
      }
  };

  const getTotalBalance = () => {
    return paymentMethods.reduce(
      (total, method) => total + parseFloat(method.balance || 0),
      0
    );
  };

  const onPayCreditExpense = async (payId, selectedPaymentMethod) => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) return;

    try {
      const response = await fetch("http://financas.rennan-alves.com/api_financas/payCreditExpense.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pay_id: payId,
          payment_method_id: selectedPaymentMethod?.id,
          user_id: user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert("Erro no pagamento: " + (data.message || "Erro desconhecido"));
        return;
      }

      if (data.status === "success") {
        fetchExpenses();
        fetchPaymentMethods();
      } else {
        window.alert("Erro no pagamento: " + data.message);
      }
    } catch (error) {
      console.error("Erro na requisição de pagamento:", error);
      window.alert("Erro: Ocorreu um erro ao processar o pagamento");
    }
  };

  const updateBalance = async (user_id, paymentMethodId, newBalance) => {
    try {
      const response = await fetch("http://financas.rennan-alves.com/api_financas/updateBalance.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id, payment_method_id: paymentMethodId, newBalance }),
      });
      const data = await response.json();

      if (!response.ok) return false;

      if (data.status === "success") {
        toast({ title: "Saldo atualizado", description: data.message });
        return true;
      } else {
        toast({
          title: "Erro ao atualizar saldo",
          description: data.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Erro ao atualizar saldo:", error);
      return false;
    }
  };

  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense);
    setShowEditDialog(true);
  };

  const handleSaveEditedExpense = async (updatedExpense) => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) return;

    const payload = {
        user_id: user.id,
        expense_id: updatedExpense.expense_id || updatedExpense.id,
        description: updatedExpense.description,
        amount: updatedExpense.amount,
        date: updatedExpense.date,
        payment_method_id: updatedExpense.payment_method_id,
        payment_type: updatedExpense.payment_type
    };

    try {
      const response = await fetch("http://financas.rennan-alves.com/api_financas/updateExpense.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);

      const data = await response.json();

      if (data.status === "success") {
        toast({ title: "Sucesso!", description: "Despesa atualizada." });
        fetchExpenses();
        fetchPaymentMethods();
        setShowEditDialog(false);
      } else {
        toast({ title: "Erro ao salvar", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro de Conexão", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteExpense = async (expense) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a despesa: "${expense.description}"?`
    );
    if (!confirmDelete) return;

    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) return;

    try {
      const response = await fetch("http://financas.rennan-alves.com/api_financas/deleteExpense.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: user.id,
          expense_id: expense.expense_id || expense.id
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        toast({ title: "Despesa Excluída", description: "O registro foi apagado com sucesso." });
        fetchExpenses();
        fetchPaymentMethods();
      } else {
        toast({ title: "Erro ao excluir", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro de conexão", description: "Não foi possível comunicar com o servidor.", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-primary/20 to-muted px-4 py-8">
        <div className="w-full max-w-6xl space-y-6">
          
          {/* BOTÃO DE AÇÃO PRINCIPAL */}
          <div className="flex justify-end w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full sm:w-auto gap-2 font-semibold shadow-lg bg-background text-foreground border border-border hover:bg-muted transition-all active:scale-95">
                  <Plus className="h-5 w-5" />
                  Nova Transação
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setShowAddDeposit(true)} className="cursor-pointer gap-2 p-3">
                  <TrendingUp className="h-4 w-4 text-emerald-500" /> 
                  <span>Novo Depósito (Entrada)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAddExpense(true)} className="cursor-pointer gap-2 p-3">
                  <Banknote className="h-4 w-4 text-green-500" /> 
                  <span>Novo Débito</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAddCreditExpense(true)} className="cursor-pointer gap-2 p-3">
                  <CreditCard className="h-4 w-4 text-blue-500" /> 
                  <span>Novo Crédito</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAddPaymentMethod(true)} className="cursor-pointer gap-2 p-3 border-t">
                  <Wallet className="h-4 w-4 text-orange-500" /> 
                  <span>Novo Cartão/Conta</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-md p-6">
            <Dashboard
              expenses={expenses}
              paymentMethods={paymentMethods}
              totalBalance={getTotalBalance()}
              onUpdateBalance={handleUpdateBalance}
              onPayCreditExpense={onPayCreditExpense}
              onEditExpense={handleEditExpense} 
              onDeleteExpense={handleDeleteExpense}
            />
          </div>
        </div>

        {/* DIALOGS */}
        <AddExpenseDialog
          open={showAddDeposit}
          onOpenChange={setShowAddDeposit}
          onAddExpense={handleAddDeposit}
          paymentMethods={paymentMethods}
          title="Registrar Entrada / Depósito"
        />

        <AddExpenseDialog
          open={showAddExpense}
          onOpenChange={setShowAddExpense}
          onAddExpense={handleAddExpense}
          paymentMethods={paymentMethods}
          title="Adicionar Compra no Débito"
        />

        <AddExpenseDialog
          open={showAddCreditExpense}
          onOpenChange={setShowAddCreditExpense}
          onAddExpense={handleAddRecurringExpense}
          paymentMethods={paymentMethods}
          title="Adicionar Compra no Crédito"
          isCredit={true}
        />

        <AddPaymentMethodDialog
          open={showAddPaymentMethod}
          onOpenChange={setShowAddPaymentMethod}
          onAddPaymentMethod={handleAddPaymentMethod}
        />

        <EditExpenseDialog 
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={handleSaveEditedExpense}
          paymentMethods={paymentMethods}
          expense={expenseToEdit}
        />
      </div>
    </Layout>
  );
}

export default Home;