<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");


if($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'config.php'; 

$data = json_decode(file_get_contents("php://input"), true);

if(!isset($data['user_id']) || !isset($data['name']) || !isset($data['type'])) {
    http_response_code(400);
    echo json_encode([
      "status" => "error",
      "message" => "Campos obrigatórios ausentes"
    ]);
    exit;
}

$user_id = intval($data['user_id']);
$name = $data['name'];
$type = $data['type'];
$balance = isset($data['balance']) ? floatval($data['balance']) : 0;

$stmt = $conn->prepare("INSERT INTO payment_methods (user_id, name, type, balance) VALUES (?, ?, ?, ?)");
$stmt->bind_param("issd", $user_id, $name, $type, $balance);

if($stmt->execute()) {
    $new_id = $stmt->insert_id;
    http_response_code(201);
    echo json_encode([
      "status" => "success",
      "message" => "Método de pagamento adicionado com sucesso",
      "paymentMethod" => [
        "id" => $new_id,
        "user_id" => $user_id,
        "name" => $name,
        "type" => $type,
        "balance" => $balance,
      ]
    ]);
}else {
    http_response_code(500);
    echo json_encode([
      "status" => "error",
      "message" => "Erro ao adicionar o método de pagamento"
    ]);
}

$stmt->close();
$conn->close();
?>