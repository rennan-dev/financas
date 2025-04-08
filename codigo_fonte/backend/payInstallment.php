<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'config.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$data = json_decode(file_get_contents("php://input"), true);

if(
    !isset($data['user_id']) || 
    !isset($data['expense_id']) || 
    !isset($data['installment_number']) || 
    !isset($data['paymentMethodName'])
) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Campos obrigatórios ausentes"
    ]);
    exit;
}

$user_id = intval($data['user_id']);
$expense_id = intval($data['expense_id']);
$installment_number = intval($data['installment_number']);
$paymentMethodName = $data['paymentMethodName'];

$stmt = $conn->prepare("SELECT amount, paid FROM installments WHERE expense_id = ? AND installment_number = ?");
$stmt->bind_param("ii", $expense_id, $installment_number);
$stmt->execute();
$result = $stmt->get_result();

if($result->num_rows === 0) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Parcela não encontrada"
    ]);
    exit;
}

$row = $result->fetch_assoc();
$installment_amount = floatval($row['amount']);
$installment_paid = $row['paid'];
$stmt->close();

if($installment_paid) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Parcela já foi paga"
    ]);
    exit;
}

$stmt = $conn->prepare("UPDATE installments SET paid = 1 WHERE expense_id = ? AND installment_number = ?");
$stmt->bind_param("ii", $expense_id, $installment_number);
if(!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Erro ao atualizar a parcela"
    ]);
    exit;
}
$stmt->close();

$stmt = $conn->prepare("UPDATE payment_methods SET balance = balance - ? WHERE user_id = ? AND name = ?");
$stmt->bind_param("dis", $installment_amount, $user_id, $paymentMethodName);
if(!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Erro ao atualizar o saldo do método de pagamento"
    ]);
    exit;
}
$stmt->close();

echo json_encode([
    "status" => "success",
    "message" => "Parcela paga com sucesso"
]);

$conn->close();
?>
