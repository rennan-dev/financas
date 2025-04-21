import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import AddPaymentMethodDialog from "@/components/AddPaymentMethodDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showAddCreditExpense, setShowAddCreditExpense] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if(!user) {
      navigate("/login");
      return;
    }
    const userObj = JSON.parse(user);
    const user_id = userObj.id; 
  
    fetch(`http://localhost/api_financas/getExpenses.php?user_id=${user_id}`, {
      method: "GET",
      credentials: "include",
    })
      .then(response => response.json())
      .then(data => {
        const expensesParsed = data.map((expense) => {
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
            due_date: correctedDueDate ?? expense.due_date
          };
        });
        
        
        setExpenses(expensesParsed);
      })
      .catch(error => console.error("Erro ao buscar despesas:", error));

    fetch(`http://localhost/api_financas/getPaymentMethods.php?user_id=${user_id}`, {
      method: "GET",
      credentials: "include",
    })
    .then(response => response.json())
    .then(data => {
      if(data.status === "success") {
        const methods = data.paymentMethods.map(method => ({
          ...method,
          balance: parseFloat(method.balance)
        }));
        setPaymentMethods(methods);
      }else {
        console.error("Erro:", data.message);
      }
    })
    .catch(error => console.error("Erro ao buscar métodos de pagamento:", error));
  }, [navigate]);
  
  const fetchExpenses = () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if(!user) return;
    fetch(`http://localhost/api_financas/getExpenses.php?user_id=${user.id}`, {
      method: "GET",
      credentials: "include",
    })
      .then(response => response.json())
      .then(data => {
        const expensesParsed = data.map((expense) => {
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
            due_date: correctedDueDate ?? expense.due_date
          };
        });
        
        
        setExpenses(expensesParsed);
      })
      .catch(error => console.error("Erro ao buscar despesas:", error));
  };

  const fetchPaymentMethods = () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if(!user) return;
    fetch(`http://localhost/api_financas/getPaymentMethods.php?user_id=${user.id}`, {
      method: "GET",
      credentials: "include",
    })
      .then(response => response.json())
      .then(data => {
        if(data.status === "success") {
          const methods = data.paymentMethods.map(method => ({
            ...method,
            balance: parseFloat(method.balance)
          }));
          setPaymentMethods(methods);
        }else {
          console.error("Erro:", data.message);
        }
      })
      .catch(error => console.error("Erro ao buscar métodos de pagamento:", error));
  };
  

  const handleAddExpense = async (expense) => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if(!user) return;
  
    const selectedMethod = paymentMethods.find(
      (m) => m.id === parseInt(expense.paymentMethod)
    );
  
    const payload = {
      user_id: user.id,
      payment_method_id: selectedMethod.id,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      payment_type: selectedMethod.type, 
      is_recurring: false,
    };
  
    try {
      const response = await fetch("http://localhost/api_financas/addExpense.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if(data.status === "success") {
        fetchExpenses();
        fetchPaymentMethods();
        toast({
          title: "Despesa adicionada",
          description: "A despesa foi registrada com sucesso!",
        });
      }
      else {
        toast({
          title: "Erro ao registrar despesa",
          description: data.message,
          variant: "destructive",
        });
      }
    }catch(error) {
      console.error("Erro ao adicionar despesa:", error);
      toast({
        title: "Erro ao registrar despesa",
        description: "Ocorreu um erro ao adicionar a despesa.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddRecurringExpense = async (expense) => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if(!user) return;
  
    const selectedMethod = paymentMethods.find(
      (m) => m.id === parseInt(expense.paymentMethod)
    );
    
    if(!selectedMethod) {
      console.error("Método de pagamento não encontrado");
      return;
    }
    
    const payload = {
      user_id: user.id,
      payment_method_id: selectedMethod.id,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      payment_type: selectedMethod.type, 
      is_recurring: false,
      installments: expense.installments, //caso esteja usando parcelas
    };
  
    try {
      const response = await fetch("http://localhost/api_financas/addExpense.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if(data.status === "success") {
        fetchExpenses();
        fetchPaymentMethods();
        toast({
          title: "Despesa adicionada",
          description: "A despesa foi registrada com sucesso!",
        });
      }else {
        toast({
          title: "Erro ao registrar despesa",
          description: data.message,
          variant: "destructive",
        });
      }
    }catch(error) {
      console.error("Erro ao adicionar despesa:", error);
      toast({
        title: "Erro ao registrar despesa",
        description: "Ocorreu um erro ao adicionar a despesa.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddPaymentMethod = () => {
    fetchPaymentMethods(); // Atualiza da API
    toast({
      title: "Método de pagamento adicionado",
      description: "O método de pagamento foi registrado com sucesso!"
    });
  };
  

  const handleUpdateBalance = async (paymentMethodId, newBalance) => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if(!user) return;
    const success = await updateBalance(user.id, paymentMethodId, newBalance);
    if(success) {
      fetchPaymentMethods();
    }
  };
  

  const getTotalBalance = () => {
    return paymentMethods
      .filter(method => method.type !== 'credit')
      .reduce((total, method) => total + parseFloat(method.balance || 0), 0);
  };

  const onPayCreditExpense = async (payId, selectedPaymentMethod) => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if(!user) return;
    console.log({
      pay_id: payId,
      payment_method_id: selectedPaymentMethod?.id,
      user_id: user?.id,
    });
    
    try {
      const response = await fetch("http://localhost/api_financas/payCreditExpense.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          pay_id: payId,
          payment_method_id: selectedPaymentMethod?.id, 
          user_id: user?.id,
        }),
      });
  
      const data = await response.json(); // lê o body uma única vez
  
      if(!response.ok) {
        window.alert("Erro no pagamento: " + (data.message || "Erro desconhecido"));
        return;
      }
  
      if(data.status === "success") {
        fetchExpenses();
        fetchPaymentMethods();
      }else {
        window.alert("Erro no pagamento: " + data.message);
      }
    }catch(error) {
      console.error("Erro na requisição de pagamento:", error);
      window.alert("Erro: Ocorreu um erro ao processar o pagamento");
    }
  };
  
  const updateBalance = async (user_id, paymentMethodId, newBalance) => {
    try {
      const response = await fetch("http://localhost/api_financas/updateBalance.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          user_id,
          payment_method_id: paymentMethodId,
          newBalance,
        }),
      });
      const data = await response.json();
      if(!response.ok) {
        toast({
          title: "Erro ao atualizar saldo",
          description: data.message || "Erro desconhecido",
          variant: "destructive",
        });
        return false;
      }
      if(data.status === "success") {
        toast({
          title: "Saldo atualizado",
          description: data.message,
        });
        return true;
      }else {
        toast({
          title: "Erro ao atualizar saldo",
          description: data.message,
          variant: "destructive",
        });
        return false;
      }
    }catch(error) {
      console.error("Erro ao atualizar saldo:", error);
      toast({
        title: "Erro ao atualizar saldo",
        description: "Ocorreu um erro ao atualizar o saldo",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-primary/20 to-muted px-4 py-10">
        <div className="w-full max-w-6xl space-y-10">
          <div className="flex flex-wrap justify-between gap-4 items-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Painel Financeiro 📊
            </h1>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowAddPaymentMethod(true)}
                variant="outline"
                className="backdrop-blur-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Método
              </Button>
              <Button
                onClick={() => setShowAddExpense(true)}
                variant="secondary"
                className="backdrop-blur-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Compra no Débito
              </Button>
              <Button
                onClick={() => setShowAddCreditExpense(true)}
                variant="secondary"
                className="backdrop-blur-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Compra no Crédito
              </Button>
            </div>
          </div>
  
          <div className="bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-md p-6">
            <Dashboard
              expenses={expenses}
              paymentMethods={paymentMethods}
              totalBalance={getTotalBalance()}
              onUpdateBalance={handleUpdateBalance}
              onPayCreditExpense={onPayCreditExpense}
            />
          </div>
        </div>
  
        <AddExpenseDialog
          open={showAddExpense}
          onOpenChange={setShowAddExpense}
          onAddExpense={handleAddExpense}
          paymentMethods={paymentMethods.filter((m) => m.type !== "credit")}
          title="Adicionar Compra no Débito"
        />
  
        <AddExpenseDialog
          open={showAddCreditExpense}
          onOpenChange={setShowAddCreditExpense}
          onAddExpense={handleAddRecurringExpense}
          paymentMethods={paymentMethods.filter((m) => m.type === "credit")}
          title="Adicionar Compra no Crédito"
          isCredit={true}
        />
  
        <AddPaymentMethodDialog
          open={showAddPaymentMethod}
          onOpenChange={setShowAddPaymentMethod}
          onAddPaymentMethod={handleAddPaymentMethod}
        />
      </div>
    </Layout>
  );  
}

export default Home;