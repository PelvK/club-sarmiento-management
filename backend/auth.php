<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Client-Info, Apikey");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("conexion.php");
$conn = getDBConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        handlePost($conn);
        break;
    case 'GET':
        handleGet($conn);
        break;
    case 'DELETE':
        handleDelete($conn);
        break;
    default:
        sendError("Method not allowed", 405);
}

function getUserWithPermissionsAndSports($conn, $userId) {
    // Obtener datos del usuario y permisos
    $stmt = $conn->prepare("
        SELECT p.id, p.email, p.username, p.is_admin, p.is_active, p.created_at,
               up.can_add, up.can_edit, up.can_delete, up.can_view, 
               up.can_manage_payments, up.can_generate_reports, up.can_toggle_activate 
        FROM profiles p
        LEFT JOIN user_permissions up ON p.id = up.user_id
        WHERE p.id = :id
    ");
    $stmt->execute(['id' => $userId]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$userData) {
        return null;
    }

    // Obtener deportes del usuario
    $stmt = $conn->prepare("
        SELECT d.id, d.name, d.description 
        FROM user_sport us
        INNER JOIN Disciplines d ON us.sport_id = d.id
        WHERE us.user_id = :user_id
    ");
    $stmt->execute(['user_id' => $userId]);
    $sports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatear deportes (convertir id a int)
    $formattedSports = array_map(function($sport) {
        return [
            'id' => (int)$sport['id'],
            'name' => $sport['name'],
            'description' => $sport['description']
        ];
    }, $sports);

    // Construir objeto de usuario completo
    return [
        'id' => $userData['id'],
        'email' => $userData['email'],
        'username' => $userData['username'],
        'is_admin' => (bool)$userData['is_admin'],
        'is_active' => (bool)$userData['is_active'],
        'created_at' => $userData['created_at'],
        'sport_supported' => $formattedSports,
        'permissions' => [
            'can_add' => (bool)($userData['can_add'] ?? false),
            'can_edit' => (bool)($userData['can_edit'] ?? false),
            'can_delete' => (bool)($userData['can_delete'] ?? false),
            'can_view' => (bool)($userData['can_view'] ?? true),
            'can_manage_payments' => (bool)($userData['can_manage_payments'] ?? false),
            'can_generate_reports' => (bool)($userData['can_generate_reports'] ?? false),
            'can_toggle_activate' => (bool)($userData['can_toggle_activate'] ?? false),
            
        ]
    ];
}

function handlePost($conn) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        sendError("Invalid JSON data", 400);
    }

    $action = $data['action'] ?? null;

    if ($action === 'login') {
        handleLogin($conn, $data);
    } elseif ($action === 'register') {
        handleRegister($conn, $data);
    } else {
        sendError("Invalid action", 400);
    }
}

function handleLogin($conn, $data) {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        sendError("Email and password are required", 400);
    }

    try {
        $stmt = $conn->prepare("
            SELECT id, email, username, password, is_admin, is_active, created_at
            FROM profiles
            WHERE email = :email
        ");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
              
        if (!$user) {
            sendError("Invalid credentials", 401);
        }

        if (!password_verify($password, $user['password'])) {
            sendError("Invalid credentials", 401);
        }

        // Verificar si el usuario está activo
        if (!$user['is_active']) {
            sendError("Tu cuenta está desactivada. Contacta al administrador.", 403);
        }

        $sessionId = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

        $stmt = $conn->prepare("
            INSERT INTO sessions (id, user_id, session_token, expires_at, created_at)
            VALUES (:id, :user_id, :session_token, :expires_at, NOW())
            ON DUPLICATE KEY UPDATE
                session_token = :session_token2,
                expires_at = :expires_at2
        ");
        $stmt->execute([
            'id' => bin2hex(random_bytes(16)),
            'user_id' => $user['id'],
            'session_token' => $sessionId,
            'expires_at' => $expiresAt,
            'session_token2' => $sessionId,
            'expires_at2' => $expiresAt
        ]);

        // Obtener usuario completo con permisos y deportes
        $userComplete = getUserWithPermissionsAndSports($conn, $user['id']);

        sendResponse([
            'user' => $userComplete,
            'session' => [
                'access_token' => $sessionId,
                'expires_at' => $expiresAt
            ]
        ]);
    } catch (Exception $e) {
        sendError("Login failed: " . $e->getMessage(), 500);
    }
}

function handleRegister($conn, $data) {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $username = $data['username'] ?? '';

    if (empty($email) || empty($password) || empty($username)) {
        sendError("Email, password and username are required", 400);
    }

    if (strlen($password) < 6) {
        sendError("Password must be at least 6 characters", 400);
    }

    try {
        $conn->beginTransaction();

        $stmt = $conn->prepare("SELECT id FROM profiles WHERE email = :email");
        $stmt->execute(['email' => $email]);
        if ($stmt->fetch()) {
            sendError("User already exists", 409);
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $userId = bin2hex(random_bytes(16));

        $stmt = $conn->prepare("
            INSERT INTO profiles (id, email, username, password, is_admin, is_active, created_at)
            VALUES (:id, :email, :username, :password, :is_admin, :is_active, NOW())
        ");
        $stmt->execute([
            'id' => $userId,
            'email' => $email,
            'username' => $username,
            'password' => $hashedPassword,
            'is_admin' => 0,
            'is_active' => 1
        ]);

        // Crear permisos por defecto para el nuevo usuario
        $stmt = $conn->prepare("
            INSERT INTO user_permissions (user_id, can_add, can_edit, can_delete, can_view, can_manage_payments, can_generate_reports)
            VALUES (:user_id, 0, 0, 0, 1, 0, 0)
        ");
        $stmt->execute(['user_id' => $userId]);

        $sessionId = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

        $stmt = $conn->prepare("
            INSERT INTO sessions (id, user_id, session_token, expires_at, created_at)
            VALUES (:id, :user_id, :session_token, :expires_at, NOW())
        ");
        $stmt->execute([
            'id' => bin2hex(random_bytes(16)),
            'user_id' => $userId,
            'session_token' => $sessionId,
            'expires_at' => $expiresAt
        ]);

        $conn->commit();

        // Obtener usuario completo con permisos
        $userComplete = getUserWithPermissionsAndSports($conn, $userId);

        sendResponse([
            'user' => $userComplete,
            'session' => [
                'access_token' => $sessionId,
                'expires_at' => $expiresAt
            ]
        ], 201);
    } catch (Exception $e) {
        $conn->rollBack();
        sendError("Registration failed: " . $e->getMessage(), 500);
    }
}

function handleGet($conn) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (empty($authHeader)) {
        sendError("Authorization header missing", 401);
    }

    $token = str_replace('Bearer ', '', $authHeader);
    if (empty($token)) {
        sendError("Invalid token", 401);
    }

    try {
        $stmt = $conn->prepare("
            SELECT s.user_id, s.expires_at, p.id, p.email, p.username, p.is_admin, p.is_active, p.created_at
            FROM sessions s
            INNER JOIN profiles p ON s.user_id = p.id
            WHERE s.session_token = :token
        ");
        $stmt->execute(['token' => $token]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result) {
            sendError("Invalid session", 401);
        }

        if (strtotime($result['expires_at']) < time()) {
            sendError("Session expired", 401);
        }

        // Verificar si el usuario está activo
        if (!$result['is_active']) {
            sendError("Tu cuenta está desactivada. Contacta al administrador.", 403);
        }

        // Obtener usuario completo con permisos y deportes
        $userComplete = getUserWithPermissionsAndSports($conn, $result['id']);

        sendResponse(['user' => $userComplete]);
    } catch (Exception $e) {
        sendError("Session verification failed: " . $e->getMessage(), 500);
    }
}

function handleDelete($conn) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (empty($authHeader)) {
        sendError("Authorization header missing", 401);
    }

    $token = str_replace('Bearer ', '', $authHeader);
    if (empty($token)) {
        sendError("Invalid token", 401);
    }

    try {
        $stmt = $conn->prepare("DELETE FROM sessions WHERE session_token = :token");
        $stmt->execute(['token' => $token]);

        sendResponse(['message' => 'Logged out successfully']);
    } catch (Exception $e) {
        sendError("Logout failed: " . $e->getMessage(), 500);
    }
}
?>