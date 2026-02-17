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
    $stmt = $conn->prepare("UPDATE Members SET active = :is_active WHERE id = :id");
$stmt->execute([
    'id' => $input['id'],
    'is_active' => (int)$input['is_active']
]);

echo json_encode([
    "success" => true,
    "id" => (int)$input["id"],
    "active" => (bool)$input["is_active"]
]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
