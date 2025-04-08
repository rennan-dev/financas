<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include './../config.php';

if(!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Não autorizado"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);

if($stmt->execute()) {
    session_destroy();
    echo json_encode(["status" => "success", "message" => "Conta excluída com sucesso"]);
}else {
    echo json_encode(["status" => "error", "message" => "Erro ao excluir conta: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>