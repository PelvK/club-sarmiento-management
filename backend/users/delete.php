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

try {
    $stmt = $conn->prepare("DELETE FROM profiles WHERE id = :id");
    $stmt->execute(['id' => $input['id']]);

    echo json_encode(['success' => true, 'message' => 'User deleted successfully']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
