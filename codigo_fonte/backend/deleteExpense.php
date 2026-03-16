<?php
/**
 * deleteExpense.php
 * Exclui uma despesa existente
 * 
 * Segurança:
 * - Autenticação via sessão (obrigatória)
 * - user_id obtido exclusivamente da sessão
 * - Validação de ownership da despesa
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

if (!$input) {
    respondError("Nenhum dado recebido.");
}

$expense_id = isset($input['expense_id']) ? intval($input['expense_id']) : null;

if (!$expense_id) {
    respondError("ID da despesa ausente.");
}

// Valida se a despesa pertence ao usuário
if (!validateExpenseOwnership($conn, $expense_id, $user_id)) {
    respondError("Despesa não encontrada ou acesso negado.", 403);
}

// Excluir a despesa
$query = $conn->prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?");
$query->bind_param("ii", $expense_id, $user_id);

if (!$query->execute()) {
    respondError("Erro ao excluir despesa.", 500);
}

respondSuccess([], "Despesa excluída com sucesso.");
$query->close();
$conn->close();