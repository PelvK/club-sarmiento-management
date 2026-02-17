<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../conexion.php");
$conn = getDBConnection();

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['id'], $input['is_active'])) {
    echo json_encode(["success" => false, "message" => "User ID and is_active required"]);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE profiles SET is_active = :is_active WHERE id = :id");
    $stmt->execute([
        'id' => $input['id'],
        'is_active' => (int) $input['is_active']
    ]);

    // Retornar usuario actualizado
    $stmt = $conn->prepare("
        SELECT p.id, p.email, p.username, p.is_admin, p.is_active, p.created_at,
               up.can_add, up.can_edit, up.can_delete, up.can_view, 
               up.can_manage_payments, up.can_generate_reports, up.can_toggle_activate
        FROM profiles p
        LEFT JOIN user_permissions up ON p.id = up.user_id
        WHERE p.id = :id
    ");
    $stmt->execute(['id' => $input['id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    $response = [
        'id' => $user['id'],
        'email' => $user['email'],
        'username' => $user['username'],
        'is_admin' => (bool) $user['is_admin'],
        'is_active' => (bool) $user['is_active'],
        'created_at' => $user['created_at'],
        'permissions' => [
            'can_add' => (bool) $user['can_add'],
            'can_edit' => (bool) $user['can_edit'],
            'can_delete' => (bool) $user['can_delete'],
            'can_view' => (bool) $user['can_view'],
            'can_manage_payments' => (bool) $user['can_manage_payments'],
            'can_generate_reports' => (bool) $user['can_generate_reports'],
            'can_toggle_activate' => (bool) $user['can_toggle_activate'],
        ]
    ];

    echo json_encode(['success' => true, 'user' => $response]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
