<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include __DIR__ . '/config.php';

if (!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "user_id é obrigatório"
    ]);
    exit;
}

$user_id = intval($_GET['user_id']);

try {
    // ✅ Seleciona todas as colunas necessárias
    $stmt = $conn->prepare("SELECT id, name, balance, created_at FROM payment_methods WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $paymentMethods = [];
    while ($row = $result->fetch_assoc()) {
        // Garante que balance venha como número
        $row['balance'] = floatval($row['balance']);
        $paymentMethods[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "paymentMethods" => $paymentMethods
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Erro no servidor: " . $e->getMessage()
    ]);
}

$stmt->close();
$conn->close();
?>
