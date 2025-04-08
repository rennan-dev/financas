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

$data = json_decode(file_get_contents("php://input"), true);

$current_password = trim($data['current_password']);
$new_password = trim($data['new_password']);
$confirm_password = trim($data['confirm_password']);

if(empty($current_password) || empty($new_password) || empty($confirm_password)) {
    echo json_encode(["status" => "error", "message" => "Todos os campos são obrigatórios"]);
    exit;
}

if(strlen($new_password) < 6 || preg_match('/\s/', $new_password)) {
    echo json_encode(["status" => "error", "message" => "A nova senha deve ter no mínimo 6 caracteres e não conter espaços"]);
    exit;
}

if($new_password !== $confirm_password) {
    echo json_encode(["status" => "error", "message" => "As novas senhas não conferem"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
if($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Usuário não encontrado"]);
    exit;
}
$row = $result->fetch_assoc();
$stmt->close();

if(!password_verify($current_password, $row['password'])) {
    echo json_encode(["status" => "error", "message" => "Senha atual incorreta"]);
    exit;
}

$new_hashed = password_hash($new_password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
$stmt->bind_param("si", $new_hashed, $user_id);
if($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Senha alterada com sucesso"]);
}else {
    echo json_encode(["status" => "error", "message" => "Erro ao atualizar senha: " . $stmt->error]);
}
$stmt->close();
$conn->close();
?>