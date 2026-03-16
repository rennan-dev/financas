<?php
/**
 * addExpense.php
 * Adiciona uma nova despesa/transação
 * 
 * Segurança:
 * - Autenticação via sessão (obrigatória)
 * - user_id obtido exclusivamente da sessão
 * - Validação de ownership do método de pagamento
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
date_default_timezone_set('America/Manaus');

// Obrigatório: usuário deve estar autenticado
$user_id = requireAuth();

$data = json_decode(file_get_contents('php://input'), true);

// Validação de dados obrigatórios
if (!isset($data['payment_method_id']) || !isset($data['description']) || 
    !isset($data['amount']) || !isset($data['date']) || !isset($data['payment_type'])) {
    respondError("Dados incompletos. Preencha todos os campos obrigatórios.");
}

$payment_method_id = intval($data['payment_method_id']);
$description = trim($data['description']);
$amount = floatval($data['amount']);
$date = $data['date'];
$payment_type = $data['payment_type'];
$is_recurring = isset($data['is_recurring']) ? (int)$data['is_recurring'] : 0;
$installments = isset($data['installments']) ? intval($data['installments']) : 1;

$invoice_card_id = isset($data['invoice_card_id']) ? intval($data['invoice_card_id']) : null;
$invoice_month = isset($data['invoice_month']) ? intval($data['invoice_month']) : null;
$invoice_year = isset($data['invoice_year']) ? intval($data['invoice_year']) : null;

// Valida se o método de pagamento pertence ao usuário
if (!validatePaymentMethodOwnership($conn, $payment_method_id, $user_id)) {
    respondError("Método de pagamento inválido ou não pertence ao usuário.", 403);
}

// Validação básica de dados
if (empty($description)) {
    respondError("Descrição é obrigatória.");
}

if ($amount <= 0) {
    respondError("Valor deve ser maior que zero.");
}

if (empty($date)) {
    respondError("Data é obrigatória.");
}

$paid = ($payment_type === 'credit') ? 0 : 1;

$stmt = $conn->prepare("
  INSERT INTO expenses 
    (user_id, payment_method_id, description, amount, date, payment_type, is_recurring, paid, paid_with_method_id)
  VALUES 
    (?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$paid_with = ($payment_type !== 'credit') ? $payment_method_id : null;

$stmt->bind_param("iisdssiis", 
  $user_id, 
  $payment_method_id, 
  $description, 
  $amount, 
  $date, 
  $payment_type, 
  $is_recurring,
  $paid,
  $paid_with
);

if($stmt->execute()){
    $expense_id = $stmt->insert_id;
    $stmt->close();
} else {
    respondError("Erro ao inserir despesa.", 500);
}

if ($payment_type === 'invoice_payment') {
    $sqlBalance = "UPDATE payment_methods SET balance = balance - ? WHERE id = ? AND user_id = ?";
    $stmtBal = $conn->prepare($sqlBalance);
    $stmtBal->bind_param("dii", $amount, $payment_method_id, $user_id);
    $stmtBal->execute();
    $stmtBal->close();

    if ($invoice_card_id && $invoice_month && $invoice_year) {
        $sqlUpdateCredit = "UPDATE expenses 
                            SET paid = 1, paid_with_method_id = ? 
                            WHERE user_id = ? 
                            AND payment_method_id = ? 
                            AND payment_type = 'credit' 
                            AND MONTH(date) = ? 
                            AND YEAR(date) = ?
                            AND paid = 0";
        
        $stmtCredit = $conn->prepare($sqlUpdateCredit);
        $stmtCredit->bind_param("iiiii", $payment_method_id, $user_id, $invoice_card_id, $invoice_month, $invoice_year);
        $stmtCredit->execute();
        $stmtCredit->close();
    }
}
elseif ($payment_type === 'transfer') {
    // 1. Subtrai da conta de origem
    $sqlBalanceOut = "UPDATE payment_methods SET balance = balance - ? WHERE id = ? AND user_id = ?";
    $stmtOut = $conn->prepare($sqlBalanceOut);
    $stmtOut->bind_param("dii", $amount, $payment_method_id, $user_id);
    $stmtOut->execute();
    $stmtOut->close();

    // 2. Adiciona na conta de destino
    $dest_id = isset($data['destination_account_id']) ? intval($data['destination_account_id']) : null;
    if ($dest_id) {
        // Valida se a conta de destino também pertence ao usuário
        if (!validatePaymentMethodOwnership($conn, $dest_id, $user_id)) {
            respondError("Conta de destino inválida.", 403);
        }
        
        $sqlBalanceIn = "UPDATE payment_methods SET balance = balance + ? WHERE id = ? AND user_id = ?";
        $stmtIn = $conn->prepare($sqlBalanceIn);
        $stmtIn->bind_param("dii", $amount, $dest_id, $user_id);
        $stmtIn->execute();
        $stmtIn->close();
    }
}
elseif ($payment_type !== 'credit' && $payment_type !== 'deposit') {
    $sqlBalance = "UPDATE payment_methods SET balance = balance - ? WHERE id = ? AND user_id = ?";
    $stmt2 = $conn->prepare($sqlBalance);
    $stmt2->bind_param("dii", $amount, $payment_method_id, $user_id);
    $stmt2->execute();
    $stmt2->close();
}
elseif ($payment_type === 'deposit') {
    $sqlBalance = "UPDATE payment_methods SET balance = balance + ? WHERE id = ? AND user_id = ?";
    $stmt3 = $conn->prepare($sqlBalance);
    $stmt3->bind_param("dii", $amount, $payment_method_id, $user_id);
    $stmt3->execute();
    $stmt3->close();
}

if ($payment_type === 'credit' && $installments > 1) {
  $installment_amount = $amount / $installments;
  
  for ($i = 1; $i <= $installments; $i++) {
    // Calcula a data de vencimento de cada parcela
    $due_date = date('Y-m-d', strtotime("+".($i-1)." month", strtotime($date)));
    
    $stmt4 = $conn->prepare("
      INSERT INTO installments 
        (expense_id, installment_number, total_installments, amount, due_date, paid)
      VALUES 
        (?, ?, ?, ?, ?, 0)
    ");
    $stmt4->bind_param("iiids", 
      $expense_id, 
      $i, 
      $installments, 
      $installment_amount, 
      $due_date
    );
    $stmt4->execute();
    $stmt4->close();
  }
}

respondSuccess(["id" => $expense_id], "Despesa adicionada com sucesso", 201);
$conn->close();