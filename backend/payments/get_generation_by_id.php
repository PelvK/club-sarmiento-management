<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/conexion.php';

try {
    $generationId = $_GET['generationId'] ?? null;

    if (!$generationId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Generation ID is required'
        ]);
        exit;
    }

    $stmt = $db->prepare("
        SELECT
            pg.*,
            COUNT(DISTINCT p.id) as actual_payment_count,
            (
                SELECT COUNT(DISTINCT pb.member_id)
                FROM Payment_breakdowns pb
                JOIN Payments p2 ON pb.payment_id = p2.id
                WHERE p2.generation_id = pg.id
                AND p2.status = 'paid'
            ) as covered_members_count
        FROM Payment_generations pg
        LEFT JOIN Payments p ON pg.id = p.generation_id AND p.status != 'cancelled'
        WHERE pg.id = ?
        GROUP BY pg.id
    ");

    $stmt->execute([$generationId]);
    $gen = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$gen) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Generation not found'
        ]);
        exit;
    }

    $formatted = [
        'id' => $gen['id'],
        'month' => (int) $gen['month'],
        'year' => (int) $gen['year'],
        'generatedDate' => $gen['generated_date'],
        'generatedBy' => $gen['generated_by'],
        'status' => $gen['status'],
        'revertedDate' => $gen['reverted_date'],
        'revertedBy' => $gen['reverted_by'],
        'notes' => $gen['notes'],
        'totalPayments' => (int) $gen['total_payments'],
        'totalAmount' => (float) $gen['total_amount'],
        'stats' => [
            'onlySocietaryCount' => (int) $gen['only_societary_count'],
            'onlySocietaryAmount' => (float) $gen['only_societary_amount'],
            'principalSportsCount' => (int) $gen['principal_sports_count'],
            'principalSportsAmount' => (float) $gen['principal_sports_amount'],
            'secondarySportsCount' => (int) $gen['secondary_sports_count'],
            'secondarySportsAmount' => (float) $gen['secondary_sports_amount'],
            'societaryInnerCount' => (int) $gen['societary_inner_count'],
            'societaryInnerAmount' => (float) $gen['societary_inner_amount'],
            'totalMembersCount' => (int) $gen['total_members_count'],
            'coveredMembersCount' => (int) $gen['covered_members_count'],
        ],
        'actualPaymentCount' => (int) $gen['actual_payment_count'],
        'configSnapshot' => $gen['config_snapshot'] ? json_decode($gen['config_snapshot'], true) : null
    ];

    echo json_encode([
        'success' => true,
        'generation' => $formatted
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
