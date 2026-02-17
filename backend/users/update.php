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

if (!isset($input['id'])) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit;
}

$userId = $input['id'];
$conn->beginTransaction();

try {
    $updates = [];
    $params = ['id' => $userId];

    if (isset($input['email'])) {
        $updates[] = "email = :email";
        $params['email'] = $input['email'];
    }
    if (isset($input['username'])) {
        $updates[] = "username = :username";
        $params['username'] = $input['username'];
    }
    if (isset($input['password'])) {
        $updates[] = "password = :password";
        $params['password'] = password_hash($input['password'], PASSWORD_BCRYPT);
    }
    if (isset($input['is_admin'])) {
        $updates[] = "is_admin = :is_admin";
        $params['is_admin'] = (int) $input['is_admin'];
    }
    if (isset($input['is_active'])) {
        $updates[] = "is_active = :is_active";
        $params['is_active'] = (int) $input['is_active'];
    }

    if (!empty($updates)) {
        $sql = "UPDATE profiles SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
    }

    // Actualizar permisos
    if (isset($input['permissions'])) {
        $perms = $input['permissions'];
        $stmt = $conn->prepare("
            INSERT INTO user_permissions (user_id, can_add, can_edit, can_delete, can_view, can_manage_payments, can_generate_reports, can_toggle_activate)
            VALUES (:user_id, :can_add, :can_edit, :can_delete, :can_view, :can_manage_payments, :can_generate_reports, :can_toggle_activate)
            ON DUPLICATE KEY UPDATE
                can_add = :can_add2,
                can_edit = :can_edit2,
                can_delete = :can_delete2,
                can_view = :can_view2,
                can_manage_payments = :can_manage_payments2,
                can_generate_reports = :can_generate_reports2,
                can_toggle_activate = :can_toggle_activate2
        ");
        $stmt->execute([
            'user_id' => $userId,
            'can_add' => isset($perms['can_add']) ? (int) $perms['can_add'] : 0,
            'can_edit' => isset($perms['can_edit']) ? (int) $perms['can_edit'] : 0,
            'can_delete' => isset($perms['can_delete']) ? (int) $perms['can_delete'] : 0,
            'can_view' => isset($perms['can_view']) ? (int) $perms['can_view'] : 1,
            'can_manage_payments' => isset($perms['can_manage_payments']) ? (int) $perms['can_manage_payments'] : 0,
            'can_generate_reports' => isset($perms['can_generate_reports']) ? (int) $perms['can_generate_reports'] : 0,
            'can_toggle_activate' => isset($perms['can_toggle_activate']) ? (int) $perms['can_toggle_activate'] : 0,
            'can_add2' => isset($perms['can_add']) ? (int) $perms['can_add'] : 0,
            'can_edit2' => isset($perms['can_edit']) ? (int) $perms['can_edit'] : 0,
            'can_delete2' => isset($perms['can_delete']) ? (int) $perms['can_delete'] : 0,
            'can_view2' => isset($perms['can_view']) ? (int) $perms['can_view'] : 1,
            'can_manage_payments2' => isset($perms['can_manage_payments']) ? (int) $perms['can_manage_payments'] : 0,
            'can_generate_reports2' => isset($perms['can_generate_reports']) ? (int) $perms['can_generate_reports'] : 0,
            'can_toggle_activate2' => isset($perms['can_toggle_activate']) ? (int) $perms['can_toggle_activate'] : 0
        ]);
    }

    // Actualizar deportes
    if (isset($input['sport_ids'])) {
        $stmt = $conn->prepare("DELETE FROM user_sport WHERE user_id = :user_id");
        $stmt->execute(['user_id' => $userId]);

        if (!empty($input['sport_ids'])) {
            $stmt = $conn->prepare("INSERT INTO user_sport (user_id, sport_id) VALUES (:user_id, :sport_id)");
            foreach ($input['sport_ids'] as $sportId) {
                $stmt->execute(['user_id' => $userId, 'sport_id' => $sportId]);
            }
        }
    }

    $conn->commit();

    // Obtener usuario actualizado
    $stmt = $conn->prepare("
        SELECT p.id, p.email, p.username, p.is_admin, p.is_active, p.created_at,
               up.can_add, up.can_edit, up.can_delete, up.can_view, 
               up.can_manage_payments, up.can_generate_reports, up.can_toggle_activate 
        FROM profiles p
        LEFT JOIN user_permissions up ON p.id = up.user_id
        WHERE p.id = :id
    ");
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $conn->prepare("
        SELECT d.id, d.name, d.description 
        FROM user_sport us
        INNER JOIN Disciplines d ON us.sport_id = d.id
        WHERE us.user_id = :user_id
    ");
    $stmt->execute(['user_id' => $userId]);
    $sports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response = [
        'id' => $user['id'],
        'email' => $user['email'],
        'username' => $user['username'],
        'is_admin' => (bool) $user['is_admin'],
        'is_active' => (bool) $user['is_active'],
        'created_at' => $user['created_at'],
        'sport_supported' => $sports,
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
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
