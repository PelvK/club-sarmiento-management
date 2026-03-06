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
    
    if (!isset($input['generationId'])) {
        throw new Exception('Generation ID not provided');
    }
    
    $generationId = $input['generationId'];
    $revertedBy = $input['revertedBy'] ?? null;
    $revertedDate = date('Y-m-d H:i:s'); 
    
    $generator = new PaymentGenerator($db);
    $generator->revertGeneration($generationId, $revertedBy, $revertedDate);
    
    echo json_encode([
        'success' => true,
        'message' => 'Generación revertida exitosamente'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
