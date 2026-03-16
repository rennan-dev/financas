<?php
/**
 * deletePaymentMethod.php
 * Exclui um método de pagamento
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

$input = json_decode(file_get_contents('php://input'), true);

// Suporta tanto método DELETE via POST quanto GET com parâmetro
$payment_method_id = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($input['id'])) {
    $payment_method_id = intval($input['id']);
} elseif (isset($_GET['id'])) {
    $payment_method_id = intval($_GET['id']);
}

if (!$payment_method_id) {
    respondError("ID do método de pagamento é obrigatório.");
}

// Valida se o método de pagamento pertence ao usuário
if (!validatePaymentMethodOwnership($conn, $payment_method_id, $user_id)) {
    respondError("Método de pagamento não encontrado ou acesso negado.", 403);
}

// Excluir o método de pagamento
$stmt = $conn->prepare("DELETE FROM payment_methods WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $payment_method_id, $user_id);

if ($stmt->execute()) {
    respondSuccess([], "Método de pagamento excluído com sucesso.");
} else {
    respondError("Erro ao excluir o método de pagamento.", 500);
}

$stmt->close();
$conn->close();