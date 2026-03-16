<?php
/**
 * payCreditExpense.php
 * Processa o pagamento de uma despesa no cartão de crédito
 * 
 * Segurança:
 * - Autenticação via sessão (obrigatória)
 * - user_id obtido exclusivamente da sessão
 * - Validação de ownership da despesa e método de pagamento
 */

// Configura headers CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

include 'auth.php';
include 'config.php';

// Obrigatório: usuário deve estar autenticado
$user_id = requireAuth();

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['pay_id']) || !isset($data['payment_method_id'])) {
    respondError("Parâmetros ausentes: pay_id e payment_method_id são obrigatórios.");
}

$pay_id = intval($data['pay_id']);
$payment_method_id = intval($data['payment_method_id']);

// Valida se o método de pagamento pertence ao usuário
if (!validatePaymentMethodOwnership($conn, $payment_method_id, $user_id)) {
    respondError("Método de pagamento não encontrado ou acesso negado.", 403);
}

$is_single = false;

// Tenta buscar a parcela na tabela installments
$stmt = $conn->prepare("SELECT expense_id, amount, paid FROM installments WHERE id = ?");
$stmt->bind_param("i", $pay_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Se não houver registro em installments, tenta buscar na tabela expenses
    $stmt->close();
    $stmt = $conn->prepare("SELECT id, amount, paid, payment_type, user_id FROM expenses WHERE id = ? AND payment_type = 'credit' AND paid = 0");
    $stmt->bind_param("i", $pay_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        respondError("Parcela/Despesa não encontrada ou já paga.", 404);
    }
    
    $expenseRow = $result->fetch_assoc();
    
    // Valida se a despesa pertence ao usuário
    if (intval($expenseRow['user_id']) !== $user_id) {
        respondError("Acesso negado.", 403);
    }
    
    $installment_amount = floatval($expenseRow['amount']);
    $expense_id = intval($expenseRow['id']);
    $is_single = true;
} else {
    $installment = $result->fetch_assoc();
    
    // Verifica ownership da despesa relacionada
    $stmtExp = $conn->prepare("SELECT user_id FROM expenses WHERE id = ?");
    $stmtExp->bind_param("i", $installment['expense_id']);
    $stmtExp->execute();
    $resultExp = $stmtExp->get_result();
    
    if ($resultExp->num_rows === 0) {
        respondError("Despesa não encontrada.", 404);
    }
    
    $expenseUser = $resultExp->fetch_assoc();
    if (intval($expenseUser['user_id']) !== $user_id) {
        respondError("Acesso negado.", 403);
    }
    $stmtExp->close();
    
    $expense_id = intval($installment['expense_id']);
    $installment_amount = floatval($installment['amount']);
}
$stmt->close();

// Buscar o método de pagamento pelo ID para o usuário
$stmt = $conn->prepare("SELECT id, balance FROM payment_methods WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $payment_method_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    respondError("Método de pagamento não encontrado.", 404);
}

$payment_method = $result->fetch_assoc();
$stmt->close();

$current_balance = floatval($payment_method['balance']);

// Verificar se há saldo suficiente
if ($current_balance < $installment_amount) {
    respondError("Saldo insuficiente.");
}

$new_balance = $current_balance - $installment_amount;

// Atualizar o saldo do método de pagamento
$stmt = $conn->prepare("UPDATE payment_methods SET balance = ? WHERE id = ? AND user_id = ?");
$stmt->bind_param("dii", $new_balance, $payment_method['id'], $user_id);
$stmt->execute();
$stmt->close();

// Atualizar o status do pagamento
if (!$is_single) {
    $stmt = $conn->prepare("UPDATE installments SET paid = 1 WHERE id = ?");
    $stmt->bind_param("i", $pay_id);
    $stmt->execute();
    $stmt->close();
    
    // Verifica se todas as parcelas foram pagas
    $stmt = $conn->prepare("SELECT COUNT(*) as total, SUM(CASE WHEN paid = 1 THEN 1 ELSE 0 END) as paid_count FROM installments WHERE expense_id = ?");
    $stmt->bind_param("i", $expense_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();
    
    if ($row['total'] > 0 && $row['total'] == $row['paid_count']) {
        $stmt = $conn->prepare("UPDATE expenses SET paid = 1, paid_with_method_id = ? WHERE id = ?");
        $stmt->bind_param("ii", $payment_method['id'], $expense_id);
        $stmt->execute();
        $stmt->close();
    }
} else {
    $stmt = $conn->prepare("UPDATE expenses SET paid = 1, paid_with_method_id = ? WHERE id = ?");
    $stmt->bind_param("ii", $payment_method['id'], $expense_id);
    $stmt->execute();
    $stmt->close();
}

respondSuccess([], "Pagamento realizado com sucesso.");
$conn->close();