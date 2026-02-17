<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/../utils/PaymentGenerator.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    $required = ['month', 'year'];
    foreach ($required as $field) {
        if (!isset($input[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }
    
    $generator = new PaymentGenerator($db);
    $result = $generator->generatePayments($input);
    
    echo json_encode([
        'success' => true,
        'generation' => $result['generation'],
        'payments' => $result['payments'],
        'message' => 'Cuotas generadas exitosamente'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
