<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("conexion.php");

$input = json_decode(file_get_contents("php://input"), true);

$id = isset($input['id']) ? intval($input['id']) : 0;

if ($id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid ID"]);
    exit();
}

// Check if the quote is being used by any members
$check_sql = "SELECT COUNT(*) as count FROM Members WHERE societary_quote_id = $id";
$check_result = $conn->query($check_sql);
$check_row = $check_result->fetch_assoc();

if ($check_row['count'] > 0) {
    echo json_encode([
        "success" => false,
        "message" => "No se puede eliminar esta cuota porque está siendo utilizada por " . $check_row['count'] . " socio(s)"
    ]);
    exit();
}

$sql = "DELETE FROM Quotes WHERE id = $id AND type = 'societaria'";

if ($conn->query($sql)) {
    echo json_encode(["success" => true, "message" => "Quote deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error deleting quote: " . $conn->error]);
}

$conn->close();
?>
