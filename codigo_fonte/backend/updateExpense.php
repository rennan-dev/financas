<?php
// updateExpense.php
error_reporting(E_ALL);
ini_set('display_errors', 0); 

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
date_default_timezone_set('America/Manaus');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'config.php';

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validações
    if (!isset($data['user_id']) || !isset($data['payment_type'])) {
        throw new Exception("Dados incompletos (user_id ou payment_type).");
    }

    $expense_id = isset($data['expense_id']) ? $data['expense_id'] : (isset($data['id']) ? $data['id'] : null);
    if (!$expense_id) throw new Exception("ID da despesa ausente.");

    $user_id = $data['user_id'];
    $new_description = $data['description'];
    $new_amount = floatval($data['amount']);
    $new_date = $data['date'];
    $new_payment_method_id = intval($data['payment_method_id']);
    
    // AQUI ESTÁ A CORREÇÃO: Usamos o tipo enviado pelo front, não buscamos no banco de métodos
    $new_type = $data['payment_type']; 

    $conn->begin_transaction();

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
        $stmtRevert = $conn->prepare("UPDATE payment_methods SET balance = balance + ? WHERE id = ?");
        $stmtRevert->bind_param("di", $old_amount, $old_pm_id);
        $stmtRevert->execute();
        $stmtRevert->close();
    }

    // 3. ATUALIZAR A DESPESA
    // Se for crédito, não está pago (paid=0). Se for débito, está pago (paid=1).
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
        throw new Exception("Erro no UPDATE: " . $stmtUpdate->error);
    }
    $stmtUpdate->close();

    // 4. LÓGICA DE SALDO - COBRANÇA NOVA
    // Se a nova versão continua sendo débito (ou virou débito), desconta do novo método
    if ($new_type !== 'credit') {
        $stmtCharge = $conn->prepare("UPDATE payment_methods SET balance = balance - ? WHERE id = ?");
        $stmtCharge->bind_param("di", $new_amount, $new_payment_method_id);
        $stmtCharge->execute();
        $stmtCharge->close();
    }

    $conn->commit();

    echo json_encode([
        "status" => "success", 
        "message" => "Atualizado com sucesso!"
    ]);

} catch (Exception $e) {
    if (isset($conn)) $conn->rollback();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

if (isset($conn)) $conn->close();
?>