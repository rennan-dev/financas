<?php
/**
 * updateBalance.php
 * Atualiza o saldo de um método de pagamento
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

// Obrigatório: usuário deve estar autenticado
$user_id = requireAuth();

$data = json_decode(file_get_contents("php://input"), true);

// Validação dos campos obrigatórios
if (!isset($data['payment_method_id']) || !isset($data['newBalance'])) {
    respondError("Campos obrigatórios ausentes: payment_method_id e newBalance.");
}

$payment_method_id = intval($data['payment_method_id']);
$newBalance = floatval($data['newBalance']);

// Valida se o método de pagamento pertence ao usuário
if (!validatePaymentMethodOwnership($conn, $payment_method_id, $user_id)) {
    respondError("Método de pagamento não encontrado ou acesso negado.", 403);
}

// Atualiza o saldo do método de pagamento
$stmt = $conn->prepare("UPDATE payment_methods SET balance = ? WHERE id = ? AND user_id = ?");
$stmt->bind_param("dii", $newBalance, $payment_method_id, $user_id);

if ($stmt->execute()) {
    respondSuccess([], "Saldo atualizado com sucesso.");
} else {
    respondError("Erro ao atualizar o saldo.", 500);
}

$stmt->close();
$conn->close();