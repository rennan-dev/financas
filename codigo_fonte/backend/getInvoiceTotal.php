<?php
// Arquivo: api_financas/getInvoiceTotal.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

include 'config.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$card_id = isset($_GET['card_id']) ? intval($_GET['card_id']) : 0;
$month = isset($_GET['month']) ? intval($_GET['month']) : date('m');
$year = isset($_GET['year']) ? intval($_GET['year']) : date('Y');

if ($user_id === 0 || $card_id === 0) {
    echo json_encode(["status" => "error", "message" => "Dados insuficientes"]);
    exit;
}

$sql = "SELECT SUM(amount) as total 
        FROM expenses 
        WHERE user_id = ? 
        AND payment_method_id = ? 
        AND payment_type = 'credit' 
        AND MONTH(date) = ? 
        AND YEAR(date) = ?
        AND paid = 0";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iiii", $user_id, $card_id, $month, $year);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

$total = $row['total'] ? floatval($row['total']) : 0;

echo json_encode(["status" => "success", "total" => $total]);

$stmt->close();
$conn->close();
?>