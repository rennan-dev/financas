<?php
/**
 * getExpenses.php
 * Lista todas as despesas do usuário autenticado
 * 
 * Segurança:
 * - Autenticação via sessão (obrigatória)
 * - user_id obtido exclusivamente da sessão
 * - Retorna apenas despesas do usuário logado
 */

// Configura headers CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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

// Busca despesas do usuário autenticado
$stmt = $conn->prepare("
    SELECT 
        e.id AS expense_id,
        e.description,
        e.amount AS total_amount,
        e.date AS expense_date,
        e.payment_type,
        e.payment_method_id,
        pm.name AS payment_method_name
    FROM expenses e
    JOIN payment_methods pm ON e.payment_method_id = pm.id
    WHERE e.user_id = ?
    ORDER BY e.date DESC, e.id DESC
");

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$expenses = $result->fetch_all(MYSQLI_ASSOC);

$stmt->close();
$conn->close();

// Retorna o JSON limpo
echo json_encode($expenses);