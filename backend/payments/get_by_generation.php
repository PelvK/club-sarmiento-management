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
    // Validar que se recibió el generationId
    if (!isset($_GET['generationId']) || empty($_GET['generationId'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'El parámetro generationId es requerido'
        ]);
        exit;
    }
    
    $generationId = $_GET['generationId'];
    
    // Verificar que la generación existe
    $checkStmt = $db->prepare("SELECT id, status FROM Payment_generations WHERE id = ?");
    $checkStmt->execute([$generationId]);
    $generation = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$generation) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Generación no encontrada'
        ]);
        exit;
    }
    
    // Query para obtener payments de esta generación
    $sql = "
        SELECT 
            p.*,
            m.id as member_id,
            m.dni as member_dni,
            m.name as member_name,
            m.second_name as member_second_name,
            m.birthdate as member_birthdate,
            m.phone_number as member_phone_number,
            m.email as member_email,
            m.active as member_active,
            m.family_status as member_family_status,
            m.societary_cuote as member_societary_cuote_id,
            d.id as sport_id,
            d.name as sport_name,
            d.description as sport_description,
            pg.status as generation_status,
            pg.month as generation_month,
            pg.year as generation_year
        FROM Payments p
        INNER JOIN Members m ON p.member_id = m.id
        LEFT JOIN Disciplines d ON p.sport_id = d.id
        INNER JOIN Payment_generations pg ON p.generation_id = pg.id
        WHERE p.generation_id = ?
        ORDER BY 
            CASE p.status
                WHEN 'pending' THEN 1
                WHEN 'partial' THEN 2
                WHEN 'paid' THEN 3
                WHEN 'cancelled' THEN 4
            END,
            m.name ASC,
            p.id ASC
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([$generationId]);
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Preparar statement para breakdowns (fuera del loop)
    $breakdownStmt = $db->prepare("
        SELECT
            type,
            member_id,
            member_name_snapshot,
            concept,
            description,
            amount
        FROM Payment_breakdowns
        WHERE payment_id = ?
    ");
    
    // Formatear respuesta
    $formatted = array_map(function($payment) use ($breakdownStmt) {
        // Obtener breakdowns para este pago
        $breakdownStmt->execute([$payment['id']]);
        $breakdownResults = $breakdownStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatear breakdowns
        $breakdownItems = array_map(function($breakdown) {
            return [
                'type' => $breakdown['type'],
                'memberId' => $breakdown['member_id'] ? (int)$breakdown['member_id'] : null,
                'memberName' => $breakdown['member_name_snapshot'],
                'concept' => $breakdown['concept'],
                'description' => $breakdown['description'],
                'amount' => (float)$breakdown['amount']
            ];
        }, $breakdownResults);
        
        // Construir objeto Member
        $member = [
            'id' => (int)$payment['member_id'],
            'dni' => $payment['member_dni'],
            'name' => $payment['member_name'],
            'second_name' => $payment['member_second_name'],
            'birthdate' => $payment['member_birthdate'],
            'phone_number' => $payment['member_phone_number'],
            'email' => $payment['member_email'],
            'active' => (bool)$payment['member_active'],
            'familyGroupStatus' => $payment['member_family_status']
        ];

        // Construir objeto Sport (si existe)
        $sport = null;
        if ($payment['sport_id']) {
            $sport = [
                'id' => (int)$payment['sport_id'],
                'name' => $payment['sport_name'],
                'description' => $payment['sport_description']
            ];
        }

        return [
            'id' => (int)$payment['id'],
            'generationId' => $payment['generation_id'],
            'member' => $member,
            'month' => (int)$payment['month'],
            'year' => (int)$payment['year'],
            'dueDate' => $payment['due_date'],
            'type' => $payment['type'],
            'sport' => $sport,
            'breakdown' => $breakdownItems,
            'amount' => (float)$payment['amount'],
            'paidAmount' => (float)$payment['paid_amount'],
            'description' => $payment['description'],
            'status' => $payment['status'],
            'paidDate' => $payment['paid_date'],
            'notes' => $payment['notes'],
            'createdAt' => $payment['created_at'] ?? null,
            'updatedAt' => $payment['updated_at'] ?? null
        ];
    }, $payments);
    
    // Calcular resumen
    $summary = [
        'total' => count($formatted),
        'pending' => count(array_filter($formatted, fn($p) => $p['status'] === 'pending')),
        'partial' => count(array_filter($formatted, fn($p) => $p['status'] === 'partial')),
        'paid' => count(array_filter($formatted, fn($p) => $p['status'] === 'paid')),
        'cancelled' => count(array_filter($formatted, fn($p) => $p['status'] === 'cancelled')),
        'totalAmount' => array_sum(array_column($formatted, 'amount')),
        'totalPaid' => array_sum(array_column($formatted, 'paidAmount'))
    ];
    
    echo json_encode([
        'success' => true,
        'generationId' => $generationId,
        'generationStatus' => $generation['status'],
        'summary' => $summary,
        'payments' => $formatted
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}