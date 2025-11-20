<?php
// payCreditExpense.php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

include 'config.php';

// Lê o JSON enviado pelo front-end
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['pay_id']) || !isset($data['payment_method_id']) || !isset($data['user_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Parâmetros ausentes"]);
    exit;
}

$pay_id = intval($data['pay_id']);
$payment_method_id = intval($data['payment_method_id']);
$user_id = intval($data['user_id']);

$is_single = false;

// Tenta buscar a parcela na tabela installments
$stmt = $conn->prepare("SELECT expense_id, amount, paid FROM installments WHERE id = ? AND paid = 0");
$stmt->bind_param("i", $pay_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Se não houver registro em installments, tenta buscar na tabela expenses para um crédito de parcela única
    $stmt->close();
    $stmt = $conn->prepare("SELECT id, amount, paid, payment_type FROM expenses WHERE id = ? AND payment_type = 'credit' AND paid = 0");
    $stmt->bind_param("i", $pay_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Parcela/Despesa não encontrada ou já paga"]);
        exit;
    }
    $expenseRow = $result->fetch_assoc();
    $installment_amount = floatval($expenseRow['amount']);
    $expense_id = intval($expenseRow['id']);
    $is_single = true;
} else {
    $installment = $result->fetch_assoc();
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
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Método de pagamento não encontrado"]);
    exit;
}
$payment_method = $result->fetch_assoc();
$stmt->close();

$current_balance = floatval($payment_method['balance']);

// Verificar se há saldo suficiente
if ($current_balance < $installment_amount) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Saldo insuficiente"]);
    exit;
}

$new_balance = $current_balance - $installment_amount;

// Atualizar o saldo do método de pagamento
$stmt = $conn->prepare("UPDATE payment_methods SET balance = ? WHERE id = ?");
$stmt->bind_param("di", $new_balance, $payment_method['id']);
$stmt->execute();
$stmt->close();

// Atualizar o status do pagamento
if (!$is_single) {
    $stmt = $conn->prepare("UPDATE installments SET paid = 1 WHERE id = ?");
    $stmt->bind_param("i", $pay_id);
    $stmt->execute();
    $stmt->close();
} else {
    $stmt = $conn->prepare("UPDATE expenses SET paid = 1, paid_with_method_id = ? WHERE id = ?");
    $stmt->bind_param("ii", $payment_method['id'], $expense_id);
    $stmt->execute();
    $stmt->close();
}

// Se for pagamento parcelado, verifique se todas as parcelas foram pagas e atualize a despesa
if (!$is_single) {
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
}

echo json_encode(["status" => "success", "message" => "Pagamento realizado com sucesso"]);
$conn->close();
?>
