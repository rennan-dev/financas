<?php
error_reporting(0);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
date_default_timezone_set('America/Manaus');

include 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$user_id = $data['user_id'];
$payment_method_id = $data['payment_method_id'];
$description = $data['description'];
$amount = floatval($data['amount']);
$date = $data['date'];
$payment_type = $data['payment_type'];
$is_recurring = isset($data['is_recurring']) ? (int)$data['is_recurring'] : 0;
$installments = isset($data['installments']) ? intval($data['installments']) : 1;

$invoice_card_id = isset($data['invoice_card_id']) ? intval($data['invoice_card_id']) : null;
$invoice_month = isset($data['invoice_month']) ? intval($data['invoice_month']) : null;
$invoice_year = isset($data['invoice_year']) ? intval($data['invoice_year']) : null;

$paid = ($payment_type === 'credit') ? 0 : 1;

$stmt = $conn->prepare("
  INSERT INTO expenses 
    (user_id, payment_method_id, description, amount, date, payment_type, is_recurring, paid, paid_with_method_id)
  VALUES 
    (?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$paid_with = ($payment_type !== 'credit') ? $payment_method_id : null;

$stmt->bind_param("iisdssiis", 
  $user_id, 
  $payment_method_id, 
  $description, 
  $amount, 
  $date, 
  $payment_type, 
  $is_recurring,
  $paid,
  $paid_with
);

if($stmt->execute()){
    $expense_id = $stmt->insert_id;
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Erro ao inserir despesa"]);
    exit;
}

if ($payment_type === 'invoice_payment') {
    $sqlBalance = "UPDATE payment_methods SET balance = balance - ? WHERE id = ?";
    $stmtBal = $conn->prepare($sqlBalance);
    $stmtBal->bind_param("di", $amount, $payment_method_id);
    $stmtBal->execute();
    $stmtBal->close();

    if ($invoice_card_id && $invoice_month && $invoice_year) {
        $sqlUpdateCredit = "UPDATE expenses 
                            SET paid = 1, paid_with_method_id = ? 
                            WHERE user_id = ? 
                            AND payment_method_id = ? 
                            AND payment_type = 'credit' 
                            AND MONTH(date) = ? 
                            AND YEAR(date) = ?
                            AND paid = 0";
        
        $stmtCredit = $conn->prepare($sqlUpdateCredit);
        $stmtCredit->bind_param("iiiii", $payment_method_id, $user_id, $invoice_card_id, $invoice_month, $invoice_year);
        $stmtCredit->execute();
        $stmtCredit->close();
    }
}
elseif ($payment_type !== 'credit' && $payment_type !== 'deposit') {
    $sqlBalance = "UPDATE payment_methods SET balance = balance - ? WHERE id = ?";
    $stmt2 = $conn->prepare($sqlBalance);
    $stmt2->bind_param("di", $amount, $payment_method_id);
    $stmt2->execute();
    $stmt2->close();
}
elseif ($payment_type === 'deposit') {
    $sqlBalance = "UPDATE payment_methods SET balance = balance + ? WHERE id = ?";
    $stmt3 = $conn->prepare($sqlBalance);
    $stmt3->bind_param("di", $amount, $payment_method_id);
    $stmt3->execute();
    $stmt3->close();
}

if ($payment_type === 'credit' && $installments > 1) {
  $installment_amount = $amount / $installments;
  
  for ($i = 1; $i <= $installments; $i++) {
    // Calcula a data de vencimento de cada parcela
    $due_date = date('Y-m-d', strtotime("+".($i-1)." month", strtotime($date)));
    
    $stmt4 = $conn->prepare("
      INSERT INTO installments 
        (expense_id, installment_number, total_installments, amount, due_date, paid)
      VALUES 
        (?, ?, ?, ?, ?, 0)
    ");
    $stmt4->bind_param("iiids", 
      $expense_id, 
      $i, 
      $installments, 
      $installment_amount, 
      $due_date
    );
    $stmt4->execute();
    $stmt4->close();
  }
}

// Cria um objeto com os dados da despesa para retorno
$expense_return = [
  "id" => $expense_id,
  "user_id" => $user_id,
  "payment_method_id" => $payment_method_id,
  "description" => $description,
  "amount" => $amount,
  "date" => $date,
  "payment_type" => $payment_type,
  "is_recurring" => $is_recurring,
  "paid" => ($payment_type !== 'credit') ? 1 : 0,
  "paid_with_method_id" => ($payment_type !== 'credit') ? $payment_method_id : null
];

echo json_encode(["status" => "success", "id" => $expense_id]);
$conn->close();
?>