<?php
// addPaymentMethod.php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'config.php'; // Conexão com o banco

$data = json_decode(file_get_contents("php://input"), true);

// Validação dos campos obrigatórios
if (!isset($data['user_id']) || !isset($data['name'])) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Campos obrigatórios ausentes"
    ]);
    exit;
}

$user_id = intval($data['user_id']);
$name = trim($data['name']);

// Query de inserção (apenas user_id e name)
$stmt = $conn->prepare("INSERT INTO payment_methods (user_id, name) VALUES (?, ?)");
$stmt->bind_param("is", $user_id, $name);

if ($stmt->execute()) {
    $new_id = $stmt->insert_id;
    http_response_code(201);
    echo json_encode([
        "status" => "success",
        "message" => "Método de pagamento adicionado com sucesso",
        "paymentMethod" => [
            "id" => $new_id,
            "user_id" => $user_id,
            "name" => $name
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Erro ao adicionar o método de pagamento"
    ]);
}

$stmt->close();
$conn->close();
?>
