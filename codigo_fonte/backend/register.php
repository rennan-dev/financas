<?php
session_start(); // Inicia a sessão
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data['name']); 
$email = trim($data['email']);
$password = $data['password'];
$confirm_password = $data['confirm_password'];

if($password !== $confirm_password) {
    echo json_encode(["status" => "error", "message" => "As senhas não coincidem"]);
    exit;
}

if(strlen($password) < 6 || preg_match('/\s/', $password)) {
    echo json_encode(["status" => "error", "message" => "A senha deve ter no mínimo 6 caracteres e não conter espaços em branco"]);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if($stmt->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "E-mail já existe no sistema"]);
    exit;
}

$stmt->close();

$password_hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $password_hash);

if($stmt->execute()) {
    session_regenerate_id(true);
    $_SESSION['user_id'] = $conn->insert_id; 
    $user_id = $conn->insert_id;
    
    $stmt2 = $conn->prepare("SELECT id, name, email, created_at FROM users WHERE id = ?");
    $stmt2->bind_param("i", $user_id);
    $stmt2->execute();
    $result = $stmt2->get_result();
    $user = $result->fetch_assoc();
    $stmt2->close();
    
    echo json_encode([
        "status" => "success",
        "message" => "Usuário cadastrado com sucesso",
        "user" => $user
    ]);
}else {
    echo json_encode(["status" => "error", "message" => "Erro ao cadastrar usuário"]);
}

$stmt->close();
$conn->close();
?>