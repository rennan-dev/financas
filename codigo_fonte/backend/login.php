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

$email = trim($data['email']);
$password = $data['password'];

$stmt = $conn->prepare("SELECT id, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if (password_verify($password, $row['password'])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $row['id'];
        echo json_encode([
            "status" => "success",
            "message" => "Login efetuado com sucesso",
            "user" => [
                "id" => $row['id'],
                "email" => $email
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Credenciais inválidas"]);
    }    
} else {
    echo json_encode(["status" => "error", "message" => "Usuário não encontrado"]);
}

$stmt->close();
$conn->close();
?>