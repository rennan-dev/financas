<?php
error_reporting(0);
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
date_default_timezone_set('America/Manaus');

include 'config.php';

// Lê o JSON vindo do front-end
$data = json_decode(file_get_contents('php://input'), true);

$user_id = $data['user_id'];
$payment_method_id = $data['payment_method_id'];
$description = $data['description'];
$amount = floatval($data['amount']);
$date = $data['date'];
$payment_type = $data['payment_type'];
$is_recurring = isset($data['is_recurring']) ? (int)$data['is_recurring'] : 0;
$installments = isset($data['installments']) ? intval($data['installments']) : 1;

$paid = 0;

// Insere na tabela expenses
$stmt = $conn->prepare("
  INSERT INTO expenses 
    (user_id, payment_method_id, description, amount, date, payment_type, is_recurring, paid)
  VALUES 
    (?, ?, ?, ?, ?, ?, ?, ?)
");
$stmt->bind_param("iisdssii", 
  $user_id, 
  $payment_method_id, 
  $description, 
  $amount, 
  $date, 
  $payment_type, 
  $is_recurring,
  $paid
);
$stmt->execute();

$expense_id = $stmt->insert_id;
$stmt->close();

// Se o pagamento não for de crédito, marque como pago e atualize o saldo
if ($payment_type !== 'credit') {
    // Atualiza o saldo do método de pagamento, subtraindo o valor da compra
    $stmt2 = $conn->prepare("UPDATE payment_methods SET balance = balance - ? WHERE id = ?");
    $stmt2->bind_param("di", $amount, $payment_method_id);
    $stmt2->execute();
    $stmt2->close();

    // Marca a despesa como paga e associa o id do método utilizado
    $stmt3 = $conn->prepare("UPDATE expenses SET paid = 1, paid_with_method_id = ? WHERE id = ?");
    $stmt3->bind_param("ii", $payment_method_id, $expense_id);
    $stmt3->execute();
    $stmt3->close();
}

// Se for compra parcelada (crédito com mais de 1 parcela), insere as parcelas
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

echo json_encode(["status" => "success", "expense" => $expense_return]);
$conn->close();
?>
