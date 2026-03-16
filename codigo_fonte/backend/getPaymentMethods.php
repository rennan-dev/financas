<?php
/**
 * getPaymentMethods.php
 * Lista todos os métodos de pagamento do usuário autenticado
 * 
 * Segurança:
 * - Autenticação via sessão (obrigatória)
 * - user_id obtido exclusivamente da sessão
 * - Retorna apenas métodos do usuário logado
 */

// Configura headers CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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

// Busca métodos de pagamento apenas do usuário autenticado
$stmt = $conn->prepare("SELECT id, name, balance, created_at FROM payment_methods WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$paymentMethods = [];
while ($row = $result->fetch_assoc()) {
    // Garante que balance venga como número
    $row['balance'] = floatval($row['balance']);
    $paymentMethods[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode([
    "status" => "success",
    "paymentMethods" => $paymentMethods
]);