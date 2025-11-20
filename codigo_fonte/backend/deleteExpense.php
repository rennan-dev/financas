<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

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

// CORRETO AGORA
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode([
        "status" => "error",
        "message" => "Nenhum dado recebido."
    ]);
    exit;
}

$user_id = $input['user_id'] ?? null;
$expense_id = $input['expense_id'] ?? null;

if (!$user_id || !$expense_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Parâmetros inválidos."
    ]);
    exit;
}

// Excluir a despesa
$query = $conn->prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?");
$query->bind_param("ii", $expense_id, $user_id);

if (!$query->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "Erro ao excluir despesa.",
        "debug" => $query->error
    ]);
    exit;
}

echo json_encode([
    "status" => "success",
    "message" => "Despesa excluída com sucesso."
]);
exit;
