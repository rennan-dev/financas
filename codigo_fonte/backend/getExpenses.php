<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Mostra erros, caso eles aconteçam (bom para debugar)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include 'config.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id === 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "User ID ausente"]);
    exit;
}

// SQL refeito: Busca simples na 'expenses'
// Faz JOIN com 'payment_methods' para pegar o nome (pm.name)
// O ExpenseList.jsx espera esses nomes de coluna (AS)
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
    ORDER BY e.date DESC
");

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$expenses = $result->fetch_all(MYSQLI_ASSOC);

$stmt->close();
$conn->close();

// Retorna o JSON limpo
echo json_encode($expenses);
?>