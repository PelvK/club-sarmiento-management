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

if (!isset($input['email'], $input['username'], $input['password'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$email = $input['email'];
$username = $input['username'];
$password = password_hash($input['password'], PASSWORD_BCRYPT);
$isAdmin = isset($input['is_admin']) ? (int)$input['is_admin'] : 0;
$isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;
$sportIds = isset($input['sport_ids']) ? $input['sport_ids'] : [];
$permissions = isset($input['permissions']) ? $input['permissions'] : [];

$conn->beginTransaction();

try {
    // Verificar si el email ya existe
    $stmt = $conn->prepare("SELECT id FROM profiles WHERE email = :email");
    $stmt->execute(['email' => $email]);
    if ($stmt->fetch()) {
        throw new Exception("Email already exists");
    }

    $userId = bin2hex(random_bytes(16));

    // Insertar usuario
    $stmt = $conn->prepare("
        INSERT INTO profiles (id, email, username, password, is_admin, is_active, created_at)
        VALUES (:id, :email, :username, :password, :is_admin, :is_active, NOW())
    ");
    $stmt->execute([
        'id' => $userId,
        'email' => $email,
        'username' => $username,
        'password' => $password,
        'is_admin' => $isAdmin,
        'is_active' => $isActive
    ]);

    // Insertar permisos
    $stmt = $conn->prepare("
        INSERT INTO user_permissions (user_id, can_add, can_edit, can_delete, can_view, can_manage_payments, can_generate_reports, can_toggle_activate)
        VALUES (:user_id, :can_add, :can_edit, :can_delete, :can_view, :can_manage_payments, :can_generate_reports, :can_toggle_activate)
    ");
    $stmt->execute([
        'user_id' => $userId,
        'can_add' => isset($permissions['can_add']) ? (int)$permissions['can_add'] : 0,
        'can_edit' => isset($permissions['can_edit']) ? (int)$permissions['can_edit'] : 0,
        'can_delete' => isset($permissions['can_delete']) ? (int)$permissions['can_delete'] : 0,
        'can_view' => isset($permissions['can_view']) ? (int)$permissions['can_view'] : 1,
        'can_manage_payments' => isset($permissions['can_manage_payments']) ? (int)$permissions['can_manage_payments'] : 0,
        'can_generate_reports' => isset($permissions['can_generate_reports']) ? (int)$permissions['can_generate_reports'] : 0,
        'can_toggle_activate' => isset($permissions['can_toggle_activate']) ? (int)$permissions['can_toggle_activate'] : 0
    ]);

    // Insertar deportes
    if (!empty($sportIds)) {
        $stmt = $conn->prepare("INSERT INTO user_sport (user_id, sport_id) VALUES (:user_id, :sport_id)");
        foreach ($sportIds as $sportId) {
            $stmt->execute(['user_id' => $userId, 'sport_id' => $sportId]);
        }
    }

    $conn->commit();

    // Obtener usuario creado con todos los datos
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

    // Obtener deportes
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
        'is_admin' => (bool)$user['is_admin'],
        'is_active' => (bool)$user['is_active'],
        'created_at' => $user['created_at'],
        'sport_supported' => $sports,
        'permissions' => [
            'can_add' => (bool)$user['can_add'],
            'can_edit' => (bool)$user['can_edit'],
            'can_delete' => (bool)$user['can_delete'],
            'can_view' => (bool)$user['can_view'],
            'can_manage_payments' => (bool)$user['can_manage_payments'],
            'can_generate_reports' => (bool)$user['can_generate_reports'],
            'can_toggle_activate' => (bool)$user['can_toggle_activate'],
        ]
    ];

    echo json_encode(['success' => true, 'user' => $response]);

} catch (Exception $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
