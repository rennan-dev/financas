<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

// Validação dos campos obrigatórios
if (!isset($data['user_id']) || !isset($data['payment_method_id']) || !isset($data['newBalance'])) {
    http_response_code(400);
    echo json_encode([
      "status" => "error",
      "message" => "Campos obrigatórios ausentes"
    ]);
    exit;
}

$user_id = intval($data['user_id']);
$payment_method_id = intval($data['payment_method_id']);
$newBalance = floatval($data['newBalance']);

// Atualiza o saldo do método de pagamento com base no ID e no usuário
$stmt = $conn->prepare("UPDATE payment_methods SET balance = ? WHERE id = ? AND user_id = ?");
$stmt->bind_param("dii", $newBalance, $payment_method_id, $user_id);

if ($stmt->execute()) {
    echo json_encode([
      "status" => "success",
      "message" => "Saldo atualizado com sucesso"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
      "status" => "error",
      "message" => "Erro ao atualizar o saldo: " . $conn->error
    ]);
}

$stmt->close();
$conn->close();
?>
