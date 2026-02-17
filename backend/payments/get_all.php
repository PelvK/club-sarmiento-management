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
    // Query para obtener todos los payments con datos completos del miembro y deporte
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
            pg.status as generation_status
        FROM Payments p
        INNER JOIN Members m ON p.member_id = m.id
        LEFT JOIN Disciplines d ON p.sport_id = d.id
        LEFT JOIN Payment_generations pg ON p.generation_id = pg.id
        WHERE p.status != 'cancelled' and m.deleted = '0' 
        ORDER BY p.due_date DESC, p.id DESC
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatear respuesta con objetos Member y Sport completos
    $formatted = array_map(function($payment) {
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
    
    echo json_encode([
        'success' => true,
        'payments' => $formatted
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
