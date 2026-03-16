<?php
/**
 * auth.php
 * Arquivo de autenticação reutilizável para todas as APIs seguras
 * 
 * Funções para:
 * - Verificar autenticação do usuário via sessão
 * - Validar ownership de métodos de pagamento
 * - Configurar headers CORS de forma padronizada
 */

// Configuração de headers CORS
function setupCorsHeaders() {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
    header("Access-Control-Allow-Credentials: true");
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit(0);
    }
}

// Configura headers CORS para cada resposta
function setCorsHeaders() {
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json; charset=UTF-8");
}

// Inicia a sessão e verifica se o usuário está autenticado
// Retorna o user_id se autenticado, ou encerra com erro 401
function requireAuth() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        setCorsHeaders();
        http_response_code(401);
        echo json_encode([
            "status" => "error", 
            "message" => "Unauthorized - Faça login para continuar"
        ]);
        exit;
    }

    return $_SESSION['user_id'];
}

// Gera um token CSRF para proteção contra ataques
function generateCsrfToken() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    
    return $_SESSION['csrf_token'];
}

// Valida se o token CSRF enviado é válido
function validateCsrfToken($token) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['csrf_token']) || empty($token)) {
        return false;
    }
    
    return hash_equals($_SESSION['csrf_token'], $token);
}

// Valida se um método de pagamento pertence ao usuário
// Retorna true se pertence, false caso contrário
function validatePaymentMethodOwnership($conn, $paymentMethodId, $userId) {
    $stmt = $conn->prepare("SELECT id FROM payment_methods WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $paymentMethodId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $exists = $result->num_rows > 0;
    $stmt->close();
    
    return $exists;
}

// Valida se uma despesa pertence ao usuário
// Retorna true se pertence, false caso contrário
function validateExpenseOwnership($conn, $expenseId, $userId) {
    $stmt = $conn->prepare("SELECT id FROM expenses WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $expenseId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $exists = $result->num_rows > 0;
    $stmt->close();
    
    return $exists;
}

// Retorna resposta de erro padronizada
function respondError($message, $statusCode = 400) {
    setCorsHeaders();
    http_response_code($statusCode);
    echo json_encode([
        "status" => "error",
        "message" => $message
    ]);
    exit;
}

// Retorna resposta de sucesso padronizada
function respondSuccess($data = [], $message = "Success", $statusCode = 200) {
    setCorsHeaders();
    http_response_code($statusCode);
    echo json_encode(array_merge([
        "status" => "success",
        "message" => $message
    ], $data));
    exit;
}
