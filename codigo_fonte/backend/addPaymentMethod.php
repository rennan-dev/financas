<?php
/**
 * addPaymentMethod.php
 * Adiciona um novo método de pagamento (cartão/conta)
 * 
 * Segurança:
 * - Autenticação via sessão (obrigatória)
 * - user_id obtido exclusivamente da sessão
 */

// Configura headers CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

include 'auth.php';
include 'config.php';

// Obrigatório: usuário deve estar autenticado
$user_id = requireAuth();

$data = json_decode(file_get_contents("php://input"), true);

// Validação dos campos obrigatórios
if (!isset($data['name']) || empty(trim($data['name']))) {
    respondError("Nome do método de pagamento é obrigatório.");
}

$name = trim($data['name']);

// Validação de tamanho do nome
if (strlen($name) < 2 || strlen($name) > 100) {
    respondError("Nome deve ter entre 2 e 100 caracteres.");
}

// Query de inserção
$stmt = $conn->prepare("INSERT INTO payment_methods (user_id, name) VALUES (?, ?)");
$stmt->bind_param("is", $user_id, $name);

if ($stmt->execute()) {
    $new_id = $stmt->insert_id;
    respondSuccess([
        "paymentMethod" => [
            "id" => $new_id,
            "user_id" => $user_id,
            "name" => $name,
            "balance" => 0.00
        ]
    ], "Método de pagamento adicionado com sucesso", 201);
} else {
    respondError("Erro ao adicionar o método de pagamento.", 500);
}

$stmt->close();
$conn->close();