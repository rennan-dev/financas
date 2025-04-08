<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'config.php';

if(!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "user_id é obrigatório"
    ]);
    exit;
}

$user_id = intval($_GET['user_id']);

$stmt = $conn->prepare("SELECT id, name, type, balance FROM payment_methods WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$paymentMethods = [];
while ($row = $result->fetch_assoc()) {
    $paymentMethods[] = $row;
}

echo json_encode([
    "status" => "success",
    "paymentMethods" => $paymentMethods
]);

$stmt->close();
$conn->close();
?>