<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

include 'config.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
if($user_id <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID de usuário inválido"]);
    exit;
}

$query = "
  SELECT 
    e.id AS expense_id,
    e.user_id,
    e.description,
    e.payment_method_id,
    e.amount AS total_amount,
    e.date AS expense_date,
    e.payment_type,
    e.is_recurring,
    e.paid AS expense_paid,
    pm.name AS payment_method_name,

    i.id AS installment_id,
    i.installment_number,
    i.total_installments,
    i.amount AS installment_amount,
    i.due_date,
    i.paid AS installment_paid

  FROM expenses e
  LEFT JOIN installments i ON e.id = i.expense_id
  LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
  WHERE e.user_id = ?
  ORDER BY e.date, i.installment_number
";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$expenses = [];
while ($row = $result->fetch_assoc()) {
    $expenses[] = $row;
}

echo json_encode($expenses);

$stmt->close();
$conn->close();
?>
