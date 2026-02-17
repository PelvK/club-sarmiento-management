<?php
// get_generation
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/conexion.php';

try {
    $stmt = $db->prepare("
        SELECT 
            pg.*,
            COUNT(DISTINCT p.id) as actual_payment_count
        FROM Payment_generations pg
        LEFT JOIN Payments p ON pg.id = p.generation_id AND p.status != 'cancelled'
        GROUP BY pg.id
        ORDER BY pg.generated_date DESC
    ");
    
    $stmt->execute();
    $generations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $formatted = array_map(function($gen) {
        return [
            'id' => $gen['id'],
            'month' => (int)$gen['month'],
            'year' => (int)$gen['year'],
            'generatedDate' => $gen['generated_date'],
            'generatedBy' => $gen['generated_by'],
            'status' => $gen['status'],
            'revertedDate' => $gen['reverted_date'],
            'revertedBy' => $gen['reverted_by'],
            'notes' => $gen['notes'],
            'totalPayments' => (int)$gen['total_payments'],
            'totalAmount' => (float)$gen['total_amount'],
            'stats' => [
                'onlySocietaryCount' => (int)$gen['only_societary_count'],
                'onlySocietaryAmount' => (float)$gen['only_societary_amount'],
                'principalSportsCount' => (int)$gen['principal_sports_count'],
                'principalSportsAmount' => (float)$gen['principal_sports_amount'],
                'secondarySportsCount' => (int)$gen['secondary_sports_count'],
                'secondarySportsAmount' => (float)$gen['secondary_sports_amount'],
            ],
            'actualPaymentCount' => (int)$gen['actual_payment_count'],
            'configSnapshot' => $gen['config_snapshot'] ? json_decode($gen['config_snapshot'], true) : null
        ];
    }, $generations);
    
    echo json_encode([
        'success' => true,
        'generations' => $formatted
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}