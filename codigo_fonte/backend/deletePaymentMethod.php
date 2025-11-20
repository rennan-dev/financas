<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    echo json_encode(["status" => "success", "message" => "Options request received"]);
    flush();
    exit(0);
}

$inputRaw = file_get_contents("php://input");
$input = json_decode($inputRaw, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($input['_method']) && strtoupper($input['_method']) === 'DELETE') {
    // Prossegue para deleção
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Método inválido"]);
    flush();
    exit;
}

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID é obrigatório"]);
    flush();
    exit;
}

include 'config.php';

if (!$conn) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Erro na conexão com o banco de dados"]);
    flush();
    exit;
}

$id = intval($_GET['id']);
error_reporting(E_ALL);

$stmt = $conn->prepare("DELETE FROM payment_methods WHERE id = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Erro na preparação da query"]);
    flush();
    exit;
}
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Cartão deletado com sucesso"]);
    flush();
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Erro ao deletar o cartão"]);
    flush();
}

$stmt->close();
$conn->close();
?>
