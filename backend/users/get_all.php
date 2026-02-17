<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../conexion.php");
$conn = getDBConnection();

try {
    $sql = "SELECT p.id, p.email, p.username, p.is_admin, p.is_active, p.created_at,
                   up.can_add, up.can_edit, up.can_delete, up.can_view, 
                   up.can_manage_payments, up.can_generate_reports, up.can_toggle_activate 
            FROM profiles p
            LEFT JOIN user_permissions up ON p.id = up.user_id
            ORDER BY p.created_at DESC";
    
    $stmt = $conn->query($sql);
    $users = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $userId = $row['id'];
        
        // Obtener deportes del usuario
        $sqlSports = "SELECT d.id, d.name, d.description 
                      FROM user_sport us
                      INNER JOIN Disciplines d ON us.sport_id = d.id
                      WHERE us.user_id = :user_id";
        $stmtSports = $conn->prepare($sqlSports);
        $stmtSports->execute(['user_id' => $userId]);
        $sports = $stmtSports->fetchAll(PDO::FETCH_ASSOC);

        $users[] = [
            'id' => $row['id'],
            'email' => $row['email'],
            'username' => $row['username'],
            'is_admin' => (bool)$row['is_admin'],
            'is_active' => (bool)$row['is_active'],
            'created_at' => $row['created_at'],
            'sport_supported' => $sports,
            'permissions' => [
                'can_add' => (bool)$row['can_add'],
                'can_edit' => (bool)$row['can_edit'],
                'can_delete' => (bool)$row['can_delete'],
                'can_view' => (bool)$row['can_view'],
                'can_manage_payments' => (bool)$row['can_manage_payments'],
                'can_generate_reports' => (bool)$row['can_generate_reports'],
                'can_toggle_activate' => (bool)$row['can_toggle_activate'],
            ]
        ];
    }

    echo json_encode(['success' => true, 'users' => $users]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
