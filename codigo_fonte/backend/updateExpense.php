<?php
/**
 * updateExpense.php
 * Atualiza uma despesa existente
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
date_default_timezone_set('America/Manaus');

// Obrigatório: usuário deve estar autenticado
$user_id = requireAuth();

$input = json_decode(file_get_contents('php://input'), true);

// Validações básicas
if (!isset($input['expense_id']) && !isset($input['id'])) {
    respondError("ID da despesa ausente.");
}

$expense_id = isset($input['expense_id']) ? intval($input['expense_id']) : intval($input['id']);
$new_description = isset($input['description']) ? trim($input['description']) : '';
$new_amount = isset($input['amount']) ? floatval($input['amount']) : 0;
$new_date = isset($input['date']) ? $input['date'] : '';
$new_payment_method_id = isset($input['payment_method_id']) ? intval($input['payment_method_id']) : 0;
$new_type = isset($input['payment_type']) ? $input['payment_type'] : '';

// Validações de dados
if (empty($new_description)) {
    respondError("Descrição é obrigatória.");
}

if ($new_amount <= 0) {
    respondError("Valor deve ser maior que zero.");
}

if (empty($new_date)) {
    respondError("Data é obrigatória.");
}

if ($new_payment_method_id <= 0) {
    respondError("Método de pagamento inválido.");
}

// Valida se a despesa pertence ao usuário
if (!validateExpenseOwnership($conn, $expense_id, $user_id)) {
    respondError("Despesa não encontrada ou acesso negado.", 403);
}

// Valida se o novo método de pagamento pertence ao usuário
if (!validatePaymentMethodOwnership($conn, $new_payment_method_id, $user_id)) {
    respondError("Método de pagamento inválido ou não pertence ao usuário.", 403);
}

$conn->begin_transaction();

try {
    // 1. BUSCAR DADOS ANTIGOS (Para estorno)
    $stmtOld = $conn->prepare("SELECT amount, payment_method_id, payment_type FROM expenses WHERE id = ? AND user_id = ?");
    $stmtOld->bind_param("ii", $expense_id, $user_id);
    $stmtOld->execute();
    $resOld = $stmtOld->get_result();
    
    if ($resOld->num_rows === 0) {
        throw new Exception("Despesa não encontrada.");
    }
    
    $oldData = $resOld->fetch_assoc();
    $old_amount = floatval($oldData['amount']);
    $old_pm_id = $oldData['payment_method_id'];
    $old_type = $oldData['payment_type'];
    $stmtOld->close();

    // 2. LÓGICA DE SALDO - ESTORNO
    // Se a despesa antiga era débito ou dinheiro, devolve o valor para o saldo antigo
    if ($old_type !== 'credit') {
        $stmtRevert = $conn->prepare("UPDATE payment_methods SET balance = balance + ? WHERE id = ? AND user_id = ?");
        $stmtRevert->bind_param("dii", $old_amount, $old_pm_id, $user_id);
        $stmtRevert->execute();
        $stmtRevert->close();
    }

    // 3. ATUALIZAR A DESPESA
    $is_paid = ($new_type !== 'credit') ? 1 : 0;
    $paid_with = ($new_type !== 'credit') ? $new_payment_method_id : null;

    $stmtUpdate = $conn->prepare("
        UPDATE expenses 
        SET description = ?, 
            amount = ?, 
            date = ?, 
            payment_method_id = ?, 
            payment_type = ?,
            paid = ?,
            paid_with_method_id = ?
        WHERE id = ? AND user_id = ?
    ");
    
    $stmtUpdate->bind_param("sdsssiiii", 
        $new_description, 
        $new_amount, 
        $new_date, 
        $new_payment_method_id, 
        $new_type,
        $is_paid,
        $paid_with,
        $expense_id, 
        $user_id
    );

    if (!$stmtUpdate->execute()) {
        throw new Exception("Erro ao atualizar despesa.");
    }
    $stmtUpdate->close();

    // 4. LÓGICA DE SALDO - COBRANÇA NOVA
    if ($new_type !== 'credit') {
        $stmtCharge = $conn->prepare("UPDATE payment_methods SET balance = balance - ? WHERE id = ? AND user_id = ?");
        $stmtCharge->bind_param("dii", $new_amount, $new_payment_method_id, $user_id);
        $stmtCharge->execute();
        $stmtCharge->close();
    }

    $conn->commit();
    respondSuccess([], "Despesa atualizada com sucesso!");

} catch (Exception $e) {
    $conn->rollback();
    respondError($e->getMessage(), 500);
}

$conn->close();